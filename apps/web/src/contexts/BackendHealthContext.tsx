import React, { createContext, useContext, useEffect, useState } from 'react'
import { apiClient } from '../lib/api-client'

interface BackendHealthContextType {
  isBackendAvailable: boolean
  isChecking: boolean
  error: string | null
  checkBackendHealth: () => Promise<void>
}

const BackendHealthContext = createContext<BackendHealthContextType | undefined>(undefined)

export const useBackendHealth = () => {
  const context = useContext(BackendHealthContext)
  if (context === undefined) {
    throw new Error('useBackendHealth must be used within a BackendHealthProvider')
  }
  return context
}

interface BackendHealthProviderProps {
  children: React.ReactNode
}

export const BackendHealthProvider: React.FC<BackendHealthProviderProps> = ({ children }) => {
  const [isBackendAvailable, setIsBackendAvailable] = useState(true)
  const [isChecking, setIsChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkBackendHealth = async () => {
    setIsChecking(true)
    setError(null)

    try {
      const isHealthy = await apiClient.healthCheck()
      setIsBackendAvailable(isHealthy)

      if (!isHealthy) {
        setError('Backend server is not responding. Please ensure the API server is running.')
      }
    } catch (err) {
      setIsBackendAvailable(false)
      setError('Failed to connect to backend server')
      console.error('Backend health check error:', err)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    // Check backend health on mount
    checkBackendHealth()

    // Recheck every 30 seconds if backend was unavailable
    const interval = setInterval(() => {
      if (!isBackendAvailable) {
        checkBackendHealth()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [isBackendAvailable])

  const value: BackendHealthContextType = {
    isBackendAvailable,
    isChecking,
    error,
    checkBackendHealth,
  }

  return <BackendHealthContext.Provider value={value}>{children}</BackendHealthContext.Provider>
}
