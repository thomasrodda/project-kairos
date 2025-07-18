// apps/web/src/components/Workspace/Workspace.tsx
// Main application layout container that combines the navigation sidebar and content editor.
// Provides the foundational layout structure with sidebar navigation on the left and editor content on the right.
//
// Features:
// - Flex-based responsive layout (sidebar + editor)
// - Error boundaries for graceful component failure handling
// - Focus management and keyboard navigation between panels
// - Layout stability guarantees (no shifts or reflows)
// - Semantic structure with proper landmarks for accessibility
//
// Props: None (pure layout component)
// State: Error boundary state for each panel

import { Component, ReactNode, useEffect, useRef, forwardRef } from 'react'
import { Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom'
import { Sidebar } from '../Sidebar'
import { Editor } from '../Editor'
import { usePageContext } from '../../contexts/PageContext'
import { usePagesContext } from '../../contexts/PagesContext'
import { useEditor } from '../../contexts/EditorContext'
import './Workspace.scss'

// Error boundary for individual panels
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback: (error: Error, retry: () => void) => ReactNode
  onError?: (error: Error) => void
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error)
  }

  retry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback(this.state.error, this.retry)
    }

    return this.props.children
  }
}

// Error fallback component
function ErrorFallback({ error, retry, component }: { error: Error; retry: () => void; component: string }) {
  const retryButtonRef = useRef<HTMLButtonElement>(null)

  // Focus retry button on mount
  useEffect(() => {
    retryButtonRef.current?.focus()
  }, [])

  return (
    <div className="workspace__error" role="alert">
      <h2>Something went wrong</h2>
      <p>The {component} encountered an error.</p>
      <details style={{ whiteSpace: 'pre-wrap' }}>
        <summary>Error details</summary>
        {error.message}
      </details>
      <button ref={retryButtonRef} onClick={retry} className="workspace__error-retry">
        Try again
      </button>
    </div>
  )
}

export function Workspace() {
  const workspaceRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLElement>(null)
  const editorRef = useRef<HTMLElement>(null)

  // Handle keyboard shortcuts for panel switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + E to focus sidebar
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'e') {
        e.preventDefault()
        // Focus first focusable element in sidebar
        const firstButton = sidebarRef.current?.querySelector('button')
        if (firstButton instanceof HTMLElement) {
          firstButton.focus()
        } else {
          sidebarRef.current?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="workspace" ref={workspaceRef}>
      {/* Left sidebar with error boundary */}
      <ErrorBoundary
        fallback={(error, retry) => (
          <aside className="workspace__panel workspace__panel--sidebar">
            <ErrorFallback error={error} retry={retry} component="Sidebar" />
          </aside>
        )}
      >
        <Sidebar ref={sidebarRef} aria-label="Navigation sidebar" />
      </ErrorBoundary>

      {/* Main content area with error boundary */}
      <ErrorBoundary
        fallback={(error, retry) => (
          <main className="workspace__panel workspace__panel--editor">
            <ErrorFallback error={error} retry={retry} component="Editor" />
          </main>
        )}
      >
        <Routes>
          <Route path="page/:pageId" element={<PageEditor ref={editorRef} />} />
          <Route path="*" element={<NoPageSelected />} />
        </Routes>
      </ErrorBoundary>
    </div>
  )
}

// Component for editing a specific page
const PageEditor = forwardRef<HTMLElement>((props, ref) => {
  const { pageId } = useParams<{ pageId: string }>()
  const { loadPage } = usePageContext()
  const { setSelectedPageId, getPageById } = usePagesContext()
  const { dispatch } = useEditor()

  useEffect(() => {
    if (pageId) {
      loadPage(pageId)
      setSelectedPageId(pageId)
    }
  }, [pageId, loadPage, setSelectedPageId])

  // Watch for title changes from sidebar
  const currentPage = getPageById(pageId || '')
  useEffect(() => {
    if (currentPage?.title) {
      dispatch({ type: 'UPDATE_TITLE', title: currentPage.title })
    }
  }, [currentPage?.title, dispatch])

  return <Editor ref={ref} aria-label="Document editor" />
})

PageEditor.displayName = 'PageEditor'

// Component shown when no page is selected
function NoPageSelected() {
  const { pages } = usePagesContext()
  const navigate = useNavigate()
  const { workspaceId } = useParams<{ workspaceId: string }>()

  useEffect(() => {
    // If there are pages, navigate to the first one
    if (pages.length > 0 && workspaceId) {
      const firstPage = pages.find((p) => !p.isFolder) || pages[0]
      if (firstPage && !firstPage.isFolder) {
        navigate(`/workspace/${workspaceId}/page/${firstPage.id}`)
      }
    }
  }, [pages, workspaceId, navigate])

  return (
    <div className="workspace__no-page">
      <h2>No page selected</h2>
      <p>Select a page from the sidebar or create a new one to get started.</p>
    </div>
  )
}
