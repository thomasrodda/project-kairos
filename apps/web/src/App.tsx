// apps/web/src/App.tsx
import { useEffect } from 'react'
import { Workspace } from './components/Workspace'
import { PerformanceTest } from './components/PerformanceTest/PerformanceTest'
import { EnhancedEditorProvider } from './contexts/EditorProvider'
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
    <EnhancedEditorProvider>
      <Workspace />
      {/* Show performance monitoring in development */}
      {process.env.NODE_ENV === 'development' && <PerformanceTest />}
    </EnhancedEditorProvider>
  )
}

export default App
