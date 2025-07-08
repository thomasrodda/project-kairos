import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { PageTreeItem } from './PageTreeItem'
import { Page } from '../../../utils/api/types'

// Mock the Icon component
jest.mock('@kairos/ui', () => ({
  Icon: ({ name, size }: { name: string; size?: number }) => <div data-testid={`icon-${name}`} data-size={size} />,
}))

describe('PageTreeItem', () => {
  const mockPage: Page & { children?: Page[] } = {
    id: '1',
    workspaceId: 'workspace-1',
    title: 'Test Page',
    order: 0,
    isFolder: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const mockFolder: Page & { children?: Page[] } = {
    id: '2',
    workspaceId: 'workspace-1',
    title: 'Test Folder',
    order: 1,
    isFolder: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    children: [
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
    ],
  }

  const defaultProps = {
    page: mockPage,
    level: 0,
    isSelected: false,
    isExpanded: false,
    onSelect: jest.fn(),
    onToggleExpand: jest.fn(),
    currentPageId: undefined,
    expandedFolders: new Set<string>(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('✅ Rendering', () => {
    it('should render page with correct title', () => {
      render(<PageTreeItem {...defaultProps} />)
      expect(screen.getByText('Test Page')).toBeInTheDocument()
    })

    it('should render page icon for pages', () => {
      render(<PageTreeItem {...defaultProps} />)
      expect(screen.getByTestId('icon-page')).toBeInTheDocument()
    })

    it('should render folder icon for folders', () => {
      render(<PageTreeItem {...defaultProps} page={mockFolder} />)
      expect(screen.getByTestId('icon-folder')).toBeInTheDocument()
    })

    it('should render expand button for folders', () => {
      render(<PageTreeItem {...defaultProps} page={mockFolder} />)
      expect(screen.getByLabelText('Expand folder')).toBeInTheDocument()
    })

    it('should not render expand button for pages', () => {
      render(<PageTreeItem {...defaultProps} />)
      expect(screen.queryByLabelText('Expand folder')).not.toBeInTheDocument()
    })

    it('should apply correct indentation based on level', () => {
      const { container } = render(<PageTreeItem {...defaultProps} level={2} />)
      const item = container.querySelector('.item')
      expect(item).toHaveStyle({ paddingLeft: '40px' }) // (2 * 16 + 8)px
    })

    it('should apply selected class when selected', () => {
      const { container } = render(<PageTreeItem {...defaultProps} isSelected={true} />)
      const item = container.querySelector('.item')
      expect(item).toHaveClass('item--selected')
    })
  })

  describe('✅ Interactions', () => {
    it('should call onSelect when page is clicked', () => {
      const onSelect = jest.fn()
      render(<PageTreeItem {...defaultProps} onSelect={onSelect} />)

      fireEvent.click(screen.getByText('Test Page'))
      expect(onSelect).toHaveBeenCalledWith('1')
    })

    it('should call onToggleExpand when folder is clicked', () => {
      const onToggleExpand = jest.fn()
      render(<PageTreeItem {...defaultProps} page={mockFolder} onToggleExpand={onToggleExpand} />)

      fireEvent.click(screen.getByText('Test Folder'))
      expect(onToggleExpand).toHaveBeenCalledWith('2')
    })

    it('should call onToggleExpand when expand button is clicked', () => {
      const onToggleExpand = jest.fn()
      render(<PageTreeItem {...defaultProps} page={mockFolder} onToggleExpand={onToggleExpand} />)

      fireEvent.click(screen.getByLabelText('Expand folder'))
      expect(onToggleExpand).toHaveBeenCalledWith('2')
    })

    it('should stop propagation when expand button is clicked', () => {
      const onToggleExpand = jest.fn()
      const onSelect = jest.fn()
      render(<PageTreeItem {...defaultProps} page={mockFolder} onToggleExpand={onToggleExpand} onSelect={onSelect} />)

      fireEvent.click(screen.getByLabelText('Expand folder'))
      expect(onToggleExpand).toHaveBeenCalledWith('2')
      expect(onSelect).not.toHaveBeenCalled()
    })
  })

  describe('✅ Expand/Collapse', () => {
    it('should show collapse label when expanded', () => {
      render(<PageTreeItem {...defaultProps} page={mockFolder} isExpanded={true} />)
      expect(screen.getByLabelText('Collapse folder')).toBeInTheDocument()
    })

    it('should render children when expanded', () => {
      render(<PageTreeItem {...defaultProps} page={mockFolder} isExpanded={true} />)
      expect(screen.getByText('Child Page')).toBeInTheDocument()
    })

    it('should not render children when collapsed', () => {
      render(<PageTreeItem {...defaultProps} page={mockFolder} isExpanded={false} />)
      expect(screen.queryByText('Child Page')).not.toBeInTheDocument()
    })

    it('should apply expanded class to expand button when expanded', () => {
      const { container } = render(<PageTreeItem {...defaultProps} page={mockFolder} isExpanded={true} />)
      const expandButton = container.querySelector('.expandButton')
      expect(expandButton).toHaveClass('expandButton--expanded')
    })

    it('should pass correct props to child items', () => {
      const expandedFolders = new Set(['3'])
      render(<PageTreeItem {...defaultProps} page={mockFolder} isExpanded={true} currentPageId="3" expandedFolders={expandedFolders} level={1} />)

      const childItem = screen.getByText('Child Page').closest('[role="treeitem"]')
      expect(childItem).toHaveAttribute('aria-selected', 'true')
      expect(childItem).toHaveStyle({ paddingLeft: '40px' }) // level 2
    })
  })

  describe('✅ Accessibility', () => {
    it('should have correct ARIA attributes for pages', () => {
      render(<PageTreeItem {...defaultProps} isSelected={true} />)
      const item = screen.getByRole('treeitem')

      expect(item).toHaveAttribute('aria-selected', 'true')
      expect(item).not.toHaveAttribute('aria-expanded')
      expect(item).toHaveAttribute('tabIndex', '0')
    })

    it('should have correct ARIA attributes for folders', () => {
      render(<PageTreeItem {...defaultProps} page={mockFolder} isExpanded={true} />)
      const items = screen.getAllByRole('treeitem')
      const folderItem = items[0] // The folder is the first treeitem

      expect(folderItem).toHaveAttribute('aria-expanded', 'true')
      expect(folderItem).toHaveAttribute('aria-selected', 'false')
    })

    it('should have group role for children container', () => {
      render(<PageTreeItem {...defaultProps} page={mockFolder} isExpanded={true} />)
      expect(screen.getByRole('group')).toBeInTheDocument()
    })

    it('should have negative tabIndex on expand button', () => {
      render(<PageTreeItem {...defaultProps} page={mockFolder} />)
      const expandButton = screen.getByLabelText('Expand folder')
      expect(expandButton).toHaveAttribute('tabIndex', '-1')
    })
  })

  describe('✅ Edge Cases', () => {
    it('should handle empty children array', () => {
      const folderWithNoChildren: Page & { children?: Page[] } = { ...mockFolder, children: [] }
      render(<PageTreeItem {...defaultProps} page={folderWithNoChildren} />)

      // Should not render expand button for empty folders
      expect(screen.queryByLabelText('Expand folder')).not.toBeInTheDocument()
    })

    it('should handle missing children property', () => {
      const folderWithoutChildren: Page & { children?: Page[] } = { ...mockFolder, children: undefined }
      render(<PageTreeItem {...defaultProps} page={folderWithoutChildren} />)

      expect(screen.queryByLabelText('Expand folder')).not.toBeInTheDocument()
    })

    it('should handle deeply nested structures', () => {
      const deeplyNested: Page & { children?: Page[] } = {
        ...mockFolder,
        children: [
          {
            id: '3',
            workspaceId: 'workspace-1',
            parentId: '2',
            title: 'Nested Folder',
            order: 0,
            isFolder: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            children: [
              {
                id: '4',
                workspaceId: 'workspace-1',
                parentId: '3',
                title: 'Deeply Nested Page',
                order: 0,
                isFolder: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ],
          } as Page & { children?: Page[] },
        ],
      }

      const expandedFolders = new Set(['2', '3'])
      render(<PageTreeItem {...defaultProps} page={deeplyNested} isExpanded={true} expandedFolders={expandedFolders} />)

      expect(screen.getByText('Nested Folder')).toBeInTheDocument()
      expect(screen.getByText('Deeply Nested Page')).toBeInTheDocument()
    })
  })
})
