import { useCallback, useEffect, useRef, useState } from 'react'
import { api, ApiError } from '../utils/api/client'
import { Block, BlockSyncState, SyncStatus } from '../utils/api/types'
import { useDebounce } from './useDebounce'

interface AutoSaveConfig {
  debounceMs?: number
  maxRetries?: number
  onError?: (error: Error, blockId: string) => void
  onConflict?: (blockId: string, localVersion: number, serverVersion: number) => void
}

interface BlockUpdate {
  id: string
  content: string
  metadata?: Block['metadata']
  version: number
}

export function useAutoSave(pageId: string | null, config: AutoSaveConfig = {}) {
  const { debounceMs = 1000, maxRetries = 3, onError, onConflict } = config

  const [syncStates, setSyncStates] = useState<Map<string, BlockSyncState>>(new Map())
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const pendingUpdates = useRef<Map<string, BlockUpdate>>(new Map())
  const retryTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Update sync state for a block
  const updateSyncState = useCallback((blockId: string, state: Partial<BlockSyncState>) => {
    setSyncStates((prev) => {
      const newStates = new Map(prev)
      const currentState = newStates.get(blockId) || { id: blockId, status: 'saved' }
      newStates.set(blockId, { ...currentState, ...state })
      return newStates
    })
  }, [])

  // Save a single block
  const saveBlock = useCallback(
    async (update: BlockUpdate): Promise<void> => {
      if (!pageId || !isOnline) {
        updateSyncState(update.id, { status: 'offline' })
        return
      }

      updateSyncState(update.id, { status: 'saving' })

      try {
        const response = await api.blocks.update(update.id, {
          content: update.content,
          metadata: update.metadata,
          version: update.version,
        })

        // Check for version conflict
        if (response.version !== update.version + 1) {
          updateSyncState(update.id, {
            status: 'error',
            error: 'Version conflict',
          })
          onConflict?.(update.id, update.version, response.version)
          return
        }

        updateSyncState(update.id, {
          status: 'saved',
          lastSaved: new Date().toISOString(),
          error: undefined,
          retryCount: 0,
        })

        // Remove from pending updates
        pendingUpdates.current.delete(update.id)
      } catch (error) {
        const apiError = error as ApiError
        const currentRetries = syncStates.get(update.id)?.retryCount || 0

        updateSyncState(update.id, {
          status: 'error',
          error: apiError.message,
          retryCount: currentRetries + 1,
        })

        // Handle specific error cases
        if (apiError.code === 'VERSION_CONFLICT') {
          onConflict?.(update.id, update.version, 0) // Server version unknown
          return
        }

        // Retry if under max retries
        if (currentRetries < maxRetries) {
          const retryDelay = Math.min(1000 * Math.pow(2, currentRetries), 10000)
          const timeoutId = setTimeout(() => {
            saveBlock(update)
          }, retryDelay)

          retryTimeouts.current.set(update.id, timeoutId)
        } else {
          onError?.(error as Error, update.id)
        }
      }
    },
    [pageId, isOnline, updateSyncState, onError, onConflict, maxRetries, syncStates]
  )

  // Batch save multiple blocks
  const saveBatch = useCallback(
    async (updates: BlockUpdate[]): Promise<void> => {
      if (!pageId || !isOnline || updates.length === 0) return

      // Update all blocks to saving status
      updates.forEach((update) => {
        updateSyncState(update.id, { status: 'saving' })
      })

      try {
        // Use batch API for multiple updates
        if (updates.length > 1) {
          const operations = updates.map((update) => ({
            type: 'update' as const,
            data: {
              id: update.id,
              content: update.content,
              metadata: update.metadata,
              version: update.version,
            },
          }))

          const results = await api.blocks.batch(operations)

          // Update sync states based on results
          results.forEach((result, index) => {
            const update = updates[index]
            if (result.success) {
              updateSyncState(update.id, {
                status: 'saved',
                lastSaved: new Date().toISOString(),
                error: undefined,
                retryCount: 0,
              })
              pendingUpdates.current.delete(update.id)
            } else {
              updateSyncState(update.id, {
                status: 'error',
                error: result.error || 'Batch update failed',
              })
            }
          })
        } else {
          // Single update - use regular save
          await saveBlock(updates[0])
        }
      } catch (error) {
        // Handle batch failure - retry individually
        console.error('Batch update failed, retrying individually:', error)
        await Promise.all(updates.map((update) => saveBlock(update)))
      }
    },
    [pageId, isOnline, updateSyncState, saveBlock]
  )

  // Debounced save function
  const debouncedSave = useDebounce(
    useCallback(async () => {
      const updates = Array.from(pendingUpdates.current.values())
      if (updates.length === 0) return

      // Save all pending updates as a batch
      await saveBatch(updates)
    }, [saveBatch]),
    debounceMs
  )

  // Queue a block for saving
  const queueBlockUpdate = useCallback(
    (blockId: string, content: string, metadata: Block['metadata'] | undefined, version: number) => {
      pendingUpdates.current.set(blockId, {
        id: blockId,
        content,
        metadata,
        version,
      })

      // Cancel any existing retry timeout
      const existingTimeout = retryTimeouts.current.get(blockId)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
        retryTimeouts.current.delete(blockId)
      }

      debouncedSave()
    },
    [debouncedSave]
  )

  // Force save all pending updates (e.g., on blur or navigation)
  const forceSaveAll = useCallback(async () => {
    const updates = Array.from(pendingUpdates.current.values())
    if (updates.length === 0) return

    // Cancel the debounced save
    debouncedSave.cancel()

    // Save all updates immediately as a batch
    await saveBatch(updates)
  }, [debouncedSave, saveBatch])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all timeouts
      retryTimeouts.current.forEach((timeout) => clearTimeout(timeout))
      retryTimeouts.current.clear()

      // Force save any pending updates
      forceSaveAll()
    }
  }, [forceSaveAll])

  // Get sync status for a specific block
  const getBlockSyncState = useCallback(
    (blockId: string): BlockSyncState => {
      return (
        syncStates.get(blockId) || {
          id: blockId,
          status: 'saved',
        }
      )
    },
    [syncStates]
  )

  // Get overall sync status
  const overallSyncStatus = useCallback((): SyncStatus => {
    if (!isOnline) return 'offline'

    const states = Array.from(syncStates.values())
    if (states.some((s) => s.status === 'error')) return 'error'
    if (states.some((s) => s.status === 'saving')) return 'saving'

    return 'saved'
  }, [isOnline, syncStates])

  return {
    queueBlockUpdate,
    forceSaveAll,
    getBlockSyncState,
    overallSyncStatus,
    isOnline,
    syncStates,
  }
}
