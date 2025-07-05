import { useEffect, useState } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '../utils/firebase'
import { api } from '../utils/api/client'

interface AuthState {
  user: User | null
  loading: boolean
  error: Error | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        try {
          if (user) {
            // Sync user with backend
            await api.auth.syncUser()
          }
          setState({ user, loading: false, error: null })
        } catch (error) {
          setState({ user: null, loading: false, error: error as Error })
        }
      },
      (error) => {
        setState({ user: null, loading: false, error })
      }
    )

    return unsubscribe
  }, [])

  return state
}
