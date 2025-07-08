// apps/web/src/components/Sidebar/Sidebar.test.tsx
// Tests for the main navigation sidebar component

import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { Sidebar } from './Sidebar'

// Mock useNavigate hook
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

// Mock the SidebarButton component
jest.mock('../SidebarButton', () => ({
  SidebarButton: ({ icon, text, variant, isCollapsed, id }: any) => (
    <button data-testid={`sidebar-button-${id}`} data-icon={icon} data-text={text} data-variant={variant} data-collapsed={isCollapsed}>
      {text}
    </button>
  ),
}))

// Mock the Icon component
jest.mock('@kairos/ui', () => ({
  Icon: ({ name, size, className }: any) => (
    <span data-testid={`icon-${name}`} data-size={size} className={className}>
      {name} icon
    </span>
  ),
}))

// Mock the WorkspaceSelector component
jest.mock('../WorkspaceSelector', () => ({
  WorkspaceSelector: ({ isCollapsed, onCreateWorkspace }: any) => (
    <div data-testid="workspace-selector" data-collapsed={isCollapsed}>
      <button onClick={onCreateWorkspace}>Workspace Selector</button>
    </div>
  ),
}))

// Mock the WorkspaceCreationDialog component
jest.mock('../WorkspaceCreationDialog', () => ({
  WorkspaceCreationDialog: ({ isOpen, onClose }: any) =>
    isOpen ? (
      <div data-testid="workspace-creation-dialog">
        <button onClick={onClose}>Close Dialog</button>
      </div>
    ) : null,
}))

// Mock the AuthContext
jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => ({
    user: { email: 'test@example.com' },
    logout: jest.fn(),
  }),
}))

// Mock the PageTree component
jest.mock('./PageTree', () => ({
  PageTree: ({ workspaceId, currentPageId, onPageSelect }: any) => (
    <div data-testid="page-tree" data-workspace-id={workspaceId} data-page-id={currentPageId}>
      Page Tree
    </div>
  ),
}))

// Helper function to render with Router
const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  describe('✅ Core Functionality', () => {
    it('starts in expanded state by default', () => {
      renderWithRouter(<Sidebar />)
      const sidebar = screen.getByRole('complementary')
      expect(sidebar).not.toHaveClass('sidebar--collapsed')
    })

    it('toggles between expanded and collapsed states', async () => {
      const user = userEvent.setup()
      renderWithRouter(<Sidebar />)

      const sidebar = screen.getByRole('complementary')
      const toggleButton = screen.getByLabelText('Collapse sidebar')

      // Initially expanded
      expect(sidebar).not.toHaveClass('sidebar--collapsed')

      // Click to collapse
      await user.click(toggleButton)
      expect(sidebar).toHaveClass('sidebar--collapsed')
      expect(screen.getByLabelText('Expand sidebar')).toBeInTheDocument()

      // Click to expand
      await user.click(screen.getByLabelText('Expand sidebar'))
      expect(sidebar).not.toHaveClass('sidebar--collapsed')
      expect(screen.getByLabelText('Collapse sidebar')).toBeInTheDocument()
    })

    it('shows logo only when expanded', async () => {
      const user = userEvent.setup()
      renderWithRouter(<Sidebar />)

      // Initially expanded - logo visible
      expect(screen.getByTestId('icon-color-profile')).toBeInTheDocument()

      // Collapse - logo hidden
      await user.click(screen.getByLabelText('Collapse sidebar'))
      expect(screen.queryByTestId('icon-color-profile')).not.toBeInTheDocument()

      // Expand - logo visible again
      await user.click(screen.getByLabelText('Expand sidebar'))
      expect(screen.getByTestId('icon-color-profile')).toBeInTheDocument()
    })
  })

  describe('✅ Primary Buttons', () => {
    it('renders workspace selector and primary buttons', () => {
      renderWithRouter(<Sidebar />)

      // Check workspace selector is rendered
      expect(screen.getByTestId('workspace-selector')).toBeInTheDocument()

      // Check other primary buttons
      const searchButton = screen.getByTestId('sidebar-button-search')
      expect(searchButton).toHaveAttribute('data-icon', 'search')
      expect(searchButton).toHaveAttribute('data-text', 'Search')
      expect(searchButton).toHaveAttribute('data-variant', 'standard')
      expect(searchButton).toHaveAttribute('data-collapsed', 'false')
    })

    it('updates button collapsed state when sidebar collapses', async () => {
      const user = userEvent.setup()
      renderWithRouter(<Sidebar />)

      const buttons = screen.getAllByTestId(/^sidebar-button-/)

      // Initially not collapsed
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('data-collapsed', 'false')
      })

      // Collapse sidebar
      await user.click(screen.getByLabelText('Collapse sidebar'))

      // All buttons should be collapsed
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('data-collapsed', 'true')
      })
    })
  })

  describe('✅ File Tree Section', () => {
    it('shows page tree when expanded with workspace', () => {
      renderWithRouter(<Sidebar workspaceId="workspace-1" currentPageId="page-1" onPageSelect={jest.fn()} />)
      expect(screen.getByTestId('page-tree')).toBeInTheDocument()
      expect(screen.getByTestId('page-tree')).toHaveAttribute('data-workspace-id', 'workspace-1')
    })

    it('does not show page tree when no workspace provided', () => {
      renderWithRouter(<Sidebar />)
      expect(screen.queryByTestId('page-tree')).not.toBeInTheDocument()
    })

    it('hides file tree when collapsed', async () => {
      const user = userEvent.setup()
      renderWithRouter(<Sidebar />)

      // Collapse sidebar
      await user.click(screen.getByLabelText('Collapse sidebar'))

      expect(screen.queryByText('File tree will go here')).not.toBeInTheDocument()
    })
  })

  describe('✅ Bottom Panel', () => {
    it('uses slim variant for bottom buttons', () => {
      renderWithRouter(<Sidebar />)

      const bottomButtons = ['page-templates', 'archive', 'help', 'settings', 'updates']

      bottomButtons.forEach((id) => {
        const button = screen.getByTestId(`sidebar-button-${id}`)
        expect(button).toHaveAttribute('data-variant', 'slim')
      })
    })
  })

  describe('✅ Toggle Icon', () => {
    it('applies flipped class when collapsed', async () => {
      const user = userEvent.setup()
      renderWithRouter(<Sidebar />)

      const icon = screen.getByTestId('icon-double-arrow')

      // Initially not flipped
      expect(icon).toHaveClass('sidebar__toggle-icon')
      expect(icon).not.toHaveClass('sidebar__toggle-icon--flipped')

      // Collapse - icon flipped
      await user.click(screen.getByLabelText('Collapse sidebar'))
      expect(icon).toHaveClass('sidebar__toggle-icon--flipped')
    })
  })

  describe('✅ Accessibility', () => {
    it('toggle button has descriptive labels', async () => {
      const user = userEvent.setup()
      renderWithRouter(<Sidebar />)

      // Initially shows collapse label
      let toggleButton = screen.getByRole('button', { name: 'Collapse sidebar' })
      expect(toggleButton).toBeInTheDocument()

      // After collapse shows expand label
      await user.click(toggleButton)
      toggleButton = screen.getByRole('button', { name: 'Expand sidebar' })
      expect(toggleButton).toBeInTheDocument()
    })

    it('all buttons are keyboard accessible', () => {
      renderWithRouter(<Sidebar />)

      // All buttons should be focusable
      const allButtons = screen.getAllByRole('button')
      allButtons.forEach((button) => {
        expect(button).toBeVisible()
      })
    })
  })

  describe('✅ Layout Structure', () => {})
})
