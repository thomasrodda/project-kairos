import { api } from '../utils/api/client'
import { Page } from '../utils/api/types'

export interface CreatePageData {
  title: string
  parentId?: string | null
  isFolder?: boolean
  order?: number
}

export interface UpdatePageData {
  title?: string
  icon?: string
  isFolder?: boolean
  order?: number
}

export interface MovePageData {
  parentId: string | null
  order: number
}

export interface PageWithHierarchy extends Page {
  children?: PageWithHierarchy[]
  _count?: {
    blocks: number
    children: number
  }
}

class PageService {
  /**
   * List all pages in a workspace with hierarchy
   */
  async listByWorkspace(workspaceId: string): Promise<PageWithHierarchy[]> {
    return api.pages.list(workspaceId)
  }

  /**
   * Get a single page by ID
   */
  async getPage(workspaceId: string, pageId: string): Promise<PageWithHierarchy> {
    return api.pages.get(workspaceId, pageId)
  }

  /**
   * Create a new page
   */
  async createPage(workspaceId: string, data: CreatePageData): Promise<Page> {
    return api.pages.create(workspaceId, data)
  }

  /**
   * Update a page
   */
  async updatePage(workspaceId: string, pageId: string, data: UpdatePageData): Promise<Page> {
    return api.pages.update(workspaceId, pageId, data)
  }

  /**
   * Delete a page and all its children
   */
  async deletePage(workspaceId: string, pageId: string): Promise<void> {
    return api.pages.delete(workspaceId, pageId)
  }

  /**
   * Move a page in the hierarchy
   */
  async movePage(workspaceId: string, pageId: string, data: MovePageData): Promise<Page> {
    return api.pages.move(workspaceId, pageId, data)
  }

  /**
   * Duplicate a page and its children
   */
  async duplicatePage(workspaceId: string, pageId: string, parentId?: string | null): Promise<Page> {
    return api.pages.duplicate(workspaceId, pageId, { parentId })
  }

  /**
   * Export a page and its children
   */
  async exportPage(workspaceId: string, pageId: string, format: 'markdown' | 'json' = 'markdown'): Promise<string> {
    const response = await api.pages.export(workspaceId, pageId, { format })
    return response.content
  }

  /**
   * Search pages in a workspace
   */
  async searchPages(workspaceId: string, query: string): Promise<Page[]> {
    return api.pages.search(workspaceId, { q: query })
  }

  /**
   * Get page breadcrumbs (path from root to page)
   */
  async getPageBreadcrumbs(workspaceId: string, pageId: string): Promise<Page[]> {
    return api.pages.breadcrumbs(workspaceId, pageId)
  }

  /**
   * Batch update multiple pages
   */
  async batchUpdatePages(workspaceId: string, updates: Array<{ pageId: string; data: UpdatePageData }>): Promise<Page[]> {
    return api.pages.batch(workspaceId, { updates })
  }

  /**
   * Get page statistics (word count, block count, etc.)
   */
  async getPageStats(
    workspaceId: string,
    pageId: string
  ): Promise<{
    wordCount: number
    characterCount: number
    blockCount: number
    lastModified: string
  }> {
    return api.pages.stats(workspaceId, pageId)
  }
}

// Create and export singleton instance
export const pageService = new PageService()
