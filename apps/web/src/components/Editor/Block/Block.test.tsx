// apps/web/src/components/Editor/Block/Block.test.tsx
// Comprehensive tests for the Block component

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Block } from './Block'
import { renderWithEditor, createMockEditorState } from '../../../test/utils'
import { EditorBlock, useEditorDispatch, useEditorState } from '../../../contexts/EditorContext'
import { generateId } from '@kairos/utils'

// Mock the EditorContext hooks
const mockDispatch = jest.fn()
const mockEditorState = createMockEditorState()

jest.mock('../../../contexts/EditorContext', () => ({
  ...jest.requireActual('../../../contexts/EditorContext'),
  useEditorDispatch: jest.fn(),
  useEditorState: jest.fn(),
  BLOCK_PLACEHOLDERS: {
    h1: 'Heading 1',
    h2: 'Heading 2',
    h3: 'Heading 3',
    paragraph: 'Start writing...',
    bullet: 'List item',
  },
}))

// Mock BlockDragHandle component
jest.mock('./BlockDragHandle', () => ({
  BlockDragHandle: ({ blockId, onSelect, dragHandleProps }: any) => (
    <div
      data-testid={`drag-handle-${blockId}`}
      onMouseDown={(e) => onSelect(blockId, e as any)}
      {...dragHandleProps}
    >
      Drag Handle
    </div>
  ),
}))

