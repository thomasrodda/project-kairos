// apps/web/src/contexts/EditorContext.tsx
// Global state management for the block-based editor using React Context with useReducer pattern.
// Manages all editor state including blocks, focused block, and selection. Provides actions for
// block CRUD operations and state updates through a centralized reducer for better debugging and undo/redo support.

import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { generateId } from '@kairos/utils'
import { applyFormat } from '../utils/textFormatting'

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

// Block types supported by the editor
export type BlockType = 'h1' | 'h2' | 'h3' | 'paragraph' | 'bullet'

// Text formatting types
export type FormatType = 'bold' | 'italic' | 'underline' | 'code' | 'strikethrough' | 'link'

// Text formatting data structure
export interface TextFormat {
  start: number // Start position in content string
  end: number // End position in content string
  type: FormatType // Type of formatting applied
  url?: string // For links
}

// Individual block data structure
export interface EditorBlock {
  id: string // Unique identifier for drag/drop and operations
  type: BlockType // Block type determines rendering and behavior
  content: string // Plain text content of the block (no markdown symbols)
  formatting?: TextFormat[] // Rich text annotations
  metadata?: {
    placeholder?: string // Custom placeholder text
    listIndex?: number // For ordered lists (future feature)
  }
}

// Cross-block text selection state
export interface CrossBlockSelection {
  startBlockId: string // ID of the block where selection starts
  startOffset: number // Character offset within start block
  endBlockId: string // ID of the block where selection ends
  endOffset: number // Character offset within end block
  selectedText: string // The actual selected text
  selectedBlocks: string[] // IDs of fully selected blocks (middle blocks)
  isCollapsed: boolean // Whether the selection is collapsed (cursor with no selection)
}

