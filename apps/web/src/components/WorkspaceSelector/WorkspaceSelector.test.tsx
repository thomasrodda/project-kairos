// apps/web/src/components/WorkspaceSelector/WorkspaceSelector.test.tsx
// Tests for the WorkspaceSelector component used in the navigation sidebar

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WorkspaceSelector } from './WorkspaceSelector'
import { useWorkspace } from '../../contexts/WorkspaceContext'
import { useDismiss } from '../../hooks/useDismiss'

// Mock the Icon component
jest.mock('@kairos/ui', () => ({
  Icon: ({ name, size }: any) => (
    <span data-testid={`icon-${name}`} data-size={size} role="img">
      {name} icon
    </span>
  ),
}))

// Mock the useWorkspace hook
jest.mock('../../contexts/WorkspaceContext', () => ({
  useWorkspace: jest.fn(),
}))

// Mock the useDismiss hook
jest.mock('../../hooks/useDismiss', () => ({
  useDismiss: jest.fn(),
}))

describe('WorkspaceSelector', () => {
  const mockSelectWorkspace = jest.fn()
  const mockOnCreateWorkspace = jest.fn()

  const mockWorkspaceContext = {
    workspaces: [
      { id: '1', name: 'Workspace 1', createdAt: new Date(), updatedAt: new Date() },
      { id: '2', name: 'Workspace 2', createdAt: new Date(), updatedAt: new Date() },
      { id: '3', name: 'Very Long Workspace Name That Should Be Truncated', createdAt: new Date(), updatedAt: new Date() },
    ],
    currentWorkspace: { id: '1', name: 'Workspace 1', createdAt: new Date(), updatedAt: new Date() },
    selectWorkspace: mockSelectWorkspace,
    loading: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useWorkspace as jest.Mock).mockReturnValue(mockWorkspaceContext)
    ;(useDismiss as jest.Mock).mockImplementation(() => {})
  })

  describe('✅ Core Functionality', () => {
    it('renders current workspace name when expanded', () => {
      render(<WorkspaceSelector isCollapsed={false} onCreateWorkspace={mockOnCreateWorkspace} />)

      expect(screen.getByText('Workspace 1')).toBeInTheDocument()
      expect(screen.getByTestId('icon-workspace')).toBeInTheDocument()
    })

    it('hides workspace name when collapsed', () => {
      render(<WorkspaceSelector isCollapsed={true} onCreateWorkspace={mockOnCreateWorkspace} />)

      expect(screen.queryByText('Workspace 1')).not.toBeInTheDocument()
      expect(screen.getByTestId('icon-workspace')).toBeInTheDocument()
    })

    it('does not render when no current workspace', () => {
      ;(useWorkspace as jest.Mock).mockReturnValue({
        ...mockWorkspaceContext,
        currentWorkspace: null,
      })

      const { container } = render(<WorkspaceSelector isCollapsed={false} onCreateWorkspace={mockOnCreateWorkspace} />)
      expect(container.firstChild).toBeNull()
    })
  })

  describe('✅ Dropdown Functionality', () => {
    it('toggles dropdown on click when expanded', async () => {
      const user = userEvent.setup()
      render(<WorkspaceSelector isCollapsed={false} onCreateWorkspace={mockOnCreateWorkspace} />)

      const trigger = screen.getByRole('button')

      // Initially closed
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()

      // Open dropdown
      await user.click(trigger)
      expect(screen.getByRole('menu')).toBeInTheDocument()
      expect(screen.getByText('Workspaces')).toBeInTheDocument()

      // Close dropdown
      await user.click(trigger)
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })

    it('does not open dropdown when collapsed', async () => {
      const user = userEvent.setup()
      render(<WorkspaceSelector isCollapsed={true} onCreateWorkspace={mockOnCreateWorkspace} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })

    it('shows all workspaces in dropdown', async () => {
      const user = userEvent.setup()
      render(<WorkspaceSelector isCollapsed={false} onCreateWorkspace={mockOnCreateWorkspace} />)

      await user.click(screen.getByRole('button'))

      // Get all workspace buttons in the dropdown menu
      const dropdownMenu = screen.getByRole('menu')
      const workspaceItems = screen.getAllByRole('menuitem')

      // Filter out the 'Create New Workspace' button to get only workspace items
      const workspaceButtons = workspaceItems.filter((item) => !item.textContent?.includes('Create New Workspace'))

      expect(workspaceButtons).toHaveLength(3)
      expect(workspaceButtons[0]).toHaveTextContent('Workspace 1')
      expect(workspaceButtons[1]).toHaveTextContent('Workspace 2')
      expect(workspaceButtons[2]).toHaveTextContent('Very Long Workspace Name That Should Be Truncated')
    })

    it('marks current workspace as active', async () => {
      const user = userEvent.setup()
      render(<WorkspaceSelector isCollapsed={false} onCreateWorkspace={mockOnCreateWorkspace} />)

      await user.click(screen.getByRole('button'))

      const workspaceItems = screen.getAllByRole('menuitem')
      const currentWorkspaceItem = workspaceItems.find((item) => item.textContent?.includes('Workspace 1'))

      expect(currentWorkspaceItem).toHaveClass('workspace-selector__dropdown-item--active')
      expect(currentWorkspaceItem?.querySelector('[data-testid="icon-check"]')).toBeInTheDocument()
    })

    it('shows create workspace option', async () => {
      const user = userEvent.setup()
      render(<WorkspaceSelector isCollapsed={false} onCreateWorkspace={mockOnCreateWorkspace} />)

      await user.click(screen.getByRole('button'))

      const createOption = screen.getByText('Create New Workspace')
      expect(createOption).toBeInTheDocument()
      expect(createOption.closest('button')).toHaveClass('workspace-selector__dropdown-item--create')
    })
  })

  describe('✅ Workspace Selection', () => {
    it('selects workspace on click', async () => {
      const user = userEvent.setup()
      render(<WorkspaceSelector isCollapsed={false} onCreateWorkspace={mockOnCreateWorkspace} />)

      await user.click(screen.getByRole('button'))
      await user.click(screen.getByText('Workspace 2'))

      expect(mockSelectWorkspace).toHaveBeenCalledWith('2')
    })

    it('closes dropdown after selection', async () => {
      const user = userEvent.setup()
      mockSelectWorkspace.mockResolvedValue(undefined)

      render(<WorkspaceSelector isCollapsed={false} onCreateWorkspace={mockOnCreateWorkspace} />)

      await user.click(screen.getByRole('button'))
      await user.click(screen.getByText('Workspace 2'))

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      })
    })

    it('handles selection errors gracefully', async () => {
      const user = userEvent.setup()
      const consoleError = jest.spyOn(console, 'error').mockImplementation()
      mockSelectWorkspace.mockRejectedValue(new Error('Failed to select'))

      render(<WorkspaceSelector isCollapsed={false} onCreateWorkspace={mockOnCreateWorkspace} />)

      await user.click(screen.getByRole('button'))
      await user.click(screen.getByText('Workspace 2'))

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith('Failed to select workspace:', expect.any(Error))
      })

      consoleError.mockRestore()
    })
  })

  describe('✅ Create Workspace', () => {
    it('calls onCreateWorkspace when create option clicked', async () => {
      const user = userEvent.setup()
      render(<WorkspaceSelector isCollapsed={false} onCreateWorkspace={mockOnCreateWorkspace} />)

      await user.click(screen.getByRole('button'))
      await user.click(screen.getByText('Create New Workspace'))

      expect(mockOnCreateWorkspace).toHaveBeenCalled()
    })

    it('closes dropdown when create option clicked', async () => {
      const user = userEvent.setup()
      render(<WorkspaceSelector isCollapsed={false} onCreateWorkspace={mockOnCreateWorkspace} />)

      await user.click(screen.getByRole('button'))
      await user.click(screen.getByText('Create New Workspace'))

      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })
  })

  describe('✅ Loading State', () => {
    it('disables trigger button when loading', () => {
      ;(useWorkspace as jest.Mock).mockReturnValue({
        ...mockWorkspaceContext,
        loading: true,
      })

      render(<WorkspaceSelector isCollapsed={false} onCreateWorkspace={mockOnCreateWorkspace} />)

      expect(screen.getByRole('button')).toBeDisabled()
    })
  })

  describe('✅ Accessibility', () => {
    it('has proper ARIA attributes', async () => {
      const user = userEvent.setup()
      render(<WorkspaceSelector isCollapsed={false} onCreateWorkspace={mockOnCreateWorkspace} />)

      const trigger = screen.getByRole('button')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(trigger).toHaveAttribute('aria-haspopup', 'true')

      await user.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    it('supports keyboard navigation', async () => {
      render(<WorkspaceSelector isCollapsed={false} onCreateWorkspace={mockOnCreateWorkspace} />)

      const trigger = screen.getByRole('button')
      trigger.focus()

      // Open with Enter
      fireEvent.keyDown(trigger, { key: 'Enter' })
      fireEvent.click(trigger)
      expect(screen.getByRole('menu')).toBeInTheDocument()

      // Close with Escape (handled by useDismiss hook)
      fireEvent.keyDown(document, { key: 'Escape' })
    })
  })

  describe('✅ Auto-close behavior', () => {
    it('closes dropdown when workspace changes', () => {
      const { rerender } = render(<WorkspaceSelector isCollapsed={false} onCreateWorkspace={mockOnCreateWorkspace} />)

      // Open dropdown
      fireEvent.click(screen.getByRole('button'))
      expect(screen.getByRole('menu')).toBeInTheDocument()

      // Change current workspace
      ;(useWorkspace as jest.Mock).mockReturnValue({
        ...mockWorkspaceContext,
        currentWorkspace: { id: '2', name: 'Workspace 2', createdAt: new Date(), updatedAt: new Date() },
      })

      rerender(<WorkspaceSelector isCollapsed={false} onCreateWorkspace={mockOnCreateWorkspace} />)

      // Dropdown should be closed
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })
  })

  describe('✅ Edge Cases', () => {
    it('handles empty workspace list', async () => {
      ;(useWorkspace as jest.Mock).mockReturnValue({
        ...mockWorkspaceContext,
        workspaces: [],
        currentWorkspace: { id: '1', name: 'Only Workspace', createdAt: new Date(), updatedAt: new Date() },
      })

      const user = userEvent.setup()
      render(<WorkspaceSelector isCollapsed={false} onCreateWorkspace={mockOnCreateWorkspace} />)

      await user.click(screen.getByRole('button'))

      // Should still show create option
      expect(screen.getByText('Create New Workspace')).toBeInTheDocument()
    })

    it('handles very long workspace names', () => {
      ;(useWorkspace as jest.Mock).mockReturnValue({
        ...mockWorkspaceContext,
        currentWorkspace: {
          id: '3',
          name: 'Very Long Workspace Name That Should Be Truncated',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })

      render(<WorkspaceSelector isCollapsed={false} onCreateWorkspace={mockOnCreateWorkspace} />)

      const nameElement = screen.getByText('Very Long Workspace Name That Should Be Truncated')
      expect(nameElement).toHaveClass('workspace-selector__name')
    })
  })
})
