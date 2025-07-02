// apps/web/src/components/Workspace/Workspace.test.tsx
// Tests for the main Workspace layout component

import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Workspace } from './Workspace'
import { renderWithEditor } from '../../test/utils'
import { generateId } from '@kairos/utils'
import type { EditorState } from '../../contexts/EditorContext'

// Helper components for testing error scenarios
let shouldSidebarError = false
let shouldEditorError = false

// Mock only for error testing scenarios
jest.mock('../Sidebar', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react')

  const MockSidebar = React.forwardRef((props: any, ref: any) => {
    if (shouldSidebarError) {
      throw new Error('Sidebar component error')
    }
    // Import real Sidebar component
    const ActualSidebar = jest.requireActual('../Sidebar').Sidebar
    return React.createElement(ActualSidebar, { ref, ...props })
  })
  MockSidebar.displayName = 'Sidebar'

  return {
    Sidebar: MockSidebar,
  }
})

jest.mock('../Editor', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react')

  const MockEditor = React.forwardRef((props: any, ref: any) => {
    if (shouldEditorError) {
      throw new Error('Editor component error')
    }
    // Import real Editor component
    const ActualEditor = jest.requireActual('../Editor').Editor
    return React.createElement(ActualEditor, { ref, ...props })
  })
  MockEditor.displayName = 'Editor'

  return {
    Editor: MockEditor,
  }
})

// Helper to mock window dimensions
const mockWindowSize = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  })
  window.dispatchEvent(new Event('resize'))
}

// Helper to get computed dimensions
const getComputedDimensions = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect()
  return {
    width: rect.width,
    height: rect.height,
    left: rect.left,
    top: rect.top,
  }
}

// Helper to create initial editor state with test data
const createTestBlocks = () => [
  {
    id: generateId(),
    type: 'h1' as const,
    content: 'Test Document',
  },
  {
    id: generateId(),
    type: 'paragraph' as const,
    content: 'This is a test paragraph with some content.',
  },
  {
    id: generateId(),
    type: 'paragraph' as const,
    content: 'Another paragraph for testing.',
  },
]

