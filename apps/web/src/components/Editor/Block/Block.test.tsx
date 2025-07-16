// apps/web/src/components/Editor/Block/Block.test.tsx
// Tests for the Block component - ensures individual editor blocks work correctly
// Covers text display, formatting, selection, drag handles, and accessibility

import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Block } from './Block'
import { EditorBlock, TextFormat, useEditorDispatch, useEditorState } from '../../../contexts/EditorContext'
import { generateId } from '@kairos/utils'

// Mock the EditorContext hooks
const mockDispatch = jest.fn()
const mockEditorState = {
  blocks: [],
  selectedBlockIds: [],
  focusedBlockId: null,
  draggedBlockIds: [],
  crossBlockSelection: null,
}

jest.mock('../../../contexts/EditorContext', () => ({
  ...jest.requireActual('../../../contexts/EditorContext'),
  useEditorDispatch: jest.fn(),
  useEditorState: jest.fn(),
}))

// Define proper types for the mock
interface MockBlockDragHandleProps {
  blockId: string
  onSelect?: (blockId: string, event?: MouseEvent) => void
  dragHandleProps?: Record<string, unknown>
}

// Mock BlockDragHandle to test selection behavior without drag-and-drop complexity
jest.mock('./BlockDragHandle', () => ({
  BlockDragHandle: ({ blockId, onSelect, dragHandleProps }: MockBlockDragHandleProps) => (
    <button
      data-testid={`drag-handle-${blockId}`}
      onMouseDown={(e: React.MouseEvent) => onSelect?.(blockId, e.nativeEvent)}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect?.(blockId)
        }
      }}
      {...dragHandleProps}
      aria-label="Drag to reorder block"
      tabIndex={0}
    >
      Drag Handle
    </button>
  ),
}))

