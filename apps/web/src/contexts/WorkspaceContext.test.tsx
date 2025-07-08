import React from 'react'
import { renderHook, act, waitFor } from '@testing-library/react'
import { WorkspaceProvider, useWorkspace } from './WorkspaceContext'
import { AuthProvider } from './AuthContext'
import { api } from '../utils/api/client'
import { onAuthStateChanged } from 'firebase/auth'

// Mock Firebase
jest.mock('../utils/firebase', () => ({
  auth: {},
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
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

// Mock Firebase auth
jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  onAuthStateChanged: jest.fn(),
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

// Test wrapper that simulates authentication
const createWrapper = (authCallback?: (user: any) => void) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    // Set up auth state
    ;(onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      // Simulate async auth check
      setTimeout(() => {
        if (authCallback) {
          authCallback(callback)
        } else {
          callback({ uid: 'test-user-id', email: 'test@example.com' })
        }
      }, 0)
      return jest.fn() // unsubscribe
    })

    return (
      <AuthProvider>
        <WorkspaceProvider>{children}</WorkspaceProvider>
      </AuthProvider>
    )
  }

  Wrapper.displayName = 'TestWrapper'
  return Wrapper
}

// Default wrapper with authenticated user
const wrapper = createWrapper()

describe('WorkspaceContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()

    // Reset API mocks
    ;(api.auth.syncUser as jest.Mock).mockResolvedValue(true)
  })

  describe('✅ Core Functionality', () => {
    it('should provide workspace context', () => {
      const { result } = renderHook(() => useWorkspace(), { wrapper })

      expect(result.current).toHaveProperty('workspaces')
      expect(result.current).toHaveProperty('currentWorkspace')
      expect(result.current).toHaveProperty('loading')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('createWorkspace')
      expect(result.current).toHaveProperty('selectWorkspace')
      expect(result.current).toHaveProperty('updateWorkspace')
      expect(result.current).toHaveProperty('deleteWorkspace')
      expect(result.current).toHaveProperty('refreshWorkspaces')
    })

    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      expect(() => {
        renderHook(() => useWorkspace())
      }).toThrow('useWorkspace must be used within a WorkspaceProvider')

      consoleSpy.mockRestore()
    })
  })

  describe('✅ Workspace Loading', () => {
    it('should load workspaces on mount', async () => {
      const mockWorkspaces = [
        { id: '1', userId: 'test-user-id', name: 'Workspace 1', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', userId: 'test-user-id', name: 'Workspace 2', createdAt: new Date(), updatedAt: new Date() },
      ]
      ;(api.workspaces.list as jest.Mock).mockResolvedValue(mockWorkspaces)

      const { result } = renderHook(() => useWorkspace(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(api.workspaces.list).toHaveBeenCalled()
      expect(result.current.workspaces).toEqual(mockWorkspaces)
      expect(result.current.currentWorkspace).toEqual(mockWorkspaces[0])
    })

    it('should create default workspace for new users', async () => {
      ;(api.workspaces.list as jest.Mock).mockResolvedValue([])
      const mockNewWorkspace = {
        id: 'new-1',
        userId: 'test-user-id',
        name: 'My Workspace',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      ;(api.workspaces.create as jest.Mock).mockResolvedValue(mockNewWorkspace)

      const { result } = renderHook(() => useWorkspace(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await waitFor(() => {
        expect(api.workspaces.create).toHaveBeenCalledWith({
          name: 'My Workspace',
          description: 'Your personal workspace',
        })
      })

      expect(result.current.workspaces).toEqual([mockNewWorkspace])
      expect(result.current.currentWorkspace).toEqual(mockNewWorkspace)
    })

    it('should restore last selected workspace from localStorage', async () => {
      const mockWorkspaces = [
        { id: '1', userId: 'test-user-id', name: 'Workspace 1', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', userId: 'test-user-id', name: 'Workspace 2', createdAt: new Date(), updatedAt: new Date() },
      ]
      ;(api.workspaces.list as jest.Mock).mockResolvedValue(mockWorkspaces)

      // Set last workspace in localStorage
      localStorageMock.setItem('kairos_workspace_preferences', JSON.stringify({ lastWorkspaceId: '2', workspacePreferences: {} }))

      const { result } = renderHook(() => useWorkspace(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await waitFor(() => {
        expect(result.current.currentWorkspace?.id).toBe('2')
      })
    })
  })

  describe('✅ Workspace Operations', () => {
    it('should create a new workspace', async () => {
      const mockWorkspaces = [{ id: '1', userId: 'test-user-id', name: 'Workspace 1', createdAt: new Date(), updatedAt: new Date() }]
      ;(api.workspaces.list as jest.Mock).mockResolvedValue(mockWorkspaces)

      const mockNewWorkspace = {
        id: 'new-1',
        userId: 'test-user-id',
        name: 'New Workspace',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      ;(api.workspaces.create as jest.Mock).mockResolvedValue(mockNewWorkspace)

      const { result } = renderHook(() => useWorkspace(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let createdWorkspace
      await act(async () => {
        createdWorkspace = await result.current.createWorkspace('New Workspace', 'A new workspace')
      })

      expect(api.workspaces.create).toHaveBeenCalledWith({
        name: 'New Workspace',
        description: 'A new workspace',
      })
      expect(result.current.workspaces).toHaveLength(2)
      expect(result.current.currentWorkspace).toEqual(mockNewWorkspace)
      expect(createdWorkspace).toEqual(mockNewWorkspace)
    })

    it('should select a workspace', async () => {
      const mockWorkspaces = [
        { id: '1', userId: 'test-user-id', name: 'Workspace 1', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', userId: 'test-user-id', name: 'Workspace 2', createdAt: new Date(), updatedAt: new Date() },
      ]
      ;(api.workspaces.list as jest.Mock).mockResolvedValue(mockWorkspaces)

      const { result } = renderHook(() => useWorkspace(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.currentWorkspace).toEqual(mockWorkspaces[0])

      await act(async () => {
        await result.current.selectWorkspace('2')
      })

      expect(result.current.currentWorkspace).toEqual(mockWorkspaces[1])
      expect(localStorageMock.setItem).toHaveBeenCalledWith('kairos_workspace_preferences', expect.stringContaining('"lastWorkspaceId":"2"'))
    })

    it('should update a workspace', async () => {
      const mockWorkspaces = [{ id: '1', userId: 'test-user-id', name: 'Workspace 1', createdAt: new Date(), updatedAt: new Date() }]
      ;(api.workspaces.list as jest.Mock).mockResolvedValue(mockWorkspaces)

      const updatedWorkspace = { ...mockWorkspaces[0], name: 'Updated Workspace' }
      ;(api.workspaces.update as jest.Mock).mockResolvedValue(updatedWorkspace)

      const { result } = renderHook(() => useWorkspace(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.updateWorkspace('1', { name: 'Updated Workspace' })
      })

      expect(api.workspaces.update).toHaveBeenCalledWith('1', { name: 'Updated Workspace' })
      expect(result.current.workspaces[0].name).toBe('Updated Workspace')
      expect(result.current.currentWorkspace?.name).toBe('Updated Workspace')
    })

    it('should delete a workspace', async () => {
      const mockWorkspaces = [
        { id: '1', userId: 'test-user-id', name: 'Workspace 1', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', userId: 'test-user-id', name: 'Workspace 2', createdAt: new Date(), updatedAt: new Date() },
      ]
      ;(api.workspaces.list as jest.Mock).mockResolvedValue(mockWorkspaces)
      ;(api.workspaces.delete as jest.Mock).mockResolvedValue(undefined)

      const { result } = renderHook(() => useWorkspace(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.deleteWorkspace('1')
      })

      expect(api.workspaces.delete).toHaveBeenCalledWith('1')
      expect(result.current.workspaces).toHaveLength(1)
      expect(result.current.workspaces[0].id).toBe('2')
      expect(result.current.currentWorkspace?.id).toBe('2')
    })

    it('should not allow deleting the last workspace', async () => {
      const mockWorkspaces = [{ id: '1', userId: 'test-user-id', name: 'Workspace 1', createdAt: new Date(), updatedAt: new Date() }]
      ;(api.workspaces.list as jest.Mock).mockResolvedValue(mockWorkspaces)

      const { result } = renderHook(() => useWorkspace(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await expect(
        act(async () => {
          await result.current.deleteWorkspace('1')
        })
      ).rejects.toThrow('Cannot delete your last workspace')

      expect(api.workspaces.delete).not.toHaveBeenCalled()
      expect(result.current.workspaces).toHaveLength(1)
    })

    it('should refresh workspaces', async () => {
      const mockWorkspaces = [{ id: '1', userId: 'test-user-id', name: 'Workspace 1', createdAt: new Date(), updatedAt: new Date() }]
      ;(api.workspaces.list as jest.Mock).mockResolvedValue(mockWorkspaces)

      const { result } = renderHook(() => useWorkspace(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const updatedWorkspaces = [
        ...mockWorkspaces,
        { id: '2', userId: 'test-user-id', name: 'Workspace 2', createdAt: new Date(), updatedAt: new Date() },
      ]
      ;(api.workspaces.list as jest.Mock).mockResolvedValue(updatedWorkspaces)

      await act(async () => {
        await result.current.refreshWorkspaces()
      })

      expect(api.workspaces.list).toHaveBeenCalledTimes(2)
      expect(result.current.workspaces).toEqual(updatedWorkspaces)
    })
  })

  describe('✅ Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const mockError = new Error('API Error')
      ;(api.workspaces.list as jest.Mock).mockRejectedValue(mockError)

      const { result } = renderHook(() => useWorkspace(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toEqual(mockError)
      expect(result.current.workspaces).toEqual([])
      expect(result.current.currentWorkspace).toBeNull()
    })

    it('should handle workspace not found error', async () => {
      const mockWorkspaces = [{ id: '1', userId: 'test-user-id', name: 'Workspace 1', createdAt: new Date(), updatedAt: new Date() }]
      ;(api.workspaces.list as jest.Mock).mockResolvedValue(mockWorkspaces)

      const { result } = renderHook(() => useWorkspace(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await expect(
        act(async () => {
          await result.current.selectWorkspace('non-existent')
        })
      ).rejects.toThrow('Workspace not found')
    })
  })

  describe('✅ localStorage Integration', () => {
    it('should persist workspace selection to localStorage', async () => {
      const mockWorkspaces = [{ id: '1', userId: 'test-user-id', name: 'Workspace 1', createdAt: new Date(), updatedAt: new Date() }]
      ;(api.workspaces.list as jest.Mock).mockResolvedValue(mockWorkspaces)

      const { result } = renderHook(() => useWorkspace(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(localStorageMock.setItem).toHaveBeenCalledWith('kairos_workspace_preferences', expect.stringContaining('"lastWorkspaceId":"1"'))
    })

    it('should handle corrupted localStorage data', async () => {
      // Set invalid JSON in localStorage
      localStorageMock.getItem.mockReturnValueOnce('invalid json')

      const mockWorkspaces = [{ id: '1', userId: 'test-user-id', name: 'Workspace 1', createdAt: new Date(), updatedAt: new Date() }]
      ;(api.workspaces.list as jest.Mock).mockResolvedValue(mockWorkspaces)

      const { result } = renderHook(() => useWorkspace(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Should still work and use first workspace
      expect(result.current.currentWorkspace).toEqual(mockWorkspaces[0])
    })
  })
})
