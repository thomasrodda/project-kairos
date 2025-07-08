import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmationDialog } from './ConfirmationDialog'

describe('ConfirmationDialog', () => {
  const defaultProps = {
    isOpen: true,
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
    title: 'Delete Workspace?',
    message: 'This action cannot be undone. Are you sure you want to delete this workspace?',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('✅ Rendering', () => {
    it('renders dialog when isOpen is true', () => {
      render(<ConfirmationDialog {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Delete Workspace?')).toBeInTheDocument()
      expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    })

    it('does not render dialog when isOpen is false', () => {
      render(<ConfirmationDialog {...defaultProps} isOpen={false} />)

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders with custom button text', () => {
      render(<ConfirmationDialog {...defaultProps} confirmText="Remove" cancelText="Keep" />)

      expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Keep' })).toBeInTheDocument()
    })

    it('renders with primary button variant', () => {
      render(<ConfirmationDialog {...defaultProps} confirmButtonVariant="primary" />)

      const confirmButton = screen.getByRole('button', { name: 'Delete' })
      expect(confirmButton).toHaveClass('dialog__button--primary')
    })

    it('renders with danger button variant by default', () => {
      render(<ConfirmationDialog {...defaultProps} />)

      const confirmButton = screen.getByRole('button', { name: 'Delete' })
      expect(confirmButton).toHaveClass('dialog__button--danger')
    })
  })

  describe('✅ User Interactions', () => {
    it('calls onConfirm when confirm button is clicked', async () => {
      const user = userEvent.setup()
      render(<ConfirmationDialog {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: 'Delete' }))

      expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
      expect(defaultProps.onCancel).not.toHaveBeenCalled()
    })

    it('calls onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<ConfirmationDialog {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: 'Cancel' }))

      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1)
      expect(defaultProps.onConfirm).not.toHaveBeenCalled()
    })

    it('calls onCancel when close button is clicked', async () => {
      const user = userEvent.setup()
      render(<ConfirmationDialog {...defaultProps} />)

      await user.click(screen.getByLabelText('Close dialog'))

      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1)
      expect(defaultProps.onConfirm).not.toHaveBeenCalled()
    })

    it('calls onCancel when clicking outside the dialog (backdrop)', async () => {
      const user = userEvent.setup()
      render(<ConfirmationDialog {...defaultProps} />)

      // Click on the overlay/backdrop
      const overlay = screen.getByRole('presentation', { hidden: true })
      await user.click(overlay)

      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1)
      expect(defaultProps.onConfirm).not.toHaveBeenCalled()
    })

    it('does not close when clicking inside the dialog', async () => {
      const user = userEvent.setup()
      render(<ConfirmationDialog {...defaultProps} />)

      await user.click(screen.getByRole('dialog'))

      expect(defaultProps.onCancel).not.toHaveBeenCalled()
      expect(defaultProps.onConfirm).not.toHaveBeenCalled()
    })
  })

  describe('✅ Keyboard Navigation', () => {
    it('calls onCancel when Escape key is pressed', () => {
      render(<ConfirmationDialog {...defaultProps} />)

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1)
      expect(defaultProps.onConfirm).not.toHaveBeenCalled()
    })

    it('calls onConfirm when Enter key is pressed', () => {
      render(<ConfirmationDialog {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      fireEvent.keyDown(dialog, { key: 'Enter' })

      expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
      expect(defaultProps.onCancel).not.toHaveBeenCalled()
    })

    it('does not call onConfirm when Enter is pressed with modifiers', () => {
      render(<ConfirmationDialog {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      fireEvent.keyDown(dialog, { key: 'Enter', shiftKey: true })
      fireEvent.keyDown(dialog, { key: 'Enter', ctrlKey: true })
      fireEvent.keyDown(dialog, { key: 'Enter', metaKey: true })

      expect(defaultProps.onConfirm).not.toHaveBeenCalled()
    })
  })

  describe('✅ Focus Management', () => {
    it('focuses confirm button when dialog opens', async () => {
      const { rerender } = render(<ConfirmationDialog {...defaultProps} isOpen={false} />)

      rerender(<ConfirmationDialog {...defaultProps} isOpen={true} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Delete' })).toHaveFocus()
      })
    })
  })

  describe('✅ Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<ConfirmationDialog {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-title')
      expect(dialog).toHaveAttribute('aria-describedby', 'dialog-message')

      expect(screen.getByText('Delete Workspace?')).toHaveAttribute('id', 'dialog-title')
      expect(screen.getByText(/This action cannot be undone/)).toHaveAttribute('id', 'dialog-message')
    })

    it('has accessible close button', () => {
      render(<ConfirmationDialog {...defaultProps} />)

      const closeButton = screen.getByLabelText('Close dialog')
      expect(closeButton).toBeInTheDocument()
      expect(closeButton).toHaveAttribute('type', 'button')
    })
  })

  describe('✅ Portal Rendering', () => {
    it('renders dialog in document body', () => {
      const { container } = render(<ConfirmationDialog {...defaultProps} />)

      // Component should render a portal, so container should be empty
      expect(container).toBeEmptyDOMElement()

      // Dialog should be rendered in document.body
      const dialog = document.body.querySelector('[role="dialog"]')
      expect(dialog).toBeInTheDocument()
    })
  })

  describe('✅ Edge Cases', () => {
    it('handles rapid open/close transitions', () => {
      const { rerender } = render(<ConfirmationDialog {...defaultProps} />)

      rerender(<ConfirmationDialog {...defaultProps} isOpen={false} />)
      rerender(<ConfirmationDialog {...defaultProps} isOpen={true} />)
      rerender(<ConfirmationDialog {...defaultProps} isOpen={false} />)

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('cleans up event listeners on unmount', () => {
      const { unmount } = render(<ConfirmationDialog {...defaultProps} />)

      unmount()

      // Ensure no errors when pressing Escape after unmount
      fireEvent.keyDown(document, { key: 'Escape' })

      expect(defaultProps.onCancel).not.toHaveBeenCalled()
    })

    it('handles empty strings for title and message', () => {
      render(<ConfirmationDialog {...defaultProps} title="" message="" />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      // Title element should still exist but be empty
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('')
    })

    it('handles very long title and message', () => {
      const longTitle = 'A'.repeat(100)
      const longMessage = 'B'.repeat(500)

      render(<ConfirmationDialog {...defaultProps} title={longTitle} message={longMessage} />)

      expect(screen.getByText(longTitle)).toBeInTheDocument()
      expect(screen.getByText(longMessage)).toBeInTheDocument()
    })
  })
})
