import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { auth, signInWithGoogle, signInWithEmail, signUpWithEmail, logout } from '../lib/firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signInWithGoogle: () => Promise<User | undefined>
  signInWithEmail: (email: string, password: string) => Promise<User | undefined>
  signUpWithEmail: (email: string, password: string) => Promise<User | undefined>
  logout: () => Promise<void>
  clearError: () => void
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
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
    } catch (error) {
      handleAuthError(error)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const value: AuthContextType = {
    user,
    loading,
    error,
    signInWithGoogle: authSignInWithGoogle,
    signInWithEmail: authSignInWithEmail,
    signUpWithEmail: authSignUpWithEmail,
    logout: authLogout,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
