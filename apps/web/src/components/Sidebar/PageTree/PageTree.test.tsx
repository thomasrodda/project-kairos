import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { PageTree } from './PageTree'
import { api } from '../../../utils/api/client'
import { Page } from '@kairos/types'

// Mock the API client
jest.mock('../../../utils/api/client', () => ({
  api: {
    pages: {
      listByWorkspace: jest.fn(),
    },
  },
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
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      workspaceId: 'workspace-1',
      title: 'Folder 1',
      order: 1,
      isFolder: true,
      createdAt: new Date(),
      updatedAt: new Date(),
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
      ;(api.pages.listByWorkspace as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      render(<PageTree {...defaultProps} />)
      expect(screen.getByText('Loading pages...')).toBeInTheDocument()
    })

    it('should have loading container class', () => {
      ;(api.pages.listByWorkspace as jest.Mock).mockImplementation(() => new Promise(() => {}))

      const { container } = render(<PageTree {...defaultProps} />)
      expect(container.querySelector('.loading')).toBeInTheDocument()
    })
  })

  describe('✅ Error State', () => {
    it('should show error message when API fails', async () => {
      const error = new Error('Network error')
      ;(api.pages.listByWorkspace as jest.Mock).mockRejectedValue(error)

      render(<PageTree {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Failed to load pages')).toBeInTheDocument()
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })
    })

    it('should have error container class', async () => {
      ;(api.pages.listByWorkspace as jest.Mock).mockRejectedValue(new Error('Test error'))

      const { container } = render(<PageTree {...defaultProps} />)

      await waitFor(() => {
        expect(container.querySelector('.error')).toBeInTheDocument()
      })
    })
  })

  describe('✅ Empty State', () => {
    it('should show empty state when no pages exist', async () => {
      ;(api.pages.listByWorkspace as jest.Mock).mockResolvedValue([])

      render(<PageTree {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('No pages yet')).toBeInTheDocument()
        expect(screen.getByText('Create your first page to get started')).toBeInTheDocument()
      })
    })

    it('should have empty container class', async () => {
      ;(api.pages.listByWorkspace as jest.Mock).mockResolvedValue([])

      const { container } = render(<PageTree {...defaultProps} />)

      await waitFor(() => {
        expect(container.querySelector('.empty')).toBeInTheDocument()
      })
    })
  })

  describe('✅ Page Rendering', () => {
    it('should render all pages', async () => {
      ;(api.pages.listByWorkspace as jest.Mock).mockResolvedValue(mockPages)

      render(<PageTree {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('page-tree-item-1')).toBeInTheDocument()
        expect(screen.getByTestId('page-tree-item-2')).toBeInTheDocument()
      })
    })

    it('should pass correct props to PageTreeItem', async () => {
      ;(api.pages.listByWorkspace as jest.Mock).mockResolvedValue(mockPages)

      render(<PageTree {...defaultProps} currentPageId="1" />)

      await waitFor(() => {
        const item1 = screen.getByTestId('page-tree-item-1')
        expect(item1).toHaveAttribute('data-level', '0')
        expect(item1).toHaveAttribute('data-selected', 'true')

        const item2 = screen.getByTestId('page-tree-item-2')
        expect(item2).toHaveAttribute('data-selected', 'false')
      })
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
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      ;(api.pages.listByWorkspace as jest.Mock).mockResolvedValue(hierarchicalPages)

      render(<PageTree {...defaultProps} />)

      await waitFor(() => {
        // Only root pages should be rendered at level 0
        expect(screen.getByTestId('page-tree-item-1')).toHaveAttribute('data-level', '0')
        expect(screen.getByTestId('page-tree-item-2')).toHaveAttribute('data-level', '0')
        // Child page is not rendered directly (handled by PageTreeItem)
        expect(screen.queryByTestId('page-tree-item-3')).not.toBeInTheDocument()
      })
    })
  })

  describe('✅ Accessibility', () => {
    it('should have tree role and aria-label', async () => {
      ;(api.pages.listByWorkspace as jest.Mock).mockResolvedValue(mockPages)

      render(<PageTree {...defaultProps} />)

      await waitFor(() => {
        const tree = screen.getByRole('tree')
        expect(tree).toHaveAttribute('aria-label', 'Page tree')
      })
    })

    it('should have container class', async () => {
      ;(api.pages.listByWorkspace as jest.Mock).mockResolvedValue(mockPages)

      const { container } = render(<PageTree {...defaultProps} />)

      await waitFor(() => {
        expect(container.querySelector('.container')).toBeInTheDocument()
      })
    })
  })

  describe('✅ API Integration', () => {
    it('should call API with correct workspace ID', async () => {
      ;(api.pages.listByWorkspace as jest.Mock).mockResolvedValue([])

      render(<PageTree {...defaultProps} workspaceId="test-workspace" />)

      await waitFor(() => {
        expect(api.pages.listByWorkspace).toHaveBeenCalledWith('test-workspace')
      })
    })

    it('should not call API when workspace ID is not provided', () => {
      render(<PageTree {...defaultProps} workspaceId="" />)

      expect(api.pages.listByWorkspace).not.toHaveBeenCalled()
    })

    it('should handle API call cancellation on unmount', async () => {
      let resolveFn: any
      ;(api.pages.listByWorkspace as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveFn = resolve
          })
      )

      const { unmount } = render(<PageTree {...defaultProps} />)

      // Unmount before API resolves
      unmount()

      // Resolve after unmount
      if (resolveFn) {
        resolveFn(mockPages)
      }

      // Should not cause any errors or state updates
      expect(screen.queryByText('Page 1')).not.toBeInTheDocument()
    })
  })

  describe('✅ Re-rendering', () => {
    it('should refetch when workspace ID changes', async () => {
      ;(api.pages.listByWorkspace as jest.Mock).mockResolvedValue(mockPages)

      const { rerender } = render(<PageTree {...defaultProps} />)

      await waitFor(() => {
        expect(api.pages.listByWorkspace).toHaveBeenCalledTimes(1)
      })

      rerender(<PageTree {...defaultProps} workspaceId="workspace-2" />)

      await waitFor(() => {
        expect(api.pages.listByWorkspace).toHaveBeenCalledTimes(2)
        expect(api.pages.listByWorkspace).toHaveBeenLastCalledWith('workspace-2')
      })
    })

    it('should not refetch when other props change', async () => {
      ;(api.pages.listByWorkspace as jest.Mock).mockResolvedValue(mockPages)

      const { rerender } = render(<PageTree {...defaultProps} />)

      await waitFor(() => {
        expect(api.pages.listByWorkspace).toHaveBeenCalledTimes(1)
      })

      rerender(<PageTree {...defaultProps} currentPageId="1" />)

      // Should not refetch
      expect(api.pages.listByWorkspace).toHaveBeenCalledTimes(1)
    })
  })
})
