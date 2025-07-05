// apps/web/src/App.dev.tsx
// Development version of App with backend integration
import { useEffect, useState } from 'react'
import { Workspace } from './components/Workspace'
import { PerformanceTest } from './components/PerformanceTest/PerformanceTest'
import { EnhancedEditorProvider } from './contexts/EditorProvider'
import { initializeIconPerformance } from '@kairos/ui'
import { useAuth } from './hooks/useAuth'
import { api } from './utils/api/client'

function App() {
  const { user, loading } = useAuth()
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [pageId, setPageId] = useState<string | null>(null)

  useEffect(() => {
    // Initialize icon performance optimizations on app startup
    initializeIconPerformance()

    // Log app initialization in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Project Kairos initialized with performance optimizations')
    }
  }, [])

  // Load or create default workspace and page
  useEffect(() => {
    if (!user || loading) return

    async function initializeWorkspace() {
      try {
        // Get user's workspaces
        const workspaces = await api.workspaces.list()

        let workspace
        if (workspaces.length > 0) {
          workspace = workspaces[0]
        } else {
          // Create default workspace
          workspace = await api.workspaces.create({
            name: 'My Workspace',
            description: 'Default workspace',
          })
        }

        setWorkspaceId(workspace.id)

        // Get pages in workspace
        const pages = await api.pages.listByWorkspace(workspace.id)

        let page
        if (pages.length > 0) {
          page = pages[0]
        } else {
          // Create default page
          page = await api.pages.create({
            workspaceId: workspace.id,
            title: 'Welcome to Kairos',
            isFolder: false,
          })
        }

        setPageId(page.id)
      } catch (error) {
        console.error('Failed to initialize workspace:', error)
      }
    }

    initializeWorkspace()
  }, [user, loading])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Please sign in to continue</h1>
        <p>Authentication UI coming soon...</p>
      </div>
    )
  }

  return (
    <EnhancedEditorProvider workspaceId={workspaceId || undefined} pageId={pageId || undefined}>
      <Workspace />
      {/* Show performance monitoring in development */}
      {process.env.NODE_ENV === 'development' && <PerformanceTest />}
    </EnhancedEditorProvider>
  )
}

export default App
