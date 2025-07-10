import React from 'react'
import { useBackendHealth } from '../../contexts/BackendHealthContext'
import './BackendHealthCheck.scss'

interface BackendHealthCheckProps {
  children: React.ReactNode
}

export const BackendHealthCheck: React.FC<BackendHealthCheckProps> = ({ children }) => {
  const { isBackendAvailable, isChecking, error, checkBackendHealth } = useBackendHealth()

  // Show loading state during initial check
  if (isChecking && isBackendAvailable) {
    return (
      <div className="backend-health-check__loading">
        <div className="backend-health-check__spinner" />
        <p>Connecting to server...</p>
      </div>
    )
  }

  // Show error state if backend is unavailable
  if (!isBackendAvailable) {
    return (
      <div className="backend-health-check__error">
        <div className="backend-health-check__error-content">
          <h2>Unable to Connect to Server</h2>
          <p>{error || 'The backend server is currently unavailable.'}</p>

          <div className="backend-health-check__instructions">
            <h3>To resolve this issue:</h3>
            <ol>
              <li>Ensure the API server is running</li>
              <li>
                Run <code>yarn dev</code> in the project root
              </li>
              <li>Check that port 3001 is available</li>
            </ol>
          </div>

          <button onClick={checkBackendHealth} className="backend-health-check__retry" disabled={isChecking}>
            {isChecking ? 'Checking...' : 'Retry Connection'}
          </button>
        </div>
      </div>
    )
  }

  // Backend is available, render children
  return <>{children}</>
}
