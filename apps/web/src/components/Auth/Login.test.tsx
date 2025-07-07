import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Login } from './Login'

// Mock useNavigate
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

// Mock auth context
const mockLogin = jest.fn()
const mockClearError = jest.fn()
let mockError: string | null = null

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => ({
    login: mockLogin,
    error: mockError,
    clearError: mockClearError,
  }),
}))

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockError = null
  })

  const renderLogin = () => {
    return render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )
  }

  describe('✅ Component Rendering', () => {
    it('renders login form with all elements', () => {
      renderLogin()

      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
      expect(screen.getByText(/sign in to your account to continue/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /forgot your password/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument()
    })

    it('renders with correct input types', () => {
      renderLogin()

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      expect(emailInput).toHaveAttribute('type', 'email')
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('has correct autocomplete attributes', () => {
      renderLogin()

      expect(screen.getByLabelText(/email/i)).toHaveAttribute('autocomplete', 'email')
      expect(screen.getByLabelText(/password/i)).toHaveAttribute('autocomplete', 'current-password')
    })
  })

  describe('✅ Form Interactions', () => {
    it('updates input values on user typing', async () => {
      const user = userEvent.setup()
      renderLogin()

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')

      expect(emailInput).toHaveValue('test@example.com')
      expect(passwordInput).toHaveValue('password123')
    })

    it('submits form with valid credentials', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue(undefined)

      renderLogin()

      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
        expect(mockNavigate).toHaveBeenCalledWith('/')
      })
    })

    it('prevents submission with empty fields', async () => {
      const user = userEvent.setup()
      renderLogin()

      await user.click(screen.getByRole('button', { name: /sign in/i }))

      expect(mockLogin).not.toHaveBeenCalled()
    })

    it('disables form during submission', async () => {
      const user = userEvent.setup()
      mockLogin.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)))

      renderLogin()

      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      expect(submitButton).toBeDisabled()
      expect(submitButton).toHaveTextContent(/signing in/i)
      expect(screen.getByLabelText(/email/i)).toBeDisabled()
      expect(screen.getByLabelText(/password/i)).toBeDisabled()

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled()
        expect(submitButton).toHaveTextContent(/sign in/i)
      })
    })
  })

  describe('✅ Error Handling', () => {
    it('displays error message when login fails', async () => {
      const errorMessage = 'Invalid email or password'
      mockError = errorMessage

      renderLogin()

      expect(screen.getByText(errorMessage)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /dismiss error/i })).toBeInTheDocument()
    })

    it('clears error when dismiss button is clicked', async () => {
      const user = userEvent.setup()
      mockError = 'Test error'

      renderLogin()

      await user.click(screen.getByRole('button', { name: /dismiss error/i }))

      expect(mockClearError).toHaveBeenCalled()
    })

    it('handles login failure gracefully', async () => {
      const user = userEvent.setup()
      mockLogin.mockRejectedValue(new Error('Network error'))

      renderLogin()

      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled()
      })
    })
  })

  describe('✅ Navigation Links', () => {
    it('has working forgot password link', () => {
      renderLogin()

      const forgotLink = screen.getByRole('link', { name: /forgot your password/i })
      expect(forgotLink).toHaveAttribute('href', '/forgot-password')
    })

    it('has working sign up link', () => {
      renderLogin()

      const signupLink = screen.getByRole('link', { name: /sign up/i })
      expect(signupLink).toHaveAttribute('href', '/signup')
    })
  })

  describe('✅ Accessibility', () => {
    it('has accessible form labels', () => {
      renderLogin()

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      expect(emailInput).toHaveAccessibleName(/email/i)
      expect(passwordInput).toHaveAccessibleName(/password/i)
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      renderLogin()

      await user.tab()
      expect(screen.getByLabelText(/email/i)).toHaveFocus()

      await user.tab()
      expect(screen.getByLabelText(/password/i)).toHaveFocus()

      await user.tab()
      expect(screen.getByRole('link', { name: /forgot your password/i })).toHaveFocus()

      await user.tab()
      expect(screen.getByRole('button', { name: /sign in/i })).toHaveFocus()
    })

    it('can submit form with Enter key', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue(undefined)

      renderLogin()

      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled()
      })
    })
  })
})
