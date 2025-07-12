// apps/web/src/App.tsx
import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Workspace } from './components/Workspace'
import { Login } from './components/Auth/Login'
import { Register } from './components/Auth/Register'
import { ProtectedRoute } from './components/Auth/ProtectedRoute'
import { WorkspaceCreation } from './components/Auth/WorkspaceCreation'
import { StyleGuide } from './pages/StyleGuide'
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
  const [showStyleGuide, setShowStyleGuide] = useState(false)

  useEffect(() => {
    // Initialize icon performance optimizations on app startup
    initializeIconPerformance()

    // Log app initialization in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Project Kairos initialized with performance optimizations')
    }

    // Add keyboard shortcut for style guide
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault()
        setShowStyleGuide((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <BrowserRouter>
      <BackendHealthProvider>
        <BackendHealthCheck>
          <AuthProvider>
            <ToastProvider>
              {/* Show style guide as overlay when active */}
              {showStyleGuide ? (
                <StyleGuide onClose={() => setShowStyleGuide(false)} />
              ) : (
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
              )}
            </ToastProvider>
          </AuthProvider>
        </BackendHealthCheck>
      </BackendHealthProvider>
    </BrowserRouter>
  )
}

export default App
