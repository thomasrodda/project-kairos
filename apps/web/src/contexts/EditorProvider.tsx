import React, { useEffect, useCallback, useMemo, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { api } from '../utils/api/client'
import { Block as ApiBlock, Page, Workspace } from '../utils/api/types'
import { useAutoSave } from '../hooks/useAutoSave'
import { EditorProvider as BaseEditorProvider, useEditor, EditorBlock, BlockType, TextFormat } from './EditorContext'

interface EditorProviderProps {
  children: React.ReactNode
  workspaceId?: string
  pageId?: string
}

// Convert API block type to editor block type
function apiToEditorBlockType(apiType: ApiBlock['type']): BlockType {
  switch (apiType) {
    case 'HEADING1':
      return 'h1'
    case 'HEADING2':
      return 'h2'
    case 'HEADING3':
      return 'h3'
    case 'BULLET':
      return 'bullet'
    case 'PARAGRAPH':
    default:
      return 'paragraph'
  }
}

// Convert editor block type to API block type
function editorToApiBlockType(editorType: BlockType): ApiBlock['type'] {
  switch (editorType) {
    case 'h1':
      return 'HEADING1'
    case 'h2':
      return 'HEADING2'
    case 'h3':
      return 'HEADING3'
    case 'bullet':
      return 'BULLET'
    case 'paragraph':
    default:
      return 'PARAGRAPH'
  }
}

// Convert API block to editor block
function apiToEditorBlock(apiBlock: ApiBlock): EditorBlock {
  return {
    id: apiBlock.id,
    type: apiToEditorBlockType(apiBlock.type),
    content: apiBlock.content,
    formatting: apiBlock.metadata?.formatting as TextFormat[] | undefined,
    metadata: {
      version: apiBlock.version,
      order: apiBlock.order,
    } as any,
  }
}

// Enhanced editor provider with API integration
export function EnhancedEditorProvider({ children, workspaceId, pageId }: EditorProviderProps) {
  return (
    <BaseEditorProvider>
      <EditorApiSync workspaceId={workspaceId} pageId={pageId}>
        {children}
      </EditorApiSync>
    </BaseEditorProvider>
  )
}

// Component that handles API synchronization
function EditorApiSync({ children, workspaceId, pageId }: { children: React.ReactNode; workspaceId?: string; pageId?: string }) {
  const { user } = useAuth()
  const { state, dispatch } = useEditor()
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)

  // Auto-save functionality
  const { queueBlockUpdate, forceSaveAll, getBlockSyncState, overallSyncStatus } = useAutoSave(pageId || null, {
    debounceMs: 1000,
    onError: (error, blockId) => {
      console.error(`Failed to save block ${blockId}:`, error)
      // TODO: Show user notification
    },
    onConflict: (blockId, localVersion, serverVersion) => {
      console.warn(`Version conflict for block ${blockId}: local=${localVersion}, server=${serverVersion}`)
      // TODO: Implement conflict resolution UI
    },
  })

  // Load page and blocks when pageId changes
  useEffect(() => {
    if (!pageId || !user) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    async function loadPage() {
      try {
        // Load page details
        const page = await api.pages.get(pageId!)

        // Load blocks
        const blocks = await api.blocks.listByPage(pageId!)

        if (!cancelled) {
          // Convert API blocks to editor blocks
          const editorBlocks = blocks.sort((a, b) => a.order - b.order).map(apiToEditorBlock)

          dispatch({
            type: 'SET_PAGE',
            pageId: page.id,
            title: page.title,
            blocks: editorBlocks,
          })

          // Initialize previousBlockIds with the loaded blocks
          previousBlockIds.current = new Set(editorBlocks.map((b) => b.id))

          setLoading(false)
        }
      } catch (error) {
        console.error('Failed to load page:', error)
        if (!cancelled) {
          setError(error as Error)
          setLoading(false)
        }
      }
    }

    loadPage()

    return () => {
      cancelled = true
      // Force save any pending changes when leaving the page
      forceSaveAll()
    }
  }, [pageId, user, dispatch, forceSaveAll])

  // Track existing blocks to detect new ones
  const previousBlockIds = useRef<Set<string>>(new Set())

  // Track pending block creations
  const pendingCreations = useRef<Map<string, boolean>>(new Map())

  // Handle creating new blocks with optimistic updates
  const createBlock = useCallback(
    async (tempId: string, block: EditorBlock, order: number) => {
      if (!pageId || pendingCreations.current.has(tempId)) return

      pendingCreations.current.set(tempId, true)

      try {
        const response = await api.blocks.create({
          pageId,
          type: editorToApiBlockType(block.type),
          content: block.content,
          order,
          metadata: {
            formatting: block.formatting as any,
          },
        })

        // Replace temporary block with server block
        const serverBlock = apiToEditorBlock(response)

        // Update the block list with the new server ID
        dispatch({
          type: 'REPLACE_BLOCK',
          oldBlockId: tempId,
          newBlock: serverBlock,
        })

        pendingCreations.current.delete(tempId)
        return response
      } catch (error) {
        console.error('Failed to create block:', error)
        pendingCreations.current.delete(tempId)

        // TODO: Show error notification and maybe revert the optimistic update
        throw error
      }
    },
    [pageId, dispatch]
  )

  // Track block changes and queue for auto-save
  useEffect(() => {
    if (!pageId || !state.isDirty) return

    const currentBlockIds = new Set(state.blocks.map((b) => b.id))

    // Find newly added blocks
    state.blocks.forEach((block, index) => {
      if (!previousBlockIds.current.has(block.id)) {
        // This is a new block - create it on the server
        createBlock(block.id, block, index)
      } else {
        // Existing block - check if it needs updating
        const version = ((block.metadata as any)?.version as number) || 0

        // Only queue if the block has a server ID (not a temporary local block)
        if (block.id.length === 25) {
          // cuid length
          queueBlockUpdate(
            block.id,
            block.content,
            {
              formatting: block.formatting as any,
            },
            version
          )
        }
      }
    })

    // Update tracked block IDs
    previousBlockIds.current = currentBlockIds
  }, [state.blocks, state.isDirty, pageId, queueBlockUpdate, createBlock])

  // Handle deleting blocks
  const deleteBlock = useCallback(async (blockId: string) => {
    try {
      await api.blocks.delete(blockId)
    } catch (error) {
      console.error('Failed to delete block:', error)
      throw error
    }
  }, [])

  // Save on window blur or before unload
  useEffect(() => {
    const handleBlur = () => forceSaveAll()
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.isDirty) {
        forceSaveAll()
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('blur', handleBlur)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [forceSaveAll, state.isDirty])

  // Provide sync status to children
  const syncContext = useMemo(
    () => ({
      syncStatus: overallSyncStatus(),
      getBlockSyncState,
      deleteBlock,
      loading,
      error,
    }),
    [overallSyncStatus, getBlockSyncState, deleteBlock, loading, error]
  )

  return <EditorSyncContext.Provider value={syncContext}>{children}</EditorSyncContext.Provider>
}

// Context for sync status
interface EditorSyncContextValue {
  syncStatus: 'saved' | 'saving' | 'error' | 'offline'
  getBlockSyncState: (blockId: string) => any
  deleteBlock: (blockId: string) => Promise<void>
  loading: boolean
  error: Error | null
}

const EditorSyncContext = React.createContext<EditorSyncContextValue | null>(null)

export function useEditorSync() {
  const context = React.useContext(EditorSyncContext)
  if (!context) {
    throw new Error('useEditorSync must be used within EnhancedEditorProvider')
  }
  return context
}
