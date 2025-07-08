// apps/web/src/components/WorkspaceCreationDialog/WorkspaceCreationDialog.test.tsx
// Tests for the WorkspaceCreationDialog component

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WorkspaceCreationDialog } from './WorkspaceCreationDialog'
import { useWorkspace } from '../../contexts/WorkspaceContext'

// Mock the Icon component
jest.mock('@kairos/ui', () => ({
  Icon: ({ name, size }: any) => (
    <span data-testid={`icon-${name}`} data-size={size} role="img">
      {name} icon
    </span>
  ),
}))

// Mock the useWorkspace hook
jest.mock('../../contexts/WorkspaceContext', () => ({
  useWorkspace: jest.fn(),
}))

describe('WorkspaceCreationDialog', () => {
  const mockCreateWorkspace = jest.fn()
  const mockOnClose = jest.fn()

  const mockWorkspaceContext = {
    createWorkspace: mockCreateWorkspace,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useWorkspace as jest.Mock).mockReturnValue(mockWorkspaceContext)
  })

  describe('✅ Core Functionality', () => {
    it('renders dialog when open', () => {
      render(<WorkspaceCreationDialog isOpen={true} onClose={mockOnClose} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Create New Workspace')).toBeInTheDocument()
    })

    it('does not render when closed', () => {
      render(<WorkspaceCreationDialog isOpen={false} onClose={mockOnClose} />)

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('focuses name input when opened', async () => {
      render(<WorkspaceCreationDialog isOpen={true} onClose={mockOnClose} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/Workspace Name/)).toHaveFocus()
      })
    })

    it('renders all form elements', () => {
      render(<WorkspaceCreationDialog isOpen={true} onClose={mockOnClose} />)

      expect(screen.getByLabelText(/Workspace Name/)).toBeInTheDocument()
      expect(screen.getByLabelText('Description')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Create Workspace' })).toBeInTheDocument()
    })
  })

  describe('✅ Form Input', () => {
    it('updates name input value', async () => {
      const user = userEvent.setup()
      render(<WorkspaceCreationDialog isOpen={true} onClose={mockOnClose} />)

      const nameInput = screen.getByLabelText(/Workspace Name/)
      await user.type(nameInput, 'My New Workspace')

      expect(nameInput).toHaveValue('My New Workspace')
    })

    it('updates description textarea value', async () => {
      const user = userEvent.setup()
      render(<WorkspaceCreationDialog isOpen={true} onClose={mockOnClose} />)

      const descriptionInput = screen.getByLabelText('Description')
      await user.type(descriptionInput, 'This is a test workspace')

      expect(descriptionInput).toHaveValue('This is a test workspace')
    })

    it('enforces max length on name input', () => {
      render(<WorkspaceCreationDialog isOpen={true} onClose={mockOnClose} />)

      const nameInput = screen.getByLabelText(/Workspace Name/)
      expect(nameInput).toHaveAttribute('maxLength', '50')
    })

    it('enforces max length on description textarea', () => {
      render(<WorkspaceCreationDialog isOpen={true} onClose={mockOnClose} />)

      const descriptionInput = screen.getByLabelText('Description')
      expect(descriptionInput).toHaveAttribute('maxLength', '200')
    })
  })

  describe('✅ Form Validation', () => {
    it('shows error when name is empty', async () => {
      const user = userEvent.setup()
      render(<WorkspaceCreationDialog isOpen={true} onClose={mockOnClose} />)

      // The submit button is disabled when name is empty, so we need to simulate form submission directly
      const form = screen.getByRole('dialog').querySelector('form')!
      fireEvent.submit(form)

      await waitFor(() => {
        expect(screen.getByText('Workspace name is required')).toBeInTheDocument()
      })
      expect(mockCreateWorkspace).not.toHaveBeenCalled()
    })

    it('shows error when name is only whitespace', async () => {
      const user = userEvent.setup()
      render(<WorkspaceCreationDialog isOpen={true} onClose={mockOnClose} />)

      const nameInput = screen.getByLabelText(/Workspace Name/)
      await user.type(nameInput, '   ')

      const form = screen.getByRole('dialog').querySelector('form')!
      fireEvent.submit(form)

      await waitFor(() => {
        expect(screen.getByText('Workspace name is required')).toBeInTheDocument()
      })
      expect(mockCreateWorkspace).not.toHaveBeenCalled()
    })

    it('shows error when name exceeds max length', async () => {
      const user = userEvent.setup()
      render(<WorkspaceCreationDialog isOpen={true} onClose={mockOnClose} />)

      const nameInput = screen.getByLabelText(/Workspace Name/) as HTMLInputElement
      // HTML maxLength prevents typing more than 50 chars, so we set the value directly
      fireEvent.change(nameInput, { target: { value: 'a'.repeat(51) } })

      const form = screen.getByRole('dialog').querySelector('form')!
      fireEvent.submit(form)

      await waitFor(() => {
        expect(screen.getByText('Workspace name must be 50 characters or less')).toBeInTheDocument()
      })
      expect(mockCreateWorkspace).not.toHaveBeenCalled()
    })

    it('disables submit button when name is empty', () => {
      render(<WorkspaceCreationDialog isOpen={true} onClose={mockOnClose} />)

      const submitButton = screen.getByRole('button', { name: 'Create Workspace' })
      expect(submitButton).toBeDisabled()
    })

    it('enables submit button when name is entered', async () => {
      const user = userEvent.setup()
      render(<WorkspaceCreationDialog isOpen={true} onClose={mockOnClose} />)

      const nameInput = screen.getByLabelText(/Workspace Name/)
      await user.type(nameInput, 'Test')

      const submitButton = screen.getByRole('button', { name: 'Create Workspace' })
      expect(submitButton).toBeEnabled()
    })
  })

  describe('✅ Form Submission', () => {
    it('creates workspace with name only', async () => {
      const user = userEvent.setup()
      mockCreateWorkspace.mockResolvedValue({ id: '1', name: 'Test Workspace' })

      render(<WorkspaceCreationDialog isOpen={true} onClose={mockOnClose} />)

      const nameInput = screen.getByLabelText(/Workspace Name/)
      await user.type(nameInput, 'Test Workspace')

      const submitButton = screen.getByRole('button', { name: 'Create Workspace' })
      await user.click(submitButton)

      expect(mockCreateWorkspace).toHaveBeenCalledWith('Test Workspace', undefined)
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })
    })

    it('creates workspace with name and description', async () => {
      const user = userEvent.setup()
      mockCreateWorkspace.mockResolvedValue({ id: '1', name: 'Test Workspace' })

      render(<WorkspaceCreationDialog isOpen={true} onClose={mockOnClose} />)

      const nameInput = screen.getByLabelText(/Workspace Name/)
      await user.type(nameInput, 'Test Workspace')

      const descriptionInput = screen.getByLabelText('Description')
      await user.type(descriptionInput, 'Test description')

      const submitButton = screen.getByRole('button', { name: 'Create Workspace' })
      await user.click(submitButton)

      expect(mockCreateWorkspace).toHaveBeenCalledWith('Test Workspace', 'Test description')
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })
    })

    it('trims whitespace from inputs', async () => {
      const user = userEvent.setup()
      mockCreateWorkspace.mockResolvedValue({ id: '1', name: 'Test Workspace' })

      render(<WorkspaceCreationDialog isOpen={true} onClose={mockOnClose} />)

      const nameInput = screen.getByLabelText(/Workspace Name/)
      await user.type(nameInput, '  Test Workspace  ')

      const descriptionInput = screen.getByLabelText('Description')
      await user.type(descriptionInput, '  Test description  ')

      const submitButton = screen.getByRole('button', { name: 'Create Workspace' })
      await user.click(submitButton)

      expect(mockCreateWorkspace).toHaveBeenCalledWith('Test Workspace', 'Test description')
    })

    it('shows loading state during submission', async () => {
      const user = userEvent.setup()
      let resolvePromise: (value: any) => void
      const promise = new Promise((resolve) => {
        resolvePromise = resolve
      })
      mockCreateWorkspace.mockReturnValue(promise)

      render(<WorkspaceCreationDialog isOpen={true} onClose={mockOnClose} />)

      const nameInput = screen.getByLabelText(/Workspace Name/)
      await user.type(nameInput, 'Test Workspace')

      const submitButton = screen.getByRole('button', { name: 'Create Workspace' })
      await user.click(submitButton)

      // Check loading state
      expect(screen.getByText('Creating...')).toBeInTheDocument()
      // The spinner is a Unicode character, not an icon component
      expect(screen.getByText('⟳')).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()

      // Resolve the promise
      resolvePromise!({ id: '1', name: 'Test Workspace' })

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })
    })

    it('handles submission errors', async () => {
      const user = userEvent.setup()
      const consoleError = jest.spyOn(console, 'error').mockImplementation()
      mockCreateWorkspace.mockRejectedValue(new Error('Network error'))

      render(<WorkspaceCreationDialog isOpen={true} onClose={mockOnClose} />)

      const nameInput = screen.getByLabelText(/Workspace Name/)
      await user.type(nameInput, 'Test Workspace')

      const submitButton = screen.getByRole('button', { name: 'Create Workspace' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })

      expect(mockOnClose).not.toHaveBeenCalled()
      expect(consoleError).toHaveBeenCalledWith('Failed to create workspace:', expect.any(Error))

      consoleError.mockRestore()
    })

    it('shows generic error message for non-Error exceptions', async () => {
      const user = userEvent.setup()
      const consoleError = jest.spyOn(console, 'error').mockImplementation()
      mockCreateWorkspace.mockRejectedValue('Unknown error')

      render(<WorkspaceCreationDialog isOpen={true} onClose={mockOnClose} />)

      const nameInput = screen.getByLabelText(/Workspace Name/)
      await user.type(nameInput, 'Test Workspace')

      const submitButton = screen.getByRole('button', { name: 'Create Workspace' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Failed to create workspace')).toBeInTheDocument()
      })

      consoleError.mockRestore()
    })
  })

  describe('✅ Dialog Controls', () => {
    it('closes dialog on cancel button click', async () => {
      const user = userEvent.setup()
      render(<WorkspaceCreationDialog isOpen={true} onClose={mockOnClose} />)

      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      await user.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('closes dialog on close button click', async () => {
      const user = userEvent.setup()
      render(<WorkspaceCreationDialog isOpen={true} onClose={mockOnClose} />)

      const closeButton = screen.getByRole('button', { name: 'Close dialog' })
      await user.click(closeButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('closes dialog on overlay click', async () => {
      const user = userEvent.setup()
      render(<WorkspaceCreationDialog isOpen={true} onClose={mockOnClose} />)

      const overlay = screen.getByRole('dialog').parentElement!
      await user.click(overlay)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('does not close on dialog content click', async () => {
      const user = userEvent.setup()
      render(<WorkspaceCreationDialog isOpen={true} onClose={mockOnClose} />)

      const dialog = screen.getByRole('dialog')
      await user.click(dialog)

      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('closes dialog on Escape key', () => {
      render(<WorkspaceCreationDialog isOpen={true} onClose={mockOnClose} />)

      const overlay = screen.getByRole('dialog').parentElement!
      fireEvent.keyDown(overlay, { key: 'Escape' })

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('does not close during submission', async () => {
      const user = userEvent.setup()
      let resolvePromise: (value: any) => void
      const promise = new Promise((resolve) => {
        resolvePromise = resolve
      })
      mockCreateWorkspace.mockReturnValue(promise)

      render(<WorkspaceCreationDialog isOpen={true} onClose={mockOnClose} />)

      const nameInput = screen.getByLabelText(/Workspace Name/)
      await user.type(nameInput, 'Test')

      const submitButton = screen.getByRole('button', { name: 'Create Workspace' })
      await user.click(submitButton)

      // Try to close during submission
      fireEvent.keyDown(document, { key: 'Escape' })
      const overlay = screen.getByRole('dialog').parentElement!
      await user.click(overlay)

      expect(mockOnClose).not.toHaveBeenCalled()

      // Cleanup
      resolvePromise!({ id: '1', name: 'Test' })
    })
  })

  describe('✅ Form Reset', () => {
    it('resets form when dialog closes and reopens', () => {
      const { rerender } = render(<WorkspaceCreationDialog isOpen={true} onClose={mockOnClose} />)

      const nameInput = screen.getByLabelText(/Workspace Name/)
      const descriptionInput = screen.getByLabelText('Description')

      // Enter some values
      fireEvent.change(nameInput, { target: { value: 'Test Workspace' } })
      fireEvent.change(descriptionInput, { target: { value: 'Test description' } })

      // Close dialog
      rerender(<WorkspaceCreationDialog isOpen={false} onClose={mockOnClose} />)

      // Reopen dialog
      rerender(<WorkspaceCreationDialog isOpen={true} onClose={mockOnClose} />)

      // Check that fields are reset
      expect(screen.getByLabelText(/Workspace Name/)).toHaveValue('')
      expect(screen.getByLabelText('Description')).toHaveValue('')
    })

    it('clears error messages when dialog closes', async () => {
      const { rerender } = render(<WorkspaceCreationDialog isOpen={true} onClose={mockOnClose} />)

      // Trigger validation error by submitting form
      const form = screen.getByRole('dialog').querySelector('form')!
      fireEvent.submit(form)

      await waitFor(() => {
        expect(screen.getByText('Workspace name is required')).toBeInTheDocument()
      })

      // Close and reopen dialog
      rerender(<WorkspaceCreationDialog isOpen={false} onClose={mockOnClose} />)
      rerender(<WorkspaceCreationDialog isOpen={true} onClose={mockOnClose} />)

      // Error should be cleared
      expect(screen.queryByText('Workspace name is required')).not.toBeInTheDocument()
    })
  })

  describe('✅ Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<WorkspaceCreationDialog isOpen={true} onClose={mockOnClose} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
    })

    it('marks required field with asterisk', () => {
      render(<WorkspaceCreationDialog isOpen={true} onClose={mockOnClose} />)

      const requiredIndicator = screen.getByText('*')
      expect(requiredIndicator).toHaveClass('workspace-dialog__required')
    })

    it('announces errors to screen readers', async () => {
      render(<WorkspaceCreationDialog isOpen={true} onClose={mockOnClose} />)

      // Submit the form to trigger validation
      const form = screen.getByRole('dialog').querySelector('form')!
      fireEvent.submit(form)

      await waitFor(() => {
        const errorElement = screen.getByRole('alert')
        expect(errorElement).toHaveTextContent('Workspace name is required')
      })
    })
  })
})
