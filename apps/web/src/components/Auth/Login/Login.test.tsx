import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Login } from './Login'
import { AuthProvider } from '../../../contexts/AuthContext'
import * as firebaseAuth from '../../../lib/firebase'

// Mock firebase/auth module
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  onAuthStateChanged: jest.fn((auth, callback) => {
    // Simulate no user initially
    callback(null)
    // Return unsubscribe function
    return jest.fn()
  }),
}))

// Mock the firebase module
jest.mock('../../../lib/firebase', () => ({
  auth: {},
  signInWithGoogle: jest.fn(),
  signInWithEmail: jest.fn(),
  signUpWithEmail: jest.fn(),
  logout: jest.fn(),
}))

// Mock useNavigate
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

describe('Login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    )
  }

  it('renders login form', () => {
    renderLogin()

    expect(screen.getByText('Welcome to Project Kairos')).toBeInTheDocument()
    expect(screen.getByText('Sign in to access your creative workspace')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('handles Google sign in', async () => {
    const mockUser = { uid: 'test-uid', email: 'test@example.com' }
    ;(firebaseAuth.signInWithGoogle as jest.Mock).mockResolvedValueOnce(mockUser)

    renderLogin()

    const googleButton = screen.getByRole('button', { name: /continue with google/i })
    fireEvent.click(googleButton)

    await waitFor(() => {
      expect(firebaseAuth.signInWithGoogle).toHaveBeenCalled()
    })
  })

  it('handles email/password sign in', async () => {
    const mockUser = { uid: 'test-uid', email: 'test@example.com' }
    ;(firebaseAuth.signInWithEmail as jest.Mock).mockResolvedValueOnce(mockUser)

    renderLogin()

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(firebaseAuth.signInWithEmail).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it.skip('displays error messages', async () => {
    ;(firebaseAuth.signInWithEmail as jest.Mock).mockRejectedValueOnce({
      code: 'auth/wrong-password',
      message: 'Incorrect password',
    })

    renderLogin()

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const form = screen.getByRole('button', { name: /sign in/i }).closest('form')

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.submit(form!)

    await waitFor(() => {
      // The AuthContext handles the error and sets it to "Incorrect password"
      expect(screen.getByText('Incorrect password')).toBeInTheDocument()
    })
  })

  it('disables form while loading', async () => {
    ;(firebaseAuth.signInWithGoogle as jest.Mock).mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)))

    renderLogin()

    const googleButton = screen.getByRole('button', { name: /continue with google/i })
    fireEvent.click(googleButton)

    expect(googleButton).toBeDisabled()
    expect(screen.getByLabelText('Email')).toBeDisabled()
    expect(screen.getByLabelText('Password')).toBeDisabled()
  })

  it('navigates to register page', () => {
    renderLogin()

    const registerLink = screen.getByRole('link', { name: /sign up/i })
    expect(registerLink).toHaveAttribute('href', '/register')
  })
})
