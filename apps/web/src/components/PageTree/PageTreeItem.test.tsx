import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { PageTreeItem } from './PageTreeItem'
import { PagesProvider } from '../../contexts/PagesContext'
import { WorkspaceProvider } from '../../contexts/WorkspaceContext'
import { ToastProvider } from '../../hooks/useToast'
import { AuthProvider } from '../../contexts/AuthContext'
import { pageService } from '../../services/api'

// Mock the API service
jest.mock('../../services/api', () => ({
  pageService: {
    getPages: jest.fn(),
    createPage: jest.fn(),
    updatePage: jest.fn(),
    deletePage: jest.fn(),
    reorderPages: jest.fn(),
  },
}))

// Mock react-router-dom
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ workspaceId: 'test-workspace-id' }),
}))

// Mock auth context
jest.mock('../../contexts/AuthContext', () => ({
  ...jest.requireActual('../../contexts/AuthContext'),
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com' },
    backendUser: { workspaces: [{ id: 'test-workspace-id', name: 'Test Workspace' }] },
  }),
}))

const mockPage = {
  id: 'page-1',
  title: 'Test Page',
  workspaceId: 'test-workspace-id',
  parentId: null,
  order: 0,
  icon: null,
  isFolder: false,
  createdAt: '2025-01-01',
  updatedAt: '2025-01-01',
  deletedAt: null,
}

const mockFolder = {
  id: 'folder-1',
  title: 'Test Folder',
  workspaceId: 'test-workspace-id',
  parentId: null,
  order: 1,
  icon: null,
  isFolder: true,
  createdAt: '2025-01-01',
  updatedAt: '2025-01-01',
  deletedAt: null,
  children: [
    {
      id: 'child-page-1',
      title: 'Child Page',
      workspaceId: 'test-workspace-id',
      parentId: 'folder-1',
      order: 0,
      icon: null,
      isFolder: false,
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01',
      deletedAt: null,
    },
  ],
}

