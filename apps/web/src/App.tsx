// apps/web/src/App.tsx
import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Workspace } from './components/Workspace'
import { PerformanceTest } from './components/PerformanceTest/PerformanceTest'
import { Login, Signup, ForgotPassword, ProtectedRoute } from './components/Auth'
import { EnhancedEditorProvider } from './contexts/EditorProvider'
import { AuthProvider } from './contexts/AuthContext'
import { WorkspaceProvider } from './contexts/WorkspaceContext'
import { initializeIconPerformance } from '@kairos/ui'

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
                  <EnhancedEditorProvider>
                    <Workspace />
                    {/* Show performance monitoring in development */}
                    {process.env.NODE_ENV === 'development' && <PerformanceTest />}
                  </EnhancedEditorProvider>
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
