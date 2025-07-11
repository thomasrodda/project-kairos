import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { auth, signInWithGoogle, signInWithEmail, signUpWithEmail, logout } from '../lib/firebase'
import { apiClient } from '../services/api'

interface BackendUser {
  id: string
  firebaseUid: string
  email: string
  displayName: string | null
  workspaces: Array<{
    id: string
    name: string
    userId: string
    createdAt: string
    updatedAt: string
  }>
}

interface AuthContextType {
  user: User | null
  backendUser: BackendUser | null
  loading: boolean
  error: string | null
  needsWorkspace: boolean
  signInWithGoogle: () => Promise<User | undefined>
  signInWithEmail: (email: string, password: string) => Promise<User | undefined>
  signUpWithEmail: (email: string, password: string) => Promise<User | undefined>
  logout: () => Promise<void>
  clearError: () => void
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [needsWorkspace, setNeedsWorkspace] = useState(false)

  // Sync with backend after Firebase auth changes
  const syncWithBackend = async (firebaseUser: User | null) => {
    if (!firebaseUser) {
      setBackendUser(null)
      setNeedsWorkspace(false)
      return
    }

    try {
      console.log('Syncing with backend for user:', firebaseUser.uid)

      // Verify auth and sync user with backend
      const verifyResponse = await apiClient.verifyAuth()
      console.log('Verify response:', verifyResponse)

      // Get current user data including workspaces
      const response = await apiClient.getCurrentUser()
      console.log('Get current user response:', response)

      const backendUserData: BackendUser = {
        ...response.user,
        firebaseUid: firebaseUser.uid,
        displayName: response.user.name || firebaseUser.displayName,
        workspaces: response.user.workspaces || [],
      }

      setBackendUser(backendUserData)

      // Check if user needs to create their first workspace
      setNeedsWorkspace(backendUserData.workspaces.length === 0)
    } catch (error) {
      console.error('Error syncing with backend:', error)
      // Don't call handleAuthError here as it will create an infinite loop
      // Just log the error for debugging
      if (error instanceof Error && error.message.includes('404')) {
        console.log('Backend sync failed - user might not be created yet')
      }
    }
  }

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      // Sync with backend when auth state changes
      await syncWithBackend(user)

      setLoading(false)
    })

    // Clean up subscription
    return () => unsubscribe()
  }, [])

  const handleAuthError = (error: any) => {
    let errorMessage = 'An error occurred during authentication'

    // Firebase auth error codes
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'This email is already registered'
        break
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address'
        break
      case 'auth/operation-not-allowed':
        errorMessage = 'This sign-in method is not enabled'
        break
      case 'auth/weak-password':
        errorMessage = 'Password is too weak'
        break
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled'
        break
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email'
        break
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password'
        break
      case 'auth/popup-closed-by-user':
        errorMessage = 'Sign-in popup was closed'
        break
      case 'auth/cancelled-popup-request':
        errorMessage = 'Another sign-in popup is already open'
        break
      default:
        errorMessage = error.message || errorMessage
    }

    setError(errorMessage)
    console.error('Auth error:', error)
  }

  const authSignInWithGoogle = async () => {
    try {
      setError(null)
      const user = await signInWithGoogle()
      if (user) {
        // Sync with backend after successful login
        await syncWithBackend(user)
      }
      return user
    } catch (error) {
      handleAuthError(error)
      return undefined
    }
  }

  const authSignInWithEmail = async (email: string, password: string) => {
    try {
      setError(null)
      const user = await signInWithEmail(email, password)
      if (user) {
        // Sync with backend after successful login
        await syncWithBackend(user)
      }
      return user
    } catch (error) {
      handleAuthError(error)
      return undefined
    }
  }

  const authSignUpWithEmail = async (email: string, password: string) => {
    try {
      setError(null)
      const user = await signUpWithEmail(email, password)
      if (user) {
        // Sync with backend after successful registration
        await syncWithBackend(user)
      }
      return user
    } catch (error) {
      handleAuthError(error)
      return undefined
    }
  }

  const authLogout = async () => {
    try {
      setError(null)
      await logout()
      setBackendUser(null)
      setNeedsWorkspace(false)
    } catch (error) {
      handleAuthError(error)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const refreshUserData = async () => {
    if (user) {
      await syncWithBackend(user)
    }
  }

  const value: AuthContextType = {
    user,
    backendUser,
    loading,
    error,
    needsWorkspace,
    signInWithGoogle: authSignInWithGoogle,
    signInWithEmail: authSignInWithEmail,
    signUpWithEmail: authSignUpWithEmail,
    logout: authLogout,
    clearError,
    refreshUserData,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
