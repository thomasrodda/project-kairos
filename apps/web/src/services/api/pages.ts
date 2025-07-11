import { BaseApiClient } from './client'

interface Page {
  id: string
  title: string
  workspaceId: string
  parentId: string | null
  order: number
  icon: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

interface Block {
  id: string
  type: string
  content: string
  order: number
  metadata: Record<string, unknown> | null
  pageId: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

interface PagesResponse {
  pages: Page[]
}

interface PageResponse {
  page: Page
  blocks: Block[]
}

interface SaveContentData {
  title?: string
  blocks?: Array<{
    id: string
    type: string
    content: string
    order: number
    metadata?: Record<string, unknown>
  }>
  deletedBlockIds?: string[]
  lastUpdatedAt?: string
}

interface SaveContentResponse {
  page: {
    id: string
    title: string
    updatedAt: string
    blocks: Array<{
      id: string
      type: string
      content: string
      order: number
      metadata: Record<string, unknown> | null
      updatedAt: string
    }>
  }
  saveStatus: 'success' | 'conflict'
  savedAt: string
}

interface PageVersion {
  id: string
  pageId: string
  versionNumber: number
  title: string
  blocks: any
  createdAt: string
  createdBy: string
}

interface PageVersionsResponse {
  versions: PageVersion[]
}

interface PageVersionResponse {
  version: PageVersion
}

class PageService extends BaseApiClient {
  async getPages(workspaceId: string) {
    return this.request<PagesResponse>(`/pages?workspaceId=${workspaceId}`)
  }

  async getPage(id: string) {
    return this.request<PageResponse>(`/pages?id=${id}`)
  }

  async createPage(workspaceId: string, data: { title: string; parentId?: string }) {
    return this.request<{ page: Page }>(`/pages?workspaceId=${workspaceId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updatePage(id: string, data: { title: string }) {
    return this.request<{ page: Page }>(`/pages?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deletePage(id: string) {
    return this.request<{ success: boolean }>(`/pages?id=${id}`, {
      method: 'DELETE',
    })
  }

  async reorderPages(data: { pageId: string; newOrder: number }[]) {
    return this.request<{ success: boolean }>('/pages/reorder', {
      method: 'PUT',
      body: JSON.stringify({ pages: data }),
    })
  }

  // Auto-save endpoint
  async savePageContent(pageId: string, data: SaveContentData) {
    return this.request<SaveContentResponse>(`/pages/${pageId}/content`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Version management
  async getPageVersions(pageId: string) {
    return this.request<PageVersionsResponse>(`/pages/${pageId}/versions`)
  }

  async getPageVersion(pageId: string, versionId: string) {
    return this.request<PageVersionResponse>(`/pages/${pageId}/versions/${versionId}`)
  }

  async restorePageVersion(pageId: string, versionId: string) {
    return this.request<PageResponse>(`/pages/${pageId}/versions/${versionId}/restore`, {
      method: 'POST',
    })
  }
}

export const pageService = new PageService()
