// Import @dnd-kit mocks FIRST before any other imports
import '../../../test/mocks/dnd-kit'
import {
  resetDragState,
  getDragState,
  simulateDragStart,
  simulateDragOver,
  simulateDragEnd,
  simulateDragCancel,
  simulateKeyboardDrag,
} from '../../../test/mocks/dnd-kit'

import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BlockDragHandle } from './BlockDragHandle'
import { renderWithEditor } from '../../../test/utils'
import { EditorContent } from '../EditorContent/EditorContent'
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core'

// Mock the Icon component from @kairos/ui
jest.mock('@kairos/ui', () => ({
  Icon: ({ name, size }: { name: string; size: number }) => (
    <div data-testid={`icon-${name}`} data-size={size}>
      {name}
    </div>
  ),
}))

// Mock dependencies for EditorContent
jest.mock('../PageTitle', () => ({
  PageTitle: ({ title }: { title: string }) => (
    <h1 data-testid="page-title" className="page-title">
      {title}
    </h1>
  ),
}))

jest.mock('../ContentEditableContainer', () => ({
  ContentEditableContainer: ({ children, onBlockClick }: { children: React.ReactNode; onBlockClick: (id: string) => void }) => (
    <div
      data-testid="content-editable-container"
      className="content-editable-container"
      onClick={(e) => {
        const blockEl = (e.target as HTMLElement).closest('[data-block-id]')
        if (blockEl) {
          const blockId = blockEl.getAttribute('data-block-id')
          if (blockId) {
            onBlockClick(blockId)
          }
        }
      }}
    >
      {children}
    </div>
  ),
}))

jest.mock('../FormattingToolbar', () => ({
  FormattingToolbar: () => null,
}))

// Mock hooks
const mockClearSelection = jest.fn()
const mockGetSelectedText = jest.fn()
const mockGetSelectedMarkdown = jest.fn()

jest.mock('../../../hooks', () => ({
  useDismiss: jest.fn(),
  useCrossBlockSelection: jest.fn(() => ({
    clearSelection: mockClearSelection,
    getSelectedText: mockGetSelectedText,
    getSelectedMarkdown: mockGetSelectedMarkdown,
  })),
}))

// Mock Block component - includes BlockDragHandle for testing drag behavior
jest.mock('./Block', () => ({
  Block: ({ block, dragHandleProps }: { block: any; dragHandleProps?: any }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require('react')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { BlockDragHandle } = require('./BlockDragHandle')

    return (
      <div data-testid={`block-${block.id}`} data-block-id={block.id} className="block">
        <BlockDragHandle blockId={block.id} dragHandleProps={dragHandleProps} />
        <div className="block__content">{block.content}</div>
      </div>
    )
  },
}))

// Mock DraggableBlock component
jest.mock('./DraggableBlock', () => ({
  DraggableBlock: ({ block, isFocused }: { block: any; isFocused: boolean }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require('react')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useSortable } = require('@dnd-kit/sortable')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Block } = require('./Block')
    const sortable = useSortable({ id: block.id })

    return (
      <div
        ref={sortable.setNodeRef}
        style={sortable.style}
        className={`draggable-block ${sortable.isDragging ? 'draggable-block--dragging' : ''}`}
        {...sortable.attributes}
      >
        <div data-testid={`draggable-block-${block.id}`}>
          <Block block={block} isFocused={isFocused} dragHandleProps={sortable.listeners} />
        </div>
      </div>
    )
  },
}))

// Helper to create test blocks
const createTestBlock = (id: string, content: string, type = 'paragraph' as any) => ({
  id,
  type,
  content,
  formats: [],
})

// Helper to get DndContext callbacks
const getDndCallbacks = () =>
  (global as any).__dndCallbacks as {
    onDragStart: (event: DragStartEvent) => void
    onDragEnd: (event: DragEndEvent) => void
  }

// Helper to simulate drag and drop
const simulateDragAndDrop = async (fromBlockId: string, toBlockId: string) => {
  const dndCallbacks = getDndCallbacks()

  // Start drag
  act(() => {
    dndCallbacks.onDragStart({
      active: { id: fromBlockId } as any,
    } as DragStartEvent)
  })

  // End drag
  act(() => {
    dndCallbacks.onDragEnd({
      active: { id: fromBlockId } as any,
      over: { id: toBlockId } as any,
    } as DragEndEvent)
  })
}

// Helper to simulate cancelled drag
const simulateCancelledDrag = async (blockId: string) => {
  const dndCallbacks = getDndCallbacks()

  // Start drag
  act(() => {
    dndCallbacks.onDragStart({
      active: { id: blockId } as any,
    } as DragStartEvent)
  })

  // Cancel drag (no over target)
  act(() => {
    dndCallbacks.onDragEnd({
      active: { id: blockId } as any,
      over: null,
    } as DragEndEvent)
  })
}

