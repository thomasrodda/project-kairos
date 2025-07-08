// apps/web/src/App.tsx
import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Workspace } from './components/Workspace'
import { PerformanceTest } from './components/PerformanceTest/PerformanceTest'
import { Login, Signup, ForgotPassword, ProtectedRoute } from './components/Auth'
import { EnhancedEditorProvider } from './contexts/EditorProvider'
import { AuthProvider } from './contexts/AuthContext'
import { WorkspaceProvider, useWorkspace } from './contexts/WorkspaceContext'
import { initializeIconPerformance } from '@kairos/ui'

// Error boundary for workspace operations
class WorkspaceErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Workspace error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <h1>Something went wrong</h1>
          <p>We encountered an error loading your workspace.</p>
          <details style={{ marginTop: '1rem', maxWidth: '500px' }}>
            <summary>Error details</summary>
            <pre style={{ textAlign: 'left', overflow: 'auto' }}>{this.state.error?.message || 'Unknown error'}</pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '2rem',
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Wrapper component that connects workspace context to UI components
function WorkspaceWrapper() {
  const { currentWorkspace, currentPageId, selectPage, loading, error, refreshWorkspaces } = useWorkspace()

  // Show loading state while workspace is being loaded
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div>Loading workspace...</div>
      </div>
    )
  }

  // Show error state with retry option
  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <h2>Unable to load workspace</h2>
        <p style={{ marginTop: '1rem', color: '#666' }}>{error.message || 'An unexpected error occurred'}</p>
        <button
          onClick={() => refreshWorkspaces()}
          style={{
            marginTop: '2rem',
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Try Again
        </button>
      </div>
    )
  }

  // If no workspace is available (shouldn't happen with auto-creation), show error
  if (!currentWorkspace) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <h2>No workspace available</h2>
        <p style={{ marginTop: '1rem', color: '#666' }}>We couldn&apos;t find or create a workspace for your account.</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '2rem',
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Reload Page
        </button>
      </div>
    )
  }

  return (
    <EnhancedEditorProvider
      key={`${currentWorkspace.id}-${currentPageId || 'no-page'}`}
      workspaceId={currentWorkspace.id}
      pageId={currentPageId || undefined}
    >
      <Workspace workspaceId={currentWorkspace.id} currentPageId={currentPageId || undefined} onPageSelect={selectPage} />
      {/* Show performance monitoring in development */}
      {process.env.NODE_ENV === 'development' && <PerformanceTest />}
    </EnhancedEditorProvider>
  )
}

function App() {
  useEffect(() => {
    // Initialize icon performance optimizations on app startup
    initializeIconPerformance()

    // Log app initialization in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Project Kairos initialized with performance optimizations')
    }
  }, [])

  return (
    <BrowserRouter>
      <AuthProvider>
        <WorkspaceProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <WorkspaceErrorBoundary>
                    <WorkspaceWrapper />
                  </WorkspaceErrorBoundary>
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </WorkspaceProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
