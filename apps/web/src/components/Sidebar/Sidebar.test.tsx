// apps/web/src/components/Sidebar/Sidebar.test.tsx
// Tests for the main navigation sidebar component

import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Sidebar } from './Sidebar'

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

describe('Sidebar', () => {
  describe('✅ Core Functionality', () => {
    it('renders sidebar container', () => {
      render(<Sidebar />)
      const sidebar = screen.getByRole('complementary')
      expect(sidebar).toHaveClass('sidebar')
    })

    it('starts in expanded state by default', () => {
      render(<Sidebar />)
      const sidebar = screen.getByRole('complementary')
      expect(sidebar).not.toHaveClass('sidebar--collapsed')
    })

    it('toggles between expanded and collapsed states', async () => {
      const user = userEvent.setup()
      render(<Sidebar />)

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
      render(<Sidebar />)

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
    it('renders all primary action buttons', () => {
      render(<Sidebar />)

      expect(screen.getByTestId('sidebar-button-workspace-name')).toBeInTheDocument()
      expect(screen.getByTestId('sidebar-button-search')).toBeInTheDocument()
      expect(screen.getByTestId('sidebar-button-image-library')).toBeInTheDocument()
      expect(screen.getByTestId('sidebar-button-create-page')).toBeInTheDocument()
    })

    it('passes correct props to primary buttons', () => {
      render(<Sidebar />)

      const workspaceButton = screen.getByTestId('sidebar-button-workspace-name')
      expect(workspaceButton).toHaveAttribute('data-icon', 'profile')
      expect(workspaceButton).toHaveAttribute('data-text', 'Workspace Name')
      expect(workspaceButton).toHaveAttribute('data-variant', 'standard')
      expect(workspaceButton).toHaveAttribute('data-collapsed', 'false')
    })

    it('updates button collapsed state when sidebar collapses', async () => {
      const user = userEvent.setup()
      render(<Sidebar />)

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
    it('shows file tree placeholder when expanded', () => {
      render(<Sidebar />)
      expect(screen.getByText('File tree will go here')).toBeInTheDocument()
    })

    it('hides file tree when collapsed', async () => {
      const user = userEvent.setup()
      render(<Sidebar />)

      // Collapse sidebar
      await user.click(screen.getByLabelText('Collapse sidebar'))

      expect(screen.queryByText('File tree will go here')).not.toBeInTheDocument()
    })
  })

  describe('✅ Bottom Panel', () => {
    it('renders all bottom panel buttons', () => {
      render(<Sidebar />)

      expect(screen.getByTestId('sidebar-button-page-templates')).toBeInTheDocument()
      expect(screen.getByTestId('sidebar-button-archive')).toBeInTheDocument()
      expect(screen.getByTestId('sidebar-button-help')).toBeInTheDocument()
      expect(screen.getByTestId('sidebar-button-settings')).toBeInTheDocument()
      expect(screen.getByTestId('sidebar-button-updates')).toBeInTheDocument()
    })

    it('uses slim variant for bottom buttons', () => {
      render(<Sidebar />)

      const bottomButtons = ['page-templates', 'archive', 'help', 'settings', 'updates']

      bottomButtons.forEach((id) => {
        const button = screen.getByTestId(`sidebar-button-${id}`)
        expect(button).toHaveAttribute('data-variant', 'slim')
      })
    })
  })

  describe('✅ Toggle Icon', () => {
    it('renders toggle icon', () => {
      render(<Sidebar />)
      expect(screen.getByTestId('icon-double-arrow')).toBeInTheDocument()
    })

    it('applies flipped class when collapsed', async () => {
      const user = userEvent.setup()
      render(<Sidebar />)

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
    it('has proper ARIA role', () => {
      render(<Sidebar />)
      expect(screen.getByRole('complementary')).toBeInTheDocument()
    })

    it('toggle button has descriptive labels', async () => {
      const user = userEvent.setup()
      render(<Sidebar />)

      // Initially shows collapse label
      let toggleButton = screen.getByRole('button', { name: 'Collapse sidebar' })
      expect(toggleButton).toBeInTheDocument()

      // After collapse shows expand label
      await user.click(toggleButton)
      toggleButton = screen.getByRole('button', { name: 'Expand sidebar' })
      expect(toggleButton).toBeInTheDocument()
    })

    it('all buttons are keyboard accessible', () => {
      render(<Sidebar />)

      // All buttons should be focusable
      const allButtons = screen.getAllByRole('button')
      allButtons.forEach((button) => {
        expect(button).toBeVisible()
      })
    })
  })

  describe('✅ Layout Structure', () => {
    it('has correct section structure', () => {
      const { container } = render(<Sidebar />)

      expect(container.querySelector('.sidebar__header')).toBeInTheDocument()
      expect(container.querySelector('.sidebar__primary-buttons')).toBeInTheDocument()
      expect(container.querySelector('.sidebar__file-tree')).toBeInTheDocument()
      expect(container.querySelector('.sidebar__bottom-panel')).toBeInTheDocument()
    })

    it('bottom panel contains bottom buttons wrapper', () => {
      const { container } = render(<Sidebar />)

      const bottomPanel = container.querySelector('.sidebar__bottom-panel')
      const bottomButtons = bottomPanel?.querySelector('.sidebar__bottom-buttons')
      expect(bottomButtons).toBeInTheDocument()
    })
  })
})
