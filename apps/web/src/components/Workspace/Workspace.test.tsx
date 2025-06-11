// apps/web/src/components/Workspace/Workspace.test.tsx
// Tests for the main Workspace layout component

import { render, screen } from '@testing-library/react'
import { Workspace } from './Workspace'

// Mock the child components
jest.mock('../Sidebar', () => ({
  Sidebar: () => <aside data-testid="sidebar">Sidebar Component</aside>,
}))

jest.mock('../Editor', () => ({
  Editor: () => <main data-testid="editor">Editor Component</main>,
}))

// Mock EditorProvider since Editor component requires it
jest.mock('../../contexts/EditorContext', () => ({
  EditorProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useEditorState: jest.fn(),
  useEditorDispatch: jest.fn(),
}))

describe('Workspace', () => {
  describe('✅ Core Functionality', () => {
    it('renders workspace container', () => {
      const { container } = render(<Workspace />)
      const workspace = container.querySelector('.workspace')
      expect(workspace).toBeInTheDocument()
    })

    it('renders both Sidebar and Editor components', () => {
      render(<Workspace />)

      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('editor')).toBeInTheDocument()
    })

    it('renders components in correct order', () => {
      const { container } = render(<Workspace />)
      const workspace = container.querySelector('.workspace')
      const children = workspace?.children

      expect(children).toHaveLength(2)
      expect(children?.[0]).toHaveAttribute('data-testid', 'sidebar')
      expect(children?.[1]).toHaveAttribute('data-testid', 'editor')
    })
  })

  describe('✅ Layout Structure', () => {
    it('applies workspace class for styling', () => {
      const { container } = render(<Workspace />)
      const workspace = container.querySelector('.workspace')
      expect(workspace).toHaveClass('workspace')
    })

    it('uses div as container element', () => {
      const { container } = render(<Workspace />)
      const workspace = container.querySelector('.workspace')
      expect(workspace?.tagName).toBe('DIV')
    })

    it('contains sidebar and editor as direct children', () => {
      const { container } = render(<Workspace />)
      const workspace = container.querySelector('.workspace')

      expect(workspace?.children).toHaveLength(2)
      expect(workspace?.querySelector('[data-testid="sidebar"]')).toBeInTheDocument()
      expect(workspace?.querySelector('[data-testid="editor"]')).toBeInTheDocument()
    })

    it('maintains proper component hierarchy', () => {
      const { container } = render(<Workspace />)

      // Workspace should be the root
      const workspace = container.firstChild
      expect(workspace).toHaveClass('workspace')

      // Sidebar should be first child
      const sidebar = workspace?.firstChild
      expect(sidebar).toHaveAttribute('data-testid', 'sidebar')

      // Editor should be last child
      const editor = workspace?.lastChild
      expect(editor).toHaveAttribute('data-testid', 'editor')
    })
  })

  describe('✅ Integration', () => {
    it('provides layout for child components', () => {
      const { container } = render(<Workspace />)

      // Workspace should act as flex container (verified by CSS)
      const workspace = container.querySelector('.workspace')
      expect(workspace).toBeInTheDocument()

      // Both children should be present and properly positioned
      const sidebar = screen.getByTestId('sidebar')
      const editor = screen.getByTestId('editor')

      expect(sidebar.parentElement).toBe(workspace)
      expect(editor.parentElement).toBe(workspace)
    })

    it('renders without props', () => {
      // Workspace is a pure layout component with no props
      expect(() => render(<Workspace />)).not.toThrow()
    })

    it('has no internal state', () => {
      // This test verifies that Workspace is a pure presentational component
      const { rerender } = render(<Workspace />)

      const firstRender = screen.getByTestId('sidebar').parentElement?.innerHTML

      // Re-render should produce identical output
      rerender(<Workspace />)

      const secondRender = screen.getByTestId('sidebar').parentElement?.innerHTML
      expect(firstRender).toBe(secondRender)
    })
  })

  describe('✅ Accessibility', () => {
    it('provides semantic structure with proper landmarks', () => {
      render(<Workspace />)

      // Sidebar should be an aside element (complementary landmark)
      const sidebar = screen.getByTestId('sidebar')
      expect(sidebar.tagName).toBe('ASIDE')

      // Editor should be a main element (main landmark)
      const editor = screen.getByTestId('editor')
      expect(editor.tagName).toBe('MAIN')
    })

    it('maintains logical document structure', () => {
      const { container } = render(<Workspace />)

      // Should have exactly one main landmark
      const mains = container.querySelectorAll('main')
      expect(mains).toHaveLength(1)

      // Should have exactly one aside landmark
      const asides = container.querySelectorAll('aside')
      expect(asides).toHaveLength(1)
    })
  })

  describe('✅ Edge Cases', () => {
    it('renders consistently across multiple instances', () => {
      const { container: container1 } = render(<Workspace />)
      const { container: container2 } = render(<Workspace />)

      const workspace1 = container1.querySelector('.workspace')
      const workspace2 = container2.querySelector('.workspace')

      expect(workspace1?.className).toBe(workspace2?.className)
      expect(workspace1?.children.length).toBe(workspace2?.children.length)
    })

    it('does not expose implementation details', () => {
      const { container } = render(<Workspace />)
      const workspace = container.querySelector('.workspace')

      // Should only have the expected class
      expect(workspace?.className).toBe('workspace')

      // Should not have any data attributes or other implementation details
      expect(workspace?.attributes.length).toBe(1) // Only class attribute
    })
  })
})
