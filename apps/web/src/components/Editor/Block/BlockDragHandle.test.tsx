import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BlockDragHandle } from './BlockDragHandle'

// Mock only the Icon component from @kairos/ui
jest.mock('@kairos/ui', () => ({
  Icon: ({ name, size }: { name: string; size: number }) => (
    <div data-testid={`icon-${name}`} data-size={size}>
      {name}
    </div>
  ),
}))

describe('BlockDragHandle', () => {
  const mockOnSelect = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('✅ Core Functionality', () => {
    it('renders grab icon that users can see', () => {
      render(<BlockDragHandle blockId="test-block" />)

      const icon = screen.getByTestId('icon-grab')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveAttribute('data-size', '16')
    })

    it('is accessible to keyboard users', () => {
      render(<BlockDragHandle blockId="test-block" />)

      const handle = screen.getByRole('button')
      expect(handle).toHaveAttribute('aria-label', 'Drag to reorder block, or click to select. Use Shift+click to select multiple blocks.')
      expect(handle).toHaveAttribute('tabIndex', '0')
    })

    it('shows helpful tooltip on hover', () => {
      render(<BlockDragHandle blockId="test-block" />)

      const handle = screen.getByRole('button')
      expect(handle).toHaveAttribute('title', 'Drag to reorder • Click to select • Shift+click for multi-select')
    })

    it('prevents contentEditable from interfering with drag', () => {
      render(<BlockDragHandle blockId="test-block" />)

      const handle = screen.getByRole('button')
      expect(handle).toHaveAttribute('contentEditable', 'false')
    })
  })

  describe('✅ User Interactions - Mouse', () => {
    it('selects block when user clicks the handle', () => {
      render(<BlockDragHandle blockId="block-123" onSelect={mockOnSelect} />)

      const handle = screen.getByRole('button')
      fireEvent.mouseDown(handle)

      expect(mockOnSelect).toHaveBeenCalledWith('block-123', expect.any(MouseEvent))
    })

    it('passes modifier keys for multi-selection when user holds Shift', () => {
      render(<BlockDragHandle blockId="block-123" onSelect={mockOnSelect} />)

      const handle = screen.getByRole('button')
      fireEvent.mouseDown(handle, { shiftKey: true })

      expect(mockOnSelect).toHaveBeenCalledWith('block-123', expect.objectContaining({ shiftKey: true }))
    })

    it('passes Ctrl key for toggle selection on Windows/Linux', () => {
      render(<BlockDragHandle blockId="block-123" onSelect={mockOnSelect} />)

      const handle = screen.getByRole('button')
      fireEvent.mouseDown(handle, { ctrlKey: true })

      expect(mockOnSelect).toHaveBeenCalledWith('block-123', expect.objectContaining({ ctrlKey: true }))
    })

    it('passes Cmd key for toggle selection on Mac', () => {
      render(<BlockDragHandle blockId="block-123" onSelect={mockOnSelect} />)

      const handle = screen.getByRole('button')
      fireEvent.mouseDown(handle, { metaKey: true })

      expect(mockOnSelect).toHaveBeenCalledWith('block-123', expect.objectContaining({ metaKey: true }))
    })

    it('passes multiple modifier keys when user holds them together', () => {
      render(<BlockDragHandle blockId="block-123" onSelect={mockOnSelect} />)

      const handle = screen.getByRole('button')
      fireEvent.mouseDown(handle, { shiftKey: true, ctrlKey: true })

      expect(mockOnSelect).toHaveBeenCalledWith(
        'block-123',
        expect.objectContaining({
          shiftKey: true,
          ctrlKey: true,
        })
      )
    })

    it('does not throw when onSelect is not provided', () => {
      render(<BlockDragHandle blockId="test-block" />)
      const handle = screen.getByRole('button')

      expect(() => fireEvent.mouseDown(handle)).not.toThrow()
    })
  })

  describe('✅ User Interactions - Keyboard', () => {
    it('selects block when user presses Enter', async () => {
      const user = userEvent.setup()
      render(<BlockDragHandle blockId="block-123" onSelect={mockOnSelect} />)

      const handle = screen.getByRole('button')
      handle.focus()

      await user.keyboard('{Enter}')

      expect(mockOnSelect).toHaveBeenCalledWith('block-123')
      expect(mockOnSelect).toHaveBeenCalledTimes(1)
    })

    it('selects block when user presses Space', async () => {
      const user = userEvent.setup()
      render(<BlockDragHandle blockId="block-123" onSelect={mockOnSelect} />)

      const handle = screen.getByRole('button')
      handle.focus()

      await user.keyboard(' ')

      expect(mockOnSelect).toHaveBeenCalledWith('block-123')
      expect(mockOnSelect).toHaveBeenCalledTimes(1)
    })

    it('prevents default action for Enter to avoid form submission', () => {
      render(<BlockDragHandle blockId="test-block" onSelect={mockOnSelect} />)
      const handle = screen.getByRole('button')

      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault')

      handle.dispatchEvent(event)
      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('prevents default action for Space to avoid page scroll', () => {
      render(<BlockDragHandle blockId="test-block" onSelect={mockOnSelect} />)
      const handle = screen.getByRole('button')

      const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true })
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault')

      handle.dispatchEvent(event)
      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('ignores other keys that are not Enter or Space', async () => {
      const user = userEvent.setup()
      render(<BlockDragHandle blockId="test-block" onSelect={mockOnSelect} />)

      const handle = screen.getByRole('button')
      handle.focus()

      await user.keyboard('a')
      await user.keyboard('{Escape}')
      await user.keyboard('{Tab}')
      await user.keyboard('{ArrowDown}')

      expect(mockOnSelect).not.toHaveBeenCalled()
    })

    it('maintains focus after keyboard interaction', async () => {
      const user = userEvent.setup()
      render(<BlockDragHandle blockId="test-block" onSelect={mockOnSelect} />)

      const handle = screen.getByRole('button')
      handle.focus()
      expect(document.activeElement).toBe(handle)

      await user.keyboard('{Enter}')

      // Focus should remain on the handle
      expect(document.activeElement).toBe(handle)
    })

    it('does not pass MouseEvent for keyboard activation', async () => {
      const user = userEvent.setup()
      render(<BlockDragHandle blockId="block-123" onSelect={mockOnSelect} />)

      const handle = screen.getByRole('button')
      handle.focus()

      await user.keyboard('{Enter}')

      // Should be called with blockId only, no mouse event
      expect(mockOnSelect).toHaveBeenCalledWith('block-123')
      expect(mockOnSelect).toHaveBeenCalledTimes(1)
      expect(mockOnSelect.mock.calls[0].length).toBe(1)
    })
  })

  describe('✅ Drag Handle Props Integration', () => {
    it('applies external drag handle props when provided', () => {
      const mockDragHandleProps = {
        onMouseDown: jest.fn(),
        onTouchStart: jest.fn(),
      }

      render(<BlockDragHandle blockId="test-block" dragHandleProps={mockDragHandleProps} />)

      const handle = screen.getByRole('button')

      // When external onMouseDown is provided, it overrides the component's handler
      fireEvent.mouseDown(handle)
      expect(mockDragHandleProps.onMouseDown).toHaveBeenCalled()
    })

    it('handles touch events for mobile drag support', () => {
      const mockDragHandleProps = {
        onTouchStart: jest.fn(),
      }

      render(<BlockDragHandle blockId="test-block" dragHandleProps={mockDragHandleProps} />)

      const handle = screen.getByRole('button')
      fireEvent.touchStart(handle)

      expect(mockDragHandleProps.onTouchStart).toHaveBeenCalled()
    })

    it('overrides component mouse handler when dragHandleProps includes onMouseDown', () => {
      const mockDragHandleProps = {
        onMouseDown: jest.fn(),
      }

      render(<BlockDragHandle blockId="test-block" onSelect={mockOnSelect} dragHandleProps={mockDragHandleProps} />)

      const handle = screen.getByRole('button')
      fireEvent.mouseDown(handle)

      // External handler takes precedence
      expect(mockDragHandleProps.onMouseDown).toHaveBeenCalled()
      expect(mockOnSelect).not.toHaveBeenCalled()
    })

    it('maintains all accessibility attributes with drag props', () => {
      const mockDragHandleProps = {
        onMouseDown: jest.fn(),
      }

      render(<BlockDragHandle blockId="test-block" dragHandleProps={mockDragHandleProps} />)

      const handle = screen.getByRole('button')

      // Core accessibility attributes should remain
      expect(handle).toHaveAttribute('tabIndex', '0')
      expect(handle).toHaveAttribute('aria-label')
      expect(handle).toHaveAttribute('contentEditable', 'false')
    })
  })

  describe('✅ Visual States', () => {
    it('has appropriate className for styling', () => {
      render(<BlockDragHandle blockId="test-block" />)

      const handle = screen.getByRole('button')
      expect(handle).toHaveClass('block-drag-handle')
    })

    it('has unique test id for each block', () => {
      render(
        <>
          <BlockDragHandle blockId="block-1" />
          <BlockDragHandle blockId="block-2" />
        </>
      )

      expect(screen.getByTestId('drag-handle-block-1')).toBeInTheDocument()
      expect(screen.getByTestId('drag-handle-block-2')).toBeInTheDocument()
    })
  })

  describe('✅ Error Handling', () => {
    it('handles missing blockId gracefully', () => {
      // @ts-expect-error Testing invalid prop
      render(<BlockDragHandle blockId={undefined} />)

      const handle = screen.getByRole('button')
      expect(handle).toBeInTheDocument()
      expect(handle).toHaveAttribute('data-testid', 'drag-handle-undefined')
    })

    it('works without any optional props', () => {
      render(<BlockDragHandle blockId="test-block" />)

      const handle = screen.getByRole('button')
      expect(handle).toBeInTheDocument()

      // Should not throw on interactions
      expect(() => fireEvent.mouseDown(handle)).not.toThrow()
      expect(() => fireEvent.keyDown(handle, { key: 'Enter' })).not.toThrow()
    })
  })
})