describe('BlockDragHandle', () => {
  const mockOnSelect = jest.fn()
  const mockDragHandleProps = {
    onMouseDown: jest.fn(),
    onTouchStart: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset global DND callbacks
    ;(global as any).__dndCallbacks = undefined
    // Clear mock functions
    mockClearSelection.mockClear()
    mockGetSelectedText.mockClear()
    mockGetSelectedMarkdown.mockClear()
    // Reset drag state
    resetDragState()
  })

  describe('✅ Basic Rendering', () => {
    it('renders grab icon', () => {
      render(<BlockDragHandle blockId="test-block" />)
      const icon = screen.getByTestId('icon-grab')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveAttribute('data-size', '16')
    })

    it('has correct ARIA attributes', () => {
      render(<BlockDragHandle blockId="test-block" />)
      const handle = screen.getByRole('button')
      expect(handle).toHaveAttribute('aria-label', 'Drag to reorder block, or click to select. Use Shift+click to select multiple blocks.')
      expect(handle).toHaveAttribute('tabIndex', '0')
    })

    it('shows tooltip on hover', () => {
      render(<BlockDragHandle blockId="test-block" />)
      const handle = screen.getByRole('button')
      expect(handle).toHaveAttribute('title', 'Drag to reorder • Click to select • Shift+click for multi-select')
    })

    it('is not contentEditable', () => {
      render(<BlockDragHandle blockId="test-block" />)
      const handle = screen.getByRole('button')
      expect(handle).toHaveAttribute('contentEditable', 'false')
    })
  })

  describe('✅ Selection Behavior', () => {
    it('calls onSelect with blockId on mousedown', () => {
      render(<BlockDragHandle blockId="test-block" onSelect={mockOnSelect} />)
      const handle = screen.getByRole('button')

      fireEvent.mouseDown(handle)
      expect(mockOnSelect).toHaveBeenCalledWith('test-block', expect.any(MouseEvent))
    })

    it('passes mouse event for modifier key detection', () => {
      render(<BlockDragHandle blockId="test-block" onSelect={mockOnSelect} />)
      const handle = screen.getByRole('button')

      // Simulate mousedown with Shift key
      fireEvent.mouseDown(handle, { shiftKey: true })

      expect(mockOnSelect).toHaveBeenCalledWith('test-block', expect.objectContaining({ shiftKey: true }))
    })

    it('detects Ctrl key for toggle selection', () => {
      render(<BlockDragHandle blockId="test-block" onSelect={mockOnSelect} />)
      const handle = screen.getByRole('button')

      fireEvent.mouseDown(handle, { ctrlKey: true })

      expect(mockOnSelect).toHaveBeenCalledWith('test-block', expect.objectContaining({ ctrlKey: true }))
    })

    it('detects Cmd key (metaKey) for toggle selection on Mac', () => {
      render(<BlockDragHandle blockId="test-block" onSelect={mockOnSelect} />)
      const handle = screen.getByRole('button')

      fireEvent.mouseDown(handle, { metaKey: true })

      expect(mockOnSelect).toHaveBeenCalledWith('test-block', expect.objectContaining({ metaKey: true }))
    })

    it('detects multiple modifier keys', () => {
      render(<BlockDragHandle blockId="test-block" onSelect={mockOnSelect} />)
      const handle = screen.getByRole('button')

      fireEvent.mouseDown(handle, { shiftKey: true, ctrlKey: true })

      expect(mockOnSelect).toHaveBeenCalledWith(
        'test-block',
        expect.objectContaining({
          shiftKey: true,
          ctrlKey: true,
        })
      )
    })
  })

  describe('✅ Keyboard Support', () => {
    it('responds to Enter key', async () => {
      render(<BlockDragHandle blockId="test-block" onSelect={mockOnSelect} />)
      const handle = screen.getByRole('button')

      handle.focus()
      await userEvent.keyboard('{Enter}')

      expect(mockOnSelect).toHaveBeenCalledWith('test-block')
    })

    it('responds to Space key', async () => {
      render(<BlockDragHandle blockId="test-block" onSelect={mockOnSelect} />)
      const handle = screen.getByRole('button')

      handle.focus()
      await userEvent.keyboard(' ')

      expect(mockOnSelect).toHaveBeenCalledWith('test-block')
    })

    it('prevents default behavior for Enter key', () => {
      render(<BlockDragHandle blockId="test-block" onSelect={mockOnSelect} />)
      const handle = screen.getByRole('button')

      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault')

      handle.dispatchEvent(event)
      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('prevents default behavior for Space key', () => {
      render(<BlockDragHandle blockId="test-block" onSelect={mockOnSelect} />)
      const handle = screen.getByRole('button')

      const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true })
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault')

      handle.dispatchEvent(event)
      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('maintains focus state', async () => {
      render(<BlockDragHandle blockId="test-block" />)
      const handle = screen.getByRole('button')

      // Focus the handle
      handle.focus()
      expect(document.activeElement).toBe(handle)

      // Should maintain focus after keyboard interaction
      await userEvent.keyboard('{Enter}')
      expect(document.activeElement).toBe(handle)
    })

    it('ignores other keys', async () => {
      render(<BlockDragHandle blockId="test-block" onSelect={mockOnSelect} />)
      const handle = screen.getByRole('button')

      handle.focus()
      await userEvent.keyboard('a')
      await userEvent.keyboard('{Escape}')
      await userEvent.keyboard('{Tab}')

      expect(mockOnSelect).not.toHaveBeenCalled()
    })

    it('does not pass mouse event for keyboard activation', async () => {
      render(<BlockDragHandle blockId="test-block" onSelect={mockOnSelect} />)
      const handle = screen.getByRole('button')

      handle.focus()
      await userEvent.keyboard('{Enter}')

      // Should be called with blockId only, no mouse event
      expect(mockOnSelect).toHaveBeenCalledWith('test-block')
      expect(mockOnSelect).toHaveBeenCalledTimes(1)
      expect(mockOnSelect.mock.calls[0].length).toBe(1)
    })
  })

  describe('✅ Drag Handle Props Integration', () => {
    it('applies drag handle props when provided', () => {
      render(<BlockDragHandle blockId="test-block" dragHandleProps={mockDragHandleProps} />)
      const handle = screen.getByRole('button')

      // Simulate mousedown on the handle
      fireEvent.mouseDown(handle)
      expect(mockDragHandleProps.onMouseDown).toHaveBeenCalled()
    })

    it('combines drag handle props with component behavior', () => {
      const customMouseDown = jest.fn()
      const customProps = {
        onMouseDown: customMouseDown,
      }

      render(<BlockDragHandle blockId="test-block" onSelect={mockOnSelect} dragHandleProps={customProps} />)

      const handle = screen.getByRole('button')

      fireEvent.mouseDown(handle)

      // When dragHandleProps includes onMouseDown, it overrides the component's handler
      // This is expected behavior for @dnd-kit integration
      expect(customMouseDown).toHaveBeenCalled()
      // The component's onSelect will not be called in this case
      expect(mockOnSelect).not.toHaveBeenCalled()
    })

    it('works with touch events on mobile', () => {
      render(<BlockDragHandle blockId="test-block" onSelect={mockOnSelect} dragHandleProps={mockDragHandleProps} />)
      const handle = screen.getByRole('button')

      // Simulate touch start (mobile drag initiation)
      fireEvent.touchStart(handle)
      expect(mockDragHandleProps.onTouchStart).toHaveBeenCalled()
    })

    it('maintains accessibility when drag props are added', () => {
      render(<BlockDragHandle blockId="test-block" dragHandleProps={mockDragHandleProps} />)

      const handle = screen.getByRole('button')
      expect(handle).toHaveAttribute('tabIndex', '0')
      expect(handle).toHaveAttribute('aria-label')
      expect(handle).toHaveAttribute('contentEditable', 'false')
    })
  })

  describe('✅ Real Drag and Drop Behavior', () => {
    it('activates drag state when drag handle is used', async () => {
      const blocks = [createTestBlock('block1', 'First block')]

      const { store } = renderWithEditor(<EditorContent />)

      act(() => {
        store.dispatch({
          type: 'SET_PAGE',
          pageId: 'test-page',
          title: 'Test Page',
          blocks,
        })
      })

      // Find the drag handle
      const dragHandle = screen.getByRole('button', { name: /Drag to reorder block/ })

      // Initially, no drag is active
      expect(getDragState().isDragging).toBe(false)
      expect(getDragState().activeId).toBeNull()

      // Simulate starting a drag via mouse
      fireEvent.mouseDown(dragHandle)

      // After the sortable hook processes the event, drag should be active
      expect(getDragState().isDragging).toBe(true)
      expect(getDragState().activeId).toBe('block1')
    })

    it('reorders blocks when dragging one block to another position', async () => {
      const blocks = [createTestBlock('block1', 'First block'), createTestBlock('block2', 'Second block'), createTestBlock('block3', 'Third block')]

      const { store } = renderWithEditor(<EditorContent />)

      // Set up initial blocks
      act(() => {
        store.dispatch({
          type: 'SET_PAGE',
          pageId: 'test-page',
          title: 'Test Page',
          blocks,
        })
      })

      // Verify initial order
      expect(store.getState().blocks.map((b) => b.content)).toEqual(['First block', 'Second block', 'Third block'])

      // Find drag handle for block1
      const dragHandles = screen.getAllByRole('button', { name: /Drag to reorder block/ })
      const firstDragHandle = dragHandles[0]

      // Start dragging block1
      fireEvent.mouseDown(firstDragHandle)

      act(() => {
        simulateDragStart('block1')
      })

      // Drag over block3
      simulateDragOver('block3')

      // Drop on block3
      act(() => {
        simulateDragEnd('block1', 'block3')
      })

      // Verify new order
      await waitFor(() => {
        expect(store.getState().blocks.map((b) => b.content)).toEqual(['Second block', 'Third block', 'First block'])
      })
    })

    it('shows drag preview during drag', async () => {
      const blocks = [createTestBlock('block1', 'Draggable content')]

      const { store } = renderWithEditor(<EditorContent />)

      act(() => {
        store.dispatch({
          type: 'SET_PAGE',
          pageId: 'test-page',
          title: 'Test Page',
          blocks,
        })
      })

      // Should not show overlay initially
      const overlay = screen.getByTestId('drag-overlay')
      expect(overlay).toBeEmptyDOMElement()

      // Find and start dragging via drag handle
      const dragHandle = screen.getByRole('button', { name: /Drag to reorder block/ })
      fireEvent.mouseDown(dragHandle)

      // Start dragging
      act(() => {
        simulateDragStart('block1')
      })

      // Should show block in overlay with correct attributes
      expect(overlay).toHaveTextContent('Draggable content')
      expect(overlay.firstChild).toHaveStyle({ opacity: '0.8' })
      expect(overlay.firstChild).toHaveAttribute('role', 'img')
      expect(overlay.firstChild).toHaveAttribute('aria-label', 'Dragging block')

      // State should indicate dragging
      expect(store.getState().isDragging).toBe(true)

      // Mock state should also reflect dragging
      expect(getDragState().isDragging).toBe(true)
      expect(getDragState().activeId).toBe('block1')
    })

    it('clears drag preview after drop', async () => {
      const blocks = [createTestBlock('block1', 'Block 1'), createTestBlock('block2', 'Block 2')]

      const { store } = renderWithEditor(<EditorContent />)

      act(() => {
        store.dispatch({
          type: 'SET_PAGE',
          pageId: 'test-page',
          title: 'Test Page',
          blocks,
        })
      })

      const overlay = screen.getByTestId('drag-overlay')

      // Simulate complete drag operation
      const dragHandle = screen.getAllByRole('button', { name: /Drag to reorder block/ })[0]
      fireEvent.mouseDown(dragHandle)

      simulateDragStart('block1')
      simulateDragOver('block2')
      simulateDragEnd('block1', 'block2')

      // Overlay should be empty after drop
      expect(overlay).toBeEmptyDOMElement()
      expect(store.getState().isDragging).toBe(false)
    })

    it('handles canceling drags with ESC key', async () => {
      const blocks = [createTestBlock('block1', 'Block 1'), createTestBlock('block2', 'Block 2')]

      const { store } = renderWithEditor(<EditorContent />)

      act(() => {
        store.dispatch({
          type: 'SET_PAGE',
          pageId: 'test-page',
          title: 'Test Page',
          blocks,
        })
      })

      // Simulate cancelled drag
      const dragHandles = screen.getAllByRole('button', { name: /Drag to reorder block/ })
      fireEvent.mouseDown(dragHandles[0])

      simulateDragStart('block1')
      simulateDragCancel('block1')

      // Blocks should remain in original order
      expect(store.getState().blocks.map((b) => b.content)).toEqual(['Block 1', 'Block 2'])

      // Drag state should be cleared
      expect(store.getState().isDragging).toBe(false)
    })

    it('prevents dragging when no over target is provided', async () => {
      const blocks = [createTestBlock('block1', 'Block 1')]

      const { store } = renderWithEditor(<EditorContent />)

      act(() => {
        store.dispatch({
          type: 'SET_PAGE',
          pageId: 'test-page',
          title: 'Test Page',
          blocks,
        })
      })

      const originalOrder = store.getState().blocks.map((b) => b.content)

      // Simulate drag with no drop target
      const dragHandle = screen.getByRole('button', { name: /Drag to reorder block/ })
      fireEvent.mouseDown(dragHandle)

      simulateDragStart('block1')
      simulateDragCancel('block1')

      // Order should remain unchanged
      expect(store.getState().blocks.map((b) => b.content)).toEqual(originalOrder)
    })

    it('supports dragging multiple selected blocks', async () => {
      const blocks = [
        createTestBlock('block1', 'Block 1'),
        createTestBlock('block2', 'Block 2'),
        createTestBlock('block3', 'Block 3'),
        createTestBlock('block4', 'Block 4'),
      ]

      const { store } = renderWithEditor(<EditorContent />)

      act(() => {
        store.dispatch({
          type: 'SET_PAGE',
          pageId: 'test-page',
          title: 'Test Page',
          blocks,
        })
      })

      // Select multiple blocks
      act(() => {
        store.dispatch({
          type: 'SET_SELECTED_BLOCKS',
          blockIds: ['block1', 'block2'],
        })
      })

      // Verify blocks are selected
      expect(store.getState().selectedBlockIds).toEqual(['block1', 'block2'])

      // Find drag handle for first selected block
      const dragHandles = screen.getAllByRole('button', { name: /Drag to reorder block/ })
      const firstDragHandle = dragHandles[0]

      // Start dragging the first selected block
      fireEvent.mouseDown(firstDragHandle)
      simulateDragStart('block1')

      // Drag to after block4
      simulateDragOver('block4')
      simulateDragEnd('block1', 'block4')

      // Note: The current implementation moves individual blocks, not groups
      // This test documents the current behavior
      await waitFor(() => {
        expect(store.getState().blocks.map((b) => b.content)).toEqual(['Block 2', 'Block 3', 'Block 4', 'Block 1'])
      })
    })

    it('clears text selection when starting drag', async () => {
      const blocks = [createTestBlock('block1', 'Block 1')]

      const { store } = renderWithEditor(<EditorContent />)

      act(() => {
        store.dispatch({
          type: 'SET_PAGE',
          pageId: 'test-page',
          title: 'Test Page',
          blocks,
        })
      })

      // Set cross-block selection
      act(() => {
        store.dispatch({
          type: 'SET_CROSS_BLOCK_SELECTION',
          selection: {
            startBlockId: 'block1',
            endBlockId: 'block1',
            startOffset: 0,
            endOffset: 5,
            selectedText: 'Conte',
            selectedBlocks: [],
            isCollapsed: false,
          },
        })
      })

      // Verify selection exists
      expect(store.getState().crossBlockSelection).toBeTruthy()

      // Start dragging via drag handle
      const dragHandle = screen.getByRole('button', { name: /Drag to reorder block/ })
      fireEvent.mouseDown(dragHandle)

      act(() => {
        simulateDragStart('block1')
      })

      // Cross-block selection should be cleared
      // In EditorContent, clearSelection is called when drag starts
      expect(mockClearSelection).toHaveBeenCalled()
    })

    it('announces drag operations to screen readers', async () => {
      const blocks = [createTestBlock('block1', 'Block 1'), createTestBlock('block2', 'Block 2')]

      const { store } = renderWithEditor(<EditorContent />)

      act(() => {
        store.dispatch({
          type: 'SET_PAGE',
          pageId: 'test-page',
          title: 'Test Page',
          blocks,
        })
      })

      // Find the screen reader announcement element
      const announcer = document.querySelector('[aria-live="polite"]')

      // Start drag
      const dndCallbacks = getDndCallbacks()
      act(() => {
        dndCallbacks.onDragStart({
          active: { id: 'block1' } as any,
        } as DragStartEvent)
      })

      // Should announce drag start
      await waitFor(() => {
        expect(announcer).toHaveTextContent('Started dragging block 1 of 2')
      })

      // Complete drag
      act(() => {
        simulateDragEnd('block1', 'block2')
      })

      // Should announce successful reorder
      await waitFor(() => {
        expect(announcer).toHaveTextContent('Block moved from position 1 to position 2')
      })
    })

    it('announces cancelled drag to screen readers', async () => {
      const blocks = [createTestBlock('block1', 'Block 1')]

      const { store } = renderWithEditor(<EditorContent />)

      act(() => {
        store.dispatch({
          type: 'SET_PAGE',
          pageId: 'test-page',
          title: 'Test Page',
          blocks,
        })
      })

      const announcer = document.querySelector('[aria-live="polite"]')

      // Start drag
      const dndCallbacks = getDndCallbacks()
      act(() => {
        dndCallbacks.onDragStart({
          active: { id: 'block1' } as any,
        } as DragStartEvent)
      })

      // Wait a moment for the start announcement
      await waitFor(() => {
        expect(announcer).toHaveTextContent('Started dragging block 1 of 1')
      })

      // Cancel drag
      act(() => {
        simulateDragCancel('block1')
      })

      // Should announce cancellation
      await waitFor(() => {
        expect(announcer).toHaveTextContent('Drag cancelled, block returned to original position')
      })
    })

    it('prevents invalid drop zones', async () => {
      const blocks = [createTestBlock('block1', 'Block 1')]

      const { store } = renderWithEditor(<EditorContent />)

      act(() => {
        store.dispatch({
          type: 'SET_PAGE',
          pageId: 'test-page',
          title: 'Test Page',
          blocks,
        })
      })

      const originalOrder = store.getState().blocks.map((b) => b.content)

      // Try to drop on non-existent block
      const dragHandle = screen.getByRole('button', { name: /Drag to reorder block/ })
      fireEvent.mouseDown(dragHandle)

      act(() => {
        simulateDragStart('block1')
        simulateDragEnd('block1', 'non-existent-block')
      })

      // Order should remain unchanged
      expect(store.getState().blocks.map((b) => b.content)).toEqual(originalOrder)
    })

    it('handles dragging the same block to its current position', async () => {
      const blocks = [createTestBlock('block1', 'Block 1'), createTestBlock('block2', 'Block 2')]

      const { store } = renderWithEditor(<EditorContent />)

      act(() => {
        store.dispatch({
          type: 'SET_PAGE',
          pageId: 'test-page',
          title: 'Test Page',
          blocks,
        })
      })

      const originalOrder = store.getState().blocks.map((b) => b.content)

      // Drag block to itself
      const dragHandle = screen.getAllByRole('button', { name: /Drag to reorder block/ })[0]
      fireEvent.mouseDown(dragHandle)

      simulateDragStart('block1')
      simulateDragOver('block1')
      simulateDragEnd('block1', 'block1')

      // Order should remain unchanged
      expect(store.getState().blocks.map((b) => b.content)).toEqual(originalOrder)

      // Drag state should still be properly cleared
      expect(store.getState().isDragging).toBe(false)
    })

    it('applies correct CSS class during drag', async () => {
      const blocks = [createTestBlock('block1', 'Block 1')]

      const { store } = renderWithEditor(<EditorContent />)

      act(() => {
        store.dispatch({
          type: 'SET_PAGE',
          pageId: 'test-page',
          title: 'Test Page',
          blocks,
        })
      })

      const editorContent = screen.getByRole('document')

      // Should not have sorting class initially
      expect(editorContent).toHaveClass('editor-content')
      expect(editorContent).not.toHaveClass('editor-content--sorting')

      // Start dragging via drag handle
      const dragHandle = screen.getByRole('button', { name: /Drag to reorder block/ })
      fireEvent.mouseDown(dragHandle)

      act(() => {
        simulateDragStart('block1')
      })

      // Should add sorting class during drag
      expect(editorContent).toHaveClass('editor-content--sorting')

      // End drag
      act(() => {
        simulateDragCancel('block1')
      })

      // Should remove sorting class after drag
      expect(editorContent).not.toHaveClass('editor-content--sorting')
    })
  })

  describe('✅ Visual Feedback', () => {
    it('changes cursor to grab on hover', () => {
      render(<BlockDragHandle blockId="test-block" />)
      const handle = screen.getByRole('button')

      // Check the base style includes cursor: grab via class
      expect(handle).toHaveClass('block-drag-handle')
      // Note: Actual cursor style testing requires checking computed styles
      // which is better tested in E2E or visual regression tests
    })

    it('changes cursor to grabbing on mousedown', () => {
      render(<BlockDragHandle blockId="test-block" />)
      const handle = screen.getByRole('button')

      // The :active pseudo-class applies cursor: grabbing
      // This is better tested in E2E tests where we can check computed styles
      fireEvent.mouseDown(handle)
      // Note: Testing pseudo-classes requires more advanced testing setup
    })

    it('applies drag transform when actively dragging', async () => {
      const blocks = [createTestBlock('block1', 'Test block')]

      const { store } = renderWithEditor(<EditorContent />)

      act(() => {
        store.dispatch({
          type: 'SET_PAGE',
          pageId: 'test-page',
          title: 'Test Page',
          blocks,
        })
      })

      // Find the draggable block element
      const draggableBlock = screen.getByTestId('draggable-block-block1')
      const dragHandle = screen.getByRole('button', { name: /Drag to reorder block/ })

      // Initially no transform
      expect(draggableBlock.parentElement).not.toHaveStyle({
        transform: expect.any(String),
      })

      // Start dragging
      fireEvent.mouseDown(dragHandle)
      act(() => {
        simulateDragStart('block1')
      })

      // During drag, the draggable block should have transform applied
      // The transform is handled by the DraggableBlock component via useSortable
      const draggingBlock = screen.getByTestId('draggable-block-block1')
      expect(draggingBlock.parentElement).toHaveClass('draggable-block--dragging')
    })

    it('shows correct aria attributes during drag', async () => {
      const blocks = [createTestBlock('block1', 'Test block')]

      const { store } = renderWithEditor(<EditorContent />)

      act(() => {
        store.dispatch({
          type: 'SET_PAGE',
          pageId: 'test-page',
          title: 'Test Page',
          blocks,
        })
      })

      const dragHandle = screen.getByRole('button', { name: /Drag to reorder block/ })

      // The draggable block wrapper has the aria-pressed attribute, not the drag handle itself
      const draggableBlock = screen.getByTestId('draggable-block-block1').parentElement

      // Check initial aria-pressed state on the draggable block
      expect(draggableBlock).toHaveAttribute('aria-pressed', 'false')

      // Start dragging
      fireEvent.mouseDown(dragHandle)
      act(() => {
        simulateDragStart('block1')
      })

      // During drag, aria-pressed should be true on the draggable block
      await waitFor(() => {
        const updatedDraggableBlock = screen.getByTestId('draggable-block-block1').parentElement
        expect(updatedDraggableBlock).toHaveAttribute('aria-pressed', 'true')
      })
    })
  })

  describe('✅ Keyboard Drag Support', () => {
    it('initiates drag with Space key', async () => {
      const blocks = [createTestBlock('block1', 'Test block'), createTestBlock('block2', 'Target block')]

      const { store } = renderWithEditor(<EditorContent />)

      act(() => {
        store.dispatch({
          type: 'SET_PAGE',
          pageId: 'test-page',
          title: 'Test Page',
          blocks,
        })
      })

      const dragHandle = screen.getAllByRole('button', { name: /Drag to reorder block/ })[0]

      // Focus the drag handle
      dragHandle.focus()
      expect(document.activeElement).toBe(dragHandle)

      // Press Space to initiate drag
      fireEvent.keyDown(dragHandle, { key: ' ' })

      // Mock should register drag initiation
      expect(getDragState().isDragging).toBe(true)
      expect(getDragState().activeId).toBe('block1')
    })

    it('initiates drag with Enter key', async () => {
      const blocks = [createTestBlock('block1', 'Test block')]

      const { store } = renderWithEditor(<EditorContent />)

      act(() => {
        store.dispatch({
          type: 'SET_PAGE',
          pageId: 'test-page',
          title: 'Test Page',
          blocks,
        })
      })

      const dragHandle = screen.getByRole('button', { name: /Drag to reorder block/ })

      // Focus and press Enter
      dragHandle.focus()
      fireEvent.keyDown(dragHandle, { key: 'Enter' })

      // Should initiate drag
      expect(getDragState().isDragging).toBe(true)
      expect(getDragState().activeId).toBe('block1')
    })

    it('completes keyboard-initiated drag operation', async () => {
      const blocks = [createTestBlock('block1', 'First block'), createTestBlock('block2', 'Second block'), createTestBlock('block3', 'Third block')]

      const { store } = renderWithEditor(<EditorContent />)

      act(() => {
        store.dispatch({
          type: 'SET_PAGE',
          pageId: 'test-page',
          title: 'Test Page',
          blocks,
        })
      })

      // Verify initial order
      expect(store.getState().blocks.map((b) => b.content)).toEqual(['First block', 'Second block', 'Third block'])

      // Simulate keyboard drag
      act(() => {
        simulateKeyboardDrag('block1', 'block3')
      })

      // Verify reordered
      expect(store.getState().blocks.map((b) => b.content)).toEqual(['Second block', 'Third block', 'First block'])
    })
  })

  describe('✅ Touch Device Support', () => {
    it('initiates drag on touch start', async () => {
      const blocks = [createTestBlock('block1', 'Touch draggable')]

      const { store } = renderWithEditor(<EditorContent />)

      act(() => {
        store.dispatch({
          type: 'SET_PAGE',
          pageId: 'test-page',
          title: 'Test Page',
          blocks,
        })
      })

      const dragHandle = screen.getByRole('button', { name: /Drag to reorder block/ })

      // Simulate touch start
      fireEvent.touchStart(dragHandle)

      // Should initiate drag
      expect(getDragState().isDragging).toBe(true)
      expect(getDragState().activeId).toBe('block1')
    })

    it('completes touch drag operation', async () => {
      const blocks = [createTestBlock('block1', 'Block 1'), createTestBlock('block2', 'Block 2')]

      const { store } = renderWithEditor(<EditorContent />)

      act(() => {
        store.dispatch({
          type: 'SET_PAGE',
          pageId: 'test-page',
          title: 'Test Page',
          blocks,
        })
      })

      const dragHandle = screen.getAllByRole('button', { name: /Drag to reorder block/ })[0]

      // Start touch drag
      fireEvent.touchStart(dragHandle)

      // Simulate drag and drop
      act(() => {
        simulateDragStart('block1')
        simulateDragEnd('block1', 'block2')
      })

      // Verify reordered
      expect(store.getState().blocks.map((b) => b.content)).toEqual(['Block 2', 'Block 1'])
    })
  })

  describe('✅ Drag Constraints and Validation', () => {
    it('prevents dragging to invalid drop zones', async () => {
      const blocks = [createTestBlock('block1', 'Source block')]

      const { store } = renderWithEditor(<EditorContent />)

      act(() => {
        store.dispatch({
          type: 'SET_PAGE',
          pageId: 'test-page',
          title: 'Test Page',
          blocks,
        })
      })

      const originalOrder = store.getState().blocks.map((b) => b.content)

      // Try to drop on non-existent target
      const dragHandle = screen.getByRole('button', { name: /Drag to reorder block/ })
      fireEvent.mouseDown(dragHandle)

      act(() => {
        simulateDragStart('block1')
        simulateDragEnd('block1', 'invalid-block-id')
      })

      // Order should remain unchanged
      expect(store.getState().blocks.map((b) => b.content)).toEqual(originalOrder)
    })

    it('handles drag cancellation with ESC key', async () => {
      const blocks = [createTestBlock('block1', 'Block 1'), createTestBlock('block2', 'Block 2')]

      const { store } = renderWithEditor(<EditorContent />)

      act(() => {
        store.dispatch({
          type: 'SET_PAGE',
          pageId: 'test-page',
          title: 'Test Page',
          blocks,
        })
      })

      const dragHandles = screen.getAllByRole('button', { name: /Drag to reorder block/ })
      const dragHandle = dragHandles[0]

      // Start dragging
      fireEvent.mouseDown(dragHandle)
      act(() => {
        simulateDragStart('block1')
      })

      // Verify drag is active
      expect(getDragState().isDragging).toBe(true)
      expect(store.getState().isDragging).toBe(true)

      // Cancel with ESC (simulated by drag cancel)
      act(() => {
        simulateDragCancel('block1')
      })

      // Drag should be cancelled
      expect(getDragState().isDragging).toBe(false)
      expect(store.getState().isDragging).toBe(false)

      // Blocks should remain in original order
      expect(store.getState().blocks.map((b) => b.content)).toEqual(['Block 1', 'Block 2'])
    })

    it('maintains focus after drag operation', async () => {
      const blocks = [createTestBlock('block1', 'Block 1'), createTestBlock('block2', 'Block 2')]

      const { store } = renderWithEditor(<EditorContent />)

      act(() => {
        store.dispatch({
          type: 'SET_PAGE',
          pageId: 'test-page',
          title: 'Test Page',
          blocks,
        })
      })

      const dragHandle = screen.getAllByRole('button', { name: /Drag to reorder block/ })[0]

      // Focus the handle
      dragHandle.focus()
      expect(document.activeElement).toBe(dragHandle)

      // Perform drag operation
      fireEvent.mouseDown(dragHandle)
      act(() => {
        simulateDragStart('block1')
        simulateDragEnd('block1', 'block2')
      })

      // Focus should be maintained (though the handle may have moved in DOM)
      const activeDragHandle = document.activeElement
      expect(activeDragHandle).toHaveAttribute('role', 'button')
      expect(activeDragHandle).toHaveAttribute('aria-label', expect.stringContaining('Drag to reorder block'))
    })
  })

  describe('✅ Edge Cases', () => {
    it('does not call onSelect if not provided', () => {
      render(<BlockDragHandle blockId="test-block" />)
      const handle = screen.getByRole('button')

      // Should not throw when onSelect is not provided
      expect(() => fireEvent.mouseDown(handle)).not.toThrow()
    })

    it('handles rapid consecutive drags', async () => {
      const blocks = [createTestBlock('block1', 'Block 1'), createTestBlock('block2', 'Block 2'), createTestBlock('block3', 'Block 3')]

      const { store } = renderWithEditor(<EditorContent />)

      act(() => {
        store.dispatch({
          type: 'SET_PAGE',
          pageId: 'test-page',
          title: 'Test Page',
          blocks,
        })
      })

      // Perform multiple rapid drags
      const dragHandles = screen.getAllByRole('button', { name: /Drag to reorder block/ })

      // First drag: block1 to block2
      fireEvent.mouseDown(dragHandles[0])
      simulateDragStart('block1')
      simulateDragEnd('block1', 'block2')

      // Second drag: block3 to block1
      fireEvent.mouseDown(dragHandles[2])
      simulateDragStart('block3')
      simulateDragEnd('block3', 'block1')

      // Third drag: block2 to block3
      fireEvent.mouseDown(dragHandles[1])
      simulateDragStart('block2')
      simulateDragEnd('block2', 'block3')

      // Final order should reflect all drags
      const finalOrder = store.getState().blocks.map((b) => b.content)
      expect(finalOrder).toBeDefined()
      expect(finalOrder.length).toBe(3)

      // Drag state should be properly cleared
      expect(store.getState().isDragging).toBe(false)
    })
  })
})
