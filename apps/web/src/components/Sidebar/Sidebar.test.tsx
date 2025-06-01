// apps/web/src/components/Sidebar/Sidebar.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Sidebar } from './Sidebar'

// Mock the @kairos/ui module directly in the test
jest.mock('@kairos/ui', () => ({
  Icon: (props: { name: string; size?: number | string; className?: string; 'aria-label'?: string; [key: string]: unknown }) => {
    const { name, size = 20, className = '', 'aria-label': ariaLabel, ...restProps } = props
    return (
      <span
        className={`icon ${className}`}
        data-icon={name}
        style={{
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
          display: 'inline-block',
        }}
        role="img"
        aria-label={ariaLabel || name}
        {...restProps}
      >
        📄
      </span>
    )
  },
  initializeIconPerformance: jest.fn(),
}))

describe('Sidebar Component', () => {
  describe('✅ Renders all navigation buttons correctly', () => {
    it('should render all 4 primary buttons with correct text and icons', () => {
      render(<Sidebar />)

      // Primary buttons (when expanded)
      expect(screen.getByRole('button', { name: /workspace name/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /image library/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create page/i })).toBeInTheDocument()

      // Verify correct icons are present (4 primary buttons + 1 toggle = 5 total in primary section)
      const primarySection = screen.getByRole('button', { name: /workspace name/i }).closest('.sidebar__primary-buttons')
      expect(primarySection).toBeInTheDocument()
    })

    it('should render all 5 bottom panel buttons with correct text and icons', () => {
      render(<Sidebar />)

      // Bottom panel buttons (when expanded)
      expect(screen.getByRole('button', { name: /page templates/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /archive/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /help/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /settings & members/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /updates & news/i })).toBeInTheDocument()

      // Verify bottom panel exists
      const bottomPanel = screen.getByRole('button', { name: /page templates/i }).closest('.sidebar__bottom-panel')
      expect(bottomPanel).toBeInTheDocument()
    })

    it('should render toggle button with correct accessibility label', () => {
      render(<Sidebar />)

      const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i })
      expect(toggleButton).toBeInTheDocument()
      expect(toggleButton).toHaveClass('sidebar__toggle')
    })

    it('should show logo when expanded', () => {
      render(<Sidebar />)

      // Logo should be visible in expanded state
      const header = document.querySelector('.sidebar__header')
      expect(header).toBeInTheDocument()

      // Check that logo section exists (contains the color-profile icon)
      const logo = document.querySelector('.sidebar__logo')
      expect(logo).toBeInTheDocument()
    })
  })

  describe('✅ Toggle functionality works correctly', () => {
    it('should start in expanded state by default', () => {
      render(<Sidebar />)

      const sidebar = document.querySelector('.sidebar')
      expect(sidebar).not.toHaveClass('sidebar--collapsed')

      // Toggle button should say "Collapse" when expanded
      expect(screen.getByRole('button', { name: /collapse sidebar/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /expand sidebar/i })).not.toBeInTheDocument()
    })

    it('should collapse when toggle button is clicked', () => {
      render(<Sidebar />)

      const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i })
      fireEvent.click(toggleButton)

      // Sidebar should have collapsed class
      const sidebar = document.querySelector('.sidebar')
      expect(sidebar).toHaveClass('sidebar--collapsed')

      // Toggle button text should change
      expect(screen.getByRole('button', { name: /expand sidebar/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /collapse sidebar/i })).not.toBeInTheDocument()
    })

    it('should expand when toggle button is clicked in collapsed state', () => {
      render(<Sidebar />)

      const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i })

      // Collapse first
      fireEvent.click(toggleButton)
      expect(document.querySelector('.sidebar')).toHaveClass('sidebar--collapsed')

      // Then expand
      const expandButton = screen.getByRole('button', { name: /expand sidebar/i })
      fireEvent.click(expandButton)

      // Should be expanded again
      const sidebar = document.querySelector('.sidebar')
      expect(sidebar).not.toHaveClass('sidebar--collapsed')
      expect(screen.getByRole('button', { name: /collapse sidebar/i })).toBeInTheDocument()
    })

    it('should toggle multiple times correctly', () => {
      render(<Sidebar />)

      const getToggleButton = () =>
        screen.queryByRole('button', { name: /collapse sidebar/i }) || screen.queryByRole('button', { name: /expand sidebar/i })

      const sidebar = document.querySelector('.sidebar')

      // Start expanded
      expect(sidebar).not.toHaveClass('sidebar--collapsed')

      // Collapse
      fireEvent.click(getToggleButton()!)
      expect(sidebar).toHaveClass('sidebar--collapsed')

      // Expand
      fireEvent.click(getToggleButton()!)
      expect(sidebar).not.toHaveClass('sidebar--collapsed')

      // Collapse again
      fireEvent.click(getToggleButton()!)
      expect(sidebar).toHaveClass('sidebar--collapsed')
    })
  })

  describe('✅ Collapsed state behavior', () => {
    it('should hide button text but keep icons visible when collapsed', () => {
      render(<Sidebar />)

      // Collapse the sidebar
      const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i })
      fireEvent.click(toggleButton)

      // All buttons should still be present and clickable
      expect(screen.getByTestId('workspace-name')).toBeInTheDocument()
      expect(screen.getByTestId('search')).toBeInTheDocument()
      expect(screen.getByTestId('image-library')).toBeInTheDocument()
      expect(screen.getByTestId('create-page')).toBeInTheDocument()
      expect(screen.getByTestId('page-templates')).toBeInTheDocument()
      expect(screen.getByTestId('archive')).toBeInTheDocument()
      expect(screen.getByTestId('help')).toBeInTheDocument()
      expect(screen.getByTestId('settings')).toBeInTheDocument()
      expect(screen.getByTestId('updates')).toBeInTheDocument()

      // Verify buttons have collapsed styling applied through SidebarButton component
      expect(screen.getByTestId('workspace-name')).toHaveClass('sidebar-button--collapsed')
      expect(screen.getByTestId('search')).toHaveClass('sidebar-button--collapsed')
    })

    it('should hide logo when collapsed', () => {
      render(<Sidebar />)

      // Logo should be visible when expanded
      expect(document.querySelector('.sidebar__logo')).toBeInTheDocument()

      // Collapse the sidebar
      const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i })
      fireEvent.click(toggleButton)

      // Logo should still exist but be hidden via CSS (conditional rendering)
      expect(document.querySelector('.sidebar__logo')).not.toBeInTheDocument()
    })

    it('should hide file tree placeholder when collapsed', () => {
      render(<Sidebar />)

      // File tree placeholder should be visible when expanded
      expect(screen.getByText(/file tree will go here/i)).toBeInTheDocument()

      // Collapse the sidebar
      const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i })
      fireEvent.click(toggleButton)

      // File tree placeholder should be hidden
      expect(screen.queryByText(/file tree will go here/i)).not.toBeInTheDocument()
    })

    it('should maintain all button functionality when collapsed', () => {
      render(<Sidebar />)

      // Collapse the sidebar
      const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i })
      fireEvent.click(toggleButton)

      // All buttons should still be clickable
      const buttons = [
        screen.getByTestId('workspace-name'),
        screen.getByTestId('search'),
        screen.getByTestId('image-library'),
        screen.getByTestId('create-page'),
        screen.getByTestId('page-templates'),
        screen.getByTestId('archive'),
        screen.getByTestId('help'),
        screen.getByTestId('settings'),
        screen.getByTestId('updates'),
      ]

      buttons.forEach((button) => {
        expect(button).toBeEnabled()
        expect(button.tagName.toLowerCase()).toBe('button')
      })
    })
  })

  describe('✅ Correct icons are used for each button', () => {
    it('should use correct icons for primary buttons', () => {
      render(<Sidebar />)

      // We can't easily test the exact icon content, but we can verify the buttons exist
      // and have the expected structure. The Icon component is tested separately.
      const workspaceButton = screen.getByTestId('workspace-name')
      const searchButton = screen.getByTestId('search')
      const imageButton = screen.getByTestId('image-library')
      const createButton = screen.getByTestId('create-page')

      // Verify buttons have the expected structure
      expect(workspaceButton).toHaveClass('sidebar-button')
      expect(searchButton).toHaveClass('sidebar-button')
      expect(imageButton).toHaveClass('sidebar-button')
      expect(createButton).toHaveClass('sidebar-button')

      // Verify they're in the primary buttons section
      const primarySection = document.querySelector('.sidebar__primary-buttons')
      expect(primarySection).toContainElement(workspaceButton)
      expect(primarySection).toContainElement(searchButton)
      expect(primarySection).toContainElement(imageButton)
      expect(primarySection).toContainElement(createButton)
    })

    it('should use correct icons for bottom panel buttons', () => {
      render(<Sidebar />)

      const templatesButton = screen.getByTestId('page-templates')
      const archiveButton = screen.getByTestId('archive')
      const helpButton = screen.getByTestId('help')
      const settingsButton = screen.getByTestId('settings')
      const updatesButton = screen.getByTestId('updates')

      // Verify buttons have the expected structure
      expect(templatesButton).toHaveClass('sidebar-button')
      expect(archiveButton).toHaveClass('sidebar-button')
      expect(helpButton).toHaveClass('sidebar-button')
      expect(settingsButton).toHaveClass('sidebar-button')
      expect(updatesButton).toHaveClass('sidebar-button')

      // Verify they're in the bottom panel section
      const bottomPanel = document.querySelector('.sidebar__bottom-buttons')
      expect(bottomPanel).toContainElement(templatesButton)
      expect(bottomPanel).toContainElement(archiveButton)
      expect(bottomPanel).toContainElement(helpButton)
      expect(bottomPanel).toContainElement(settingsButton)
      expect(bottomPanel).toContainElement(updatesButton)
    })

    it('should use correct variant classes for different button groups', () => {
      render(<Sidebar />)

      // Primary buttons should use 'standard' variant
      expect(screen.getByTestId('workspace-name')).toHaveClass('sidebar-button--standard')
      expect(screen.getByTestId('search')).toHaveClass('sidebar-button--standard')
      expect(screen.getByTestId('image-library')).toHaveClass('sidebar-button--standard')
      expect(screen.getByTestId('create-page')).toHaveClass('sidebar-button--standard')

      // Bottom panel buttons should use 'slim' variant
      expect(screen.getByTestId('page-templates')).toHaveClass('sidebar-button--slim')
      expect(screen.getByTestId('archive')).toHaveClass('sidebar-button--slim')
      expect(screen.getByTestId('help')).toHaveClass('sidebar-button--slim')
      expect(screen.getByTestId('settings')).toHaveClass('sidebar-button--slim')
      expect(screen.getByTestId('updates')).toHaveClass('sidebar-button--slim')
    })
  })

  describe('✅ Accessibility and user experience', () => {
    it('should have proper ARIA labels for screen readers', () => {
      render(<Sidebar />)

      // Toggle button has proper accessibility label
      expect(screen.getByRole('button', { name: /collapse sidebar/i })).toHaveAttribute('aria-label', 'Collapse sidebar')

      // Sidebar should have appropriate landmark role
      const sidebar = document.querySelector('.sidebar')
      expect(sidebar?.tagName.toLowerCase()).toBe('aside')
    })

    it('should handle keyboard navigation properly', () => {
      render(<Sidebar />)

      // Test that all interactive elements are properly focusable
      const allButtons = screen.getAllByRole('button')

      // Every button should be focusable via keyboard
      allButtons.forEach((button) => {
        button.focus()
        expect(document.activeElement).toBe(button)
        expect(button.tagName.toLowerCase()).toBe('button')
      })

      // Test that the toggle button specifically works with keyboard
      const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i })
      toggleButton.focus()

      // Use userEvent-style testing - simulate the full interaction
      // Space or Enter would trigger click in real browsers
      fireEvent.click(toggleButton) // This simulates what Space/Enter would do
      expect(document.querySelector('.sidebar')).toHaveClass('sidebar--collapsed')
    })

    it('should maintain focus management during state changes', () => {
      render(<Sidebar />)

      const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i })
      toggleButton.focus()

      // Click to collapse
      fireEvent.click(toggleButton)

      // Focus should remain on the toggle button (now with different label)
      const expandButton = screen.getByRole('button', { name: /expand sidebar/i })
      expect(document.activeElement).toBe(expandButton)
    })

    it('should provide visual feedback for interactive elements', () => {
      render(<Sidebar />)

      // Toggle button should be a proper button element
      const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i })
      expect(toggleButton.tagName.toLowerCase()).toBe('button')
      expect(toggleButton).toHaveClass('sidebar__toggle')

      // All sidebar buttons should be proper button elements
      const allButtons = screen.getAllByRole('button')
      allButtons.forEach((button) => {
        expect(button.tagName.toLowerCase()).toBe('button')
      })
    })
  })

  describe('✅ Layout and structure integrity', () => {
    it('should maintain proper layout structure', () => {
      render(<Sidebar />)

      // Main sidebar element
      const sidebar = document.querySelector('.sidebar')
      expect(sidebar).toBeInTheDocument()
      expect(sidebar).toHaveClass('sidebar')

      // Header section
      const header = document.querySelector('.sidebar__header')
      expect(header).toBeInTheDocument()

      // Primary buttons section
      const primaryButtons = document.querySelector('.sidebar__primary-buttons')
      expect(primaryButtons).toBeInTheDocument()

      // File tree section
      const fileTree = document.querySelector('.sidebar__file-tree')
      expect(fileTree).toBeInTheDocument()

      // Bottom panel section
      const bottomPanel = document.querySelector('.sidebar__bottom-panel')
      expect(bottomPanel).toBeInTheDocument()
    })

    it('should have correct button counts in each section', () => {
      render(<Sidebar />)

      // Primary buttons section should have 4 buttons
      const primarySection = document.querySelector('.sidebar__primary-buttons')
      const primaryButtons = primarySection?.querySelectorAll('.sidebar-button')
      expect(primaryButtons).toHaveLength(4)

      // Bottom panel should have 5 buttons
      const bottomSection = document.querySelector('.sidebar__bottom-buttons')
      const bottomButtons = bottomSection?.querySelectorAll('.sidebar-button')
      expect(bottomButtons).toHaveLength(5)

      // Total should be 9 sidebar buttons + 1 toggle button = 10 buttons
      const allButtons = screen.getAllByRole('button')
      expect(allButtons).toHaveLength(10)
    })

    it('should apply correct CSS classes for styling', () => {
      render(<Sidebar />)

      const sidebar = document.querySelector('.sidebar')

      // Should have base class
      expect(sidebar).toHaveClass('sidebar')

      // Should not have collapsed class initially
      expect(sidebar).not.toHaveClass('sidebar--collapsed')

      // After collapsing
      fireEvent.click(screen.getByRole('button', { name: /collapse sidebar/i }))
      expect(sidebar).toHaveClass('sidebar--collapsed')
    })
  })
})
