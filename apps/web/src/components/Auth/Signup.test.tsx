import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Signup } from './Signup'

// Mock useNavigate
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

// Mock auth context
const mockSignup = jest.fn()
const mockClearError = jest.fn()
let mockError: string | null = null

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => ({
    signup: mockSignup,
    error: mockError,
    clearError: mockClearError,
  }),
}))

describe('Signup Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockError = null
  })

  const renderSignup = () => {
    return render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    )
  }

  describe('✅ Component Rendering', () => {
    it('renders signup form with all elements', () => {
      renderSignup()

      expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument()
      expect(screen.getByText(/start building amazing stories/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/display name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument()
    })

    it('marks display name as optional', () => {
      renderSignup()

      expect(screen.getByText(/display name.*optional/i)).toBeInTheDocument()
    })

    it('has correct input types and attributes', () => {
      renderSignup()

      expect(screen.getByLabelText(/display name/i)).toHaveAttribute('type', 'text')
      expect(screen.getByLabelText(/^email$/i)).toHaveAttribute('type', 'email')
      expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('type', 'password')
      expect(screen.getByLabelText(/confirm password/i)).toHaveAttribute('type', 'password')

      expect(screen.getByLabelText(/display name/i)).toHaveAttribute('autocomplete', 'name')
      expect(screen.getByLabelText(/^email$/i)).toHaveAttribute('autocomplete', 'email')
      expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('autocomplete', 'new-password')
      expect(screen.getByLabelText(/confirm password/i)).toHaveAttribute('autocomplete', 'new-password')
    })
  })

  describe('✅ Form Validation', () => {
    it('shows validation error for empty required fields', async () => {
      const user = userEvent.setup()
      renderSignup()

      // Remove required attribute to test our custom validation
      const emailInput = screen.getByLabelText(/^email$/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

      emailInput.removeAttribute('required')
      passwordInput.removeAttribute('required')
      confirmPasswordInput.removeAttribute('required')

      // Click submit without filling any fields
      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/please fill in all required fields/i)).toBeInTheDocument()
      })
      expect(mockSignup).not.toHaveBeenCalled()
    })

    it('shows validation error for password mismatch', async () => {
      const user = userEvent.setup()
      renderSignup()

      await user.type(screen.getByLabelText(/^email$/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'differentpassword')
      await user.click(screen.getByRole('button', { name: /create account/i }))

      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
      expect(mockSignup).not.toHaveBeenCalled()
    })

    it('shows validation error for short password', async () => {
      const user = userEvent.setup()
      renderSignup()

      await user.type(screen.getByLabelText(/^email$/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^password$/i), '12345')
      await user.type(screen.getByLabelText(/confirm password/i), '12345')
      await user.click(screen.getByRole('button', { name: /create account/i }))

      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
      expect(mockSignup).not.toHaveBeenCalled()
    })
  })

  describe('✅ Form Submission', () => {
    it('submits form with valid data including display name', async () => {
      const user = userEvent.setup()
      mockSignup.mockResolvedValue(undefined)

      renderSignup()

      await user.type(screen.getByLabelText(/display name/i), 'Test User')
      await user.type(screen.getByLabelText(/^email$/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(mockSignup).toHaveBeenCalledWith('test@example.com', 'password123', 'Test User')
        expect(mockNavigate).toHaveBeenCalledWith('/')
      })
    })

    it('submits form without display name', async () => {
      const user = userEvent.setup()
      mockSignup.mockResolvedValue(undefined)

      renderSignup()

      await user.type(screen.getByLabelText(/^email$/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(mockSignup).toHaveBeenCalledWith('test@example.com', 'password123', undefined)
        expect(mockNavigate).toHaveBeenCalledWith('/')
      })
    })

    it('disables form during submission', async () => {
      const user = userEvent.setup()
      mockSignup.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)))

      renderSignup()

      await user.type(screen.getByLabelText(/^email$/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      expect(submitButton).toBeDisabled()
      expect(submitButton).toHaveTextContent(/creating account/i)
      expect(screen.getByLabelText(/display name/i)).toBeDisabled()
      expect(screen.getByLabelText(/^email$/i)).toBeDisabled()
      expect(screen.getByLabelText(/^password$/i)).toBeDisabled()
      expect(screen.getByLabelText(/confirm password/i)).toBeDisabled()

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled()
        expect(submitButton).toHaveTextContent(/create account/i)
      })
    })
  })

  describe('✅ Error Handling', () => {
    it('displays Firebase error messages', async () => {
      const errorMessage = 'Email already in use'
      mockError = errorMessage

      renderSignup()

      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    it('clears errors when dismiss button is clicked', async () => {
      const user = userEvent.setup()
      mockError = 'Test error message'

      renderSignup()

      expect(screen.getByText('Test error message')).toBeInTheDocument()

      // Clear the error
      await user.click(screen.getByRole('button', { name: /dismiss error/i }))

      expect(mockClearError).toHaveBeenCalled()
    })

    it('handles signup failure gracefully', async () => {
      const user = userEvent.setup()
      mockSignup.mockRejectedValue(new Error('Network error'))

      renderSignup()

      await user.type(screen.getByLabelText(/^email$/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled()
      })
    })
  })

  describe('✅ Navigation', () => {
    it('has working sign in link', () => {
      renderSignup()

      const signinLink = screen.getByRole('link', { name: /sign in/i })
      expect(signinLink).toHaveAttribute('href', '/login')
    })
  })

  describe('✅ Accessibility', () => {
    it('has accessible form labels', () => {
      renderSignup()

      expect(screen.getByLabelText(/display name/i)).toHaveAccessibleName(/display name/i)
      expect(screen.getByLabelText(/^email$/i)).toHaveAccessibleName(/email/i)
      expect(screen.getByLabelText(/^password$/i)).toHaveAccessibleName(/password/i)
      expect(screen.getByLabelText(/confirm password/i)).toHaveAccessibleName(/confirm password/i)
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      renderSignup()

      await user.tab()
      expect(screen.getByLabelText(/display name/i)).toHaveFocus()

      await user.tab()
      expect(screen.getByLabelText(/^email$/i)).toHaveFocus()

      await user.tab()
      expect(screen.getByLabelText(/^password$/i)).toHaveFocus()

      await user.tab()
      expect(screen.getByLabelText(/confirm password/i)).toHaveFocus()

      await user.tab()
      expect(screen.getByRole('button', { name: /create account/i })).toHaveFocus()
    })

    it('can submit form with Enter key', async () => {
      const user = userEvent.setup()
      mockSignup.mockResolvedValue(undefined)

      renderSignup()

      await user.type(screen.getByLabelText(/^email$/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(mockSignup).toHaveBeenCalled()
      })
    })
  })

  describe('✅ Input Interactions', () => {
    it('updates all input values on user typing', async () => {
      const user = userEvent.setup()
      renderSignup()

      await user.type(screen.getByLabelText(/display name/i), 'Test User')
      await user.type(screen.getByLabelText(/^email$/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')

      expect(screen.getByLabelText(/display name/i)).toHaveValue('Test User')
      expect(screen.getByLabelText(/^email$/i)).toHaveValue('test@example.com')
      expect(screen.getByLabelText(/^password$/i)).toHaveValue('password123')
      expect(screen.getByLabelText(/confirm password/i)).toHaveValue('password123')
    })

    it('shows password placeholder hint', () => {
      renderSignup()

      expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('placeholder', 'At least 6 characters')
    })
  })
})