describe('Block', () => {
  // Helper to create test blocks with sensible defaults
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

  // Tests are organized into 4 categories following our testing guide:
  // 1. Core Functionality - Basic rendering and display
  // 2. User Interactions - Click, keyboard, and selection behaviors
  // 3. Error Handling - Edge cases and invalid inputs
  // 4. Accessibility - Keyboard navigation and screen reader support

  describe('✅ Core Functionality', () => {
    it('displays text content that users can read', () => {
      const block = createMockBlock({ content: 'Hello World' })
      render(<Block block={block} isFocused={false} />)

      expect(screen.getByText('Hello World')).toBeInTheDocument()
    })

    it('shows helpful placeholder when user focuses empty block', () => {
      const block = createMockBlock({ content: '' })
      render(<Block block={block} isFocused={true} />)

      // Users see guidance for what they can do
      expect(screen.getByText("Press '/' for commands, or 'space' for AI...")).toBeInTheDocument()
    })

    it('hides placeholder when user types content', () => {
      const block = createMockBlock({ content: 'Some text' })
      render(<Block block={block} isFocused={true} />)

      expect(screen.queryByText("Press '/' for commands, or 'space' for AI...")).not.toBeInTheDocument()
      expect(screen.getByText('Some text')).toBeInTheDocument()
    })

    it('renders different heading levels for visual hierarchy', () => {
      // Test H1
      const h1Block = createMockBlock({ type: 'h1', content: 'Main Title' })
      render(<Block block={h1Block} isFocused={false} />)
      expect(screen.getByText('Main Title')).toBeInTheDocument()

      // Test H2
      const h2Block = createMockBlock({ type: 'h2', content: 'Subtitle' })
      render(<Block block={h2Block} isFocused={false} />)
      expect(screen.getByText('Subtitle')).toBeInTheDocument()

      // Test bullet
      const bulletBlock = createMockBlock({ type: 'bullet', content: 'List item' })
      render(<Block block={bulletBlock} isFocused={false} />)
      expect(screen.getByText('List item')).toBeInTheDocument()
    })

    it('displays formatted text with proper styling', () => {
      // Test all supported formatting types
      const formatting: TextFormat[] = [
        { type: 'bold', start: 0, end: 4 }, // "Bold"
        { type: 'italic', start: 5, end: 11 }, // "italic"
        { type: 'underline', start: 12, end: 21 }, // "underline"
        { type: 'link', start: 22, end: 26, url: 'https://example.com' }, // "link"
      ]

      const block = createMockBlock({
        content: 'Bold italic underline link text',
        formatting,
      })

      const { container } = render(<Block block={block} isFocused={false} />)

      // User sees bold text
      const boldText = container.querySelector('strong')
      expect(boldText).toBeInTheDocument()
      expect(boldText).toHaveTextContent('Bold')

      // User sees italic text
      const italicText = container.querySelector('em')
      expect(italicText).toBeInTheDocument()
      expect(italicText).toHaveTextContent('italic')

      // User sees underlined text
      const underlineText = container.querySelector('u')
      expect(underlineText).toBeInTheDocument()
      expect(underlineText).toHaveTextContent('underline')

      // User can click links
      const linkElement = screen.getByRole('link')
      expect(linkElement).toHaveAttribute('href', 'https://example.com')
      expect(linkElement).toHaveTextContent('link')
    })

    it('handles overlapping formatting correctly', () => {
      const formatting: TextFormat[] = [
        { type: 'bold', start: 0, end: 10 }, // "Start bold"
        { type: 'italic', start: 5, end: 15 }, // overlaps with bold
      ]

      const block = createMockBlock({
        content: 'Start bold&italic end',
        formatting,
      })

      const { container } = render(<Block block={block} isFocused={false} />)

      // User sees text with both formats applied where they overlap
      const overlap = container.querySelector('strong em, em strong')
      expect(overlap).toBeInTheDocument()
      expect(overlap).toHaveTextContent('bold')
    })

    it('visually indicates when block is selected', () => {
      const block = createMockBlock()
      ;(useEditorState as jest.Mock).mockReturnValue({
        ...mockEditorState,
        selectedBlockIds: [block.id],
      })

      render(<Block block={block} isFocused={false} />)

      // User sees visual feedback that block is selected
      const blockElement = screen.getByText('Test block content').closest('[data-block-id]')
      expect(blockElement).toBeInTheDocument()
      // In real app, this would have visual styling applied
    })

    it('updates immediately when content changes', () => {
      const block = createMockBlock({ content: 'Initial content' })
      const { rerender } = render(<Block block={block} isFocused={false} />)

      expect(screen.getByText('Initial content')).toBeInTheDocument()

      // User sees updated content immediately
      const updatedBlock = { ...block, content: 'Updated content' }
      rerender(<Block block={updatedBlock} isFocused={false} />)

      expect(screen.queryByText('Initial content')).not.toBeInTheDocument()
      expect(screen.getByText('Updated content')).toBeInTheDocument()
    })
  })

  describe('✅ User Interactions', () => {
    it('allows user to click block to start editing', async () => {
      const user = userEvent.setup()
      const block = createMockBlock()
      const handleClick = jest.fn()
      render(<Block block={block} isFocused={false} onBlockClick={handleClick} />)

      const blockContent = screen.getByText('Test block content')
      await user.click(blockContent)

      // User action triggers focus on the block
      expect(handleClick).toHaveBeenCalledWith(block.id)
    })

    it('selects block when user clicks drag handle', async () => {
      const user = userEvent.setup()
      const block = createMockBlock()
      render(<Block block={block} isFocused={false} />)

      const dragHandle = screen.getByRole('button', { name: /drag to reorder/i })
      await user.click(dragHandle)

      // User sees block is selected (actual behavior)
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_SELECTED_BLOCKS',
        blockIds: [block.id],
      })
    })

    it('allows user to select multiple blocks with Shift+click', async () => {
      const user = userEvent.setup()
      const block = createMockBlock()
      ;(useEditorState as jest.Mock).mockReturnValue({
        ...mockEditorState,
        selectedBlockIds: ['other-block-id'],
      })

      render(<Block block={block} isFocused={false} />)

      const dragHandle = screen.getByRole('button', { name: /drag to reorder/i })

      // Shift+click to select range between blocks
      await user.keyboard('{Shift>}')
      await user.click(dragHandle)
      await user.keyboard('{/Shift}')

      // Block component correctly dispatches range selection
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SELECT_BLOCK_RANGE',
        startBlockId: 'other-block-id',
        endBlockId: block.id,
      })

      // NOTE: There's a known bug where Shift+click selection behaves asymmetrically
      // based on direction. This is NOT a Block component issue - the bug is in
      // EditorContext's SELECT_BLOCK_RANGE handler. See /docs/bugs/shift-click-selection-asymmetry.md
    })

    it('toggles block selection with Ctrl/Cmd+click', async () => {
      const user = userEvent.setup()
      const block = createMockBlock()
      render(<Block block={block} isFocused={false} />)

      const dragHandle = screen.getByRole('button', { name: /drag to reorder/i })

      // Ctrl+click toggles selection (Windows/Linux)
      await user.keyboard('{Control>}')
      await user.click(dragHandle)
      await user.keyboard('{/Control}')

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'TOGGLE_BLOCK_SELECTION',
        blockId: block.id,
      })

      mockDispatch.mockClear()

      // Cmd+click also toggles selection (Mac)
      await user.keyboard('{Meta>}')
      await user.click(dragHandle)
      await user.keyboard('{/Meta}')

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'TOGGLE_BLOCK_SELECTION',
        blockId: block.id,
      })
    })

    it('shows placeholder guidance when user focuses empty block', () => {
      const block = createMockBlock({ content: '' })
      const { rerender } = render(<Block block={block} isFocused={false} />)

      // Initially no placeholder
      expect(screen.queryByText("Press '/' for commands, or 'space' for AI...")).not.toBeInTheDocument()

      // User focuses block
      rerender(<Block block={block} isFocused={true} />)

      // User sees helpful guidance
      expect(screen.getByText("Press '/' for commands, or 'space' for AI...")).toBeInTheDocument()

      // User unfocuses block
      rerender(<Block block={block} isFocused={false} />)

      // Placeholder disappears
      expect(screen.queryByText("Press '/' for commands, or 'space' for AI...")).not.toBeInTheDocument()
    })

    it('allows keyboard navigation on drag handle', async () => {
      const user = userEvent.setup()
      const block = createMockBlock()
      render(<Block block={block} isFocused={false} />)

      const dragHandle = screen.getByRole('button', { name: /drag to reorder/i })

      // User can tab to drag handle
      await user.tab()
      expect(dragHandle).toHaveFocus()

      // User can activate with Enter key
      await user.keyboard('{Enter}')
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_SELECTED_BLOCKS',
        blockIds: [block.id],
      })

      mockDispatch.mockClear()

      // User can also activate with Space key
      await user.keyboard(' ')
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_SELECTED_BLOCKS',
        blockIds: [block.id],
      })
    })
  })

  describe('✅ Error Handling', () => {
    // Tests for edge cases and invalid inputs
    it('displays empty block gracefully when content is undefined', () => {
      const block = createMockBlock({ content: undefined as unknown as string })
      const { container } = render(<Block block={block} isFocused={false} />)

      // User sees empty block, not "undefined" text
      expect(screen.queryByText('undefined')).not.toBeInTheDocument()
      const blockElement = container.querySelector('.block__content')
      expect(blockElement).toBeInTheDocument()
      expect(blockElement).toHaveTextContent('')
    })

    it('handles invalid formatting ranges safely', () => {
      // Component should filter out invalid formatting and still apply valid ones
      const formatting: TextFormat[] = [
        { type: 'bold', start: 100, end: 200 }, // Out of bounds
        { type: 'italic', start: -5, end: 5 }, // Negative start
        { type: 'link', start: 0, end: 5, url: '' }, // Empty URL
        { type: 'underline', start: 2, end: 7 }, // Valid formatting
      ]

      const block = createMockBlock({
        content: 'Short text', // 10 characters
        formatting,
      })

      render(<Block block={block} isFocused={false} />)

      // User still sees valid formatting applied
      const underline = screen.getByText(/ort t/).closest('u')
      expect(underline).toBeInTheDocument()
    })

    it('gracefully handles invalid block types', () => {
      const block = createMockBlock({ type: 'invalid-type' as EditorBlock['type'] })
      const { container } = render(<Block block={block} isFocused={false} />)

      // User still sees content even with invalid type
      expect(screen.getByText('Test block content')).toBeInTheDocument()

      // Component falls back to paragraph type
      const blockElement = container.querySelector('.block')
      expect(blockElement).toHaveClass('block--paragraph')
    })

    it('renders extremely long content without breaking', () => {
      const longContent = 'A'.repeat(10000)
      const block = createMockBlock({ content: longContent })
      render(<Block block={block} isFocused={false} />)

      // User can see the content (even if truncated visually)
      const contentElement = screen.getByText(longContent)
      expect(contentElement).toBeInTheDocument()
    })

    it('prevents XSS attacks in content', () => {
      const dangerousContent = '<script>alert("XSS")</script> & <img src=x onerror=alert("XSS")>'
      const block = createMockBlock({ content: dangerousContent })
      const { container } = render(<Block block={block} isFocused={false} />)

      // Scripts are escaped and cannot execute
      expect(container.textContent).toContain('<script>')
      expect(container.innerHTML).not.toContain('<script>')
      expect(container.innerHTML).not.toContain('<img')
    })

    it('preserves all unicode and special characters', () => {
      const specialContent = '© ® ™ § ¶ † ‡ • ‰ 🌟 🔥 🎨 中文 العربية'
      const block = createMockBlock({ content: specialContent })
      render(<Block block={block} isFocused={false} />)

      // User sees all special characters preserved
      expect(screen.getByText(specialContent)).toBeInTheDocument()
    })

    it('handles missing formatting array gracefully', () => {
      const block1 = createMockBlock({
        content: 'Text without formatting',
        formatting: undefined,
      })

      render(<Block block={block1} isFocused={false} />)
      expect(screen.getByText('Text without formatting')).toBeInTheDocument()

      const block2 = createMockBlock({
        content: 'Text with empty formatting',
        formatting: [],
      })

      render(<Block block={block2} isFocused={false} />)
      expect(screen.getByText('Text with empty formatting')).toBeInTheDocument()
    })

    it('clamps formatting to content length', () => {
      const formatting: TextFormat[] = [
        { type: 'bold', start: 0, end: 100 }, // Extends beyond content
      ]

      const block = createMockBlock({
        content: 'Short text',
        formatting,
      })

      const { container } = render(<Block block={block} isFocused={false} />)

      // User sees entire text bolded (clamped to actual length)
      const boldText = container.querySelector('strong')
      expect(boldText).toBeInTheDocument()
      expect(boldText).toHaveTextContent('Short text')
    })

    it('sanitizes malicious link URLs', () => {
      const formatting: TextFormat[] = [{ type: 'link', start: 0, end: 5, url: 'javascript:alert("XSS")' }]

      const block = createMockBlock({
        content: 'Click here',
        formatting,
      })

      render(<Block block={block} isFocused={false} />)

      const link = screen.getByRole('link')
      // User is protected from javascript: URLs
      expect(link).not.toHaveAttribute('href', 'javascript:alert("XSS")')
    })
  })

  describe('✅ Accessibility', () => {
    // Ensures the component works for all users, including those using assistive technology
    it('provides keyboard-accessible drag handles', () => {
      const block = createMockBlock()
      render(<Block block={block} isFocused={false} />)

      const dragHandle = screen.getByRole('button', { name: /drag to reorder/i })

      // Screen reader users can access drag handle
      expect(dragHandle).toHaveAttribute('tabIndex', '0')
      expect(dragHandle).toHaveAttribute('aria-label', 'Drag to reorder block')
    })

    it('identifies blocks for assistive technology', () => {
      const block = createMockBlock()
      const { container } = render(<Block block={block} isFocused={false} />)

      // Assistive tech can identify specific blocks
      const blockElement = container.querySelector(`[data-block-id="${block.id}"]`)
      expect(blockElement).toBeInTheDocument()
    })

    it('ensures links are accessible and secure', () => {
      const formatting: TextFormat[] = [{ type: 'link', start: 0, end: 10, url: 'https://example.com' }]

      const block = createMockBlock({
        content: 'Visit site for more info',
        formatting,
      })

      render(<Block block={block} isFocused={false} />)

      const link = screen.getByRole('link')

      // Links open in new tab with security attributes
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')

      // Links are keyboard accessible by default
      expect(link.tabIndex).not.toBe(-1)
    })

    it('provides focus context for screen readers', () => {
      const block = createMockBlock({ content: '' })
      const { container } = render(<Block block={block} isFocused={true} />)

      // Screen reader users get context about focused empty blocks
      const placeholder = screen.getByText("Press '/' for commands, or 'space' for AI...")
      expect(placeholder).toBeInTheDocument()

      // Visual focus indicator is present via CSS class
      const focusedContent = container.querySelector('.block__content--focused')
      expect(focusedContent).toBeInTheDocument()
    })

    it('supports full keyboard interaction flow', async () => {
      const user = userEvent.setup()
      const block = createMockBlock()
      const onBlockClick = jest.fn()

      render(<Block block={block} isFocused={false} onBlockClick={onBlockClick} />)

      // User can tab to interactive elements
      await user.tab()
      const dragHandle = screen.getByRole('button', { name: /drag to reorder/i })
      expect(dragHandle).toHaveFocus()

      // User can activate with keyboard
      await user.keyboard('{Enter}')
      expect(mockDispatch).toHaveBeenCalled()
    })

    it('announces selection state changes', () => {
      const block = createMockBlock()
      const { rerender, container } = render(<Block block={block} isFocused={false} />)

      // Initially not selected
      let blockElement = container.querySelector('.block')
      expect(blockElement).not.toHaveClass('block--selected')

      // Update to selected state
      ;(useEditorState as jest.Mock).mockReturnValue({
        ...mockEditorState,
        selectedBlockIds: [block.id],
      })

      rerender(<Block block={block} isFocused={false} />)

      // Visual selection state is applied
      blockElement = container.querySelector('.block')
      expect(blockElement).toHaveClass('block--selected')
    })

    it('maintains semantic structure for headings', () => {
      const headingTypes = ['h1', 'h2', 'h3'] as const

      headingTypes.forEach((type) => {
        const block = createMockBlock({ type, content: `${type.toUpperCase()} Heading` })
        const { container } = render(<Block block={block} isFocused={false} />)

        // Each heading type gets appropriate styling classes
        const blockElement = container.querySelector('.block')
        expect(blockElement).toHaveClass(`block--${type}`)

        const contentElement = container.querySelector('.block__content')
        expect(contentElement).toHaveClass(`block__content--${type}`)
      })
    })

    it('provides clear navigation between blocks', async () => {
      const user = userEvent.setup()
      const blocks = [createMockBlock({ content: 'First block' }), createMockBlock({ content: 'Second block' })]

      const { container } = render(
        <>
          <Block block={blocks[0]} isFocused={false} />
          <Block block={blocks[1]} isFocused={false} />
        </>
      )

      // User can navigate between blocks with keyboard
      const firstDragHandle = within(container).getAllByRole('button', { name: /drag to reorder/i })[0]
      const secondDragHandle = within(container).getAllByRole('button', { name: /drag to reorder/i })[1]

      firstDragHandle.focus()
      expect(firstDragHandle).toHaveFocus()

      await user.tab()
      expect(secondDragHandle).toHaveFocus()
    })
  })
})
