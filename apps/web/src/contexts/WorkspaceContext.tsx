import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { apiClient, pageService } from '../services/api'

interface Workspace {
  id: string
  name: string
  userId: string
  createdAt: string
  updatedAt: string
}

interface WorkspaceContextValue {
  workspaces: Workspace[]
  currentWorkspace: Workspace | null
  isLoading: boolean
  error: string | null
  loadWorkspaces: () => Promise<void>
  createWorkspace: (name: string) => Promise<Workspace>
  updateWorkspace: (id: string, name: string) => Promise<Workspace>
  deleteWorkspace: (id: string) => Promise<void>
  selectWorkspace: (workspaceId: string) => Promise<void>
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined)

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider')
  }
  return context
}

interface WorkspaceProviderProps {
  children: ReactNode
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const navigate = useNavigate()
  const { user, backendUser, refreshUserData } = useAuth()

  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load workspaces from backend user data
  useEffect(() => {
    if (backendUser?.workspaces) {
      setWorkspaces(backendUser.workspaces)
    }
  }, [backendUser])

  // Set current workspace based on URL
  useEffect(() => {
    if (workspaceId && workspaces.length > 0) {
      const workspace = workspaces.find((w) => w.id === workspaceId)
      if (workspace) {
        setCurrentWorkspace(workspace)
      } else {
        // Workspace not found, redirect to first workspace
        const firstWorkspace = workspaces[0]
        if (firstWorkspace) {
          navigate(`/workspace/${firstWorkspace.id}`, { replace: true })
        }
      }
    } else if (!workspaceId && workspaces.length > 0) {
      // No workspace in URL, redirect to first workspace
      const firstWorkspace = workspaces[0]
      navigate(`/workspace/${firstWorkspace.id}`, { replace: true })
    }
  }, [workspaceId, workspaces, navigate])

  // Load workspaces from backend
  const loadWorkspaces = useCallback(async () => {
    if (!user) {
      setError('User not authenticated')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.getWorkspaces()
      setWorkspaces(response.workspaces)
    } catch (err) {
      console.error('Failed to load workspaces:', err)
      setError(err instanceof Error ? err.message : 'Failed to load workspaces')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Create a new workspace
  const createWorkspace = useCallback(
    async (name: string): Promise<Workspace> => {
      if (!user) {
        throw new Error('User not authenticated')
      }

      try {
        const workspace = await apiClient.createWorkspace({ name })

        // Refresh user data to get updated workspace list
        await refreshUserData()

        return workspace
      } catch (err) {
        console.error('Failed to create workspace:', err)
        throw err
      }
    },
    [user, refreshUserData]
  )

  // Update workspace name
  const updateWorkspace = useCallback(
    async (id: string, name: string): Promise<Workspace> => {
      if (!user) {
        throw new Error('User not authenticated')
      }

      try {
        const response = await apiClient.updateWorkspace(id, { name })
        const updatedWorkspace = response.workspace

        // Update local state
        setWorkspaces((prev) => prev.map((w) => (w.id === id ? updatedWorkspace : w)))
        if (currentWorkspace?.id === id) {
          setCurrentWorkspace(updatedWorkspace)
        }

        return updatedWorkspace
      } catch (err) {
        console.error('Failed to update workspace:', err)
        throw err
      }
    },
    [user, currentWorkspace]
  )

  // Delete a workspace
  const deleteWorkspace = useCallback(
    async (id: string) => {
      if (!user) {
        throw new Error('User not authenticated')
      }

      if (workspaces.length <= 1) {
        throw new Error('Cannot delete the last workspace')
      }

      try {
        await apiClient.deleteWorkspace(id)

        // Refresh user data to get updated workspace list
        await refreshUserData()

        // If deleting current workspace, navigate to another one
        if (currentWorkspace?.id === id) {
          const remainingWorkspaces = workspaces.filter((w) => w.id !== id)
          if (remainingWorkspaces.length > 0) {
            navigate(`/workspace/${remainingWorkspaces[0].id}`, { replace: true })
          }
        }
      } catch (err) {
        console.error('Failed to delete workspace:', err)
        throw err
      }
    },
    [user, workspaces, currentWorkspace, navigate, refreshUserData]
  )

  // Select a workspace
  const selectWorkspace = useCallback(
    async (workspaceId: string) => {
      const workspace = workspaces.find((w) => w.id === workspaceId)
      if (workspace) {
        try {
          // Try to get the first page in the new workspace
          const response = await pageService.getPages(workspaceId)
          const pages = response.pages

          // Find the first non-folder page
          const firstPage = pages.find((p: any) => !p.isFolder) || pages[0]

          if (firstPage && !firstPage.isFolder) {
            // Navigate directly to the first page
            navigate(`/workspace/${workspaceId}/page/${firstPage.id}`)
          } else {
            // No pages, just navigate to workspace
            navigate(`/workspace/${workspaceId}`)
          }
        } catch (err) {
          console.error('Failed to fetch pages for workspace:', err)
          // Fallback to just navigating to workspace
          navigate(`/workspace/${workspaceId}`)
        }
      }
    },
    [workspaces, navigate]
  )

  const value: WorkspaceContextValue = {
    workspaces,
    currentWorkspace,
    isLoading,
    error,
    loadWorkspaces,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    selectWorkspace,
  }

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}
