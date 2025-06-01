// apps/web/src/components/Workspace/Workspace.tsx
// Main application layout container that combines the navigation sidebar and content editor.
// Provides the foundational layout structure with sidebar navigation on the left and editor content on the right.
//
// Features:
// - Simple flex-based layout (sidebar + editor)
// - No internal state - acts as pure layout container
// - Responsive design foundation for the entire app
// - Semantic structure with proper landmarks for accessibility
//
// Props: None (pure layout component)
// State: None (stateless container)

import { Sidebar } from '../Sidebar'
import { Editor } from '../Editor'
import './Workspace.scss'

export function Workspace() {
  // This is a pure layout component with no state or complex logic
  // It simply combines the Sidebar and Editor in a flex container

  return (
    <div className="workspace">
      {/* Left sidebar - Navigation, file tree, and workspace controls */}
      <Sidebar />

      {/* Main content area - Block-based editor for pages */}
      <Editor />
    </div>
  )
}
