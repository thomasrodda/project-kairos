// apps/web/src/contexts/EditorContext.tsx
// Global state management for the block-based editor using React Context with useReducer pattern.
// Manages all editor state including blocks, focused block, and selection. Provides actions for
// block CRUD operations and state updates through a centralized reducer for better debugging and undo/redo support.

import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { generateId } from '@kairos/utils'

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

// Block types supported by the editor
export type BlockType = 'h1' | 'h2' | 'h3' | 'paragraph' | 'bullet'

// Individual block data structure
export interface EditorBlock {
  id: string // Unique identifier for drag/drop and operations
  type: BlockType // Block type determines rendering and behavior
  content: string // Plain text content of the block
  metadata?: {
    placeholder?: string // Custom placeholder text
    listIndex?: number // For ordered lists (future feature)
  }
}

// Global editor state
export interface EditorState {
  pageId: string | null // Current page being edited
  pageTitle: string // Editable page title
  blocks: EditorBlock[] // All blocks in the page
  focusedBlockId: string | null // Currently focused block
  selectedBlockId: string | null // Currently selected block (via drag handle)
  selectedRange?: {
    // Text selection across blocks
    startBlockId: string
    startOffset: number
    endBlockId: string
    endOffset: number
  }
  isDirty: boolean // Has unsaved changes
  lastSaved: Date | null // Last save timestamp
}

// =============================================================================
// ACTION TYPES
// =============================================================================

export type EditorAction =
  | { type: 'SET_PAGE'; pageId: string; title: string; blocks: EditorBlock[] }
  | { type: 'UPDATE_TITLE'; title: string }
  | { type: 'ADD_BLOCK'; block: EditorBlock; afterBlockId?: string }
  | { type: 'UPDATE_BLOCK'; blockId: string; content: string }
  | { type: 'DELETE_BLOCK'; blockId: string }
  | { type: 'CHANGE_BLOCK_TYPE'; blockId: string; blockType: BlockType }
  | { type: 'REORDER_BLOCKS'; blockIds: string[] }
  | { type: 'SET_FOCUSED_BLOCK'; blockId: string | null }
  | { type: 'SET_SELECTED_BLOCK'; blockId: string | null }
  | { type: 'SET_SELECTION'; selection: EditorState['selectedRange'] }
  | { type: 'MARK_SAVED' }
  | { type: 'RESET_EDITOR' }

// =============================================================================
// INITIAL STATE
// =============================================================================

const createInitialBlock = (): EditorBlock => ({
  id: generateId(),
  type: 'paragraph',
  content: '',
  metadata: {
    placeholder: 'Start writing...',
  },
})

const initialState: EditorState = {
  pageId: null,
  pageTitle: 'New Page',
  blocks: [createInitialBlock()],
  focusedBlockId: null,
  selectedBlockId: null,
  selectedRange: undefined,
  isDirty: false,
  lastSaved: null,
}

// =============================================================================
// REDUCER
// =============================================================================

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_PAGE':
      return {
        ...state,
        pageId: action.pageId,
        pageTitle: action.title,
        blocks: action.blocks.length > 0 ? action.blocks : [createInitialBlock()],
        focusedBlockId: null,
        selectedBlockId: null,
        selectedRange: undefined,
        isDirty: false,
        lastSaved: new Date(),
      }

    case 'UPDATE_TITLE':
      return {
        ...state,
        pageTitle: action.title,
        isDirty: true,
      }

    case 'ADD_BLOCK': {
      const { block, afterBlockId } = action
      const newBlocks = [...state.blocks]

      if (afterBlockId) {
        const index = newBlocks.findIndex((b) => b.id === afterBlockId)
        if (index !== -1) {
          newBlocks.splice(index + 1, 0, block)
        } else {
          newBlocks.push(block)
        }
      } else {
        newBlocks.push(block)
      }

      return {
        ...state,
        blocks: newBlocks,
        focusedBlockId: block.id,
        selectedBlockId: null, // Clear selection when adding new block
        isDirty: true,
      }
    }

    case 'UPDATE_BLOCK': {
      const newBlocks = state.blocks.map((block) => (block.id === action.blockId ? { ...block, content: action.content } : block))

      return {
        ...state,
        blocks: newBlocks,
        isDirty: true,
      }
    }

    case 'DELETE_BLOCK': {
      // Don't delete if it's the only block
      if (state.blocks.length === 1) {
        return state
      }

      const blockIndex = state.blocks.findIndex((b) => b.id === action.blockId)
      const newBlocks = state.blocks.filter((b) => b.id !== action.blockId)

      // Update focus to previous block or next block
      let newFocusedId = null
      if (blockIndex > 0) {
        newFocusedId = state.blocks[blockIndex - 1].id
      } else if (newBlocks.length > 0) {
        newFocusedId = newBlocks[0].id
      }

      return {
        ...state,
        blocks: newBlocks,
        focusedBlockId: newFocusedId,
        selectedBlockId: null, // Clear selection when deleting block
        isDirty: true,
      }
    }

    case 'CHANGE_BLOCK_TYPE': {
      const newBlocks = state.blocks.map((block) => (block.id === action.blockId ? { ...block, type: action.blockType } : block))

      return {
        ...state,
        blocks: newBlocks,
        isDirty: true,
      }
    }

    case 'REORDER_BLOCKS': {
      // Reorder blocks based on the new order of IDs
      const blockMap = new Map(state.blocks.map((b) => [b.id, b]))
      const newBlocks = action.blockIds.map((id) => blockMap.get(id)).filter((block): block is EditorBlock => block !== undefined)

      return {
        ...state,
        blocks: newBlocks,
        isDirty: true,
      }
    }

    case 'SET_FOCUSED_BLOCK':
      return {
        ...state,
        focusedBlockId: action.blockId,
        selectedBlockId: null, // Clear selection when focusing for editing
      }

    case 'SET_SELECTED_BLOCK':
      return {
        ...state,
        selectedBlockId: action.blockId,
        focusedBlockId: null, // Clear focus when selecting
      }

    case 'SET_SELECTION':
      return {
        ...state,
        selectedRange: action.selection,
      }

    case 'MARK_SAVED':
      return {
        ...state,
        isDirty: false,
        lastSaved: new Date(),
      }

    case 'RESET_EDITOR':
      return initialState

    default:
      return state
  }
}

// =============================================================================
// CONTEXT
// =============================================================================

interface EditorContextValue {
  state: EditorState
  dispatch: React.Dispatch<EditorAction>
}

const EditorContext = createContext<EditorContextValue | undefined>(undefined)

// =============================================================================
// PROVIDER
// =============================================================================

interface EditorProviderProps {
  children: ReactNode
}

export function EditorProvider({ children }: EditorProviderProps) {
  const [state, dispatch] = useReducer(editorReducer, initialState)

  return <EditorContext.Provider value={{ state, dispatch }}>{children}</EditorContext.Provider>
}

// =============================================================================
// HOOKS
// =============================================================================

// Main hook for accessing editor context
export function useEditor() {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider')
  }
  return context
}

// Convenience hook for accessing just the editor state
export function useEditorState() {
  const { state } = useEditor()
  return state
}

// Convenience hook for accessing just the dispatch function
export function useEditorDispatch() {
  const { dispatch } = useEditor()
  return dispatch
}

// =============================================================================
// PLACEHOLDER TEXT CONSTANTS
// =============================================================================

export const BLOCK_PLACEHOLDERS: Record<BlockType, string> = {
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  paragraph: 'Start writing...',
  bullet: 'List item',
}
