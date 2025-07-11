// apps/web/src/contexts/PageContext.tsx
// Context for managing the current page and auto-save functionality

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { useWorkspace } from './WorkspaceContext'
import { useEditor } from './EditorContext'
import { useAutoSave } from '../hooks/useAutoSave'
import { apiClient } from '../services/api'
import { EditorBlock } from './EditorContext'

interface Page {
  id: string
  title: string
  workspaceId: string
  parentId: string | null
  order: number
  createdAt: string
  updatedAt: string
}

interface PageContextValue {
  currentPage: Page | null
  isLoading: boolean
  error: string | null
  loadPage: (pageId: string) => Promise<void>
  createPage: (workspaceId: string, title: string, parentId?: string) => Promise<Page>
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
  lastSaved: Date | null
  forceSave: () => Promise<void>
}

const PageContext = createContext<PageContextValue | undefined>(undefined)

export function usePageContext() {
  const context = useContext(PageContext)
  if (!context) {
    throw new Error('usePageContext must be used within a PageProvider')
  }
  return context
}

interface PageProviderProps {
  children: ReactNode
}

export function PageProvider({ children }: PageProviderProps) {
  const { user } = useAuth()
  const { currentWorkspace } = useWorkspace()
  const { dispatch } = useEditor()

  const [currentPage, setCurrentPage] = useState<Page | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-save hook
  const { saveStatus, lastSaved, forceSave } = useAutoSave({
    pageId: currentPage?.id || null,
    debounceDelay: 2000, // 2 seconds
    maxDelay: 30000, // 30 seconds
    onSaveStart: () => {
      console.log('Auto-save started')
    },
    onSaveSuccess: () => {
      console.log('Auto-save completed')
    },
    onSaveError: (error) => {
      console.error('Auto-save failed:', error)
      setError(error.message)
    },
  })

  // Load a page
  const loadPage = useCallback(
    async (pageId: string) => {
      if (!user) {
        setError('User not authenticated')
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await apiClient.getPage(pageId)
        const { page, blocks } = response

        // Update current page
        setCurrentPage(page)

        // Convert backend blocks to editor blocks
        const editorBlocks: EditorBlock[] = blocks
          .sort((a: any, b: any) => a.order - b.order)
          .map((block: any) => ({
            id: block.id,
            type: block.type,
            content: block.content || '',
            formatting: block.metadata?.formatting || [],
            metadata: block.metadata || {},
          }))

        // Update editor state
        dispatch({
          type: 'SET_PAGE',
          pageId: page.id,
          title: page.title,
          blocks: editorBlocks,
        })
      } catch (err) {
        console.error('Failed to load page:', err)
        setError(err instanceof Error ? err.message : 'Failed to load page')
      } finally {
        setIsLoading(false)
      }
    },
    [user, dispatch]
  )

  // Create a new page
  const createPage = useCallback(
    async (workspaceId: string, title: string, parentId?: string): Promise<Page> => {
      if (!user) {
        throw new Error('User not authenticated')
      }

      try {
        const response = await apiClient.createPage(workspaceId, {
          title,
          parentId,
        })

        return response
      } catch (err) {
        console.error('Failed to create page:', err)
        throw err
      }
    },
    [user]
  )

  // Load default page when workspace changes
  useEffect(() => {
    if (currentWorkspace && user) {
      // For now, create or load a default page
      // In the future, this should load the last opened page or show a page selector
      loadDefaultPage()
    }

    async function loadDefaultPage() {
      try {
        // Try to get pages in the workspace
        const response = await apiClient.getPages(currentWorkspace!.id)
        const pages = response.pages

        if (pages.length > 0) {
          // Load the first page
          await loadPage(pages[0].id)
        } else {
          // Create a default page
          const newPage = await createPage(currentWorkspace!.id, 'Untitled Page')
          await loadPage(newPage.id)
        }
      } catch (err) {
        console.error('Failed to load default page:', err)
        setError('Failed to load workspace pages')
      }
    }
  }, [currentWorkspace, user, loadPage, createPage])

  const value: PageContextValue = {
    currentPage,
    isLoading,
    error,
    loadPage,
    createPage,
    saveStatus,
    lastSaved,
    forceSave,
  }

  return <PageContext.Provider value={value}>{children}</PageContext.Provider>
}
