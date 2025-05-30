// apps/web/src/components/SidebarButton/SidebarButton.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { SidebarButton } from './SidebarButton'

describe('SidebarButton', () => {
  const defaultProps = {
    icon: 'search' as const,
    text: 'Test Button',
    id: 'test-button',
  }

  it('renders with icon and text when expanded', () => {
    render(<SidebarButton {...defaultProps} />)

    expect(screen.getByText('Test Button')).toBeInTheDocument()
    // Icon will be an img element now
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('hides text when collapsed', () => {
    render(<SidebarButton {...defaultProps} isCollapsed={true} />)

    expect(screen.getByRole('img')).toBeInTheDocument()
    expect(screen.queryByText('Test Button')).not.toBeInTheDocument()
  })

  it('applies standard variant class by default', () => {
    render(<SidebarButton {...defaultProps} />)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('sidebar-button--standard')
  })

  it('applies slim variant class when specified', () => {
    render(<SidebarButton {...defaultProps} variant="slim" />)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('sidebar-button--slim')
  })

  it('applies collapsed class when isCollapsed is true', () => {
    render(<SidebarButton {...defaultProps} isCollapsed={true} />)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('sidebar-button--collapsed')
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<SidebarButton {...defaultProps} onClick={handleClick} />)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('sets data-testid when id prop is provided', () => {
    render(<SidebarButton {...defaultProps} id="custom-id" />)

    expect(screen.getByTestId('custom-id')).toBeInTheDocument()
  })
})