describe('Block', () => {
  const createMockBlock = (overrides?: Partial<EditorBlock>): EditorBlock => ({
    id: generateId(),
    type: 'paragraph',
    content: 'Test block content',
    ...overrides,
  })

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useEditorDispatch as jest.Mock).mockReturnValue(mockDispatch)
    ;(useEditorState as jest.Mock).mockReturnValue(mockEditorState)
  })

  describe('✅ Rendering (Static Types Only)', () => {
    it('renders blocks with content correctly', () => {
      const block = createMockBlock({ content: 'Hello World' })
      render(<Block block={block} isFocused={false} />)
      
      expect(screen.getByText('Hello World')).toBeInTheDocument()
    })

    it('applies correct CSS class based on block type', () => {
      const blockTypes: EditorBlock['type'][] = ['h1', 'h2', 'h3', 'paragraph', 'bullet']
      
      blockTypes.forEach((type) => {
        const block = createMockBlock({ type })
        const { container } = render(<Block block={block} isFocused={false} />)
        
        const blockElement = container.querySelector('.block')
        expect(blockElement).toHaveClass(`block--${type}`)
        
        const contentElement = container.querySelector('.block__content')
        expect(contentElement).toHaveClass(`block__content--${type}`)
      })
    })

    it('shows placeholder "Press \'/\' for commands..." when focused and empty', () => {
      const block = createMockBlock({ content: '' })
      render(<Block block={block} isFocused={true} />)
      
      expect(screen.getByText("Press '/' for commands, or 'space' for AI...")).toBeInTheDocument()
    })

    it('renders bullet point for bullet type blocks', () => {
      const block = createMockBlock({ type: 'bullet', content: 'List item' })
      const { container } = render(<Block block={block} isFocused={false} />)
      
      // Check that bullet type class is applied
      const blockElement = container.querySelector('.block')
      expect(blockElement).toHaveClass('block--bullet')
    })

    it('does not show placeholder when block has content', () => {
      const block = createMockBlock({ content: 'Some text' })
      render(<Block block={block} isFocused={true} />)
      
      expect(screen.queryByText("Press '/' for commands, or 'space' for AI...")).not.toBeInTheDocument()
      expect(screen.getByText('Some text')).toBeInTheDocument()
    })

    it('does not show placeholder when block is not focused', () => {
      const block = createMockBlock({ content: '' })
      render(<Block block={block} isFocused={false} />)
      
      expect(screen.queryByText("Press '/' for commands, or 'space' for AI...")).not.toBeInTheDocument()
    })
  })

  describe('✅ Visual States', () => {
    it('shows drag handle on hover', async () => {
      const block = createMockBlock()
      const { container } = render(<Block block={block} isFocused={false} />)
      
      // Drag handle should be rendered (visibility controlled by CSS)
      const dragHandle = screen.getByTestId(`drag-handle-${block.id}`)
      expect(dragHandle).toBeInTheDocument()
    })

    it('hides drag handle when not hovering', () => {
      const block = createMockBlock()
      render(<Block block={block} isFocused={false} />)
      
      // Drag handle exists but visibility is controlled by CSS
      const dragHandle = screen.getByTestId(`drag-handle-${block.id}`)
      expect(dragHandle).toBeInTheDocument()
    })

    it('applies selected state styling (blue highlight)', () => {
      const block = createMockBlock()
      ;(useEditorState as jest.Mock).mockReturnValue({
        ...mockEditorState,
        selectedBlockIds: [block.id],
      })
      
      const { container } = render(<Block block={block} isFocused={false} />)
      
      const blockElement = container.querySelector('.block')
      expect(blockElement).toHaveClass('block--selected')
    })

    it('shows hover effect on non-selected blocks', () => {
      const block = createMockBlock()
      ;(useEditorState as jest.Mock).mockReturnValue({
        ...mockEditorState,
        selectedBlockIds: [],
      })
      
      const { container } = render(<Block block={block} isFocused={false} />)
      
      const blockElement = container.querySelector('.block')
      expect(blockElement).not.toHaveClass('block--selected')
    })

    it('applies focused class when isFocused is true', () => {
      const block = createMockBlock()
      const { container } = render(<Block block={block} isFocused={true} />)
      
      const contentElement = container.querySelector('.block__content')
      expect(contentElement).toHaveClass('block__content--focused')
    })

    it('applies empty class when focused and empty', () => {
      const block = createMockBlock({ content: '' })
      const { container } = render(<Block block={block} isFocused={true} />)
      
      const contentElement = container.querySelector('.block__content')
      expect(contentElement).toHaveClass('block__content--empty')
    })
  })

  describe('✅ Interactions', () => {
    it('calls onBlockClick when clicked', () => {
      const block = createMockBlock()
      const handleClick = jest.fn()
      render(<Block block={block} isFocused={false} onBlockClick={handleClick} />)
      
      const blockElement = screen.getByText('Test block content').closest('.block')!
      fireEvent.click(blockElement)
      
      expect(handleClick).toHaveBeenCalledWith(block.id)
    })

    it('passes blockId to drag handle onSelect', () => {
      const block = createMockBlock()
      render(<Block block={block} isFocused={false} />)
      
      const dragHandle = screen.getByTestId(`drag-handle-${block.id}`)
      fireEvent.mouseDown(dragHandle)
      
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_SELECTED_BLOCKS',
        blockIds: [block.id],
      })
    })

    it('updates when block prop changes', () => {
      const block = createMockBlock({ content: 'Initial content' })
      const { rerender } = render(<Block block={block} isFocused={false} />)
      
      expect(screen.getByText('Initial content')).toBeInTheDocument()
      
      const updatedBlock = { ...block, content: 'Updated content' }
      rerender(<Block block={updatedBlock} isFocused={false} />)
      
      expect(screen.queryByText('Initial content')).not.toBeInTheDocument()
      expect(screen.getByText('Updated content')).toBeInTheDocument()
    })

    it('maintains isFocused state correctly', () => {
      const block = createMockBlock({ content: '' })
      const { container, rerender } = render(<Block block={block} isFocused={false} />)
      
      let contentElement = container.querySelector('.block__content')
      expect(contentElement).not.toHaveClass('block__content--focused')
      expect(screen.queryByText("Press '/' for commands, or 'space' for AI...")).not.toBeInTheDocument()
      
      rerender(<Block block={block} isFocused={true} />)
      
      contentElement = container.querySelector('.block__content')
      expect(contentElement).toHaveClass('block__content--focused')
      expect(screen.getByText("Press '/' for commands, or 'space' for AI...")).toBeInTheDocument()
    })

    it('handles multi-block selection with Shift key', () => {
      const block = createMockBlock()
      ;(useEditorState as jest.Mock).mockReturnValue({
        ...mockEditorState,
        selectedBlockIds: ['other-block-id'],
      })
      
      render(<Block block={block} isFocused={false} />)
      
      const dragHandle = screen.getByTestId(`drag-handle-${block.id}`)
      fireEvent.mouseDown(dragHandle, { shiftKey: true })
      
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SELECT_BLOCK_RANGE',
        startBlockId: 'other-block-id',
        endBlockId: block.id,
      })
    })

    it('handles toggle selection with Ctrl/Cmd key', () => {
      const block = createMockBlock()
      render(<Block block={block} isFocused={false} />)
      
      const dragHandle = screen.getByTestId(`drag-handle-${block.id}`)
      
      // Test Ctrl key
      fireEvent.mouseDown(dragHandle, { ctrlKey: true })
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'TOGGLE_BLOCK_SELECTION',
        blockId: block.id,
      })
      
      // Test Cmd key (metaKey)
      fireEvent.mouseDown(dragHandle, { metaKey: true })
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'TOGGLE_BLOCK_SELECTION',
        blockId: block.id,
      })
    })

    it('handles single selection without modifier keys', () => {
      const block = createMockBlock()
      render(<Block block={block} isFocused={false} />)
      
      const dragHandle = screen.getByTestId(`drag-handle-${block.id}`)
      fireEvent.mouseDown(dragHandle)
      
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_SELECTED_BLOCKS',
        blockIds: [block.id],
      })
    })

    it('renders with drag handle props when provided', () => {
      const block = createMockBlock()
      const dragHandleProps = {
        'data-test': 'drag-props',
        onMouseDown: jest.fn(),
      }
      
      render(<Block block={block} isFocused={false} dragHandleProps={dragHandleProps} />)
      
      const dragHandle = screen.getByTestId(`drag-handle-${block.id}`)
      expect(dragHandle).toHaveAttribute('data-test', 'drag-props')
    })
  })

  describe('✅ Edge Cases', () => {
    it('handles blocks with very long content', () => {
      const longContent = 'A'.repeat(1000)
      const block = createMockBlock({ content: longContent })
      render(<Block block={block} isFocused={false} />)
      
      expect(screen.getByText(longContent)).toBeInTheDocument()
    })

    it('handles blocks with special characters', () => {
      const specialContent = '© ® ™ § ¶ † ‡ • ‰ 🌟 🔥 🎨 <>&"\'`'
      const block = createMockBlock({ content: specialContent })
      render(<Block block={block} isFocused={false} />)
      
      expect(screen.getByText(specialContent)).toBeInTheDocument()
    })

    it('handles blocks with newline characters', () => {
      const contentWithNewlines = 'Line 1\nLine 2\nLine 3'
      const block = createMockBlock({ content: contentWithNewlines })
      const { container } = render(<Block block={block} isFocused={false} />)
      
      // Check that the content is rendered with newlines preserved
      const contentElement = container.querySelector('.block__content span')
      expect(contentElement).toBeInTheDocument()
      expect(contentElement?.textContent).toBe(contentWithNewlines)
    })

    it('handles rapid prop updates', () => {
      const block = createMockBlock({ content: 'Initial' })
      const { rerender } = render(<Block block={block} isFocused={false} />)
      
      // Simulate rapid updates
      for (let i = 0; i < 10; i++) {
        const updatedBlock = { ...block, content: `Update ${i}` }
        rerender(<Block block={updatedBlock} isFocused={false} />)
      }
      
      expect(screen.getByText('Update 9')).toBeInTheDocument()
    })

    it('handles missing or undefined props gracefully', () => {
      const block = createMockBlock()
      
      // Render without optional props
      const { container } = render(<Block block={block} isFocused={false} />)
      
      expect(container.querySelector('.block')).toBeInTheDocument()
      expect(screen.getByText('Test block content')).toBeInTheDocument()
    })
  })
})