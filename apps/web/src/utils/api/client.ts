import { auth } from '../firebase'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    page?: number
    limit?: number
    total?: number
    requestId?: string
    timestamp?: string
  }
}

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number,
    public details?: any,
    public requestId?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export interface RequestConfig {
  headers?: Record<string, string>
  params?: Record<string, any>
  signal?: AbortSignal
}

class ApiClient {
  private baseURL: string
  private pendingRequests = new Map<string, AbortController>()

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async getAuthToken(): Promise<string | null> {
    const user = auth.currentUser
    if (!user) return null
    try {
      return await user.getIdToken()
    } catch (error) {
      console.error('Failed to get auth token:', error)
      return null
    }
  }

  private buildURL(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(endpoint, this.baseURL)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }
    return url.toString()
  }

  private async request<T>(method: string, endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    const requestId = `${method}:${endpoint}:${Date.now()}`
    const abortController = new AbortController()

    // Cancel any pending request to the same endpoint
    const existingRequest = this.pendingRequests.get(`${method}:${endpoint}`)
    if (existingRequest) {
      existingRequest.abort()
    }
    this.pendingRequests.set(`${method}:${endpoint}`, abortController)

    try {
      const token = await this.getAuthToken()
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...config?.headers,
      }

      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const url = this.buildURL(endpoint, config?.params)
      const options: RequestInit = {
        method,
        headers,
        signal: config?.signal || abortController.signal,
      }

      if (data && method !== 'GET') {
        options.body = JSON.stringify(data)
      }

      const response = await fetch(url, options)
      const responseData: ApiResponse<T> = await response.json()

      if (!response.ok || !responseData.success) {
        throw new ApiError(
          responseData.error?.code || 'UNKNOWN_ERROR',
          responseData.error?.message || 'An error occurred',
          response.status,
          responseData.error?.details,
          responseData.meta?.requestId
        )
      }

      return responseData.data as T
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError('REQUEST_ABORTED', 'Request was aborted', 0)
        }
        throw new ApiError('NETWORK_ERROR', error.message || 'Network error occurred', 0)
      }
      throw new ApiError('UNKNOWN_ERROR', 'An unknown error occurred', 0)
    } finally {
      this.pendingRequests.delete(`${method}:${endpoint}`)
    }
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, config)
  }

  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>('POST', endpoint, data, config)
  }

  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>('PUT', endpoint, data, config)
  }

  async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>('PATCH', endpoint, data, config)
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('DELETE', endpoint, undefined, config)
  }

  // Cancel all pending requests
  cancelAll(): void {
    this.pendingRequests.forEach((controller) => controller.abort())
    this.pendingRequests.clear()
  }
}

// Create and export the API client instance
const apiBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
export const apiClient = new ApiClient(apiBaseURL)

// Export typed API methods for better DX
export const api = {
  // Auth
  auth: {
    verify: () => apiClient.post<{ user: any }>('/api/auth/verify'),
    syncUser: () => apiClient.post<{ user: any }>('/api/auth/sync-user'),
    me: () => apiClient.get<{ user: any }>('/api/auth/me'),
  },

  // Workspaces
  workspaces: {
    list: (params?: { page?: number; limit?: number }) => apiClient.get<any[]>('/api/workspaces', { params }),
    create: (data: { name: string; description?: string }) => apiClient.post<any>('/api/workspaces', data),
    get: (id: string) => apiClient.get<any>(`/api/workspaces/${id}`),
    update: (id: string, data: { name?: string; description?: string }) => apiClient.put<any>(`/api/workspaces/${id}`, data),
    delete: (id: string) => apiClient.delete<void>(`/api/workspaces/${id}`),
  },

  // Pages
  pages: {
    listByWorkspace: (workspaceId: string) => apiClient.get<any[]>(`/api/pages/${workspaceId}`),
    create: (data: { workspaceId: string; title: string; parentId?: string; isFolder?: boolean }) => apiClient.post<any>('/api/pages', data),
    get: (pageId: string) => apiClient.get<any>(`/api/pages/${pageId}`),
    update: (pageId: string, data: { title?: string; icon?: string; isFolder?: boolean }) => apiClient.put<any>(`/api/pages/${pageId}`, data),
    delete: (pageId: string) => apiClient.delete<void>(`/api/pages/${pageId}`),
    move: (pageId: string, data: { parentId?: string; order?: number }) => apiClient.put<any>(`/api/pages/${pageId}/move`, data),
  },

  // Blocks
  blocks: {
    listByPage: (pageId: string, params?: { limit?: number; offset?: number }) => apiClient.get<any[]>(`/api/blocks/${pageId}`, { params }),
    create: (data: { pageId: string; type: string; content: string; order?: number; metadata?: any }) => apiClient.post<any>('/api/blocks', data),
    update: (
      blockId: string,
      data: {
        content?: string
        type?: string
        metadata?: any
        version?: number
      }
    ) => apiClient.put<any>(`/api/blocks/${blockId}`, data),
    delete: (blockId: string) => apiClient.delete<void>(`/api/blocks/${blockId}`),
    batch: (
      operations: Array<{
        type: 'create' | 'update' | 'delete'
        data: any
      }>
    ) => apiClient.post<any[]>('/api/blocks/batch', { operations }),
    reorder: (pageId: string, blockOrders: Array<{ id: string; order: number }>) =>
      apiClient.put<void>('/api/blocks/reorder', { pageId, blockOrders }),
  },
}
