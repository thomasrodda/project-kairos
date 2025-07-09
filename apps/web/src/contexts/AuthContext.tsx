import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from '../utils/firebase'
import { api } from '../utils/api/client'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signup: (email: string, password: string, displayName?: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

// Alias for better developer experience
export const useAuth = useAuthContext

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        try {
          if (firebaseUser) {
            // Sync user with backend
            await api.auth.syncUser()
            setUser(firebaseUser)
          } else {
            setUser(null)
          }
          setError(null)
        } catch (err) {
          console.error('Auth state change error:', err)
          setError('Failed to sync user data')
          // Don't set the user if sync fails to prevent login loop
          setUser(null)
        } finally {
          setLoading(false)
        }
      },
      (error) => {
        console.error('Auth state error:', error)
        setError(error.message)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [])

  const signup = async (email: string, password: string, displayName?: string) => {
    try {
      setError(null)
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password)

      if (displayName) {
        await updateProfile(newUser, { displayName })
      }

      // Sync with backend
      await api.auth.syncUser()
    } catch (err) {
      console.error('Signup error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to create account'
      setError(errorMessage)
      throw err
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      await signInWithEmailAndPassword(auth, email, password)
      // User state will be updated by onAuthStateChanged
    } catch (err) {
      console.error('Login error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in'
      setError(errorMessage)
      throw err
    }
  }

  const logout = async () => {
    try {
      setError(null)
      await signOut(auth)
    } catch (err) {
      console.error('Logout error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign out'
      setError(errorMessage)
      throw err
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setError(null)
      await sendPasswordResetEmail(auth, email)
    } catch (err) {
      console.error('Password reset error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to send password reset email'
      setError(errorMessage)
      throw err
    }
  }

  const clearError = () => setError(null)

  const value: AuthContextType = {
    user,
    loading,
    error,
    signup,
    login,
    logout,
    resetPassword,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
