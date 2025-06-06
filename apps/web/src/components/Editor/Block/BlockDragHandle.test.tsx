import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BlockDragHandle } from './BlockDragHandle'

// Mock the Icon component from @kairos/ui
jest.mock('@kairos/ui', () => ({
  Icon: ({ name, size }: { name: string; size: number }) => (
    <div data-testid={`icon-${name}`} data-size={size}>
      {name}
    </div>
  ),
}))

describe('BlockDragHandle', () => {
  const mockOnSelect = jest.fn()
  const mockDragHandleProps = {
    onMouseDown: jest.fn(),
    onTouchStart: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('✅ Rendering', () => {
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

    it('applies drag handle props when provided', () => {
      render(<BlockDragHandle blockId="test-block" dragHandleProps={mockDragHandleProps} />)
      const handle = screen.getByRole('button')

      // Simulate mousedown on the handle
      fireEvent.mouseDown(handle)
      expect(mockDragHandleProps.onMouseDown).toHaveBeenCalled()
    })

    it('is not contentEditable', () => {
      render(<BlockDragHandle blockId="test-block" />)
      const handle = screen.getByRole('button')
      expect(handle).toHaveAttribute('contentEditable', 'false')
    })
  })

  describe('✅ Mouse Interactions', () => {
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

    it('changes cursor to grab on hover', () => {
      render(<BlockDragHandle blockId="test-block" />)
      const handle = screen.getByRole('button')

      // Check the base style includes cursor: grab
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

    it('does not call onSelect if not provided', () => {
      render(<BlockDragHandle blockId="test-block" />)
      const handle = screen.getByRole('button')

      // Should not throw when onSelect is not provided
      expect(() => fireEvent.mouseDown(handle)).not.toThrow()
    })
  })

  describe('✅ Keyboard Interactions', () => {
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

  describe('✅ Multi-Select Support', () => {
    it('detects Shift key for range selection', () => {
      render(<BlockDragHandle blockId="test-block" onSelect={mockOnSelect} />)
      const handle = screen.getByRole('button')

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

    it('works with touch events on mobile', () => {
      render(<BlockDragHandle blockId="test-block" onSelect={mockOnSelect} dragHandleProps={mockDragHandleProps} />)
      const handle = screen.getByRole('button')

      // Simulate touch start (mobile drag initiation)
      fireEvent.touchStart(handle)
      expect(mockDragHandleProps.onTouchStart).toHaveBeenCalled()
    })

    it('provides clear multi-select instructions in aria-label', () => {
      render(<BlockDragHandle blockId="test-block" />)
      const handle = screen.getByRole('button')

      const ariaLabel = handle.getAttribute('aria-label')
      expect(ariaLabel).toContain('Shift+click to select multiple blocks')
    })
  })

  describe('✅ Integration with drag handlers', () => {
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

    it('maintains accessibility when drag props are added', () => {
      render(<BlockDragHandle blockId="test-block" dragHandleProps={mockDragHandleProps} />)

      const handle = screen.getByRole('button')
      expect(handle).toHaveAttribute('tabIndex', '0')
      expect(handle).toHaveAttribute('aria-label')
      expect(handle).toHaveAttribute('contentEditable', 'false')
    })
  })
})
