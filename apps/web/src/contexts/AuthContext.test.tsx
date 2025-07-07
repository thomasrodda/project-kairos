import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuthContext } from './AuthContext'
import { auth } from '../utils/firebase'
import { api } from '../utils/api/client'
import * as firebaseAuth from 'firebase/auth'

// Mock Firebase auth
jest.mock('../utils/firebase', () => ({
  auth: {},
}))

// Mock API client
jest.mock('../utils/api/client', () => ({
  api: {
    auth: {
      syncUser: jest.fn().mockResolvedValue(true),
    },
  },
}))

// Mock Firebase auth functions
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  updateProfile: jest.fn(),
}))

describe('AuthContext', () => {
  let mockUnsubscribe: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockUnsubscribe = jest.fn()
    ;(firebaseAuth.onAuthStateChanged as jest.Mock).mockReturnValue(mockUnsubscribe)
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>

  describe('useAuthContext', () => {
    it('throws error when used outside AuthProvider', () => {
      const { result } = renderHook(() => {
        try {
          useAuthContext()
        } catch (error) {
          return error
        }
      })

      expect(result.current).toEqual(new Error('useAuthContext must be used within an AuthProvider'))
    })

    it('provides auth context when used within AuthProvider', () => {
      const { result } = renderHook(() => useAuthContext(), { wrapper })

      expect(result.current).toHaveProperty('user')
      expect(result.current).toHaveProperty('loading')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('signup')
      expect(result.current).toHaveProperty('login')
      expect(result.current).toHaveProperty('logout')
      expect(result.current).toHaveProperty('resetPassword')
      expect(result.current).toHaveProperty('clearError')
    })
  })

  describe('Auth state changes', () => {
    it('initializes with loading state', () => {
      const { result } = renderHook(() => useAuthContext(), { wrapper })

      expect(result.current.loading).toBe(true)
      expect(result.current.user).toBe(null)
      expect(result.current.error).toBe(null)
    })

    it('updates user when auth state changes', async () => {
      const mockUser = { uid: '123', email: 'test@example.com' } as firebaseAuth.User

      const { result } = renderHook(() => useAuthContext(), { wrapper })

      // Simulate auth state change
      const onAuthStateChangedCallback = (firebaseAuth.onAuthStateChanged as jest.Mock).mock.calls[0][1]

      await act(async () => {
        await onAuthStateChangedCallback(mockUser)
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.loading).toBe(false)
      expect(api.auth.syncUser).toHaveBeenCalled()
    })

    it('handles auth errors', async () => {
      const mockError = new Error('Auth failed')

      const { result } = renderHook(() => useAuthContext(), { wrapper })

      // Simulate auth error
      const onErrorCallback = (firebaseAuth.onAuthStateChanged as jest.Mock).mock.calls[0][2]

      await act(async () => {
        onErrorCallback(mockError)
      })

      expect(result.current.error).toBe('Auth failed')
      expect(result.current.loading).toBe(false)
      expect(result.current.user).toBe(null)
    })
  })

  describe('signup', () => {
    it('creates user account successfully', async () => {
      const mockUser = { uid: '123', email: 'new@example.com' } as firebaseAuth.User
      ;(firebaseAuth.createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: mockUser })
      ;(firebaseAuth.updateProfile as jest.Mock).mockResolvedValue(undefined)

      const { result } = renderHook(() => useAuthContext(), { wrapper })

      await act(async () => {
        await result.current.signup('new@example.com', 'password123', 'Test User')
      })

      expect(firebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, 'new@example.com', 'password123')
      expect(firebaseAuth.updateProfile).toHaveBeenCalledWith(mockUser, { displayName: 'Test User' })
      expect(api.auth.syncUser).toHaveBeenCalled()
    })

    it('handles signup errors', async () => {
      const mockError = new Error('Email already in use')
      ;(firebaseAuth.createUserWithEmailAndPassword as jest.Mock).mockRejectedValue(mockError)

      const { result } = renderHook(() => useAuthContext(), { wrapper })

      await expect(
        act(async () => {
          await result.current.signup('existing@example.com', 'password123')
        })
      ).rejects.toThrow('Email already in use')

      expect(result.current.error).toBe('Email already in use')
    })
  })

  describe('login', () => {
    it('signs in user successfully', async () => {
      const mockUser = { uid: '123', email: 'test@example.com' } as firebaseAuth.User
      ;(firebaseAuth.signInWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: mockUser })

      const { result } = renderHook(() => useAuthContext(), { wrapper })

      await act(async () => {
        await result.current.login('test@example.com', 'password123')
      })

      expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@example.com', 'password123')
    })

    it('handles login errors', async () => {
      const mockError = new Error('Invalid credentials')
      ;(firebaseAuth.signInWithEmailAndPassword as jest.Mock).mockRejectedValue(mockError)

      const { result } = renderHook(() => useAuthContext(), { wrapper })

      await expect(
        act(async () => {
          await result.current.login('test@example.com', 'wrongpassword')
        })
      ).rejects.toThrow('Invalid credentials')

      expect(result.current.error).toBe('Invalid credentials')
    })
  })

  describe('logout', () => {
    it('signs out user successfully', async () => {
      ;(firebaseAuth.signOut as jest.Mock).mockResolvedValue(undefined)

      const { result } = renderHook(() => useAuthContext(), { wrapper })

      await act(async () => {
        await result.current.logout()
      })

      expect(firebaseAuth.signOut).toHaveBeenCalledWith(auth)
    })

    it('handles logout errors', async () => {
      const mockError = new Error('Logout failed')
      ;(firebaseAuth.signOut as jest.Mock).mockRejectedValue(mockError)

      const { result } = renderHook(() => useAuthContext(), { wrapper })

      await expect(
        act(async () => {
          await result.current.logout()
        })
      ).rejects.toThrow('Logout failed')

      expect(result.current.error).toBe('Logout failed')
    })
  })

  describe('resetPassword', () => {
    it('sends password reset email successfully', async () => {
      ;(firebaseAuth.sendPasswordResetEmail as jest.Mock).mockResolvedValue(undefined)

      const { result } = renderHook(() => useAuthContext(), { wrapper })

      await act(async () => {
        await result.current.resetPassword('test@example.com')
      })

      expect(firebaseAuth.sendPasswordResetEmail).toHaveBeenCalledWith(auth, 'test@example.com')
    })

    it('handles password reset errors', async () => {
      const mockError = new Error('User not found')
      ;(firebaseAuth.sendPasswordResetEmail as jest.Mock).mockRejectedValue(mockError)

      const { result } = renderHook(() => useAuthContext(), { wrapper })

      await expect(
        act(async () => {
          await result.current.resetPassword('nonexistent@example.com')
        })
      ).rejects.toThrow('User not found')

      expect(result.current.error).toBe('User not found')
    })
  })

  describe('clearError', () => {
    it('clears error state', async () => {
      const { result } = renderHook(() => useAuthContext(), { wrapper })

      // Set an error first
      const mockError = new Error('Test error')
      ;(firebaseAuth.signInWithEmailAndPassword as jest.Mock).mockRejectedValue(mockError)

      await expect(
        act(async () => {
          await result.current.login('test@example.com', 'wrongpassword')
        })
      ).rejects.toThrow()

      expect(result.current.error).toBe('Test error')

      // Clear the error
      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBe(null)
    })
  })

  describe('cleanup', () => {
    it('unsubscribes from auth state changes on unmount', () => {
      const { unmount } = renderHook(() => useAuthContext(), { wrapper })

      unmount()

      expect(mockUnsubscribe).toHaveBeenCalled()
    })
  })
})
