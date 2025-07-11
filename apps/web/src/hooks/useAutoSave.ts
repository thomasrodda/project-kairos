// apps/web/src/hooks/useAutoSave.ts
// Auto-save hook that implements debounced saving with retry logic
// Saves after 2 seconds of inactivity or maximum 30 seconds during continuous typing

import { useRef, useCallback, useEffect } from 'react'
import { useEditor } from '../contexts/EditorContext'
import { apiClient } from '../services/api'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface UseAutoSaveOptions {
  pageId: string | null
  debounceDelay?: number // milliseconds to wait after last change (default: 2000)
  maxDelay?: number // maximum time between saves during continuous typing (default: 30000)
  onSaveStart?: () => void
  onSaveSuccess?: () => void
  onSaveError?: (error: Error) => void
}

interface UseAutoSaveReturn {
  saveStatus: SaveStatus
  lastSaved: Date | null
  forceSave: () => Promise<void>
}

export function useAutoSave({
  pageId,
  debounceDelay = 2000,
  maxDelay = 30000,
  onSaveStart,
  onSaveSuccess,
  onSaveError,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const { state, dispatch } = useEditor()
  const { pageTitle, blocks, isDirty, lastSaved: lastSavedFromState } = state

  // Track save status
  const saveStatusRef = useRef<SaveStatus>('idle')
  const lastSavedRef = useRef<Date | null>(lastSavedFromState)
  const saveCountRef = useRef(0)

  // Timers for debouncing
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const maxDelayTimerRef = useRef<NodeJS.Timeout | null>(null)
  const firstChangeTimeRef = useRef<number | null>(null)

  // Track deleted block IDs since last save
  const deletedBlockIdsRef = useRef<Set<string>>(new Set())

  // Retry queue for failed saves
  const retryCountRef = useRef(0)
  const maxRetries = 3
  const retryDelayMs = 1000 // Start with 1 second, exponential backoff

  // Get the current save status
  const getSaveStatus = useCallback(() => saveStatusRef.current, [])

  // Save function
  const performSave = useCallback(
    async (isRetry = false) => {
      console.log('performSave called', { pageId, isDirty, isRetry })
      if (!pageId || !isDirty) {
        console.log('performSave: Skipping save', { pageId, isDirty })
        return
      }

      // Set saving status
      saveStatusRef.current = 'saving'
      onSaveStart?.()

      try {
        // Prepare save data
        const saveData = {
          title: pageTitle,
          blocks: blocks.map((block: any, index: number) => ({
            id: block.id,
            type: block.type,
            content: block.content,
            order: index,
            metadata: {
              ...block.metadata,
              formatting: block.formatting || [],
            },
          })),
          deletedBlockIds: Array.from(deletedBlockIdsRef.current),
          lastUpdatedAt: lastSavedRef.current?.toISOString(),
        }

        // Log what we're sending
        console.log('Sending save data:', JSON.stringify(saveData, null, 2))

        // Call API
        const response = await apiClient.savePageContent(pageId, saveData)

        if (response.saveStatus === 'conflict') {
          // Handle conflict - for now, just log it
          console.warn('Save conflict detected - another user may have modified the page')
          // In the future, we might want to show a dialog or merge changes
        }

        // Update state on success
        saveStatusRef.current = 'saved'
        lastSavedRef.current = new Date(response.savedAt)
        deletedBlockIdsRef.current.clear()
        retryCountRef.current = 0
        saveCountRef.current++

        // Update editor state
        dispatch({ type: 'MARK_SAVED' })
        onSaveSuccess?.()
      } catch (error) {
        console.error('Auto-save failed:', error)
        saveStatusRef.current = 'error'

        // Retry logic
        if (!isRetry && retryCountRef.current < maxRetries) {
          retryCountRef.current++
          const retryDelay = retryDelayMs * Math.pow(2, retryCountRef.current - 1) // Exponential backoff

          console.log(`Retrying save in ${retryDelay}ms (attempt ${retryCountRef.current}/${maxRetries})`)

          setTimeout(() => {
            performSave(true)
          }, retryDelay)
        } else {
          // Max retries reached or this was already a retry
          onSaveError?.(error instanceof Error ? error : new Error('Save failed'))
        }
      }
    },
    [pageId, pageTitle, blocks, isDirty, dispatch, onSaveStart, onSaveSuccess, onSaveError]
  )

  // Debounced save function
  const debouncedSave = useCallback(() => {
    // Clear existing timers
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // If this is the first change, record the time and set max delay timer
    if (!firstChangeTimeRef.current) {
      firstChangeTimeRef.current = Date.now()

      // Set maximum delay timer
      if (maxDelayTimerRef.current) {
        clearTimeout(maxDelayTimerRef.current)
      }

      maxDelayTimerRef.current = setTimeout(() => {
        performSave()
        firstChangeTimeRef.current = null
        if (maxDelayTimerRef.current) {
          clearTimeout(maxDelayTimerRef.current)
          maxDelayTimerRef.current = null
        }
      }, maxDelay)
    }

    // Set debounce timer
    debounceTimerRef.current = setTimeout(() => {
      performSave()
      firstChangeTimeRef.current = null

      // Clear max delay timer if we're saving
      if (maxDelayTimerRef.current) {
        clearTimeout(maxDelayTimerRef.current)
        maxDelayTimerRef.current = null
      }
    }, debounceDelay)
  }, [performSave, debounceDelay, maxDelay])

  // Force save function (for explicit save actions)
  const forceSave = useCallback(async () => {
    // Clear any pending timers
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    if (maxDelayTimerRef.current) {
      clearTimeout(maxDelayTimerRef.current)
      maxDelayTimerRef.current = null
    }
    firstChangeTimeRef.current = null

    // Perform save immediately
    await performSave()
  }, [performSave])

  // Track deleted blocks
  useEffect(() => {
    // This would need to be implemented with a more sophisticated state tracking
    // For now, we'll rely on the API to handle soft deletes
  }, [blocks])

  // Trigger auto-save when content changes
  useEffect(() => {
    if (isDirty && pageId) {
      console.log('useAutoSave: Content changed, triggering debounced save', { isDirty, pageId })
      debouncedSave()
    }

    // Cleanup on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      if (maxDelayTimerRef.current) {
        clearTimeout(maxDelayTimerRef.current)
      }
    }
  }, [isDirty, pageId, debouncedSave])

  // Save on page unload (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && pageId) {
        // Try to save before unload
        forceSave()

        // Show browser warning
        e.preventDefault()
        e.returnValue = ''
        return ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty, pageId, forceSave])

  return {
    saveStatus: getSaveStatus(),
    lastSaved: lastSavedRef.current,
    forceSave,
  }
}
