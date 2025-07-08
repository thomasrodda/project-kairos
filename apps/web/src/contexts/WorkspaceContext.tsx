import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { Workspace, Page } from '../utils/api/types'
import { api } from '../utils/api/client'
import { useAuthContext } from './AuthContext'
import { pageService } from '../services'
import { generateWelcomePageContent } from '../utils/defaultContent'

interface WorkspaceStorage {
  lastWorkspaceId: string | null
  workspacePreferences: {
    [workspaceId: string]: {
      lastPageId?: string
    }
  }
}

interface WorkspaceContextValue {
  // State
  workspaces: Workspace[]
  currentWorkspace: Workspace | null
  currentPageId: string | null
  pages: Page[]
  loading: boolean
  error: Error | null

  // Workspace Actions
  createWorkspace: (name: string, description?: string) => Promise<Workspace>
  selectWorkspace: (id: string) => Promise<void>
  updateWorkspace: (id: string, data: { name?: string; description?: string }) => Promise<void>
  deleteWorkspace: (id: string) => Promise<void>
  refreshWorkspaces: () => Promise<void>

  // Page Actions
  selectPage: (pageId: string) => void
  createPage: (data: { title: string; parentId?: string | null; isFolder?: boolean }) => Promise<Page>
  updatePage: (pageId: string, data: { title?: string; parentId?: string | null; order?: number }) => Promise<void>
  deletePage: (pageId: string) => Promise<void>
  refreshPages: () => Promise<void>
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined)

const WORKSPACE_STORAGE_KEY = 'kairos_workspace_preferences'

// Helper to get/set localStorage
const getWorkspaceStorage = (): WorkspaceStorage => {
  try {
    const stored = localStorage.getItem(WORKSPACE_STORAGE_KEY)
    return stored ? JSON.parse(stored) : { lastWorkspaceId: null, workspacePreferences: {} }
  } catch {
    return { lastWorkspaceId: null, workspacePreferences: {} }
  }
}

