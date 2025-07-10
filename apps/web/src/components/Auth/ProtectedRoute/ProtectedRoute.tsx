import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import './ProtectedRoute.scss'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireWorkspace?: boolean
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireWorkspace = true }) => {
  const { user, backendUser, loading, needsWorkspace } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="protected-route__loading">
        <div className="protected-route__spinner" />
        <p className="protected-route__loading-text">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // If user needs a workspace and we're not already on the workspace creation page
  if (requireWorkspace && needsWorkspace && location.pathname !== '/workspace/new') {
    return <Navigate to="/workspace/new" replace />
  }

  // Wait for backend user data to load
  if (!backendUser && !needsWorkspace) {
    return (
      <div className="protected-route__loading">
        <div className="protected-route__spinner" />
        <p className="protected-route__loading-text">Syncing with server...</p>
      </div>
    )
  }

  return <>{children}</>
}
