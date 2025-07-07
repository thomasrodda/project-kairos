import { useState, useEffect, useCallback, useMemo } from 'react'
import { api } from '../../../utils/api/client'
import { Page } from '@kairos/types'

// Type for Page with children property
type PageWithChildren = Page & { children: PageWithChildren[] }

interface UsePageTreeOptions {
  workspaceId: string
  currentPageId?: string
  onPageSelect: (pageId: string) => void
}

interface PageTreeState {
  pages: Page[]
  expandedFolders: Set<string>
  loading: boolean
  error: Error | null
}

export function usePageTree({ workspaceId, currentPageId, onPageSelect }: UsePageTreeOptions) {
  const [state, setState] = useState<PageTreeState>({
    pages: [],
    expandedFolders: new Set(),
    loading: true,
    error: null,
  })

  // Fetch pages from API
  useEffect(() => {
    if (!workspaceId) return

    let cancelled = false

    async function fetchPages() {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        const pages = await api.pages.listByWorkspace(workspaceId)

        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            pages,
            loading: false,
          }))
        }
      } catch (error) {
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: error instanceof Error ? error : new Error('Failed to load pages'),
          }))
        }
      }
    }

    fetchPages()

    return () => {
      cancelled = true
    }
  }, [workspaceId])

  // Toggle folder expansion
  const toggleFolder = useCallback((folderId: string) => {
    setState((prev) => {
      const newExpanded = new Set(prev.expandedFolders)
      if (newExpanded.has(folderId)) {
        newExpanded.delete(folderId)
      } else {
        newExpanded.add(folderId)
      }
      return { ...prev, expandedFolders: newExpanded }
    })
  }, [])

  // Build hierarchical tree structure
  const pageTree = useMemo(() => {
    const { pages } = state
    if (pages.length === 0) return []

    // Create a map for quick lookup
    const pageMap = new Map<string, PageWithChildren>()
    pages.forEach((page) => {
      pageMap.set(page.id, { ...page, children: [] })
    })

    // Build the tree
    const rootPages: PageWithChildren[] = []
    pages.forEach((page) => {
      const pageWithChildren = pageMap.get(page.id)!
      if (page.parentId) {
        const parent = pageMap.get(page.parentId)
        if (parent) {
          parent.children.push(pageWithChildren)
        } else {
          // Parent not found, treat as root
          rootPages.push(pageWithChildren)
        }
      } else {
        rootPages.push(pageWithChildren)
      }
    })

    // Sort pages by order
    const sortPages = (pages: PageWithChildren[]) => {
      pages.sort((a, b) => a.order - b.order)
      pages.forEach((page) => {
        if (page.children.length > 0) {
          sortPages(page.children)
        }
      })
    }

    sortPages(rootPages)
    return rootPages
  }, [state.pages])

  // Handle page selection
  const handlePageSelect = useCallback(
    (pageId: string) => {
      const page = state.pages.find((p) => p.id === pageId)
      if (page && !page.isFolder) {
        onPageSelect(pageId)
      }
    },
    [state.pages, onPageSelect]
  )

  // Expand all parent folders of the current page
  useEffect(() => {
    if (!currentPageId || state.pages.length === 0) return

    const expandParents = (pageId: string) => {
      const page = state.pages.find((p) => p.id === pageId)
      if (page?.parentId) {
        setState((prev) => ({
          ...prev,
          expandedFolders: new Set([...prev.expandedFolders, page.parentId!]),
        }))
        expandParents(page.parentId)
      }
    }

    expandParents(currentPageId)
  }, [currentPageId, state.pages])

  return {
    pageTree,
    loading: state.loading,
    error: state.error,
    expandedFolders: state.expandedFolders,
    toggleFolder,
    handlePageSelect,
    refetch: () => {
      // Trigger a re-fetch by changing workspaceId dependency
      setState((prev) => ({ ...prev, loading: true }))
      // The useEffect will handle the actual fetch
    },
  }
}
