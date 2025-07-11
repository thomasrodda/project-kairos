import { auth } from '../../lib/firebase'

const API_BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:3001/api'

interface ApiRequestOptions extends RequestInit {
  skipAuth?: boolean
}

export class BaseApiClient {
  private tokenExpiryBuffer = 5 * 60 * 1000 // 5 minutes in milliseconds
  private isRefreshingToken = false
  private tokenRefreshPromise: Promise<string | null> | null = null

  protected async getAuthToken(forceRefresh = false): Promise<string | null> {
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

  protected async request<T>(endpoint: string, options: ApiRequestOptions = {}, isRetry = false): Promise<T> {
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

        const retryJson = await retryResponse.json()
        return retryJson.data !== undefined ? retryJson.data : retryJson
      }
    }

    // Handle other error responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `HTTP error! status: ${response.status}`,
      }))
      console.error('API Error Response:', errorData)
      const error = new Error(errorData.error?.message || errorData.message || `Request failed: ${response.statusText}`)
      ;(error as any).response = { data: errorData, status: response.status }
      throw error
    }

    // Return parsed JSON
    const json = await response.json()
    // If the response has a 'data' property, unwrap it
    return json.data !== undefined ? json.data : json
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
}

// Export base URL for services that might need it
export { API_BASE_URL }
