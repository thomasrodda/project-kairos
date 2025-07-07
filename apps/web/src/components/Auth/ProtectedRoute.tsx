import { Navigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuthContext()
  const location = useLocation()

  if (loading) {
    // You could render a loading spinner here
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
        data-testid="loading-container"
      >
        Loading...
      </div>
    )
  }

  if (!user) {
    // Redirect to login page but save the location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
