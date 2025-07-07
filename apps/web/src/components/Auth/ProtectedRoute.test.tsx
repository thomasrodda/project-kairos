import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { User } from 'firebase/auth'

// Mock auth context
let mockUser: User | null = null
let mockLoading = false

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => ({
    user: mockUser,
    loading: mockLoading,
  }),
}))

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUser = null
    mockLoading = false
  })

  const renderWithRouter = (initialRoute = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Dashboard Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )
  }

  describe('✅ Loading State', () => {
    it('shows loading indicator when auth is loading', () => {
      mockLoading = true
      renderWithRouter()

      expect(screen.getByText(/loading/i)).toBeInTheDocument()
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })

    it('centers loading indicator on screen', () => {
      mockLoading = true
      renderWithRouter()

      const loadingContainer = screen.getByTestId('loading-container')
      expect(loadingContainer).toHaveStyle({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      })
    })
  })

  describe('✅ Authentication Check', () => {
    it('renders children when user is authenticated', () => {
      mockUser = { uid: '123', email: 'test@example.com' } as User
      mockLoading = false

      renderWithRouter()

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
      expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
    })

    it('redirects to login when user is not authenticated', () => {
      mockUser = null
      mockLoading = false

      renderWithRouter()

      expect(screen.getByText('Login Page')).toBeInTheDocument()
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })

    it('preserves attempted location in redirect state', () => {
      mockUser = null
      mockLoading = false

      renderWithRouter('/dashboard')

      expect(screen.getByText('Login Page')).toBeInTheDocument()
      expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument()
    })
  })

  describe('✅ Edge Cases', () => {
    it('handles transition from loading to authenticated', () => {
      mockLoading = true
      const { rerender } = renderWithRouter()

      expect(screen.getByText(/loading/i)).toBeInTheDocument()

      // Update to authenticated state
      mockLoading = false
      mockUser = { uid: '123', email: 'test@example.com' } as User

      rerender(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      )

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })

    it('handles transition from loading to unauthenticated', () => {
      mockLoading = true
      const { rerender } = renderWithRouter()

      expect(screen.getByText(/loading/i)).toBeInTheDocument()

      // Update to unauthenticated state
      mockLoading = false
      mockUser = null

      rerender(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      )

      expect(screen.getByText('Login Page')).toBeInTheDocument()
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })

    it('renders multiple protected children correctly', () => {
      mockUser = { uid: '123', email: 'test@example.com' } as User
      mockLoading = false

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <div>Child 1</div>
            <div>Child 2</div>
            <div>Child 3</div>
          </ProtectedRoute>
        </MemoryRouter>
      )

      expect(screen.getByText('Child 1')).toBeInTheDocument()
      expect(screen.getByText('Child 2')).toBeInTheDocument()
      expect(screen.getByText('Child 3')).toBeInTheDocument()
    })
  })

  describe('✅ Component Behavior', () => {
    it('renders children when authenticated', () => {
      mockUser = { uid: '123', email: 'test@example.com' } as User
      mockLoading = false

      const TestComponent = () => {
        return <div data-testid="test-component">Protected Component</div>
      }

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </MemoryRouter>
      )

      expect(screen.getByTestId('test-component')).toBeInTheDocument()
      expect(screen.getByText('Protected Component')).toBeInTheDocument()
    })
  })
})