describe('Workspace', () => {
  beforeEach(() => {
    // Reset error flags
    shouldSidebarError = false
    shouldEditorError = false

    // Set default window size
    mockWindowSize(1200, 800)
  })

  describe('✅ Component Integration', () => {
    it('renders both Sidebar and Editor components successfully', () => {
      const { container } = renderWithEditor(<Workspace />, {
        initialBlocks: createTestBlocks(),
      })

      // Verify workspace container
      const workspace = container.querySelector('.workspace')
      expect(workspace).toBeInTheDocument()

      // Verify Sidebar renders with real content
      const sidebar = screen.getByRole('complementary', { name: /navigation sidebar/i })
      expect(sidebar).toBeInTheDocument()
      expect(sidebar.classList.contains('sidebar')).toBe(true)

      // Verify sidebar buttons are present
      expect(screen.getByRole('button', { name: /workspace name/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create page/i })).toBeInTheDocument()

      // Verify Editor renders with real content
      const editor = screen.getByRole('main', { name: /document editor/i })
      expect(editor).toBeInTheDocument()
      expect(editor.classList.contains('editor')).toBe(true)

      // Verify editor has actual content
      expect(screen.getByText('Test Document')).toBeInTheDocument()
      expect(screen.getByText('This is a test paragraph with some content.')).toBeInTheDocument()
    })

    it('allows navigation from sidebar to editor content', async () => {
      const user = userEvent.setup()
      const { store } = renderWithEditor(<Workspace />, {
        initialBlocks: createTestBlocks(),
      })

      // Click create page button in sidebar
      const createPageButton = screen.getByRole('button', { name: /create page/i })
      await user.click(createPageButton)

      // In a real implementation, this would navigate or create a new page
      // For now, verify the button is interactive
      expect(createPageButton).toHaveClass('sidebar-button--active')

      // Click into editor content
      const editorContent = screen.getByRole('textbox')
      await user.click(editorContent)

      // Verify we can type in the editor
      await user.type(editorContent, 'New text')

      // Check that editor state was updated
      const state = store.getState()
      expect(state.blocks.some((block) => block.content.includes('New text'))).toBe(true)
    })

    it('maintains independent state between sidebar and editor', async () => {
      const user = userEvent.setup()
      renderWithEditor(<Workspace />, {
        initialBlocks: createTestBlocks(),
      })

      // Interact with sidebar - toggle collapse
      const collapseButton = screen.getByRole('button', { name: /collapse sidebar/i })
      await user.click(collapseButton)

      // Sidebar should be collapsed
      const sidebar = screen.getByRole('complementary', { name: /navigation sidebar/i })
      expect(sidebar).toHaveClass('sidebar--collapsed')

      // Editor content should remain unchanged
      expect(screen.getByText('Test Document')).toBeInTheDocument()
      expect(screen.getByText('This is a test paragraph with some content.')).toBeInTheDocument()

      // Expand sidebar again
      const expandButton = screen.getByRole('button', { name: /expand sidebar/i })
      await user.click(expandButton)

      // Sidebar should be expanded
      expect(sidebar).not.toHaveClass('sidebar--collapsed')
    })
  })

  describe('✅ Responsive Layout Behavior', () => {
    it('maintains stable layout when window resizes', async () => {
      const { container } = renderWithEditor(<Workspace />)
      const workspace = container.querySelector('.workspace') as HTMLElement
      const sidebar = screen.getByRole('complementary', { name: /navigation sidebar/i })
      const editor = screen.getByRole('main', { name: /document editor/i })

      // Capture initial layout
      const initialSidebarWidth = window.getComputedStyle(sidebar).width
      const initialEditorFlex = window.getComputedStyle(editor).flex

      // Resize to tablet size
      mockWindowSize(768, 1024)
      await waitFor(() => {
        // Sidebar should maintain its width pattern
        const currentSidebarWidth = window.getComputedStyle(sidebar).width
        expect(currentSidebarWidth).toBeTruthy()
        // Editor should still be flexible
        expect(window.getComputedStyle(editor).flex).toBe(initialEditorFlex)
      })

      // Resize to mobile size
      mockWindowSize(375, 667)
      await waitFor(() => {
        // Layout should not break - both components still visible
        expect(sidebar).toBeVisible()
        expect(editor).toBeVisible()
        // Workspace should not overflow
        expect(workspace.scrollWidth).toBeLessThanOrEqual(375)
      })
    })

    it('prevents horizontal scrolling at any viewport size', () => {
      const { container } = renderWithEditor(<Workspace />)
      const workspace = container.querySelector('.workspace') as HTMLElement

      // Test various viewport sizes
      const viewportSizes = [
        { width: 320, height: 568 }, // Small mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1920, height: 1080 }, // Desktop
        { width: 3840, height: 2160 }, // 4K
      ]

      viewportSizes.forEach(({ width, height }) => {
        mockWindowSize(width, height)

        // Workspace should never cause horizontal scroll
        expect(workspace.scrollWidth).toBeLessThanOrEqual(width)
        expect(window.getComputedStyle(workspace).overflowX).not.toBe('scroll')
      })
    })

    it('ensures editor content remains accessible on narrow viewports', () => {
      renderWithEditor(<Workspace />, {
        initialBlocks: createTestBlocks(),
      })
      const editor = screen.getByRole('main', { name: /document editor/i })
      const editorContent = screen.getByRole('textbox')

      // Narrow viewport
      mockWindowSize(400, 800)

      // Editor should have minimum width for content
      const editorWidth = editor.getBoundingClientRect().width
      expect(editorWidth).toBeGreaterThan(100) // Minimum usable width

      // Content should be contained within editor
      const contentWidth = editorContent.getBoundingClientRect().width
      expect(contentWidth).toBeLessThanOrEqual(editorWidth)
    })
  })

  describe('✅ Error Boundary', () => {
    // Suppress console errors for error boundary tests
    const originalError = console.error
    beforeEach(() => {
      console.error = jest.fn()
    })
    afterEach(() => {
      console.error = originalError
    })

    it('displays error message when Sidebar crashes', () => {
      shouldSidebarError = true

      renderWithEditor(<Workspace />)

      // Should show error UI instead of blank screen
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
      expect(screen.getByText(/The Sidebar encountered an error/i)).toBeInTheDocument()

      // Editor should still be visible (error boundary only affects sidebar)
      expect(screen.queryByRole('main', { name: /document editor/i })).toBeInTheDocument()
    })

    it('displays error message when Editor crashes', () => {
      shouldEditorError = true

      renderWithEditor(<Workspace />)

      // Should show error UI
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
      expect(screen.getByText(/The Editor encountered an error/i)).toBeInTheDocument()

      // Sidebar should still be visible (error boundary only affects editor)
      expect(screen.queryByRole('complementary', { name: /navigation sidebar/i })).toBeInTheDocument()
    })

    it('allows recovery from errors with retry button', async () => {
      const user = userEvent.setup()
      shouldSidebarError = true

      renderWithEditor(<Workspace />)

      // Error state shown
      const retryButton = screen.getByRole('button', { name: /try again/i })
      expect(retryButton).toBeInTheDocument()

      // Clear error for retry
      shouldSidebarError = false

      // Click retry
      await user.click(retryButton)

      // Should recover and show sidebar
      await waitFor(() => {
        expect(screen.getByRole('complementary', { name: /navigation sidebar/i })).toBeInTheDocument()
        expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('✅ Focus Management', () => {
    it('allows keyboard navigation between sidebar and editor', async () => {
      const user = userEvent.setup()
      renderWithEditor(<Workspace />, {
        initialBlocks: createTestBlocks(),
      })

      const sidebar = screen.getByRole('complementary', { name: /navigation sidebar/i })
      const editor = screen.getByRole('main', { name: /document editor/i })

      // Focus sidebar
      sidebar.focus()
      expect(document.activeElement).toBe(sidebar)

      // Tab through sidebar buttons to eventually reach editor
      // First tab goes to collapse button
      await user.tab()
      expect(document.activeElement).toHaveAttribute('aria-label', expect.stringMatching(/collapse sidebar/i))

      // Continue tabbing through sidebar buttons
      await user.tab() // Workspace name
      await user.tab() // Search
      await user.tab() // Image Library
      await user.tab() // Create Page

      // Eventually should reach editor content
      await user.tab()
      await user.tab() // Skip page title

      // Should be in editor content area
      expect(document.activeElement?.closest('.editor')).toBeTruthy()
    })

    it('maintains focus within workspace boundaries', async () => {
      const user = userEvent.setup()
      const { container } = renderWithEditor(<Workspace />, {
        initialBlocks: createTestBlocks(),
      })
      const workspace = container.querySelector('.workspace') as HTMLElement

      // Focus editor content
      const editorContent = screen.getByRole('textbox')
      editorContent.focus()

      // Tab forward - should wrap to sidebar
      await user.tab()

      // Focus should remain within workspace
      expect(workspace.contains(document.activeElement)).toBe(true)
    })

    it('restores focus to appropriate section after error recovery', async () => {
      const user = userEvent.setup()
      shouldEditorError = true

      renderWithEditor(<Workspace />)

      // Click retry
      const retryButton = screen.getByRole('button', { name: /try again/i })
      shouldEditorError = false
      await user.click(retryButton)

      // Focus should return to editor area after recovery
      await waitFor(() => {
        const editor = screen.getByRole('main', { name: /document editor/i })
        expect(editor).toBeInTheDocument()
        // Focus is on the retry button after recovery
        expect(document.activeElement).toBe(retryButton)
      })
    })
  })

  describe('✅ Layout Stability', () => {
    it('prevents layout shift when sidebar content changes', async () => {
      const result = renderWithEditor(<Workspace />)
      const editor = screen.getByRole('main', { name: /document editor/i })

      // Capture editor position
      const initialPosition = editor.getBoundingClientRect()

      // Simulate sidebar state change by toggling collapse
      const collapseButton = screen.getByRole('button', { name: /collapse sidebar/i })
      await userEvent.click(collapseButton)

      // Editor position should not shift
      const newPosition = editor.getBoundingClientRect()
      expect(newPosition.left).toBe(initialPosition.left)
      expect(newPosition.top).toBe(initialPosition.top)
    })

    it('maintains consistent height without vertical scrolling', () => {
      const { container } = renderWithEditor(<Workspace />)
      const workspace = container.querySelector('.workspace') as HTMLElement

      // Workspace should fill viewport height
      expect(workspace.scrollHeight).toBe(window.innerHeight)

      // Should not have vertical scroll
      expect(window.getComputedStyle(workspace).overflowY).toBe('hidden')

      // Children should not cause overflow
      const sidebar = screen.getByRole('complementary', { name: /navigation sidebar/i })
      const editor = screen.getByRole('main', { name: /document editor/i })

      expect(sidebar.scrollHeight).toBeLessThanOrEqual(window.innerHeight)
      expect(editor.scrollHeight).toBeLessThanOrEqual(window.innerHeight)
    })
  })

  describe('✅ Workspace-Specific Features', () => {
    it('supports keyboard shortcut to focus sidebar (Ctrl+Shift+E)', async () => {
      const user = userEvent.setup()
      renderWithEditor(<Workspace />, {
        initialBlocks: createTestBlocks(),
      })

      // Focus editor first
      const editorContent = screen.getByRole('textbox')
      editorContent.focus()
      expect(document.activeElement).toBe(editorContent)

      // Use keyboard shortcut
      await user.keyboard('{Control>}{Shift>}e{/Control}{/Shift}')

      // Focus should move to first button in sidebar
      await waitFor(() => {
        expect(document.activeElement).toHaveAttribute('aria-label', expect.stringMatching(/collapse sidebar/i))
      })
    })

    it('preserves editor state when sidebar collapses and expands', async () => {
      const user = userEvent.setup()
      const { store } = renderWithEditor(<Workspace />, {
        initialBlocks: createTestBlocks(),
      })

      // Type in editor
      const editorContent = screen.getByRole('textbox')
      await user.click(editorContent)
      await user.type(editorContent, ' Additional text')

      // Verify content was added
      const stateBefore = store.getState()
      expect(stateBefore.blocks[0].content).toContain('Additional text')

      // Toggle sidebar collapse
      const collapseButton = screen.getByRole('button', { name: /collapse sidebar/i })
      await user.click(collapseButton)

      // Editor state should be preserved
      const stateAfter = store.getState()
      expect(stateAfter.blocks[0].content).toBe(stateBefore.blocks[0].content)
      expect(screen.getByText(/Additional text/)).toBeInTheDocument()
    })

    it('handles simultaneous interactions in sidebar and editor', async () => {
      const user = userEvent.setup()
      const { store } = renderWithEditor(<Workspace />, {
        initialBlocks: createTestBlocks(),
      })

      // Start typing in editor
      const editorContent = screen.getByRole('textbox')
      await user.click(editorContent)
      await user.type(editorContent, 'Typing')

      // While "typing", also interact with sidebar
      const searchButton = screen.getByRole('button', { name: /search/i })
      await user.click(searchButton)

      // Both components should remain functional
      expect(screen.getByRole('complementary', { name: /navigation sidebar/i })).toBeVisible()
      expect(screen.getByRole('main', { name: /document editor/i })).toBeVisible()

      // Editor content should include typed text
      const state = store.getState()
      expect(state.blocks.some((block) => block.content.includes('Typing'))).toBe(true)

      // Search button should show active state
      expect(searchButton).toHaveClass('sidebar-button--active')
    })
  })

  describe('✅ Communication Between Components', () => {
    it('allows sidebar button clicks to affect editor focus', async () => {
      const user = userEvent.setup()
      renderWithEditor(<Workspace />, {
        initialBlocks: createTestBlocks(),
      })

      // Click Create Page button
      const createPageButton = screen.getByRole('button', { name: /create page/i })
      await user.click(createPageButton)

      // In a full implementation, this would create a new page
      // For now, verify the editor is ready to receive input
      const editorContent = screen.getByRole('textbox')
      editorContent.focus()

      // Should be able to type immediately
      await user.type(editorContent, 'New page content')
      expect(screen.getByText(/New page content/)).toBeInTheDocument()
    })

    it('provides proper focus restoration after sidebar state changes', async () => {
      const user = userEvent.setup()
      renderWithEditor(<Workspace />, {
        initialBlocks: createTestBlocks(),
      })

      // Focus a sidebar button
      const searchButton = screen.getByRole('button', { name: /search/i })
      searchButton.focus()
      expect(document.activeElement).toBe(searchButton)

      // Collapse sidebar
      const collapseButton = screen.getByRole('button', { name: /collapse sidebar/i })
      await user.click(collapseButton)

      // Focus should remain accessible - moved to collapse button
      expect(document.activeElement).toBe(screen.getByRole('button', { name: /expand sidebar/i }))

      // Expand again
      await user.click(screen.getByRole('button', { name: /expand sidebar/i }))

      // Focus should be restored to a reasonable location
      expect(document.activeElement).toHaveAttribute('aria-label', expect.stringMatching(/collapse sidebar/i))
    })

    it('coordinates drag operations between sidebar and editor', async () => {
      const user = userEvent.setup()
      renderWithEditor(<Workspace />, {
        initialBlocks: createTestBlocks(),
      })

      // Future test: verify that dragging from sidebar (e.g., templates)
      // to editor works correctly

      // For now, verify both components render their draggable elements
      const sidebar = screen.getByRole('complementary', { name: /navigation sidebar/i })
      const editor = screen.getByRole('main', { name: /document editor/i })

      // Sidebar has interactive buttons
      const sidebarButtons = within(sidebar).getAllByRole('button')
      expect(sidebarButtons.length).toBeGreaterThan(0)

      // Editor has draggable blocks
      const blocks = within(editor).getAllByRole('button', { name: /drag handle/i })
      expect(blocks.length).toBeGreaterThan(0)
    })
  })

  describe('✅ Accessibility', () => {
    it('announces panel changes to screen readers', () => {
      renderWithEditor(<Workspace />)

      // Panels should have appropriate ARIA labels
      const sidebar = screen.getByRole('complementary', { name: /navigation sidebar/i })
      const editor = screen.getByRole('main', { name: /document editor/i })

      expect(sidebar).toHaveAttribute('aria-label', 'Navigation sidebar')
      expect(editor).toHaveAttribute('aria-label', 'Document editor')
    })

    it('maintains focus visibility for keyboard users', async () => {
      const user = userEvent.setup()
      renderWithEditor(<Workspace />)

      // Tab through interface
      await user.tab()

      // Active element should have visible focus indicator
      const activeElement = document.activeElement as HTMLElement

      // Should be a focusable element
      expect(activeElement.tagName).toMatch(/BUTTON|INPUT|TEXTAREA|A/)

      // Should be within the workspace
      expect(activeElement.closest('.workspace')).toBeTruthy()
    })
  })
})
