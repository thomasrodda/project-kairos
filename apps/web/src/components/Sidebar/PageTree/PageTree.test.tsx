import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { PageTree } from './PageTree'
import { Page } from '../../../utils/api/types'
import { useWorkspace } from '../../../contexts/WorkspaceContext'

// Mock the useWorkspace hook
jest.mock('../../../contexts/WorkspaceContext', () => ({
  useWorkspace: jest.fn(),
}))

// Mock the PageTreeItem component
jest.mock('./PageTreeItem', () => ({
  PageTreeItem: ({ page, level, isSelected }: any) => (
    <div data-testid={`page-tree-item-${page.id}`} data-level={level} data-selected={isSelected}>
      {page.title}
    </div>
  ),
}))

describe('PageTree', () => {
  const mockPages: Page[] = [
    {
      id: '1',
      workspaceId: 'workspace-1',
      title: 'Page 1',
      order: 0,
      isFolder: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      workspaceId: 'workspace-1',
      title: 'Folder 1',
      order: 1,
      isFolder: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  const defaultProps = {
    workspaceId: 'workspace-1',
    currentPageId: undefined,
    onPageSelect: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('✅ Loading State', () => {
    it('should show loading state initially', () => {
      ;(useWorkspace as jest.Mock).mockReturnValue({
        pages: [],
        loading: true,
        error: null,
      })

      render(<PageTree {...defaultProps} />)
      expect(screen.getByText('Loading pages...')).toBeInTheDocument()
    })

    it('should have loading container class', () => {
      ;(useWorkspace as jest.Mock).mockReturnValue({
        pages: [],
        loading: true,
        error: null,
      })

      const { container } = render(<PageTree {...defaultProps} />)
      expect(container.querySelector('.loading')).toBeInTheDocument()
    })
  })

  describe('✅ Error State', () => {
    it('should show error message when API fails', async () => {
      const error = new Error('Network error')
      ;(useWorkspace as jest.Mock).mockReturnValue({
        pages: [],
        loading: false,
        error: error,
      })

      render(<PageTree {...defaultProps} />)

      expect(screen.getByText('Failed to load pages')).toBeInTheDocument()
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })

    it('should have error container class', async () => {
      ;(useWorkspace as jest.Mock).mockReturnValue({
        pages: [],
        loading: false,
        error: new Error('Test error'),
      })

      const { container } = render(<PageTree {...defaultProps} />)

      expect(container.querySelector('.error')).toBeInTheDocument()
    })
  })

  describe('✅ Empty State', () => {
    it('should show empty state when no pages exist', async () => {
      ;(useWorkspace as jest.Mock).mockReturnValue({
        pages: [],
        loading: false,
        error: null,
      })

      render(<PageTree {...defaultProps} />)

      expect(screen.getByText('No pages yet')).toBeInTheDocument()
      expect(screen.getByText('Create your first page to get started')).toBeInTheDocument()
    })

    it('should have empty container class', async () => {
      ;(useWorkspace as jest.Mock).mockReturnValue({
        pages: [],
        loading: false,
        error: null,
      })

      const { container } = render(<PageTree {...defaultProps} />)

      expect(container.querySelector('.empty')).toBeInTheDocument()
    })
  })

  describe('✅ Page Rendering', () => {
    it('should render all pages', async () => {
      ;(useWorkspace as jest.Mock).mockReturnValue({
        pages: mockPages,
        loading: false,
        error: null,
      })

      render(<PageTree {...defaultProps} />)

      expect(screen.getByTestId('page-tree-item-1')).toBeInTheDocument()
      expect(screen.getByTestId('page-tree-item-2')).toBeInTheDocument()
    })

    it('should pass correct props to PageTreeItem', async () => {
      ;(useWorkspace as jest.Mock).mockReturnValue({
        pages: mockPages,
        loading: false,
        error: null,
      })

      render(<PageTree {...defaultProps} currentPageId="1" />)

      const item1 = screen.getByTestId('page-tree-item-1')
      expect(item1).toHaveAttribute('data-level', '0')
      expect(item1).toHaveAttribute('data-selected', 'true')

      const item2 = screen.getByTestId('page-tree-item-2')
      expect(item2).toHaveAttribute('data-selected', 'false')
    })

    it('should render pages in hierarchical structure', async () => {
      const hierarchicalPages: Page[] = [
        ...mockPages,
        {
          id: '3',
          workspaceId: 'workspace-1',
          parentId: '2',
          title: 'Child Page',
          order: 0,
          isFolder: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      ;(useWorkspace as jest.Mock).mockReturnValue({
        pages: hierarchicalPages,
        loading: false,
        error: null,
      })

      render(<PageTree {...defaultProps} />)

      // Only root pages should be rendered at level 0
      expect(screen.getByTestId('page-tree-item-1')).toHaveAttribute('data-level', '0')
      expect(screen.getByTestId('page-tree-item-2')).toHaveAttribute('data-level', '0')
      // Child page is not rendered directly (handled by PageTreeItem)
      expect(screen.queryByTestId('page-tree-item-3')).not.toBeInTheDocument()
    })
  })

  describe('✅ Accessibility', () => {
    it('should have tree role and aria-label', async () => {
      ;(useWorkspace as jest.Mock).mockReturnValue({
        pages: mockPages,
        loading: false,
        error: null,
      })

      render(<PageTree {...defaultProps} />)

      const tree = screen.getByRole('tree')
      expect(tree).toHaveAttribute('aria-label', 'Page tree')
    })

    it('should have container class', async () => {
      ;(useWorkspace as jest.Mock).mockReturnValue({
        pages: mockPages,
        loading: false,
        error: null,
      })

      const { container } = render(<PageTree {...defaultProps} />)

      expect(container.querySelector('.container')).toBeInTheDocument()
    })
  })

  describe('✅ Context Integration', () => {
    it('should use workspace context for pages', () => {
      ;(useWorkspace as jest.Mock).mockReturnValue({
        pages: mockPages,
        loading: false,
        error: null,
      })

      render(<PageTree {...defaultProps} />)

      expect(useWorkspace).toHaveBeenCalled()
      expect(screen.getByTestId('page-tree-item-1')).toBeInTheDocument()
    })

    it('should show empty state when context has no pages', () => {
      ;(useWorkspace as jest.Mock).mockReturnValue({
        pages: [],
        loading: false,
        error: null,
      })

      render(<PageTree {...defaultProps} />)

      expect(screen.getByText('No pages yet')).toBeInTheDocument()
    })

    it('should handle context loading state', () => {
      ;(useWorkspace as jest.Mock).mockReturnValue({
        pages: [],
        loading: true,
        error: null,
      })

      render(<PageTree {...defaultProps} />)

      expect(screen.getByText('Loading pages...')).toBeInTheDocument()
    })
  })

  describe('✅ Re-rendering', () => {
    it('should update when context pages change', () => {
      ;(useWorkspace as jest.Mock).mockReturnValue({
        pages: mockPages,
        loading: false,
        error: null,
      })

      const { rerender } = render(<PageTree {...defaultProps} />)

      expect(screen.getByTestId('page-tree-item-1')).toBeInTheDocument()
      expect(screen.getByTestId('page-tree-item-2')).toBeInTheDocument()

      // Update context with new pages
      const newPages = [mockPages[0]]
      ;(useWorkspace as jest.Mock).mockReturnValue({
        pages: newPages,
        loading: false,
        error: null,
      })

      rerender(<PageTree {...defaultProps} />)

      expect(screen.getByTestId('page-tree-item-1')).toBeInTheDocument()
      expect(screen.queryByTestId('page-tree-item-2')).not.toBeInTheDocument()
    })

    it('should update selection when currentPageId changes', () => {
      ;(useWorkspace as jest.Mock).mockReturnValue({
        pages: mockPages,
        loading: false,
        error: null,
      })

      const { rerender } = render(<PageTree {...defaultProps} currentPageId="1" />)

      expect(screen.getByTestId('page-tree-item-1')).toHaveAttribute('data-selected', 'true')
      expect(screen.getByTestId('page-tree-item-2')).toHaveAttribute('data-selected', 'false')

      rerender(<PageTree {...defaultProps} currentPageId="2" />)

      expect(screen.getByTestId('page-tree-item-1')).toHaveAttribute('data-selected', 'false')
      expect(screen.getByTestId('page-tree-item-2')).toHaveAttribute('data-selected', 'true')
    })
  })
})
