import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { WorkspaceProvider, useWorkspace } from '../contexts/WorkspaceContext'
import { AuthProvider } from '../contexts/AuthContext'
import { api } from '../utils/api/client'
import { onAuthStateChanged } from 'firebase/auth'

// Mock Firebase
jest.mock('../utils/firebase', () => ({
  auth: {},
}))

// Mock Firebase auth
jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  onAuthStateChanged: jest.fn(),
}))

// Mock the API client
jest.mock('../utils/api/client', () => ({
  api: {
    auth: {
      syncUser: jest.fn().mockResolvedValue(true),
    },
    workspaces: {
      list: jest.fn(),
      create: jest.fn(),
    },
  },
}))

// Test component that uses workspace context
function TestComponent() {
  const { workspaces, currentWorkspace, currentPageId, selectPage, loading, error } = useWorkspace()

  if (loading) return <div>Loading workspaces...</div>
  if (error)
    return (
      <div>
        Error: <span>{error.message}</span>
      </div>
    )

  return (
    <div>
      <div data-testid="workspace-count">{workspaces.length}</div>
      <div data-testid="current-workspace">{currentWorkspace?.name || 'none'}</div>
      <div data-testid="current-page">{currentPageId || 'none'}</div>
      <button onClick={() => selectPage('test-page-123')}>Select Page</button>
    </div>
  )
}

describe('Workspace Integration Flow', () => {
  const mockUser = { uid: 'test-user-id', email: 'test@example.com' }
  const mockWorkspace = {
    id: 'workspace-1',
    userId: 'test-user-id',
    name: 'Test Workspace',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()

    // Setup auth to return user immediately
    ;(onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      callback(mockUser)
      return jest.fn()
    })
    ;(api.auth.syncUser as jest.Mock).mockResolvedValue(true)
  })

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <AuthProvider>
        <WorkspaceProvider>{component}</WorkspaceProvider>
      </AuthProvider>
    )
  }

  describe('✅ Workspace Loading', () => {
    it('should load workspaces on mount', async () => {
      ;(api.workspaces.list as jest.Mock).mockResolvedValue([mockWorkspace])

      renderWithProviders(<TestComponent />)

      // Wait for workspaces to load
      await waitFor(() => {
        expect(screen.getByTestId('workspace-count')).toHaveTextContent('1')
      })

      expect(screen.getByTestId('current-workspace')).toHaveTextContent('Test Workspace')
    })

    it('should create default workspace for new users', async () => {
      ;(api.workspaces.list as jest.Mock).mockResolvedValue([])
      ;(api.workspaces.create as jest.Mock).mockResolvedValue({
        ...mockWorkspace,
        name: 'My Workspace',
      })

      renderWithProviders(<TestComponent />)

      await waitFor(() => {
        expect(api.workspaces.create).toHaveBeenCalledWith({
          name: 'My Workspace',
          description: 'Your personal workspace',
        })
      })

      await waitFor(() => {
        expect(screen.getByTestId('current-workspace')).toHaveTextContent('My Workspace')
      })
    })
  })

  describe('✅ Page Selection', () => {
    it('should select and persist page selection', async () => {
      ;(api.workspaces.list as jest.Mock).mockResolvedValue([mockWorkspace])

      renderWithProviders(<TestComponent />)

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByTestId('current-workspace')).toHaveTextContent('Test Workspace')
      })

      expect(screen.getByTestId('current-page')).toHaveTextContent('none')

      // Click button to select page
      const selectButton = screen.getByText('Select Page')
      selectButton.click()

      await waitFor(() => {
        expect(screen.getByTestId('current-page')).toHaveTextContent('test-page-123')
      })

      // Check localStorage was updated
      const stored = localStorage.getItem('kairos_workspace_preferences')
      expect(stored).toBeTruthy()
      const prefs = JSON.parse(stored!)
      expect(prefs.workspacePreferences['workspace-1'].lastPageId).toBe('test-page-123')
    })

    it('should restore page from localStorage', async () => {
      // Set page preference in localStorage
      localStorage.setItem(
        'kairos_workspace_preferences',
        JSON.stringify({
          lastWorkspaceId: 'workspace-1',
          workspacePreferences: {
            'workspace-1': { lastPageId: 'saved-page-456' },
          },
        })
      )
      ;(api.workspaces.list as jest.Mock).mockResolvedValue([mockWorkspace])

      renderWithProviders(<TestComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('current-page')).toHaveTextContent('saved-page-456')
      })
    })
  })

  describe('✅ Error Handling', () => {
    it('should handle workspace loading errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      ;(api.workspaces.list as jest.Mock).mockRejectedValue(new Error('Network error'))

      renderWithProviders(<TestComponent />)

      await waitFor(() => {
        // Check that error is displayed
        const errorElement = screen.getByText(/Error:/)
        expect(errorElement).toBeInTheDocument()
        // The context wraps the error but keeps the original message
        const errorSpan = screen.getByText('Network error')
        expect(errorSpan).toBeInTheDocument()
      })

      consoleSpy.mockRestore()
    })
  })
})
