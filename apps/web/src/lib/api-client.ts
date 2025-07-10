import { auth } from './firebase'

const API_BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:3001/api'

interface ApiRequestOptions extends RequestInit {
  skipAuth?: boolean
}

class ApiClient {
  private tokenExpiryBuffer = 5 * 60 * 1000 // 5 minutes in milliseconds
  private isRefreshingToken = false
  private tokenRefreshPromise: Promise<string | null> | null = null

  private async getAuthToken(forceRefresh = false): Promise<string | null> {
    if (!auth.currentUser) {
      return null
    }

    try {
      // Force refresh the token if requested or if it's about to expire
      const token = await auth.currentUser.getIdToken(forceRefresh)

      // Check if token is about to expire (within buffer time)
      const tokenResult = await auth.currentUser.getIdTokenResult()
      const expirationTime = new Date(tokenResult.expirationTime).getTime()
      const currentTime = Date.now()

      if (expirationTime - currentTime < this.tokenExpiryBuffer) {
        // Token is about to expire, force refresh
        return this.refreshToken()
      }

      return token
    } catch (error) {
      console.error('Error getting auth token:', error)
      return null
    }
  }

  private async refreshToken(): Promise<string | null> {
    // Prevent multiple simultaneous refresh attempts
    if (this.isRefreshingToken && this.tokenRefreshPromise) {
      return this.tokenRefreshPromise
    }

    this.isRefreshingToken = true
    this.tokenRefreshPromise = (async () => {
      try {
        if (!auth.currentUser) {
          return null
        }

        const newToken = await auth.currentUser.getIdToken(true)
        return newToken
      } catch (error) {
        console.error('Error refreshing token:', error)
        return null
      } finally {
        this.isRefreshingToken = false
        this.tokenRefreshPromise = null
      }
    })()

    return this.tokenRefreshPromise
  }

  private async request<T>(endpoint: string, options: ApiRequestOptions = {}, isRetry = false): Promise<T> {
    const { skipAuth = false, ...fetchOptions } = options

    // Build headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Merge any custom headers
    if (options.headers) {
      Object.assign(headers, options.headers)
    }

    // Add auth token if not skipped
    if (!skipAuth) {
      const token = await this.getAuthToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    // Make the request
    const url = `${API_BASE_URL}${endpoint}`
    console.log('Making request to:', url, 'Base URL:', API_BASE_URL, 'Endpoint:', endpoint)
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    })

    // Handle 401 Unauthorized - try to refresh token and retry once
    if (response.status === 401 && !skipAuth && !isRetry) {
      console.log('Received 401, attempting to refresh token and retry...')

      const newToken = await this.refreshToken()
      if (newToken) {
        // Update the authorization header with the new token
        headers['Authorization'] = `Bearer ${newToken}`

        // Retry the request with the new token
        const retryResponse = await fetch(url, {
          ...fetchOptions,
          headers,
        })

        if (!retryResponse.ok) {
          const error = await retryResponse.json().catch(() => ({
            message: `HTTP error! status: ${retryResponse.status}`,
          }))
          throw new Error(error.message || `Request failed: ${retryResponse.statusText}`)
        }

        return retryResponse.json()
      }
    }

    // Handle other error responses
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP error! status: ${response.status}`,
      }))
      throw new Error(error.message || `Request failed: ${response.statusText}`)
    }

    // Return parsed JSON
    return response.json()
  }

  // Health check
  async healthCheck() {
    try {
      // Remove /api from base URL if present since health endpoint is at /api/health
      const baseUrl = API_BASE_URL.replace(/\/api$/, '')
      const response = await fetch(`${baseUrl}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      return response.ok
    } catch (error) {
      console.error('Backend health check failed:', error)
      return false
    }
  }

  // Auth endpoints
  async verifyAuth() {
    const token = await this.getAuthToken()
    if (!token) {
      throw new Error('No auth token available')
    }

    return this.request<{ user: any }>('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ idToken: token }),
    })
  }

  async getCurrentUser() {
    return this.request<{ user: any }>('/auth/me')
  }

  // Workspace endpoints
  async getWorkspaces() {
    return this.request<{ workspaces: any[] }>('/workspaces')
  }

  async getWorkspace(id: string) {
    return this.request<{ workspace: any }>(`/workspaces?id=${id}`)
  }

  async createWorkspace(data: { name: string }) {
    return this.request<{ workspace: any }>('/workspaces', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateWorkspace(id: string, data: { name: string }) {
    return this.request<{ workspace: any }>(`/workspaces?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteWorkspace(id: string) {
    return this.request<{ success: boolean }>(`/workspaces?id=${id}`, {
      method: 'DELETE',
    })
  }

  // Page endpoints
  async getPages(workspaceId: string) {
    return this.request<{ pages: any[] }>(`/pages?workspaceId=${workspaceId}`)
  }

  async getPage(id: string) {
    return this.request<{ page: any; blocks: any[] }>(`/pages?id=${id}`)
  }

  async createPage(workspaceId: string, data: { title: string; parentId?: string }) {
    return this.request<{ page: any }>(`/pages?workspaceId=${workspaceId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updatePage(id: string, data: { title: string }) {
    return this.request<{ page: any }>(`/pages?id=${id}`, {
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

  // Block endpoints
  async getBlocks(pageId: string) {
    return this.request<{ blocks: any[] }>(`/blocks?pageId=${pageId}`)
  }

  async createBlock(pageId: string, data: { type: string; content: string; order: number }) {
    return this.request<{ block: any }>(`/blocks?pageId=${pageId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateBlock(id: string, data: { type?: string; content?: string }) {
    return this.request<{ block: any }>(`/blocks?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async updateBlocksBulk(blocks: Array<{ id: string; type?: string; content?: string }>) {
    return this.request<{ blocks: any[] }>('/blocks/bulk', {
      method: 'PUT',
      body: JSON.stringify({ blocks }),
    })
  }

  async deleteBlock(id: string) {
    return this.request<{ success: boolean }>(`/blocks?id=${id}`, {
      method: 'DELETE',
    })
  }

  async reorderBlocks(data: { blockId: string; newOrder: number }[]) {
    return this.request<{ success: boolean }>('/blocks/reorder', {
      method: 'PUT',
      body: JSON.stringify({ blocks: data }),
    })
  }
}

export const apiClient = new ApiClient()
