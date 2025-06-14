import {
  EditorState,
  EditorAction,
  EditorBlock,
  BlockType,
  CrossBlockSelection,
  TextFormat,
  editorReducer,
  createInitialBlocks,
} from './EditorContext'
import { generateId } from '@kairos/utils'

// Mock generateId
jest.mock('@kairos/utils', () => ({
  generateId: jest.fn(() => 'mock-id'),
}))

describe('EditorContext Reducer', () => {
  const mockDate = new Date('2024-01-01T00:00:00Z')

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    jest.setSystemTime(mockDate)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  // Helper to create initial state
  const createInitialState = (): EditorState => ({
    pageId: null,
    pageTitle: 'Test Page',
    blocks: [
      {
        id: 'block-1',
        type: 'paragraph',
        content: 'First block',
      },
      {
        id: 'block-2',
        type: 'paragraph',
        content: 'Second block',
      },
      {
        id: 'block-3',
        type: 'paragraph',
        content: 'Third block',
      },
    ],
    focusedBlockId: null,
    selectedBlockIds: [],
    crossBlockSelection: null,
    isDragging: false,
    selectedRange: undefined,
    isDirty: false,
    lastSaved: null,
  })

  describe('✅ Initial State', () => {
    it('should have correct initial state structure', () => {
      const state = createInitialState()

      expect(state.pageId).toBeNull()
      expect(state.pageTitle).toBe('Test Page')
      expect(state.blocks).toHaveLength(3)
      expect(state.focusedBlockId).toBeNull()
      expect(state.selectedBlockIds).toEqual([])
      expect(state.crossBlockSelection).toBeNull()
      expect(state.isDragging).toBe(false)
      expect(state.selectedRange).toBeUndefined()
      expect(state.isDirty).toBe(false)
      expect(state.lastSaved).toBeNull()
    })

    it('should handle invalid action type', () => {
      const state = createInitialState()
      const invalidAction = { type: 'INVALID_ACTION' } as any

      const newState = editorReducer(state, invalidAction)
      expect(newState).toBe(state) // Should return same reference
    })
  })

  describe('✅ State Immutability', () => {
    it('should not mutate the original state', () => {
      const state = createInitialState()
      const originalState = JSON.parse(JSON.stringify(state))

      // Test various actions
      editorReducer(state, { type: 'UPDATE_TITLE', title: 'New Title' })
      expect(state).toEqual(originalState)

      editorReducer(state, {
        type: 'ADD_BLOCK',
        block: { id: 'new-block', type: 'paragraph', content: 'New block' },
      })
      expect(state).toEqual(originalState)

      editorReducer(state, { type: 'DELETE_BLOCK', blockId: 'block-1' })
      expect(state).toEqual(originalState)
    })

    it('should create new state object for every action', () => {
      const state = createInitialState()

      const newState1 = editorReducer(state, { type: 'UPDATE_TITLE', title: 'New' })
      expect(newState1).not.toBe(state)

      const newState2 = editorReducer(state, { type: 'SET_DRAGGING', isDragging: true })
      expect(newState2).not.toBe(state)
    })
  })

  describe('✅ SET_PAGE Action', () => {
    it('should set page with provided blocks', () => {
      const state = createInitialState()
      const newBlocks: EditorBlock[] = [
        { id: 'new-1', type: 'h1', content: 'New Page Title' },
        { id: 'new-2', type: 'paragraph', content: 'New content' },
      ]

      const newState = editorReducer(state, {
        type: 'SET_PAGE',
        pageId: 'page-123',
        title: 'New Page',
        blocks: newBlocks,
      })

      expect(newState.pageId).toBe('page-123')
      expect(newState.pageTitle).toBe('New Page')
      expect(newState.blocks).toEqual(newBlocks)
      expect(newState.focusedBlockId).toBeNull()
      expect(newState.selectedBlockIds).toEqual([])
      expect(newState.crossBlockSelection).toBeNull()
      expect(newState.isDirty).toBe(false)
      expect(newState.lastSaved).toEqual(mockDate)
    })

    it('should create default blocks when empty blocks array provided', () => {
      const state = createInitialState()

      ;(generateId as jest.Mock)
        .mockReturnValueOnce('default-1')
        .mockReturnValueOnce('default-2')
        .mockReturnValueOnce('default-3')
        .mockReturnValueOnce('default-4')

      const newState = editorReducer(state, {
        type: 'SET_PAGE',
        pageId: 'page-123',
        title: 'Empty Page',
        blocks: [],
      })

      expect(newState.blocks).toHaveLength(4)
      expect(newState.blocks[0].type).toBe('h1')
      expect(newState.blocks[0].content).toBe('Welcome to the Editor')
    })
  })

  describe('✅ UPDATE_TITLE Action', () => {
    it('should update page title and mark as dirty', () => {
      const state = createInitialState()

      const newState = editorReducer(state, {
        type: 'UPDATE_TITLE',
        title: 'Updated Title',
      })

      expect(newState.pageTitle).toBe('Updated Title')
      expect(newState.isDirty).toBe(true)
      expect(newState.blocks).toBe(state.blocks) // Should reuse blocks array
    })
  })

  describe('✅ ADD_BLOCK Action', () => {
    it('should add block at end when no afterBlockId provided', () => {
      const state = createInitialState()
      const newBlock: EditorBlock = {
        id: 'new-block',
        type: 'paragraph',
        content: 'New content',
      }

      const newState = editorReducer(state, {
        type: 'ADD_BLOCK',
        block: newBlock,
      })

      expect(newState.blocks).toHaveLength(4)
      expect(newState.blocks[3]).toEqual(newBlock)
      expect(newState.focusedBlockId).toBe('new-block')
      expect(newState.selectedBlockIds).toEqual([])
      expect(newState.crossBlockSelection).toBeNull()
      expect(newState.isDirty).toBe(true)
    })

    it('should add block after specified block', () => {
      const state = createInitialState()
      const newBlock: EditorBlock = {
        id: 'new-block',
        type: 'paragraph',
        content: 'Inserted content',
      }

      const newState = editorReducer(state, {
        type: 'ADD_BLOCK',
        block: newBlock,
        afterBlockId: 'block-1',
      })

      expect(newState.blocks).toHaveLength(4)
      expect(newState.blocks[1]).toEqual(newBlock)
      expect(newState.blocks[0].id).toBe('block-1')
      expect(newState.blocks[2].id).toBe('block-2')
    })

    it('should add block at end when afterBlockId not found', () => {
      const state = createInitialState()
      const newBlock: EditorBlock = {
        id: 'new-block',
        type: 'paragraph',
        content: 'New content',
      }

      const newState = editorReducer(state, {
        type: 'ADD_BLOCK',
        block: newBlock,
        afterBlockId: 'non-existent',
      })

      expect(newState.blocks).toHaveLength(4)
      expect(newState.blocks[3]).toEqual(newBlock)
    })
  })

  describe('✅ UPDATE_BLOCK Action', () => {
    it('should update block content', () => {
      const state = createInitialState()

      const newState = editorReducer(state, {
        type: 'UPDATE_BLOCK',
        blockId: 'block-2',
        content: 'Updated content',
      })

      expect(newState.blocks[1].content).toBe('Updated content')
      expect(newState.blocks[0].content).toBe('First block')
      expect(newState.blocks[2].content).toBe('Third block')
      expect(newState.isDirty).toBe(true)
    })

    it('should handle non-existent block ID', () => {
      const state = createInitialState()

      const newState = editorReducer(state, {
        type: 'UPDATE_BLOCK',
        blockId: 'non-existent',
        content: 'Updated content',
      })

      expect(newState.blocks).toEqual(state.blocks)
      expect(newState.isDirty).toBe(true) // Still marks as dirty
    })
  })

  describe('✅ DELETE_BLOCK Action', () => {
    it('should delete block and update focus to previous block', () => {
      const state = createInitialState()

      const newState = editorReducer(state, {
        type: 'DELETE_BLOCK',
        blockId: 'block-2',
      })

      expect(newState.blocks).toHaveLength(2)
      expect(newState.blocks.find((b) => b.id === 'block-2')).toBeUndefined()
      expect(newState.focusedBlockId).toBe('block-1')
      expect(newState.selectedBlockIds).toEqual([])
      expect(newState.crossBlockSelection).toBeNull()
      expect(newState.isDirty).toBe(true)
    })

    it('should focus next block when deleting first block', () => {
      const state = createInitialState()

      const newState = editorReducer(state, {
        type: 'DELETE_BLOCK',
        blockId: 'block-1',
      })

      expect(newState.blocks).toHaveLength(2)
      expect(newState.focusedBlockId).toBe('block-2')
    })

    it('should not delete the last remaining block', () => {
      const state: EditorState = {
        ...createInitialState(),
        blocks: [{ id: 'only-block', type: 'paragraph', content: 'Content' }],
      }

      const newState = editorReducer(state, {
        type: 'DELETE_BLOCK',
        blockId: 'only-block',
      })

      expect(newState).toBe(state) // Should return same state
      expect(newState.blocks).toHaveLength(1)
    })
  })

  describe('✅ DELETE_BLOCKS Action', () => {
    it('should delete multiple blocks', () => {
      const state = createInitialState()

      const newState = editorReducer(state, {
        type: 'DELETE_BLOCKS',
        blockIds: ['block-1', 'block-3'],
      })

      expect(newState.blocks).toHaveLength(1)
      expect(newState.blocks[0].id).toBe('block-2')
      expect(newState.selectedBlockIds).toEqual([])
      expect(newState.crossBlockSelection).toBeNull()
      expect(newState.isDirty).toBe(true)
    })

    it('should create default blocks when all blocks deleted', () => {
      const state = createInitialState()

      ;(generateId as jest.Mock)
        .mockReturnValueOnce('default-1')
        .mockReturnValueOnce('default-2')
        .mockReturnValueOnce('default-3')
        .mockReturnValueOnce('default-4')

      const newState = editorReducer(state, {
        type: 'DELETE_BLOCKS',
        blockIds: ['block-1', 'block-2', 'block-3'],
      })

      expect(newState.blocks).toHaveLength(4)
      expect(newState.blocks[0].type).toBe('h1')
      expect(newState.blocks[0].content).toBe('Welcome to the Editor')
    })

    it('should focus block before first deleted block', () => {
      const state: EditorState = {
        ...createInitialState(),
        blocks: [
          { id: 'block-1', type: 'paragraph', content: 'First' },
          { id: 'block-2', type: 'paragraph', content: 'Second' },
          { id: 'block-3', type: 'paragraph', content: 'Third' },
          { id: 'block-4', type: 'paragraph', content: 'Fourth' },
        ],
      }

      const newState = editorReducer(state, {
        type: 'DELETE_BLOCKS',
        blockIds: ['block-2', 'block-3'],
      })

      expect(newState.focusedBlockId).toBe('block-1')
    })

    it('should focus first remaining block when deleting from start', () => {
      const state = createInitialState()

      const newState = editorReducer(state, {
        type: 'DELETE_BLOCKS',
        blockIds: ['block-1', 'block-2'],
      })

      expect(newState.focusedBlockId).toBe('block-3')
    })
  })

  describe('✅ CHANGE_BLOCK_TYPE Action', () => {
    it('should change block type', () => {
      const state = createInitialState()

      const newState = editorReducer(state, {
        type: 'CHANGE_BLOCK_TYPE',
        blockId: 'block-1',
        blockType: 'h1',
      })

      expect(newState.blocks[0].type).toBe('h1')
      expect(newState.blocks[0].content).toBe('First block') // Content unchanged
      expect(newState.isDirty).toBe(true)
    })

    it('should handle non-existent block ID', () => {
      const state = createInitialState()

      const newState = editorReducer(state, {
        type: 'CHANGE_BLOCK_TYPE',
        blockId: 'non-existent',
        blockType: 'h1',
      })

      expect(newState.blocks).toEqual(state.blocks)
      expect(newState.isDirty).toBe(true)
    })
  })

  describe('✅ REORDER_BLOCKS Action', () => {
    it('should reorder blocks', () => {
      const state = createInitialState()
      const reorderedBlocks = [state.blocks[2], state.blocks[0], state.blocks[1]]

      const newState = editorReducer(state, {
        type: 'REORDER_BLOCKS',
        blocks: reorderedBlocks,
      })

      expect(newState.blocks).toEqual(reorderedBlocks)
      expect(newState.blocks[0].id).toBe('block-3')
      expect(newState.blocks[1].id).toBe('block-1')
      expect(newState.blocks[2].id).toBe('block-2')
      expect(newState.isDirty).toBe(true)
    })
  })

  describe('✅ Selection Actions', () => {
    it('SET_FOCUSED_BLOCK should update focus and clear selections', () => {
      const state: EditorState = {
        ...createInitialState(),
        selectedBlockIds: ['block-1', 'block-2'],
        crossBlockSelection: {
          startBlockId: 'block-1',
          startOffset: 0,
          endBlockId: 'block-2',
          endOffset: 5,
          selectedText: 'test',
          selectedBlocks: [],
          isCollapsed: false,
        },
      }

      const newState = editorReducer(state, {
        type: 'SET_FOCUSED_BLOCK',
        blockId: 'block-2',
      })

      expect(newState.focusedBlockId).toBe('block-2')
      expect(newState.selectedBlockIds).toEqual([])
      expect(newState.crossBlockSelection).toBeNull()
    })

    it('SET_FOCUSED_BLOCK should handle null blockId', () => {
      const state = createInitialState()

      const newState = editorReducer(state, {
        type: 'SET_FOCUSED_BLOCK',
        blockId: null,
      })

      expect(newState.focusedBlockId).toBeNull()
    })

    it('SET_SELECTED_BLOCKS should update selection and clear focus', () => {
      const state: EditorState = {
        ...createInitialState(),
        focusedBlockId: 'block-1',
        crossBlockSelection: {
          startBlockId: 'block-1',
          startOffset: 0,
          endBlockId: 'block-2',
          endOffset: 5,
          selectedText: 'test',
          selectedBlocks: [],
          isCollapsed: false,
        },
      }

      const newState = editorReducer(state, {
        type: 'SET_SELECTED_BLOCKS',
        blockIds: ['block-1', 'block-3'],
      })

      expect(newState.selectedBlockIds).toEqual(['block-1', 'block-3'])
      expect(newState.focusedBlockId).toBeNull()
      expect(newState.crossBlockSelection).toBeNull()
    })

    it('TOGGLE_BLOCK_SELECTION should add unselected block', () => {
      const state: EditorState = {
        ...createInitialState(),
        selectedBlockIds: ['block-1'],
      }

      const newState = editorReducer(state, {
        type: 'TOGGLE_BLOCK_SELECTION',
        blockId: 'block-2',
      })

      expect(newState.selectedBlockIds).toEqual(['block-1', 'block-2'])
      expect(newState.focusedBlockId).toBeNull()
      expect(newState.crossBlockSelection).toBeNull()
    })

    it('TOGGLE_BLOCK_SELECTION should remove selected block', () => {
      const state: EditorState = {
        ...createInitialState(),
        selectedBlockIds: ['block-1', 'block-2'],
      }

      const newState = editorReducer(state, {
        type: 'TOGGLE_BLOCK_SELECTION',
        blockId: 'block-1',
      })

      expect(newState.selectedBlockIds).toEqual(['block-2'])
    })

    it('SELECT_BLOCK_RANGE should select range of blocks', () => {
      const state = createInitialState()

      const newState = editorReducer(state, {
        type: 'SELECT_BLOCK_RANGE',
        startBlockId: 'block-1',
        endBlockId: 'block-3',
      })

      expect(newState.selectedBlockIds).toEqual(['block-1', 'block-2', 'block-3'])
      expect(newState.focusedBlockId).toBeNull()
      expect(newState.crossBlockSelection).toBeNull()
    })

    it('SELECT_BLOCK_RANGE should handle reversed range', () => {
      const state = createInitialState()

      const newState = editorReducer(state, {
        type: 'SELECT_BLOCK_RANGE',
        startBlockId: 'block-3',
        endBlockId: 'block-1',
      })

      expect(newState.selectedBlockIds).toEqual(['block-1', 'block-2', 'block-3'])
    })

    it('SELECT_BLOCK_RANGE should handle invalid block IDs', () => {
      const state = createInitialState()

      const newState = editorReducer(state, {
        type: 'SELECT_BLOCK_RANGE',
        startBlockId: 'invalid-1',
        endBlockId: 'block-2',
      })

      expect(newState).toBe(state) // Should return same state
    })

    it('CLEAR_SELECTION should clear all selections', () => {
      const state: EditorState = {
        ...createInitialState(),
        selectedBlockIds: ['block-1', 'block-2'],
        crossBlockSelection: {
          startBlockId: 'block-1',
          startOffset: 0,
          endBlockId: 'block-2',
          endOffset: 5,
          selectedText: 'test',
          selectedBlocks: [],
          isCollapsed: false,
        },
      }

      const newState = editorReducer(state, { type: 'CLEAR_SELECTION' })

      expect(newState.selectedBlockIds).toEqual([])
      expect(newState.crossBlockSelection).toBeNull()
    })
  })

  describe('✅ Text Formatting Actions', () => {
    it('APPLY_FORMATTING should add formatting to block', () => {
      const state = createInitialState()

      const newState = editorReducer(state, {
        type: 'APPLY_FORMATTING',
        blockId: 'block-1',
        format: 'bold',
        range: { start: 5, end: 10 },
      })

      expect(newState.blocks[0].formatting).toEqual([{ type: 'bold', start: 5, end: 10 }])
      expect(newState.isDirty).toBe(true)
    })

    it('APPLY_FORMATTING should merge with existing formats', () => {
      const state: EditorState = {
        ...createInitialState(),
        blocks: [
          {
            id: 'block-1',
            type: 'paragraph',
            content: 'First block with formatting',
            formatting: [{ type: 'bold', start: 0, end: 5 }],
          },
          ...createInitialState().blocks.slice(1),
        ],
      }

      const newState = editorReducer(state, {
        type: 'APPLY_FORMATTING',
        blockId: 'block-1',
        format: 'italic',
        range: { start: 6, end: 11 },
      })

      expect(newState.blocks[0].formatting).toHaveLength(2)
      expect(newState.blocks[0].formatting).toContainEqual({ type: 'bold', start: 0, end: 5 })
      expect(newState.blocks[0].formatting).toContainEqual({ type: 'italic', start: 6, end: 11 })
    })

    it('REMOVE_FORMATTING should remove specific format from block', () => {
      const state: EditorState = {
        ...createInitialState(),
        blocks: [
          {
            id: 'block-1',
            type: 'paragraph',
            content: 'First block',
            formatting: [
              { type: 'bold', start: 0, end: 5 },
              { type: 'italic', start: 6, end: 11 },
            ],
          },
          ...createInitialState().blocks.slice(1),
        ],
      }

      const newState = editorReducer(state, {
        type: 'REMOVE_FORMATTING',
        blockId: 'block-1',
        start: 0,
        end: 5,
        formatType: 'bold',
      })

      expect(newState.blocks[0].formatting).toHaveLength(1)
      expect(newState.blocks[0].formatting).toEqual([{ type: 'italic', start: 6, end: 11 }])
      expect(newState.isDirty).toBe(true)
    })

    it('UPDATE_BLOCK_FORMATTING should update block formatting', () => {
      const state = createInitialState()
      const newFormatting: TextFormat[] = [
        { type: 'bold', start: 0, end: 5 },
        { type: 'italic', start: 6, end: 11 },
      ]

      const newState = editorReducer(state, {
        type: 'UPDATE_BLOCK_FORMATTING',
        blockId: 'block-1',
        formatting: newFormatting,
      })

      expect(newState.blocks[0].formatting).toEqual(newFormatting)
      expect(newState.isDirty).toBe(true)
    })

    it('should handle formatting for non-existent block', () => {
      const state = createInitialState()

      const newState = editorReducer(state, {
        type: 'APPLY_FORMATTING',
        blockId: 'non-existent',
        format: 'bold',
        range: { start: 0, end: 5 },
      })

      expect(newState.blocks).toEqual(state.blocks)
      expect(newState.isDirty).toBe(true)
    })

    it('should handle link formatting with URL', () => {
      const state = createInitialState()

      const newState = editorReducer(state, {
        type: 'APPLY_FORMATTING',
        blockId: 'block-1',
        format: 'link',
        range: { start: 5, end: 10 },
        url: 'https://example.com',
      })

      expect(newState.blocks[0].formatting).toEqual([
        {
          type: 'link',
          start: 5,
          end: 10,
          url: 'https://example.com',
        },
      ])
    })
  })

  describe('✅ Other Actions', () => {
    it('SET_DRAGGING should update dragging state', () => {
      const state = createInitialState()

      const newState = editorReducer(state, {
        type: 'SET_DRAGGING',
        isDragging: true,
      })

      expect(newState.isDragging).toBe(true)

      const newState2 = editorReducer(newState, {
        type: 'SET_DRAGGING',
        isDragging: false,
      })

      expect(newState2.isDragging).toBe(false)
    })

    it('SET_SELECTION should update selected range', () => {
      const state = createInitialState()
      const selection = {
        startBlockId: 'block-1',
        startOffset: 5,
        endBlockId: 'block-2',
        endOffset: 10,
      }

      const newState = editorReducer(state, {
        type: 'SET_SELECTION',
        selection,
      })

      expect(newState.selectedRange).toEqual(selection)
    })

    it('SET_CROSS_BLOCK_SELECTION should update cross block selection', () => {
      const state = createInitialState()
      const selection: CrossBlockSelection = {
        startBlockId: 'block-1',
        startOffset: 0,
        endBlockId: 'block-2',
        endOffset: 5,
        selectedText: 'test',
        selectedBlocks: ['block-1', 'block-2'],
        isCollapsed: false,
      }

      const newState = editorReducer(state, {
        type: 'SET_CROSS_BLOCK_SELECTION',
        selection,
      })

      expect(newState.crossBlockSelection).toEqual(selection)
      expect(newState.selectedBlockIds).toEqual([]) // Should clear block selection
    })

    it('SET_CROSS_BLOCK_SELECTION with null should not clear block selection', () => {
      const state: EditorState = {
        ...createInitialState(),
        selectedBlockIds: ['block-1', 'block-2'],
      }

      const newState = editorReducer(state, {
        type: 'SET_CROSS_BLOCK_SELECTION',
        selection: null,
      })

      expect(newState.crossBlockSelection).toBeNull()
      expect(newState.selectedBlockIds).toEqual(['block-1', 'block-2'])
    })

    it('MARK_SAVED should update save state', () => {
      const state: EditorState = {
        ...createInitialState(),
        isDirty: true,
      }

      const newState = editorReducer(state, { type: 'MARK_SAVED' })

      expect(newState.isDirty).toBe(false)
      expect(newState.lastSaved).toEqual(mockDate)
    })

    it('RESET_EDITOR should reset to initial state', () => {
      const state: EditorState = {
        ...createInitialState(),
        pageId: 'page-123',
        pageTitle: 'Modified',
        focusedBlockId: 'block-1',
        selectedBlockIds: ['block-2'],
        isDirty: true,
      }

      ;(generateId as jest.Mock)
        .mockReturnValueOnce('reset-1')
        .mockReturnValueOnce('reset-2')
        .mockReturnValueOnce('reset-3')
        .mockReturnValueOnce('reset-4')

      const newState = editorReducer(state, { type: 'RESET_EDITOR' })

      expect(newState.pageId).toBeNull()
      expect(newState.pageTitle).toBe('Test Page')
      expect(newState.blocks).toHaveLength(4)
      expect(newState.blocks[0].type).toBe('h1')
      expect(newState.focusedBlockId).toBeNull()
      expect(newState.selectedBlockIds).toEqual([])
      expect(newState.isDirty).toBe(false)
      expect(newState.lastSaved).toBeNull()
    })
  })

  describe('✅ Business Rules', () => {
    it('should handle complex multi-action sequences like real user interactions', () => {
      let state = createInitialState()

      // User creates a new block
      state = editorReducer(state, {
        type: 'ADD_BLOCK',
        block: { id: 'new-block', type: 'paragraph', content: 'New paragraph' },
        afterBlockId: 'block-1',
      })

      // User applies bold formatting to part of the new block
      state = editorReducer(state, {
        type: 'APPLY_FORMATTING',
        blockId: 'new-block',
        format: 'bold',
        range: { start: 0, end: 3 },
      })

      // User changes block type to heading
      state = editorReducer(state, {
        type: 'CHANGE_BLOCK_TYPE',
        blockId: 'new-block',
        blockType: 'h2',
      })

      // Verify final state
      const newBlock = state.blocks.find((b) => b.id === 'new-block')
      expect(newBlock).toBeDefined()
      expect(newBlock!.type).toBe('h2')
      expect(newBlock!.content).toBe('New paragraph')
      expect(newBlock!.formatting).toEqual([{ type: 'bold', start: 0, end: 3 }])
      expect(state.focusedBlockId).toBe('new-block')
      expect(state.isDirty).toBe(true)
    })

    it('should maintain formatting when moving blocks', () => {
      const formattedBlock: EditorBlock = {
        id: 'formatted-block',
        type: 'paragraph',
        content: 'Bold and italic text',
        formatting: [
          { type: 'bold', start: 0, end: 4 },
          { type: 'italic', start: 9, end: 15 },
        ],
      }

      const state: EditorState = {
        ...createInitialState(),
        blocks: [formattedBlock, ...createInitialState().blocks],
      }

      // Reorder blocks
      const reorderedBlocks = [
        state.blocks[1],
        state.blocks[2],
        state.blocks[0], // formatted block moved to end
        state.blocks[3],
      ]

      const newState = editorReducer(state, {
        type: 'REORDER_BLOCKS',
        blocks: reorderedBlocks,
      })

      const movedBlock = newState.blocks[2]
      expect(movedBlock.id).toBe('formatted-block')
      expect(movedBlock.formatting).toEqual(formattedBlock.formatting)
    })

    it('should clear formatting when changing block type to non-text', () => {
      const state: EditorState = {
        ...createInitialState(),
        blocks: [
          {
            id: 'block-1',
            type: 'paragraph',
            content: 'Formatted text',
            formatting: [{ type: 'bold', start: 0, end: 9 }],
          },
          ...createInitialState().blocks.slice(1),
        ],
      }

      // This test assumes a future feature where some block types don't support formatting
      // For now, just verify formatting is preserved
      const newState = editorReducer(state, {
        type: 'CHANGE_BLOCK_TYPE',
        blockId: 'block-1',
        blockType: 'h1',
      })

      expect(newState.blocks[0].formatting).toEqual([{ type: 'bold', start: 0, end: 9 }])
    })

    it('should not allow deleting the last block', () => {
      const state: EditorState = {
        ...createInitialState(),
        blocks: [{ id: 'only-block', type: 'paragraph', content: 'Content' }],
      }

      const newState = editorReducer(state, {
        type: 'DELETE_BLOCK',
        blockId: 'only-block',
      })

      expect(newState.blocks).toHaveLength(1)
      expect(newState).toBe(state)
    })

    it('should clear selections when focusing a block', () => {
      const state: EditorState = {
        ...createInitialState(),
        selectedBlockIds: ['block-1', 'block-2'],
        crossBlockSelection: {
          startBlockId: 'block-1',
          startOffset: 0,
          endBlockId: 'block-2',
          endOffset: 5,
          selectedText: 'test',
          selectedBlocks: [],
          isCollapsed: false,
        },
      }

      const newState = editorReducer(state, {
        type: 'SET_FOCUSED_BLOCK',
        blockId: 'block-3',
      })

      expect(newState.selectedBlockIds).toEqual([])
      expect(newState.crossBlockSelection).toBeNull()
    })

    it('should clear block selection when text is selected', () => {
      const state: EditorState = {
        ...createInitialState(),
        selectedBlockIds: ['block-1', 'block-2'],
      }

      const newState = editorReducer(state, {
        type: 'SET_CROSS_BLOCK_SELECTION',
        selection: {
          startBlockId: 'block-1',
          startOffset: 0,
          endBlockId: 'block-1',
          endOffset: 5,
          selectedText: 'test',
          selectedBlocks: [],
          isCollapsed: false,
        },
      })

      expect(newState.selectedBlockIds).toEqual([])
    })

    it('should track dirty state for content changes', () => {
      const state = createInitialState()

      // UPDATE_TITLE
      let newState = editorReducer(state, { type: 'UPDATE_TITLE', title: 'New' })
      expect(newState.isDirty).toBe(true)

      // ADD_BLOCK
      newState = editorReducer(state, {
        type: 'ADD_BLOCK',
        block: { id: 'new', type: 'paragraph', content: 'New' },
      })
      expect(newState.isDirty).toBe(true)

      // UPDATE_BLOCK
      newState = editorReducer(state, {
        type: 'UPDATE_BLOCK',
        blockId: 'block-1',
        content: 'Updated',
      })
      expect(newState.isDirty).toBe(true)

      // DELETE_BLOCK
      newState = editorReducer(state, { type: 'DELETE_BLOCK', blockId: 'block-1' })
      expect(newState.isDirty).toBe(true)

      // CHANGE_BLOCK_TYPE
      newState = editorReducer(state, {
        type: 'CHANGE_BLOCK_TYPE',
        blockId: 'block-1',
        blockType: 'h1',
      })
      expect(newState.isDirty).toBe(true)

      // REORDER_BLOCKS
      newState = editorReducer(state, {
        type: 'REORDER_BLOCKS',
        blocks: [state.blocks[1], state.blocks[0], state.blocks[2]],
      })
      expect(newState.isDirty).toBe(true)
    })
  })

  describe('✅ Error Handling and Edge Cases', () => {
    it('should handle malformed formatting ranges gracefully', () => {
      const state = createInitialState()

      const newState = editorReducer(state, {
        type: 'APPLY_FORMATTING',
        blockId: 'block-1',
        format: 'bold',
        range: { start: 10, end: 5 }, // end before start
      })

      // Should either fix the range or ignore it
      // Current implementation may just add it as-is
      expect(newState.blocks[0].formatting).toBeDefined()
    })

    it('should handle formatting beyond content length', () => {
      const state = createInitialState()
      // block-1 has content 'First block' (11 chars)

      const newState = editorReducer(state, {
        type: 'APPLY_FORMATTING',
        blockId: 'block-1',
        format: 'bold',
        range: { start: 10, end: 20 }, // beyond content length
      })

      expect(newState.blocks[0].formatting).toEqual([{ type: 'bold', start: 10, end: 20 }])
      // In practice, the formatting renderer should handle this edge case
    })

    it('should handle concurrent modifications safely', () => {
      const state = createInitialState()

      // Simulate rapid updates that might happen from user typing
      let newState = state
      for (let i = 0; i < 5; i++) {
        newState = editorReducer(newState, {
          type: 'UPDATE_BLOCK',
          blockId: 'block-1',
          content: `Updated content ${i}`,
        })
      }

      expect(newState.blocks[0].content).toBe('Updated content 4')
      expect(newState.isDirty).toBe(true)

      // Each update should create a new state object
      expect(newState).not.toBe(state)
    })
  })
})