const renderPageTreeItem = (page = mockPage, props = {}) => {
  const defaultProps = {
    page,
    level: 0,
    isSelected: false,
    onSelect: jest.fn(),
  }

  return render(
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <WorkspaceProvider>
            <PagesProvider>
              <PageTreeItem {...defaultProps} {...props} />
            </PagesProvider>
          </WorkspaceProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('PageTreeItem', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(pageService.getPages as jest.Mock).mockResolvedValue({ pages: [] })
    window.confirm = jest.fn().mockReturnValue(true)
    window.prompt = jest.fn()
  })

  describe('✅ Display and Styling', () => {
    test('renders page with correct icon', () => {
      renderPageTreeItem()

      expect(screen.getByText('Test Page')).toBeInTheDocument()
      // Page icon should be present
      const pageIcon = document.querySelector('[data-icon="page"]')
      expect(pageIcon).toBeInTheDocument()
    })

    test('renders folder with correct icon', () => {
      renderPageTreeItem(mockFolder)

      expect(screen.getByText('Test Folder')).toBeInTheDocument()
      // Folder icon should be present
      const folderIcon = document.querySelector('[data-icon="folder"]')
      expect(folderIcon).toBeInTheDocument()
    })

    test('applies correct indentation based on level', () => {
      const { container } = renderPageTreeItem(mockPage, { level: 2 })

      const item = container.querySelector('.page-tree-item')
      expect(item).toHaveStyle('padding-left: 40px') // 2 * 20px
    })

    test('shows selected state', () => {
      const { container } = renderPageTreeItem(mockPage, { isSelected: true })

      const item = container.querySelector('.page-tree-item')
      expect(item).toHaveClass('page-tree-item--selected')
    })
  })

  describe('✅ Context Menu', () => {
    test('opens context menu on right click', async () => {
      const user = userEvent.setup()
      renderPageTreeItem()

      const item = screen.getByText('Test Page')
      await user.pointer({ keys: '[MouseRight]', target: item })

      expect(screen.getByText('Rename')).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    test('shows folder-specific options in context menu', async () => {
      const user = userEvent.setup()
      renderPageTreeItem(mockFolder)

      const item = screen.getByText('Test Folder')
      await user.pointer({ keys: '[MouseRight]', target: item })

      expect(screen.getByText('Rename')).toBeInTheDocument()
      expect(screen.getByText('New Page')).toBeInTheDocument()
      expect(screen.getByText('New Folder')).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    test('closes context menu when clicking outside', async () => {
      const user = userEvent.setup()
      renderPageTreeItem()

      // Open context menu
      const item = screen.getByText('Test Page')
      await user.pointer({ keys: '[MouseRight]', target: item })

      expect(screen.getByText('Rename')).toBeInTheDocument()

      // Click outside
      await user.click(document.body)

      expect(screen.queryByText('Rename')).not.toBeInTheDocument()
    })
  })

  describe('✅ Rename Functionality', () => {
    test('renames page through context menu', async () => {
      const user = userEvent.setup()
      ;(pageService.updatePage as jest.Mock).mockResolvedValue({ success: true })

      renderPageTreeItem()

      // Open context menu
      const item = screen.getByText('Test Page')
      await user.pointer({ keys: '[MouseRight]', target: item })

      // Click rename
      await user.click(screen.getByText('Rename'))

      // Edit input should appear
      const input = screen.getByDisplayValue('Test Page')
      expect(input).toBeInTheDocument()

      // Change name
      await user.clear(input)
      await user.type(input, 'Renamed Page')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(pageService.updatePage).toHaveBeenCalledWith('page-1', {
          title: 'Renamed Page',
        })
      })
    })

    test('cancels rename on escape', async () => {
      const user = userEvent.setup()

      renderPageTreeItem()

      // Open context menu and click rename
      const item = screen.getByText('Test Page')
      await user.pointer({ keys: '[MouseRight]', target: item })
      await user.click(screen.getByText('Rename'))

      // Press escape
      const input = screen.getByDisplayValue('Test Page')
      await user.keyboard('{Escape}')

      // Should revert to original name
      expect(screen.getByText('Test Page')).toBeInTheDocument()
      expect(pageService.updatePage).not.toHaveBeenCalled()
    })

    test('saves rename on blur', async () => {
      const user = userEvent.setup()
      ;(pageService.updatePage as jest.Mock).mockResolvedValue({ success: true })

      renderPageTreeItem()

      // Open context menu and click rename
      const item = screen.getByText('Test Page')
      await user.pointer({ keys: '[MouseRight]', target: item })
      await user.click(screen.getByText('Rename'))

      // Change name and blur
      const input = screen.getByDisplayValue('Test Page')
      await user.clear(input)
      await user.type(input, 'Renamed Page')
      await user.click(document.body)

      await waitFor(() => {
        expect(pageService.updatePage).toHaveBeenCalledWith('page-1', {
          title: 'Renamed Page',
        })
      })
    })
  })

  describe('✅ Delete Functionality', () => {
    test('deletes page after confirmation', async () => {
      const user = userEvent.setup()
      ;(pageService.deletePage as jest.Mock).mockResolvedValue({ success: true })

      renderPageTreeItem()

      // Open context menu
      const item = screen.getByText('Test Page')
      await user.pointer({ keys: '[MouseRight]', target: item })

      // Click delete
      await user.click(screen.getByText('Delete'))

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this page?')

      await waitFor(() => {
        expect(pageService.deletePage).toHaveBeenCalledWith('page-1')
      })
    })

    test('shows folder-specific delete confirmation', async () => {
      const user = userEvent.setup()
      ;(pageService.deletePage as jest.Mock).mockResolvedValue({ success: true })

      renderPageTreeItem(mockFolder)

      // Open context menu
      const item = screen.getByText('Test Folder')
      await user.pointer({ keys: '[MouseRight]', target: item })

      // Click delete
      await user.click(screen.getByText('Delete'))

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this folder? All pages inside will also be deleted.')
    })

    test('cancels delete on confirmation cancel', async () => {
      const user = userEvent.setup()
      window.confirm = jest.fn().mockReturnValue(false)

      renderPageTreeItem()

      // Open context menu and click delete
      const item = screen.getByText('Test Page')
      await user.pointer({ keys: '[MouseRight]', target: item })
      await user.click(screen.getByText('Delete'))

      expect(pageService.deletePage).not.toHaveBeenCalled()
    })
  })

  describe('✅ Create Subpage/Subfolder', () => {
    test('creates subpage in folder', async () => {
      const user = userEvent.setup()
      window.prompt = jest.fn().mockReturnValue('New Subpage')
      ;(pageService.createPage as jest.Mock).mockResolvedValue({
        id: 'new-subpage',
        title: 'New Subpage',
        isFolder: false,
      })

      renderPageTreeItem(mockFolder)

      // Open context menu
      const item = screen.getByText('Test Folder')
      await user.pointer({ keys: '[MouseRight]', target: item })

      // Click new page
      await user.click(screen.getByText('New Page'))

      await waitFor(() => {
        expect(pageService.createPage).toHaveBeenCalledWith('test-workspace-id', {
          title: 'New Subpage',
          parentId: 'folder-1',
          isFolder: false,
        })
      })
    })

    test('creates subfolder in folder', async () => {
      const user = userEvent.setup()
      window.prompt = jest.fn().mockReturnValue('New Subfolder')
      ;(pageService.createPage as jest.Mock).mockResolvedValue({
        id: 'new-subfolder',
        title: 'New Subfolder',
        isFolder: true,
      })

      renderPageTreeItem(mockFolder)

      // Open context menu
      const item = screen.getByText('Test Folder')
      await user.pointer({ keys: '[MouseRight]', target: item })

      // Click new folder
      await user.click(screen.getByText('New Folder'))

      await waitFor(() => {
        expect(pageService.createPage).toHaveBeenCalledWith('test-workspace-id', {
          title: 'New Subfolder',
          parentId: 'folder-1',
          isFolder: true,
        })
      })
    })

    test('cancels creation if no title provided', async () => {
      const user = userEvent.setup()
      window.prompt = jest.fn().mockReturnValue('')

      renderPageTreeItem(mockFolder)

      // Open context menu and click new page
      const item = screen.getByText('Test Folder')
      await user.pointer({ keys: '[MouseRight]', target: item })
      await user.click(screen.getByText('New Page'))

      expect(pageService.createPage).not.toHaveBeenCalled()
    })
  })

  describe('✅ Expand/Collapse', () => {
    test('expands folder on arrow click', async () => {
      const user = userEvent.setup()
      renderPageTreeItem(mockFolder)

      // Initially collapsed
      expect(screen.queryByText('Child Page')).not.toBeInTheDocument()

      // Click expand arrow
      const expandButton = screen.getByLabelText('Expand')
      await user.click(expandButton)

      // Should show children
      expect(screen.getByText('Child Page')).toBeInTheDocument()
    })

    test('collapses folder on arrow click', async () => {
      const user = userEvent.setup()
      renderPageTreeItem(mockFolder)

      // Expand first
      const expandButton = screen.getByLabelText('Expand')
      await user.click(expandButton)
      expect(screen.getByText('Child Page')).toBeInTheDocument()

      // Then collapse
      const collapseButton = screen.getByLabelText('Collapse')
      await user.click(collapseButton)

      expect(screen.queryByText('Child Page')).not.toBeInTheDocument()
    })

    test('does not show expand arrow for empty pages', () => {
      renderPageTreeItem(mockPage)

      expect(screen.queryByLabelText('Expand')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Collapse')).not.toBeInTheDocument()
    })
  })
})
