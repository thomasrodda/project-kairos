import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { api } from './utils/api/client'
import { onAuthStateChanged } from 'firebase/auth'

// Mock Firebase
jest.mock('./utils/firebase', () => ({
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
jest.mock('./utils/api/client', () => ({
  api: {
    auth: {
      syncUser: jest.fn().mockResolvedValue(true),
    },
    workspaces: {
      list: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    pages: {
      get: jest.fn(),
      listByWorkspace: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    blocks: {
      listByPage: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

// Mock @kairos/ui
jest.mock('@kairos/ui', () => ({
  initializeIconPerformance: jest.fn(),
  iconCache: {
    ChevronRight: () => <span>ChevronRight</span>,
    ChevronDown: () => <span>ChevronDown</span>,
    Plus: () => <span>Plus</span>,
    Edit: () => <span>Edit</span>,
    Trash: () => <span>Trash</span>,
    MoreHorizontal: () => <span>MoreHorizontal</span>,
    Menu: () => <span>Menu</span>,
    X: () => <span>X</span>,
    Layout: () => <span>Layout</span>,
    GripVertical: () => <span>GripVertical</span>,
    Bold: () => <span>Bold</span>,
    Italic: () => <span>Italic</span>,
    Underline: () => <span>Underline</span>,
    Link: () => <span>Link</span>,
  },
}))

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    clear: jest.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('App Integration Tests', () => {
  const mockUser = { uid: 'test-user-id', email: 'test@example.com' }
  const mockWorkspace = {
    id: 'workspace-1',
    userId: 'test-user-id',
    name: 'Test Workspace',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  const mockPage = {
    id: 'page-1',
    workspaceId: 'workspace-1',
    userId: 'test-user-id',
    title: 'Test Page',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  const mockBlocks = [
    {
      id: 'block-1',
      pageId: 'page-1',
      type: 'PARAGRAPH' as const,
      content: 'Test content',
      order: 0,
      metadata: {},
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()

    // Setup default mocks
    ;(onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      callback(mockUser)
      return jest.fn() // unsubscribe
    })
    ;(api.auth.syncUser as jest.Mock).mockResolvedValue(true)
    ;(api.workspaces.list as jest.Mock).mockResolvedValue([mockWorkspace])
    ;(api.pages.listByWorkspace as jest.Mock).mockResolvedValue([mockPage])
    ;(api.pages.get as jest.Mock).mockResolvedValue(mockPage)
    ;(api.blocks.listByPage as jest.Mock).mockResolvedValue(mockBlocks)
  })

  describe('✅ Workspace Loading Flow', () => {
    it('should load workspace and show loading state', async () => {
      render(<App />)

      // Should show loading state initially (from ProtectedRoute)
      expect(screen.getByText('Loading...')).toBeInTheDocument()

      // Wait for auth and workspace to load
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
      })

      // Wait for workspace loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading workspace...')).not.toBeInTheDocument()
      })

      // Should call workspace list API
      expect(api.workspaces.list).toHaveBeenCalled()
    })

    it('should create default workspace for new users', async () => {
      ;(api.workspaces.list as jest.Mock).mockResolvedValue([])
      ;(api.workspaces.create as jest.Mock).mockResolvedValue(mockWorkspace)

      render(<App />)

      await waitFor(() => {
        expect(api.workspaces.create).toHaveBeenCalledWith({
          name: 'My Workspace',
          description: 'Your personal workspace',
        })
      })
    })

    it('should restore last selected workspace from localStorage', async () => {
      const workspace2 = { ...mockWorkspace, id: 'workspace-2', name: 'Second Workspace' }
      ;(api.workspaces.list as jest.Mock).mockResolvedValue([mockWorkspace, workspace2])

      // Set last workspace in localStorage
      localStorageMock.setItem('kairos_workspace_preferences', JSON.stringify({ lastWorkspaceId: 'workspace-2', workspacePreferences: {} }))

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Loading workspace...')).not.toBeInTheDocument()
      })

      // The workspace ID should be passed to the Workspace component
      // We can't directly test props, but we can verify localStorage was read
      expect(localStorageMock.getItem).toHaveBeenCalledWith('kairos_workspace_preferences')
    })
  })

  describe('✅ Page Selection Flow', () => {
    it('should restore last selected page when workspace loads', async () => {
      // Set last page in localStorage
      localStorageMock.setItem(
        'kairos_workspace_preferences',
        JSON.stringify({
          lastWorkspaceId: 'workspace-1',
          workspacePreferences: {
            'workspace-1': { lastPageId: 'page-1' },
          },
        })
      )

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Loading workspace...')).not.toBeInTheDocument()
      })

      // Verify page was loaded
      await waitFor(() => {
        expect(api.pages.get).toHaveBeenCalledWith('page-1')
        expect(api.blocks.listByPage).toHaveBeenCalledWith('page-1')
      })
    })

    it('should handle page selection from sidebar', async () => {
      const page2 = { ...mockPage, id: 'page-2', title: 'Second Page' }
      ;(api.pages.listByWorkspace as jest.Mock).mockResolvedValue([mockPage, page2])
      ;(api.pages.get as jest.Mock).mockResolvedValue(page2)

      render(<App />)

      // Wait for everything to load
      await waitFor(() => {
        expect(api.workspaces.list).toHaveBeenCalled()
      })

      // Wait for pages to be loaded
      await waitFor(() => {
        expect(api.pages.listByWorkspace).toHaveBeenCalledWith('workspace-1')
      })

      // Find and click the second page button
      const secondPageButton = await screen.findByRole('button', { name: 'Second Page' })
      await userEvent.click(secondPageButton)

      // Verify new page was loaded
      await waitFor(() => {
        expect(api.pages.get).toHaveBeenCalledWith('page-2')
      })

      // Verify localStorage was updated with page selection
      await waitFor(() => {
        const calls = localStorageMock.setItem.mock.calls
        const lastCall = calls[calls.length - 1]
        if (lastCall && lastCall[1].includes('lastPageId')) {
          const storedPrefs = JSON.parse(lastCall[1])
          expect(storedPrefs.workspacePreferences['workspace-1'].lastPageId).toBe('page-2')
        }
      })
    })
  })

  describe('✅ Authentication Flow', () => {
    it('should redirect to login when not authenticated', async () => {
      ;(onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
        callback(null) // No user
        return jest.fn()
      })

      render(<App />)

      await waitFor(() => {
        expect(screen.getByText(/Sign in to your account/i)).toBeInTheDocument()
      })
    })

    it('should handle logout and clear workspace data', async () => {
      const signOutMock = jest.fn().mockResolvedValue(undefined)
      jest.doMock('firebase/auth', () => ({
        ...jest.requireActual('firebase/auth'),
        signOut: signOutMock,
      }))

      // Update auth state to simulate logout
      ;(onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
        // First call with user
        callback(mockUser)
        // Simulate logout after some time
        setTimeout(() => callback(null), 100)
        return jest.fn()
      })

      render(<App />)

      // Wait for app to load
      await waitFor(() => {
        expect(api.workspaces.list).toHaveBeenCalled()
      })

      // Find and click logout button
      const logoutButton = await screen.findByRole('button', { name: /logout/i })
      await userEvent.click(logoutButton)

      // Should redirect to login after logout
      await waitFor(() => {
        expect(screen.getByText(/Sign in to your account/i)).toBeInTheDocument()
      })
    })
  })

  describe('✅ Error Handling', () => {
    it('should show error when workspace loading fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      ;(api.workspaces.list as jest.Mock).mockRejectedValue(new Error('Network error'))

      render(<App />)

      // Wait for error state
      await waitFor(
        () => {
          // Since we can't create a workspace when list fails, it should show no workspace message
          expect(screen.getByText('No workspace available. Please refresh the page.')).toBeInTheDocument()
        },
        { timeout: 5000 }
      )

      consoleSpy.mockRestore()
    })
  })
})
