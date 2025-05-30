// apps/web/src/App.tsx
import { useEffect } from 'react'
import { Workspace } from './components/Workspace'
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

  return <Workspace />
}

export default App
