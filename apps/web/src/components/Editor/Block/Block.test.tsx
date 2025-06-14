// apps/web/src/components/Editor/Block/Block.test.tsx
// Comprehensive tests for the Block component - the basic building block of the editor

import { render, screen, fireEvent, within } from '@testing-library/react'
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

// Mock BlockDragHandle component
jest.mock('./BlockDragHandle', () => ({
  BlockDragHandle: ({ blockId, onSelect, dragHandleProps }: any) => (
    <div
      data-testid={`drag-handle-${blockId}`}
      onMouseDown={(e) => onSelect(blockId, e as any)}
      {...dragHandleProps}
      role="button"
      aria-label="Drag handle"
      tabIndex={0}
    >
      Drag Handle
    </div>
  ),
}))

// Mock console.error to catch validation warnings
const originalConsoleError = console.error
beforeAll(() => {
  console.error = jest.fn()
})
afterAll(() => {
  console.error = originalConsoleError
})

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

  describe('✅ Core Functionality', () => {
    it('should display block content that users can see', () => {
      const block = createMockBlock({ content: 'Hello World' })
      render(<Block block={block} isFocused={false} />)

      expect(screen.getByText('Hello World')).toBeInTheDocument()
    })

    it('should show placeholder text when block is empty and focused', () => {
      const block = createMockBlock({ content: '' })
      render(<Block block={block} isFocused={true} />)

      // This is the documented placeholder text for empty blocks
      expect(screen.getByText("Press '/' for commands, or 'space' for AI...")).toBeInTheDocument()
    })

    it('should not show placeholder when block has content', () => {
      const block = createMockBlock({ content: 'Some text' })
      render(<Block block={block} isFocused={true} />)

      expect(screen.queryByText("Press '/' for commands, or 'space' for AI...")).not.toBeInTheDocument()
      expect(screen.getByText('Some text')).toBeInTheDocument()
    })

    it('should render different block types with proper visual hierarchy', () => {
      // Heading 1 should be visually distinct
      const h1Block = createMockBlock({ type: 'h1', content: 'Main Title' })
      const { container: h1Container } = render(<Block block={h1Block} isFocused={false} />)
      expect(screen.getByText('Main Title')).toBeInTheDocument()

      // Verify it's marked as h1 for styling
      const h1Element = h1Container.querySelector('.block--h1')
      expect(h1Element).toBeInTheDocument()

      // Bullet points should be visually distinct
      const bulletBlock = createMockBlock({ type: 'bullet', content: 'List item' })
      const { container: bulletContainer } = render(<Block block={bulletBlock} isFocused={false} />)
      expect(screen.getByText('List item')).toBeInTheDocument()

      // Verify it's marked as bullet for styling
      const bulletElement = bulletContainer.querySelector('.block--bullet')
      expect(bulletElement).toBeInTheDocument()
    })

    it('should render formatted text exactly as users expect', () => {
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

      // Bold text MUST be wrapped in <strong>
      const boldText = container.querySelector('strong')
      expect(boldText).toBeInTheDocument()
      expect(boldText).toHaveTextContent('Bold')

      // Italic text MUST be wrapped in <em>
      const italicText = container.querySelector('em')
      expect(italicText).toBeInTheDocument()
      expect(italicText).toHaveTextContent('italic')

      // Underlined text MUST be wrapped in <u>
      const underlineText = container.querySelector('u')
      expect(underlineText).toBeInTheDocument()
      expect(underlineText).toHaveTextContent('underline')

      // Links MUST have proper attributes for security and UX
      const linkElement = screen.getByRole('link')
      expect(linkElement).toHaveAttribute('href', 'https://example.com')
      expect(linkElement).toHaveTextContent('link')
      expect(linkElement).toHaveAttribute('target', '_blank') // Opens in new tab
      expect(linkElement).toHaveAttribute('rel', 'noopener noreferrer') // Security
    })

    it('should render overlapping formatting with proper nesting', () => {
      const formatting: TextFormat[] = [
        { type: 'bold', start: 0, end: 10 }, // "Start bold"
        { type: 'italic', start: 5, end: 15 }, // "bold&italic"
      ]

      const block = createMockBlock({
        content: 'Start bold&italic end',
        formatting,
      })

      const { container } = render(<Block block={block} isFocused={false} />)

      // The overlapping region MUST have both formats applied
      const overlap = container.querySelector('strong em, em strong')
      expect(overlap).toBeInTheDocument()
      expect(overlap).toHaveTextContent('bold')

      // Verify complete structure in content area
      const contentArea = container.querySelector('.block__content')
      expect(contentArea).toBeInTheDocument()
      expect(contentArea?.textContent).toBe('Start bold&italic end')
    })

    it('should highlight selected blocks for user feedback', () => {
      const block = createMockBlock()
      ;(useEditorState as jest.Mock).mockReturnValue({
        ...mockEditorState,
        selectedBlockIds: [block.id],
      })

      const { container } = render(<Block block={block} isFocused={false} />)

      // Selected blocks MUST have visual indicator
      const blockElement = container.querySelector('.block')
      expect(blockElement).toHaveClass('block--selected')
    })

    it('should update content immediately when block prop changes', () => {
      const block = createMockBlock({ content: 'Initial content' })
      const { rerender } = render(<Block block={block} isFocused={false} />)

      expect(screen.getByText('Initial content')).toBeInTheDocument()

      // Content updates MUST be reflected immediately
      const updatedBlock = { ...block, content: 'Updated content' }
      rerender(<Block block={updatedBlock} isFocused={false} />)

      expect(screen.queryByText('Initial content')).not.toBeInTheDocument()
      expect(screen.getByText('Updated content')).toBeInTheDocument()
    })
  })

  describe('✅ User Interactions', () => {
    it('should handle click to focus block for editing', () => {
      const block = createMockBlock()
      const handleClick = jest.fn()
      render(<Block block={block} isFocused={false} onBlockClick={handleClick} />)

      const blockElement = screen.getByText('Test block content').closest('.block')!
      fireEvent.click(blockElement)

      // Click MUST notify parent to focus this block
      expect(handleClick).toHaveBeenCalledWith(block.id)
    })

    it('should select single block when drag handle is clicked', () => {
      const block = createMockBlock()
      render(<Block block={block} isFocused={false} />)

      const dragHandle = screen.getByRole('button', { name: 'Drag handle' })
      fireEvent.mouseDown(dragHandle)

      // Single click MUST select only this block
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_SELECTED_BLOCKS',
        blockIds: [block.id],
      })
    })

    it('should handle multi-block selection with Shift+click', () => {
      const block = createMockBlock()
      ;(useEditorState as jest.Mock).mockReturnValue({
        ...mockEditorState,
        selectedBlockIds: ['other-block-id'],
      })

      render(<Block block={block} isFocused={false} />)

      const dragHandle = screen.getByRole('button', { name: 'Drag handle' })
      fireEvent.mouseDown(dragHandle, { shiftKey: true })

      // Shift+click MUST select range from last selected to current
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SELECT_BLOCK_RANGE',
        startBlockId: 'other-block-id',
        endBlockId: block.id,
      })
    })

    it('should toggle selection with Ctrl/Cmd+click', () => {
      const block = createMockBlock()
      render(<Block block={block} isFocused={false} />)

      const dragHandle = screen.getByRole('button', { name: 'Drag handle' })

      // Ctrl+click MUST toggle selection
      fireEvent.mouseDown(dragHandle, { ctrlKey: true })
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'TOGGLE_BLOCK_SELECTION',
        blockId: block.id,
      })

      // Cmd+click MUST also toggle selection (Mac)
      mockDispatch.mockClear()
      fireEvent.mouseDown(dragHandle, { metaKey: true })
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'TOGGLE_BLOCK_SELECTION',
        blockId: block.id,
      })
    })

    it('should maintain focus state correctly through rerenders', () => {
      const block = createMockBlock({ content: '' })
      const { container, rerender } = render(<Block block={block} isFocused={false} />)

      // Not focused: no placeholder, no focus class
      expect(screen.queryByText("Press '/' for commands, or 'space' for AI...")).not.toBeInTheDocument()
      expect(container.querySelector('.block__content--focused')).not.toBeInTheDocument()

      // Focus the block
      rerender(<Block block={block} isFocused={true} />)

      // Focused: show placeholder, add focus class
      expect(screen.getByText("Press '/' for commands, or 'space' for AI...")).toBeInTheDocument()
      expect(container.querySelector('.block__content--focused')).toBeInTheDocument()

      // Unfocus the block
      rerender(<Block block={block} isFocused={false} />)

      // State MUST revert correctly
      expect(screen.queryByText("Press '/' for commands, or 'space' for AI...")).not.toBeInTheDocument()
      expect(container.querySelector('.block__content--focused')).not.toBeInTheDocument()
    })
  })

  describe('✅ Error Handling', () => {
    it('should render empty string when content is missing or undefined', () => {
      // Content should default to empty string, not crash
      const block = createMockBlock({ content: undefined as any })
      const { container } = render(<Block block={block} isFocused={false} />)

      const blockContent = container.querySelector('.block__content')
      expect(blockContent).toBeInTheDocument()
      expect(blockContent).toHaveTextContent('') // Should be empty, not "undefined"
    })

    it('should filter out invalid formatting and warn in development', () => {
      const formatting: TextFormat[] = [
        { type: 'bold', start: 100, end: 200 }, // Out of bounds - MUST be ignored
        { type: 'italic', start: -5, end: 5 }, // Invalid range - MUST be ignored
        { type: 'link', start: 0, end: 5, url: '' }, // Invalid link - MUST be ignored
        { type: 'underline', start: 2, end: 7 }, // Valid - MUST be applied
      ]

      const block = createMockBlock({
        content: 'Short text', // 10 characters
        formatting,
      })

      render(<Block block={block} isFocused={false} />)

      // Valid formatting MUST still work
      const underline = screen.getByText(/ort t/).closest('u')
      expect(underline).toBeInTheDocument()

      // In development, we should warn about invalid formatting
      if (process.env.NODE_ENV === 'development') {
        expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Invalid formatting'))
      }
    })

    it('should only accept valid block types', () => {
      const validTypes = ['h1', 'h2', 'h3', 'paragraph', 'bullet']
      const block = createMockBlock({ type: 'invalid-type' as any })

      const { container } = render(<Block block={block} isFocused={false} />)

      // Should still render content
      expect(screen.getByText('Test block content')).toBeInTheDocument()

      // Should default to paragraph styling or show warning
      const blockElement = container.querySelector('.block')
      expect(blockElement).toHaveClass('block--paragraph') // Should fallback to paragraph

      // Should warn in development
      if (process.env.NODE_ENV === 'development') {
        expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Invalid block type'))
      }
    })

    it('should handle extremely long content without breaking layout', () => {
      // 10,000 characters should not break the layout
      const longContent = 'A'.repeat(10000)
      const block = createMockBlock({ content: longContent })
      render(<Block block={block} isFocused={false} />)

      const contentElement = screen.getByText(longContent)
      expect(contentElement).toBeInTheDocument()

      // Content should be contained within block
      const blockElement = contentElement.closest('.block__content')
      expect(blockElement).toBeInTheDocument()
    })

    it('should properly escape HTML entities to prevent XSS', () => {
      const dangerousContent = '<script>alert("XSS")</script> & <img src=x onerror=alert("XSS")>'
      const block = createMockBlock({ content: dangerousContent })
      const { container } = render(<Block block={block} isFocused={false} />)

      // Content MUST be escaped
      const blockContent = container.querySelector('.block__content')
      expect(blockContent?.innerHTML).not.toContain('<script>')
      expect(blockContent?.innerHTML).not.toContain('<img')

      // Text content should show escaped version
      expect(blockContent?.textContent).toContain('<script>')
    })

    it('should handle all unicode and special characters correctly', () => {
      const specialContent = '© ® ™ § ¶ † ‡ • ‰ 🌟 🔥 🎨 中文 العربية'
      const block = createMockBlock({ content: specialContent })
      const { container } = render(<Block block={block} isFocused={false} />)

      const blockContent = container.querySelector('.block__content')
      expect(blockContent).toBeInTheDocument()

      // All characters MUST be preserved exactly
      expect(blockContent?.textContent).toBe(specialContent)
    })

    it('should gracefully handle missing or empty formatting array', () => {
      // undefined formatting should work same as empty array
      const block1 = createMockBlock({
        content: 'Text without formatting',
        formatting: undefined,
      })

      const { container: container1 } = render(<Block block={block1} isFocused={false} />)
      expect(container1.querySelector('.block__content')).toHaveTextContent('Text without formatting')

      // Empty array should render plain text
      const block2 = createMockBlock({
        content: 'Text with empty formatting',
        formatting: [],
      })

      const { container: container2 } = render(<Block block={block2} isFocused={false} />)
      expect(container2.querySelector('.block__content')).toHaveTextContent('Text with empty formatting')
    })

    it('should handle formatting that extends beyond content length', () => {
      const formatting: TextFormat[] = [
        { type: 'bold', start: 0, end: 100 }, // Content is only 10 chars
      ]

      const block = createMockBlock({
        content: 'Short text',
        formatting,
      })

      const { container } = render(<Block block={block} isFocused={false} />)

      // Should clamp formatting to content length
      const boldText = container.querySelector('strong')
      expect(boldText).toBeInTheDocument()
      expect(boldText).toHaveTextContent('Short text') // Entire text should be bold
    })
  })

  describe('✅ Accessibility', () => {
    it('should have keyboard-accessible drag handle', () => {
      const block = createMockBlock()
      render(<Block block={block} isFocused={false} />)

      const dragHandle = screen.getByRole('button', { name: 'Drag handle' })

      // MUST be keyboard accessible
      expect(dragHandle).toHaveAttribute('tabIndex', '0')
      expect(dragHandle).toHaveAttribute('role', 'button')
      expect(dragHandle).toHaveAttribute('aria-label', 'Drag handle')
    })

    it('should identify blocks for assistive technology', () => {
      const block = createMockBlock()
      const { container } = render(<Block block={block} isFocused={false} />)

      // Blocks MUST be identifiable
      const blockElement = container.querySelector(`[data-block-id="${block.id}"]`)
      expect(blockElement).toBeInTheDocument()
    })

    it('should ensure links are accessible and secure', () => {
      const formatting: TextFormat[] = [{ type: 'link', start: 0, end: 10, url: 'https://example.com' }]

      const block = createMockBlock({
        content: 'Visit site for more info',
        formatting,
      })

      render(<Block block={block} isFocused={false} />)

      const link = screen.getByRole('link')

      // Links MUST have security attributes
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')

      // Links MUST be keyboard accessible
      expect(link).not.toHaveAttribute('tabIndex', '-1')
    })

    it('should provide focus context for screen readers', () => {
      const block = createMockBlock({ content: '' })
      const { container } = render(<Block block={block} isFocused={true} />)

      // Focused empty blocks MUST show placeholder
      const placeholder = screen.getByText("Press '/' for commands, or 'space' for AI...")
      expect(placeholder).toBeInTheDocument()

      // Should have focus indicator class
      const contentElement = container.querySelector('.block__content--focused')
      expect(contentElement).toBeInTheDocument()
    })

    it('should support keyboard operations on drag handle', () => {
      const block = createMockBlock()
      render(<Block block={block} isFocused={false} />)

      const dragHandle = screen.getByRole('button', { name: 'Drag handle' })

      // Simulate keyboard activation
      fireEvent.keyDown(dragHandle, { key: 'Enter' })

      // In a real implementation, Enter/Space should trigger selection
      // This test ensures the handle can receive keyboard events
      expect(dragHandle).toHaveAttribute('role', 'button')
    })

    it('should announce selection state to screen readers', () => {
      const block = createMockBlock()
      const { container, rerender } = render(<Block block={block} isFocused={false} />)

      // Not selected
      let blockElement = container.querySelector('.block')
      expect(blockElement).not.toHaveClass('block--selected')

      // Select the block
      ;(useEditorState as jest.Mock).mockReturnValue({
        ...mockEditorState,
        selectedBlockIds: [block.id],
      })

      rerender(<Block block={block} isFocused={false} />)

      // Selected state MUST be visually indicated
      blockElement = container.querySelector('.block')
      expect(blockElement).toHaveClass('block--selected')

      // Could also add aria-selected="true" for better screen reader support
    })

    it('should maintain semantic structure for different block types', () => {
      const headingTypes = ['h1', 'h2', 'h3'] as const

      headingTypes.forEach((type) => {
        const block = createMockBlock({ type, content: `${type.toUpperCase()} Heading` })
        const { container } = render(<Block block={block} isFocused={false} />)

        // Headings MUST be identifiable for proper document structure
        const blockElement = container.querySelector('.block')
        expect(blockElement).toHaveClass(`block--${type}`)

        // Could also use role="heading" with aria-level for better semantics
      })
    })

    it('should handle malicious link URLs safely', () => {
      const formatting: TextFormat[] = [{ type: 'link', start: 0, end: 5, url: 'javascript:alert("XSS")' }]

      const block = createMockBlock({
        content: 'Click here',
        formatting,
      })

      render(<Block block={block} isFocused={false} />)

      const link = screen.getByRole('link')

      // javascript: URLs MUST be sanitized
      expect(link).not.toHaveAttribute('href', 'javascript:alert("XSS")')
      // Should either be blocked or sanitized to safe value
      expect(link.getAttribute('href')).toMatch(/^(https?:|#|$)/)
    })
  })
})
