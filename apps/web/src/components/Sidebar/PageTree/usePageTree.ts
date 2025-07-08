import { useState, useEffect, useCallback, useMemo } from 'react'
import { Page } from '../../../utils/api/types'
import { useWorkspace } from '../../../contexts/WorkspaceContext'

// Type for Page with children property
type PageWithChildren = Page & { children: PageWithChildren[] }

interface UsePageTreeOptions {
  workspaceId: string
  currentPageId?: string
  onPageSelect: (pageId: string) => void
}

export function usePageTree({ workspaceId, currentPageId, onPageSelect }: UsePageTreeOptions) {
  const { pages, loading, error } = useWorkspace()
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  // Toggle folder expansion
  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders((prev) => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(folderId)) {
        newExpanded.delete(folderId)
      } else {
        newExpanded.add(folderId)
      }
      return newExpanded
    })
  }, [])

  // Build hierarchical tree structure
  const pageTree = useMemo(() => {
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
  }, [pages])

  // Handle page selection
  const handlePageSelect = useCallback(
    (pageId: string) => {
      const page = pages.find((p) => p.id === pageId)
      if (page && !page.isFolder) {
        onPageSelect(pageId)
      }
    },
    [pages, onPageSelect]
  )

  // Expand all parent folders of the current page
  useEffect(() => {
    if (!currentPageId || pages.length === 0) return

    const expandParents = (pageId: string) => {
      const page = pages.find((p) => p.id === pageId)
      if (page?.parentId) {
        setExpandedFolders((prev) => new Set([...prev, page.parentId!]))
        expandParents(page.parentId)
      }
    }

    expandParents(currentPageId)
  }, [currentPageId, pages])

  return {
    pageTree,
    loading,
    error,
    expandedFolders,
    toggleFolder,
    handlePageSelect,
  }
}
