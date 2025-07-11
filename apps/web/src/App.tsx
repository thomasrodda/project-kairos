// apps/web/src/App.tsx
import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Workspace } from './components/Workspace'
import { Login } from './components/Auth/Login'
import { Register } from './components/Auth/Register'
import { ProtectedRoute } from './components/Auth/ProtectedRoute'
import { WorkspaceCreation } from './components/Auth/WorkspaceCreation'
import { PerformanceTest } from './components/PerformanceTest/PerformanceTest'
import { EditorProvider } from './contexts/EditorContext'
import { AuthProvider } from './contexts/AuthContext'
import { BackendHealthProvider } from './contexts/BackendHealthContext'
import { PageProvider } from './contexts/PageContext'
import { WorkspaceProvider } from './contexts/WorkspaceContext'
import { PagesProvider } from './contexts/PagesContext'
import { ToastProvider } from './hooks/useToast'
import { BackendHealthCheck } from './components/BackendHealthCheck'
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
      <BackendHealthProvider>
        <BackendHealthCheck>
          <AuthProvider>
            <ToastProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected routes */}
                <Route
                  path="/workspace/new"
                  element={
                    <ProtectedRoute requireWorkspace={false}>
                      <WorkspaceCreation />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/workspace/:workspaceId?/*"
                  element={
                    <ProtectedRoute>
                      <WorkspaceProvider>
                        <PagesProvider>
                          <EditorProvider>
                            <PageProvider>
                              <Workspace />
                              {/* Show performance monitoring in development */}
                              {process.env.NODE_ENV === 'development' && <PerformanceTest />}
                            </PageProvider>
                          </EditorProvider>
                        </PagesProvider>
                      </WorkspaceProvider>
                    </ProtectedRoute>
                  }
                />

                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/workspace" replace />} />
                <Route path="*" element={<Navigate to="/workspace" replace />} />
              </Routes>
            </ToastProvider>
          </AuthProvider>
        </BackendHealthCheck>
      </BackendHealthProvider>
    </BrowserRouter>
  )
}

export default App
