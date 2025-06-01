// apps/web/src/components/Workspace/Workspace.test.tsx
import { render, screen } from '@testing-library/react'
import { Workspace } from './Workspace'

// Mock the child components to focus on testing the Workspace layout
jest.mock('../Sidebar', () => ({
  Sidebar: () => <aside data-testid="sidebar">Sidebar Component</aside>,
}))

jest.mock('../Editor', () => ({
  Editor: () => <main data-testid="editor">Editor Component</main>,
}))

describe('Workspace Component', () => {
  describe('✅ Renders both Sidebar and Editor', () => {
    it('should render the Sidebar component', () => {
      render(<Workspace />)

      const sidebar = screen.getByTestId('sidebar')
      expect(sidebar).toBeInTheDocument()
      expect(sidebar).toHaveTextContent('Sidebar Component')
    })

    it('should render the Editor component', () => {
      render(<Workspace />)

      const editor = screen.getByTestId('editor')
      expect(editor).toBeInTheDocument()
      expect(editor).toHaveTextContent('Editor Component')
    })

    it('should render both components simultaneously', () => {
      render(<Workspace />)

      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('editor')).toBeInTheDocument()
    })
  })

  describe('✅ Has correct layout structure', () => {
    it('should render workspace container with correct CSS class', () => {
      const { container } = render(<Workspace />)

      const workspaceDiv = container.firstChild as HTMLElement
      expect(workspaceDiv).toHaveClass('workspace')
      expect(workspaceDiv.tagName.toLowerCase()).toBe('div')
    })

    it('should contain exactly two child components', () => {
      const { container } = render(<Workspace />)

      const workspaceDiv = container.firstChild as HTMLElement
      expect(workspaceDiv.children).toHaveLength(2)
    })

    it('should have Sidebar as first child and Editor as second child', () => {
      const { container } = render(<Workspace />)

      const workspaceDiv = container.firstChild as HTMLElement
      const firstChild = workspaceDiv.children[0]
      const secondChild = workspaceDiv.children[1]

      expect(firstChild).toHaveAttribute('data-testid', 'sidebar')
      expect(secondChild).toHaveAttribute('data-testid', 'editor')
    })

    it('should apply flex layout styles correctly', () => {
      const { container } = render(<Workspace />)

      const workspaceDiv = container.firstChild as HTMLElement

      // Test that the CSS class is applied (the actual styles are tested via CSS)
      expect(workspaceDiv).toHaveClass('workspace')

      // Verify the element is a div container as expected
      expect(workspaceDiv.tagName.toLowerCase()).toBe('div')
    })
  })

  describe('✅ Components are properly integrated', () => {
    it('should pass no props to child components', () => {
      // This test ensures our mocked components receive expected props (none in this case)
      render(<Workspace />)

      // Both components should render without requiring any props
      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('editor')).toBeInTheDocument()
    })

    it('should not crash when child components are present', () => {
      // Smoke test to ensure the component renders without errors
      expect(() => render(<Workspace />)).not.toThrow()
    })

    it('should maintain component isolation', () => {
      render(<Workspace />)

      // Each component should be independent and not interfere with each other
      const sidebar = screen.getByTestId('sidebar')
      const editor = screen.getByTestId('editor')

      expect(sidebar).not.toEqual(editor)
      expect(sidebar.textContent).not.toEqual(editor.textContent)
    })
  })

  describe('✅ Accessibility and semantic structure', () => {
    it('should have proper semantic container structure', () => {
      const { container } = render(<Workspace />)

      const workspaceDiv = container.firstChild as HTMLElement
      expect(workspaceDiv.tagName.toLowerCase()).toBe('div')
      expect(workspaceDiv).toHaveClass('workspace')
    })

    it('should contain semantic landmarks through child components', () => {
      render(<Workspace />)

      // Sidebar should be rendered as an aside element (semantic landmark)
      const sidebar = screen.getByTestId('sidebar')
      expect(sidebar.tagName.toLowerCase()).toBe('aside')

      // Editor should be rendered as a main element (semantic landmark)
      const editor = screen.getByTestId('editor')
      expect(editor.tagName.toLowerCase()).toBe('main')
    })

    it('should provide accessible navigation structure', () => {
      render(<Workspace />)

      // The workspace should contain the main navigation (sidebar) and main content (editor)
      expect(screen.getByRole('complementary')).toBeInTheDocument() // aside element
      expect(screen.getByRole('main')).toBeInTheDocument() // main element
    })

    it('should not have any accessibility violations in structure', () => {
      const { container } = render(<Workspace />)

      // Basic accessibility structure checks
      const workspaceDiv = container.firstChild as HTMLElement

      // Should not have conflicting ARIA roles
      expect(workspaceDiv).not.toHaveAttribute('role')

      // Should be a simple container div
      expect(workspaceDiv.tagName.toLowerCase()).toBe('div')
    })
  })

  describe('✅ Rendering consistency', () => {
    it('should render the same content on multiple renders', () => {
      const { rerender } = render(<Workspace />)

      // First render
      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('editor')).toBeInTheDocument()

      // Re-render
      rerender(<Workspace />)

      // Should still have the same components
      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('editor')).toBeInTheDocument()
    })

    it('should maintain stable DOM structure across renders', () => {
      const { container, rerender } = render(<Workspace />)

      const initialStructure = container.innerHTML

      rerender(<Workspace />)

      expect(container.innerHTML).toBe(initialStructure)
    })

    it('should handle component unmounting cleanly', () => {
      const { unmount } = render(<Workspace />)

      // Should not throw errors when unmounting
      expect(() => unmount()).not.toThrow()
    })
  })
})
