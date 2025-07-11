import { BaseApiClient } from './client'

interface User {
  id: string
  email: string
  name: string | null
  imageUrl: string | null
  firebaseUid: string
  createdAt: string
  updatedAt: string
  workspaces?: any[]
}

interface AuthResponse {
  user: User
}

class AuthService extends BaseApiClient {
  async verifyAuth() {
    const token = await this.getAuthToken()
    if (!token) {
      throw new Error('No auth token available')
    }

    return this.request<AuthResponse>('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ idToken: token }),
    })
  }

  async getCurrentUser() {
    return this.request<AuthResponse>('/auth/me')
  }

  async logout() {
    // Optional server-side logout
    return this.request<{ success: boolean }>('/auth/logout', {
      method: 'POST',
    }).catch(() => {
      // Logout endpoint is optional, don't fail if it doesn't exist
      return { success: true }
    })
  }
}

export const authService = new AuthService()