const setWorkspaceStorage = (storage: WorkspaceStorage) => {
  try {
    localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(storage))
  } catch (error) {
    console.error('Failed to save workspace preferences:', error)
  }
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)
  const [currentPageId, setCurrentPageId] = useState<string | null>(null)
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Load workspaces when user is authenticated
  const loadWorkspaces = useCallback(async () => {
    if (!user) {
      setWorkspaces([])
      setCurrentWorkspace(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const fetchedWorkspaces = await api.workspaces.list()
      setWorkspaces(fetchedWorkspaces)

      // Auto-select workspace
      if (fetchedWorkspaces.length > 0) {
        const storage = getWorkspaceStorage()
        const lastWorkspaceId = storage.lastWorkspaceId

        // Try to select last used workspace
        const workspaceToSelect = lastWorkspaceId
          ? fetchedWorkspaces.find((w) => w.id === lastWorkspaceId) || fetchedWorkspaces[0]
          : fetchedWorkspaces[0]

        setCurrentWorkspace(workspaceToSelect)

        // Load last selected page for this workspace
        const pageId = storage.workspacePreferences[workspaceToSelect.id]?.lastPageId
        if (pageId) {
          setCurrentPageId(pageId)
        }
      } else {
        // Create default workspace for new users
        const defaultWorkspace = await api.workspaces.create({
          name: 'My Workspace',
          description: 'Your personal workspace',
        })
        setWorkspaces([defaultWorkspace])
        setCurrentWorkspace(defaultWorkspace)

        // Create welcome page for the default workspace
        try {
          const welcomeBlocks = generateWelcomePageContent()
          const welcomePage = await pageService.createPage(defaultWorkspace.id, {
            title: 'Welcome',
            parentId: null,
            isFolder: false,
          })

          // Create blocks for the welcome page
          if (welcomePage && welcomePage.id) {
            const blockPromises = welcomeBlocks.map((block, index) =>
              api.blocks.create({
                pageId: welcomePage.id,
                type: block.type,
                content: block.content,
                order: index,
                metadata: {
                  ...block.metadata,
                  formatting: block.formatting || [],
                },
              })
            )

            await Promise.all(blockPromises)

            // Update workspace preferences to set this page as lastPageId
            const storage = getWorkspaceStorage()
            storage.workspacePreferences = storage.workspacePreferences || {}
            storage.workspacePreferences[defaultWorkspace.id] = {
              lastPageId: welcomePage.id,
            }
            setWorkspaceStorage(storage)
            setCurrentPageId(welcomePage.id)
          }
        } catch (pageError) {
          // Log error but don't fail workspace creation
          console.error('Failed to create welcome page for default workspace:', pageError)
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load workspaces')
      setError(error)
      console.error('Failed to load workspaces:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Load workspaces on mount and when user changes
  useEffect(() => {
    loadWorkspaces()
  }, [loadWorkspaces])

  // Save current workspace to localStorage when it changes
  useEffect(() => {
    if (currentWorkspace) {
      const storage = getWorkspaceStorage()
      storage.lastWorkspaceId = currentWorkspace.id
      setWorkspaceStorage(storage)
    }
  }, [currentWorkspace])

  // Load pages when workspace changes
  const loadPages = useCallback(async () => {
    if (!currentWorkspace) {
      setPages([])
      return
    }

    try {
      const fetchedPages = await api.pages.list(currentWorkspace.id)
      setPages(fetchedPages)
    } catch (err) {
      console.error('Failed to load pages:', err)
      // Don't set error state here as it's not critical
    }
  }, [currentWorkspace])

  // Load pages when workspace changes
  useEffect(() => {
    loadPages()
  }, [loadPages])

  const createWorkspace = useCallback(async (name: string, description?: string): Promise<Workspace> => {
    try {
      setError(null)
      const newWorkspace = await api.workspaces.create({ name, description })
      setWorkspaces((prev) => [...prev, newWorkspace])
      setCurrentWorkspace(newWorkspace)

      // Create welcome page for the new workspace
      try {
        const welcomeBlocks = generateWelcomePageContent()
        const welcomePage = await pageService.createPage(newWorkspace.id, {
          title: 'Welcome',
          parentId: null,
          isFolder: false,
        })

        // Create blocks for the welcome page
        if (welcomePage && welcomePage.id) {
          const blockPromises = welcomeBlocks.map((block, index) =>
            api.blocks.create({
              pageId: welcomePage.id,
              type: block.type,
              content: block.content,
              order: index,
              metadata: {
                ...block.metadata,
                formatting: block.formatting || [],
              },
            })
          )

          await Promise.all(blockPromises)

          // Update workspace preferences to set this page as lastPageId
          const storage = getWorkspaceStorage()
          storage.workspacePreferences = storage.workspacePreferences || {}
          storage.workspacePreferences[newWorkspace.id] = {
            lastPageId: welcomePage.id,
          }
          setWorkspaceStorage(storage)
          setCurrentPageId(welcomePage.id)
        }
      } catch (pageError) {
        // Log error but don't fail workspace creation
        console.error('Failed to create welcome page:', pageError)
      }

      return newWorkspace
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create workspace')
      setError(error)
      throw error
    }
  }, [])

  const selectWorkspace = useCallback(
    async (id: string) => {
      const workspace = workspaces.find((w) => w.id === id)
      if (!workspace) {
        throw new Error('Workspace not found')
      }
      setCurrentWorkspace(workspace)

      // Load last selected page for this workspace
      const storage = getWorkspaceStorage()
      const pageId = storage.workspacePreferences[id]?.lastPageId
      setCurrentPageId(pageId || null)
    },
    [workspaces]
  )

  const updateWorkspace = useCallback(
    async (id: string, data: { name?: string; description?: string }) => {
      try {
        setError(null)
        const updated = await api.workspaces.update(id, data)
        setWorkspaces((prev) => prev.map((w) => (w.id === id ? updated : w)))
        if (currentWorkspace?.id === id) {
          setCurrentWorkspace(updated)
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update workspace')
        setError(error)
        throw error
      }
    },
    [currentWorkspace]
  )

  const deleteWorkspace = useCallback(
    async (id: string) => {
      try {
        setError(null)

        // Don't allow deleting the last workspace
        if (workspaces.length === 1) {
          throw new Error('Cannot delete your last workspace')
        }

        await api.workspaces.delete(id)

        // Remove from state
        const remainingWorkspaces = workspaces.filter((w) => w.id !== id)
        setWorkspaces(remainingWorkspaces)

        // If deleting current workspace, switch to another
        if (currentWorkspace?.id === id && remainingWorkspaces.length > 0) {
          setCurrentWorkspace(remainingWorkspaces[0])
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to delete workspace')
        setError(error)
        throw error
      }
    },
    [workspaces, currentWorkspace]
  )

  const selectPage = useCallback(
    (pageId: string) => {
      setCurrentPageId(pageId)

      // Save page selection to localStorage
      if (currentWorkspace) {
        const storage = getWorkspaceStorage()
        storage.workspacePreferences = storage.workspacePreferences || {}
        storage.workspacePreferences[currentWorkspace.id] = {
          ...(storage.workspacePreferences[currentWorkspace.id] || {}),
          lastPageId: pageId,
        }
        setWorkspaceStorage(storage)
      }
    },
    [currentWorkspace]
  )

  const refreshWorkspaces = useCallback(async () => {
    await loadWorkspaces()
  }, [loadWorkspaces])

  // Page CRUD operations
  const createPage = useCallback(
    async (data: { title: string; parentId?: string | null; isFolder?: boolean }): Promise<Page> => {
      if (!currentWorkspace) {
        throw new Error('No workspace selected')
      }

      try {
        const newPage = await pageService.createPage(currentWorkspace.id, data)
        setPages((prev) => [...prev, newPage])

        // Select the new page if it's not a folder
        if (!data.isFolder) {
          selectPage(newPage.id)
        }

        return newPage
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to create page')
        console.error('Failed to create page:', error)
        throw error
      }
    },
    [currentWorkspace, selectPage]
  )

  const updatePage = useCallback(
    async (pageId: string, data: { title?: string; parentId?: string | null; order?: number }) => {
      if (!currentWorkspace) {
        throw new Error('No workspace selected')
      }

      try {
        const updatedPage = await pageService.updatePage(currentWorkspace.id, pageId, data)
        setPages((prev) => prev.map((p) => (p.id === pageId ? updatedPage : p)))
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update page')
        console.error('Failed to update page:', error)
        throw error
      }
    },
    [currentWorkspace]
  )

  const deletePage = useCallback(
    async (pageId: string) => {
      if (!currentWorkspace) {
        throw new Error('No workspace selected')
      }

      try {
        await pageService.deletePage(currentWorkspace.id, pageId)
        setPages((prev) => prev.filter((p) => p.id !== pageId))

        // If we deleted the current page, clear selection
        if (currentPageId === pageId) {
          setCurrentPageId(null)
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to delete page')
        console.error('Failed to delete page:', error)
        throw error
      }
    },
    [currentWorkspace, currentPageId]
  )

  const refreshPages = useCallback(async () => {
    await loadPages()
  }, [loadPages])

  const value: WorkspaceContextValue = {
    // State
    workspaces,
    currentWorkspace,
    currentPageId,
    pages,
    loading,
    error,
    // Workspace Actions
    createWorkspace,
    selectWorkspace,
    updateWorkspace,
    deleteWorkspace,
    refreshWorkspaces,
    // Page Actions
    selectPage,
    createPage,
    updatePage,
    deletePage,
    refreshPages,
  }

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider')
  }
  return context
}
