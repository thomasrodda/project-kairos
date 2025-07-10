// apps/web/src/App.tsx
import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Workspace } from './components/Workspace'
import { Login } from './components/Auth/Login'
import { Register } from './components/Auth/Register'
import { ProtectedRoute } from './components/Auth/ProtectedRoute'
import { PerformanceTest } from './components/PerformanceTest/PerformanceTest'
import { EditorProvider } from './contexts/EditorContext'
import { AuthProvider } from './contexts/AuthContext'
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
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/workspace"
            element={
              <ProtectedRoute>
                <EditorProvider>
                  <Workspace />
                  {/* Show performance monitoring in development */}
                  {process.env.NODE_ENV === 'development' && <PerformanceTest />}
                </EditorProvider>
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/workspace" replace />} />
          <Route path="*" element={<Navigate to="/workspace" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