// Global editor state
export interface EditorState {
  pageId: string | null // Current page being edited
  pageTitle: string // Editable page title
  blocks: EditorBlock[] // All blocks in the page
  focusedBlockId: string | null // Currently focused block
  selectedBlockIds: string[] // Currently selected blocks (via drag handle)
  crossBlockSelection: CrossBlockSelection | null // Cross-block text selection
  isDragging: boolean // Whether we're currently dragging a block
  selectedRange?: {
    // Text selection across blocks (deprecated - using crossBlockSelection instead)
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
  | { type: 'DELETE_BLOCKS'; blockIds: string[] }
  | { type: 'CHANGE_BLOCK_TYPE'; blockId: string; blockType: BlockType }
  | { type: 'REORDER_BLOCKS'; blocks: EditorBlock[] }
  | { type: 'SET_FOCUSED_BLOCK'; blockId: string | null }
  | { type: 'SET_SELECTED_BLOCKS'; blockIds: string[] }
  | { type: 'TOGGLE_BLOCK_SELECTION'; blockId: string }
  | { type: 'SELECT_BLOCK_RANGE'; startBlockId: string; endBlockId: string }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_DRAGGING'; isDragging: boolean }
  | { type: 'SET_SELECTION'; selection: EditorState['selectedRange'] }
  | { type: 'SET_CROSS_BLOCK_SELECTION'; selection: CrossBlockSelection | null }
  | { type: 'APPLY_FORMATTING'; blockId: string; format: FormatType; range: { start: number; end: number }; url?: string }
  | { type: 'REMOVE_FORMATTING'; blockId: string; start: number; end: number; formatType?: FormatType }
  | { type: 'UPDATE_BLOCK_FORMATTING'; blockId: string; formatting: TextFormat[] }
  | { type: 'REPLACE_BLOCK'; oldBlockId: string; newBlock: EditorBlock }
  | { type: 'MARK_SAVED' }
  | { type: 'RESET_EDITOR' }

// =============================================================================
// INITIAL STATE
// =============================================================================

export const createInitialBlocks = (): EditorBlock[] => [
  {
    id: generateId(),
    type: 'h1',
    content: 'Welcome to the Editor',
    metadata: {
      placeholder: 'Heading 1',
    },
  },
  {
    id: generateId(),
    type: 'paragraph',
    content: 'This is the first paragraph. Try selecting text across multiple blocks.',
    metadata: {
      placeholder: 'Start writing...',
    },
  },
  {
    id: generateId(),
    type: 'paragraph',
    content: 'This is the second paragraph. You should be able to select from the first paragraph to here.',
    metadata: {
      placeholder: 'Start writing...',
    },
  },
  {
    id: generateId(),
    type: 'paragraph',
    content: 'This is the third paragraph. Cross-block selection should work smoothly.',
    metadata: {
      placeholder: 'Start writing...',
    },
  },
]

const initialState: EditorState = {
  pageId: null,
  pageTitle: 'Test Page',
  blocks: createInitialBlocks(),
  focusedBlockId: null,
  selectedBlockIds: [],
  crossBlockSelection: null,
  isDragging: false,
  selectedRange: undefined,
  isDirty: false,
  lastSaved: null,
}

// =============================================================================
// REDUCER
// =============================================================================

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_PAGE':
      return {
        ...state,
        pageId: action.pageId,
        pageTitle: action.title,
        blocks: action.blocks.length > 0 ? action.blocks : createInitialBlocks(),
        focusedBlockId: null,
        selectedBlockIds: [],
        crossBlockSelection: null,
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
        selectedBlockIds: [], // Clear selection when adding new block
        crossBlockSelection: null, // Clear text selection too
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

    case 'APPLY_FORMATTING': {
      const { blockId, format, range, url } = action
      const newBlocks = state.blocks.map((block) => {
        if (block.id !== blockId) return block

        const currentFormatting = block.formatting || []
        const updatedFormatting = applyFormat(currentFormatting, range.start, range.end, format, url)

        return {
          ...block,
          formatting: updatedFormatting,
        }
      })

      return {
        ...state,
        blocks: newBlocks,
        isDirty: true,
      }
    }

    case 'REMOVE_FORMATTING': {
      const { blockId, start, end, formatType } = action
      const newBlocks = state.blocks.map((block) => {
        if (block.id !== blockId || !block.formatting) return block

        const formatting = block.formatting.filter((format) => {
          // Remove formats that overlap with the specified range
          const overlaps = format.start < end && format.end > start
          const matchesType = !formatType || format.type === formatType
          return !(overlaps && matchesType)
        })

        return {
          ...block,
          formatting: formatting.length > 0 ? formatting : undefined,
        }
      })

      return {
        ...state,
        blocks: newBlocks,
        isDirty: true,
      }
    }

    case 'UPDATE_BLOCK_FORMATTING': {
      const { blockId, formatting } = action
      const newBlocks = state.blocks.map((block) => {
        if (block.id !== blockId) return block
        return {
          ...block,
          formatting: formatting.length > 0 ? formatting : undefined,
        }
      })

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
        selectedBlockIds: [], // Clear selection when deleting block
        crossBlockSelection: null, // Clear text selection too
        isDirty: true,
      }
    }

    case 'DELETE_BLOCKS': {
      // Don't delete all blocks - always keep at least one
      const blocksToDelete = new Set(action.blockIds)
      const remainingBlocks = state.blocks.filter((b) => !blocksToDelete.has(b.id))

      // If we would delete all blocks, keep one empty paragraph
      const newBlocks = remainingBlocks.length === 0 ? createInitialBlocks() : remainingBlocks

      // Find new focus target
      let newFocusedId = null
      if (remainingBlocks.length > 0) {
        // Focus the block before the first deleted block, or the first remaining block
        const firstDeletedIndex = state.blocks.findIndex((b) => blocksToDelete.has(b.id))
        if (firstDeletedIndex > 0) {
          newFocusedId = state.blocks[firstDeletedIndex - 1].id
        } else {
          newFocusedId = remainingBlocks[0].id
        }
      }

      return {
        ...state,
        blocks: newBlocks,
        focusedBlockId: newFocusedId,
        selectedBlockIds: [], // Clear selection after deletion
        crossBlockSelection: null, // Clear text selection too
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
      return {
        ...state,
        blocks: action.blocks,
        isDirty: true,
      }
    }

    case 'SET_FOCUSED_BLOCK':
      return {
        ...state,
        focusedBlockId: action.blockId,
        selectedBlockIds: [], // Clear selection when focusing for editing
        crossBlockSelection: null, // Clear text selection when focusing a block
      }

    case 'SET_SELECTED_BLOCKS':
      return {
        ...state,
        selectedBlockIds: action.blockIds,
        focusedBlockId: null, // Clear focus when selecting
        crossBlockSelection: null, // Clear text selection when selecting blocks
      }

    case 'TOGGLE_BLOCK_SELECTION': {
      const { blockId } = action
      const isSelected = state.selectedBlockIds.includes(blockId)

      return {
        ...state,
        selectedBlockIds: isSelected ? state.selectedBlockIds.filter((id) => id !== blockId) : [...state.selectedBlockIds, blockId],
        focusedBlockId: null, // Clear focus when selecting
        crossBlockSelection: null, // Clear text selection
      }
    }

    case 'SELECT_BLOCK_RANGE': {
      const { startBlockId, endBlockId } = action
      const startIndex = state.blocks.findIndex((b) => b.id === startBlockId)
      const endIndex = state.blocks.findIndex((b) => b.id === endBlockId)

      if (startIndex === -1 || endIndex === -1) return state

      const [minIndex, maxIndex] = [Math.min(startIndex, endIndex), Math.max(startIndex, endIndex)]
      const selectedIds = state.blocks.slice(minIndex, maxIndex + 1).map((b) => b.id)

      return {
        ...state,
        selectedBlockIds: selectedIds,
        focusedBlockId: null, // Clear focus when selecting range
        crossBlockSelection: null, // Clear text selection
      }
    }

    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedBlockIds: [],
        crossBlockSelection: null, // Also clear text selection
      }

    case 'SET_DRAGGING':
      return {
        ...state,
        isDragging: action.isDragging,
      }

    case 'SET_SELECTION':
      return {
        ...state,
        selectedRange: action.selection,
      }

    case 'SET_CROSS_BLOCK_SELECTION':
      return {
        ...state,
        crossBlockSelection: action.selection,
        // Clear block selection when text is selected
        selectedBlockIds: action.selection ? [] : state.selectedBlockIds,
      }

    case 'REPLACE_BLOCK': {
      const { oldBlockId, newBlock } = action
      const newBlocks = state.blocks.map((block) => (block.id === oldBlockId ? newBlock : block))

      // Update focused block if it was the replaced block
      const newFocusedId = state.focusedBlockId === oldBlockId ? newBlock.id : state.focusedBlockId

      // Update selected blocks if the old block was selected
      const newSelectedIds = state.selectedBlockIds.map((id) => (id === oldBlockId ? newBlock.id : id))

      return {
        ...state,
        blocks: newBlocks,
        focusedBlockId: newFocusedId,
        selectedBlockIds: newSelectedIds,
      }
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
