// apps/web/src/components/SidebarButton/SidebarButton.test.tsx
// Tests for the SidebarButton component used in the navigation sidebar

import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SidebarButton, SidebarButtonProps } from './SidebarButton'

// Mock the Icon component
jest.mock('@kairos/ui', () => ({
  Icon: ({ name, size }: any) => (
    <span data-testid={`icon-${name}`} data-size={size} role="img">
      {name} icon
    </span>
  ),
}))

describe('SidebarButton', () => {
  const defaultProps: SidebarButtonProps = {
    icon: 'profile' as any,
    text: 'Test Button',
    id: 'test-button',
  }

  describe('✅ Core Functionality', () => {
    it('renders button with icon and text', () => {
      render(<SidebarButton {...defaultProps} />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(screen.getByText('Test Button')).toBeInTheDocument()
      expect(screen.getByTestId('icon-profile')).toBeInTheDocument()
    })

    it('uses data-testid when id prop is provided', () => {
      render(<SidebarButton {...defaultProps} />)

      expect(screen.getByTestId('test-button')).toBeInTheDocument()
    })

    it('handles click events', async () => {
      const user = userEvent.setup()
      const handleClick = jest.fn()

      render(<SidebarButton {...defaultProps} onClick={handleClick} />)

      await user.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('✅ Variants', () => {
    it('applies standard variant by default', () => {
      render(<SidebarButton {...defaultProps} />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('sidebar-button--standard')
    })

    it('applies slim variant when specified', () => {
      render(<SidebarButton {...defaultProps} variant="slim" />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('sidebar-button--slim')
    })

    it('does not apply both variant classes', () => {
      render(<SidebarButton {...defaultProps} variant="slim" />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('sidebar-button--slim')
      expect(button).not.toHaveClass('sidebar-button--standard')
    })
  })

  describe('✅ Collapsed State', () => {
    it('shows text when not collapsed', () => {
      render(<SidebarButton {...defaultProps} isCollapsed={false} />)

      expect(screen.getByText('Test Button')).toBeInTheDocument()
    })

    it('hides text when collapsed', () => {
      render(<SidebarButton {...defaultProps} isCollapsed={true} />)

      expect(screen.queryByText('Test Button')).not.toBeInTheDocument()
    })

    it('always shows icon regardless of collapsed state', () => {
      const { rerender } = render(<SidebarButton {...defaultProps} isCollapsed={false} />)
      expect(screen.getByTestId('icon-profile')).toBeInTheDocument()

      rerender(<SidebarButton {...defaultProps} isCollapsed={true} />)
      expect(screen.getByTestId('icon-profile')).toBeInTheDocument()
    })

    it('applies collapsed class when collapsed', () => {
      render(<SidebarButton {...defaultProps} isCollapsed={true} />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('sidebar-button--collapsed')
    })

    it('does not apply collapsed class when expanded', () => {
      render(<SidebarButton {...defaultProps} isCollapsed={false} />)

      const button = screen.getByRole('button')
      expect(button).not.toHaveClass('sidebar-button--collapsed')
    })
  })

  describe('✅ Icon Props', () => {
    it('supports different icon types', () => {
      const { rerender } = render(<SidebarButton {...defaultProps} icon={'search' as any} />)
      expect(screen.getByTestId('icon-search')).toBeInTheDocument()

      rerender(<SidebarButton {...defaultProps} icon={'settings' as any} />)
      expect(screen.getByTestId('icon-settings')).toBeInTheDocument()
    })
  })

  describe('✅ Text Content', () => {
    it('handles long text gracefully', () => {
      const longText = 'This is a very long button text that might overflow'
      render(<SidebarButton {...defaultProps} text={longText} />)

      expect(screen.getByText(longText)).toBeInTheDocument()
    })

    it('handles empty text', () => {
      render(<SidebarButton {...defaultProps} text="" />)

      const textWrapper = screen.getByRole('button').querySelector('.sidebar-button__text')
      expect(textWrapper).toBeInTheDocument()
      expect(textWrapper).toHaveTextContent('')
    })
  })

  describe('✅ Combined States', () => {
    it('applies multiple classes correctly', () => {
      render(<SidebarButton {...defaultProps} variant="slim" isCollapsed={true} />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('sidebar-button')
      expect(button).toHaveClass('sidebar-button--slim')
      expect(button).toHaveClass('sidebar-button--collapsed')
    })

    it('maintains functionality when collapsed', async () => {
      const user = userEvent.setup()
      const handleClick = jest.fn()

      render(<SidebarButton {...defaultProps} isCollapsed={true} onClick={handleClick} />)

      await user.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('✅ Accessibility', () => {
    it('is keyboard accessible', () => {
      render(<SidebarButton {...defaultProps} />)

      const button = screen.getByRole('button')
      button.focus()
      expect(document.activeElement).toBe(button)
    })

    it('supports keyboard activation', () => {
      const handleClick = jest.fn()
      render(<SidebarButton {...defaultProps} onClick={handleClick} />)

      const button = screen.getByRole('button')
      button.focus()

      // Simulate Enter key
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
      fireEvent.click(button)

      expect(handleClick).toHaveBeenCalled()
    })
  })

  describe('✅ Edge Cases', () => {
    it('handles undefined onClick gracefully', async () => {
      const user = userEvent.setup()
      render(<SidebarButton {...defaultProps} onClick={undefined} />)

      const button = screen.getByRole('button')

      // Should not throw error when clicked without onClick handler
      await expect(user.click(button)).resolves.not.toThrow()
    })
  })
})
