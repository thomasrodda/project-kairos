import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { pageService } from '../services/api'
import { useWorkspace } from './WorkspaceContext'
import { useToast } from '../hooks/useToast'

// Use the Page interface from the API service
interface Page {
  id: string
  title: string
  workspaceId: string
  parentId: string | null
  order: number
  icon: string | null
  isFolder?: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

interface PageWithChildren extends Page {
  children?: PageWithChildren[]
  isExpanded?: boolean
}

interface PagesContextType {
  pages: PageWithChildren[]
  loading: boolean
  error: string | null
  selectedPageId: string | null
  expandedPageIds: Set<string>
  fetchPages: () => Promise<void>
  createPage: (title: string, parentId?: string | null, isFolder?: boolean) => Promise<Page | null>
  updatePage: (id: string, data: { title?: string; parentId?: string | null }) => Promise<boolean>
  updatePageLocally: (id: string, data: { title?: string }) => void
  deletePage: (id: string) => Promise<boolean>
  reorderPages: (pageIds: string[]) => Promise<boolean>
  togglePageExpanded: (pageId: string) => void
  setSelectedPageId: (pageId: string | null) => void
  getPageById: (pageId: string) => PageWithChildren | undefined
  getPagePath: (pageId: string) => PageWithChildren[]
}

const PagesContext = createContext<PagesContextType | null>(null)

export function usePagesContext() {
  const context = useContext(PagesContext)
  if (!context) {
    throw new Error('usePagesContext must be used within a PagesProvider')
  }
  return context
}

export function usePages() {
  try {
    return usePagesContext()
  } catch {
    // Return a safe default when used outside provider
    return null
  }
}

interface PagesProviderProps {
  children: ReactNode
}

export function PagesProvider({ children }: PagesProviderProps) {
  const [pages, setPages] = useState<PageWithChildren[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null)
  const [expandedPageIds, setExpandedPageIds] = useState<Set<string>>(new Set())

  const { currentWorkspace: selectedWorkspace } = useWorkspace()
  const { showToast } = useToast()

  // Build hierarchical page tree from flat list
  const buildPageTree = useCallback((flatPages: Page[]): PageWithChildren[] => {
    const pageMap = new Map<string, PageWithChildren>()
    const rootPages: PageWithChildren[] = []

    // First pass: create all pages
    flatPages.forEach((page) => {
      pageMap.set(page.id, { ...page, children: [] })
    })

    // Second pass: build hierarchy
    flatPages.forEach((page) => {
      const pageWithChildren = pageMap.get(page.id)!
      if (page.parentId && pageMap.has(page.parentId)) {
        const parent = pageMap.get(page.parentId)!
        if (!parent.children) parent.children = []
        parent.children.push(pageWithChildren)
      } else {
        rootPages.push(pageWithChildren)
      }
    })

    // Sort pages by order at each level
    const sortPages = (pages: PageWithChildren[]) => {
      pages.sort((a, b) => a.order - b.order)
      pages.forEach((page) => {
        if (page.children?.length) {
          sortPages(page.children)
        }
      })
    }

    sortPages(rootPages)
    return rootPages
  }, [])

  // Fetch pages when workspace changes
  const fetchPages = useCallback(async () => {
    if (!selectedWorkspace) return

    setLoading(true)
    setError(null)

    try {
      const response = await pageService.getPages(selectedWorkspace.id)
      const pageTree = buildPageTree(response.pages)
      setPages(pageTree)
    } catch (err) {
      console.error('Failed to fetch pages:', err)
      setError('Failed to load pages')
      showToast?.({
        message: 'Failed to load pages',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }, [selectedWorkspace, buildPageTree])

  // Create a new page
  const createPage = useCallback(
    async (title: string, parentId?: string | null, isFolder: boolean = false): Promise<Page | null> => {
      if (!selectedWorkspace) return null

      try {
        const newPage = await pageService.createPage(selectedWorkspace.id, {
          title,
          parentId: parentId || undefined,
          isFolder,
        })

        // Refresh pages to get updated tree
        await fetchPages()

        // Auto-expand parent if it exists
        if (parentId) {
          setExpandedPageIds((prev) => new Set(prev).add(parentId))
        }

        showToast?.({
          message: `${isFolder ? 'Folder' : 'Page'} created successfully`,
          type: 'success',
        })

        return newPage
      } catch (err: any) {
        console.error('Failed to create page:', err)
        console.error('Error details:', err.response || err.message || err)

        // Try to extract a more specific error message
        const errorMessage = err.response?.data?.error?.message || err.message || `Failed to create ${isFolder ? 'folder' : 'page'}`

        showToast?.({
          message: errorMessage,
          type: 'error',
        })
        return null
      }
    },
    [selectedWorkspace, fetchPages, showToast]
  )

  // Update page properties
  const updatePage = useCallback(
    async (id: string, data: { title?: string; parentId?: string | null }): Promise<boolean> => {
      try {
        await pageService.updatePage(id, data)
        await fetchPages()

        showToast?.({
          message: 'Page updated successfully',
          type: 'success',
        })

        return true
      } catch (err) {
        console.error('Failed to update page:', err)
        showToast?.({
          message: 'Failed to update page',
          type: 'error',
        })
        return false
      }
    },
    [fetchPages, showToast]
  )

  // Update page properties locally without API call
  const updatePageLocally = useCallback((id: string, data: { title?: string }) => {
    setPages((prevPages) => {
      const updatePageInTree = (pages: PageWithChildren[]): PageWithChildren[] => {
        return pages.map((page) => {
          if (page.id === id) {
            return { ...page, ...data }
          }
          if (page.children?.length) {
            return { ...page, children: updatePageInTree(page.children) }
          }
          return page
        })
      }
      return updatePageInTree(prevPages)
    })
  }, [])

  // Delete a page
  const deletePage = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await pageService.deletePage(id)

        // Clear selection if deleted page was selected
        if (selectedPageId === id) {
          setSelectedPageId(null)
        }

        await fetchPages()

        showToast?.({
          message: 'Page deleted successfully',
          type: 'success',
        })

        return true
      } catch (err: any) {
        console.error('Failed to delete page:', err)

        // Show specific error message if available
        const errorMessage = err.response?.data?.error?.message || 'Failed to delete page'
        showToast?.({
          message: errorMessage,
          type: 'error',
        })

        return false
      }
    },
    [selectedPageId, fetchPages, showToast]
  )

  // Reorder pages
  const reorderPages = useCallback(
    async (pageIds: string[]): Promise<boolean> => {
      try {
        await pageService.reorderPages({ pageIds })
        await fetchPages()
        return true
      } catch (err) {
        console.error('Failed to reorder pages:', err)
        showToast?.({
          message: 'Failed to reorder pages',
          type: 'error',
        })
        return false
      }
    },
    [fetchPages, showToast]
  )

  // Toggle page expanded state
  const togglePageExpanded = useCallback((pageId: string) => {
    setExpandedPageIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(pageId)) {
        newSet.delete(pageId)
      } else {
        newSet.add(pageId)
      }
      return newSet
    })
  }, [])

  // Get page by ID from tree
  const getPageById = useCallback(
    (pageId: string): PageWithChildren | undefined => {
      const findPage = (pages: PageWithChildren[]): PageWithChildren | undefined => {
        for (const page of pages) {
          if (page.id === pageId) return page
          if (page.children?.length) {
            const found = findPage(page.children)
            if (found) return found
          }
        }
        return undefined
      }

      return findPage(pages)
    },
    [pages]
  )

  // Get path to a page (for breadcrumbs)
  const getPagePath = useCallback(
    (pageId: string): PageWithChildren[] => {
      const path: PageWithChildren[] = []

      const findPath = (pages: PageWithChildren[], target: string): boolean => {
        for (const page of pages) {
          path.push(page)

          if (page.id === target) {
            return true
          }

          if (page.children?.length && findPath(page.children, target)) {
            return true
          }

          path.pop()
        }
        return false
      }

      findPath(pages, pageId)
      return path
    },
    [pages]
  )

  // Fetch pages when workspace changes
  useEffect(() => {
    if (selectedWorkspace) {
      // Inline the fetch logic to avoid dependency issues
      const loadPages = async () => {
        setLoading(true)
        setError(null)

        try {
          const response = await pageService.getPages(selectedWorkspace.id)
          const pageTree = buildPageTree(response.pages)
          setPages(pageTree)
        } catch (err) {
          console.error('Failed to fetch pages:', err)
          setError('Failed to load pages')
        } finally {
          setLoading(false)
        }
      }

      loadPages()
    } else {
      setPages([])
      setSelectedPageId(null)
      setExpandedPageIds(new Set())
    }
  }, [selectedWorkspace?.id, buildPageTree])

  const value: PagesContextType = {
    pages,
    loading,
    error,
    selectedPageId,
    expandedPageIds,
    fetchPages,
    createPage,
    updatePage,
    updatePageLocally,
    deletePage,
    reorderPages,
    togglePageExpanded,
    setSelectedPageId,
    getPageById,
    getPagePath,
  }

  return <PagesContext.Provider value={value}>{children}</PagesContext.Provider>
}
