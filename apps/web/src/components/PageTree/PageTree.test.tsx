import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { PageTree } from './PageTree'
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

const mockPages = [
  {
    id: 'page-1',
    title: 'Page 1',
    workspaceId: 'test-workspace-id',
    parentId: null,
    order: 0,
    icon: null,
    isFolder: false,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    deletedAt: null,
  },
  {
    id: 'folder-1',
    title: 'Folder 1',
    workspaceId: 'test-workspace-id',
    parentId: null,
    order: 1,
    icon: null,
    isFolder: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    deletedAt: null,
  },
  {
    id: 'page-2',
    title: 'Page 2',
    workspaceId: 'test-workspace-id',
    parentId: 'folder-1',
    order: 0,
    icon: null,
    isFolder: false,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    deletedAt: null,
  },
]

const renderPageTree = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <WorkspaceProvider>
            <PagesProvider>
              <PageTree />
            </PagesProvider>
          </WorkspaceProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('PageTree', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(pageService.getPages as jest.Mock).mockResolvedValue({ pages: mockPages })
  })

  describe('✅ Loading and Display', () => {
    test('shows loading state initially', async () => {
      renderPageTree()
      expect(screen.getByText('Loading pages...')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.queryByText('Loading pages...')).not.toBeInTheDocument()
      })
    })

    test('displays pages after loading', async () => {
      renderPageTree()

      await waitFor(() => {
        expect(screen.getByText('Page 1')).toBeInTheDocument()
        expect(screen.getByText('Folder 1')).toBeInTheDocument()
      })
    })

    test('shows empty state when no pages', async () => {
      ;(pageService.getPages as jest.Mock).mockResolvedValue({ pages: [] })

      renderPageTree()

      await waitFor(() => {
        expect(screen.getByText('No pages yet')).toBeInTheDocument()
        expect(screen.getByText('Create your first page')).toBeInTheDocument()
      })
    })

    test('shows error state on fetch failure', async () => {
      ;(pageService.getPages as jest.Mock).mockRejectedValue(new Error('Network error'))

      renderPageTree()

      await waitFor(() => {
        expect(screen.getByText('Failed to load pages')).toBeInTheDocument()
      })
    })
  })

  describe('✅ Page Creation', () => {
    test('creates new page via header button', async () => {
      const user = userEvent.setup()
      ;(pageService.createPage as jest.Mock).mockResolvedValue({
        id: 'new-page',
        title: 'New Page',
        isFolder: false,
      })

      renderPageTree()

      await waitFor(() => {
        expect(screen.getByText('Page 1')).toBeInTheDocument()
      })

      // Click create page button
      const createButton = screen.getByLabelText('Create page')
      await user.click(createButton)

      // Type page title
      const input = screen.getByPlaceholderText('Page title...')
      await user.type(input, 'New Page')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(pageService.createPage).toHaveBeenCalledWith('test-workspace-id', {
          title: 'New Page',
          parentId: null,
          isFolder: false,
        })
        expect(mockNavigate).toHaveBeenCalledWith('/workspace/test-workspace-id/page/new-page')
      })
    })

    test('creates new folder via header button', async () => {
      const user = userEvent.setup()
      window.prompt = jest.fn().mockReturnValue('New Folder')
      ;(pageService.createPage as jest.Mock).mockResolvedValue({
        id: 'new-folder',
        title: 'New Folder',
        isFolder: true,
      })

      renderPageTree()

      await waitFor(() => {
        expect(screen.getByText('Page 1')).toBeInTheDocument()
      })

      // Click create folder button
      const createFolderButton = screen.getByLabelText('Create folder')
      await user.click(createFolderButton)

      await waitFor(() => {
        expect(pageService.createPage).toHaveBeenCalledWith('test-workspace-id', {
          title: 'New Folder',
          parentId: null,
          isFolder: true,
        })
      })
    })

    test('cancels page creation on escape', async () => {
      const user = userEvent.setup()

      renderPageTree()

      await waitFor(() => {
        expect(screen.getByText('Page 1')).toBeInTheDocument()
      })

      // Click create page button
      const createButton = screen.getByLabelText('Create page')
      await user.click(createButton)

      // Press escape
      const input = screen.getByPlaceholderText('Page title...')
      await user.keyboard('{Escape}')

      expect(screen.queryByPlaceholderText('Page title...')).not.toBeInTheDocument()
      expect(pageService.createPage).not.toHaveBeenCalled()
    })
  })

  describe('✅ Page Selection and Navigation', () => {
    test('navigates to page on click', async () => {
      const user = userEvent.setup()

      renderPageTree()

      await waitFor(() => {
        expect(screen.getByText('Page 1')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Page 1'))

      expect(mockNavigate).toHaveBeenCalledWith('/workspace/test-workspace-id/page/page-1')
    })

    test('does not navigate when clicking folder', async () => {
      const user = userEvent.setup()

      renderPageTree()

      await waitFor(() => {
        expect(screen.getByText('Folder 1')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Folder 1'))

      expect(mockNavigate).not.toHaveBeenCalled()
    })

    test('highlights selected page', async () => {
      const user = userEvent.setup()

      renderPageTree()

      await waitFor(() => {
        expect(screen.getByText('Page 1')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Page 1'))

      const pageItem = screen.getByText('Page 1').closest('.page-tree-item')
      expect(pageItem).toHaveClass('page-tree-item--selected')
    })
  })

  describe('✅ Folder Expansion', () => {
    test('expands and collapses folders', async () => {
      const user = userEvent.setup()

      renderPageTree()

      await waitFor(() => {
        expect(screen.getByText('Folder 1')).toBeInTheDocument()
      })

      // Initially, child page should not be visible
      expect(screen.queryByText('Page 2')).not.toBeInTheDocument()

      // Click expand button
      const expandButton = screen.getByLabelText('Expand')
      await user.click(expandButton)

      // Child page should now be visible
      await waitFor(() => {
        expect(screen.getByText('Page 2')).toBeInTheDocument()
      })

      // Click collapse button
      const collapseButton = screen.getByLabelText('Collapse')
      await user.click(collapseButton)

      // Child page should be hidden again
      expect(screen.queryByText('Page 2')).not.toBeInTheDocument()
    })
  })

  describe('✅ Empty State Actions', () => {
    test('creates first page from empty state', async () => {
      const user = userEvent.setup()
      ;(pageService.getPages as jest.Mock).mockResolvedValue({ pages: [] })
      ;(pageService.createPage as jest.Mock).mockResolvedValue({
        id: 'first-page',
        title: 'My First Page',
        isFolder: false,
      })

      renderPageTree()

      await waitFor(() => {
        expect(screen.getByText('No pages yet')).toBeInTheDocument()
      })

      // Click create button in empty state
      await user.click(screen.getByText('Create your first page'))

      // Type page title
      const input = screen.getByPlaceholderText('Page title...')
      await user.type(input, 'My First Page')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(pageService.createPage).toHaveBeenCalledWith('test-workspace-id', {
          title: 'My First Page',
          parentId: null,
          isFolder: false,
        })
      })
    })
  })
})
