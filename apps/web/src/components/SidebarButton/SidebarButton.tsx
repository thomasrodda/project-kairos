// apps/web/src/components/SidebarButton/SidebarButton.tsx
import './SidebarButton.scss'

export interface SidebarButtonProps {
  icon: string
  text: string
  variant?: 'standard' | 'slim'
  isCollapsed?: boolean
  onClick?: () => void
  id?: string
}

export function SidebarButton({ icon, text, variant = 'standard', isCollapsed = false, onClick, id }: SidebarButtonProps) {
  const className = `sidebar-button sidebar-button--${variant} ${isCollapsed ? 'sidebar-button--collapsed' : ''}`

  return (
    <button className={className} onClick={onClick} data-testid={id}>
      <span className="sidebar-button__icon">{icon}</span>
      {!isCollapsed && <span className="sidebar-button__text">{text}</span>}
    </button>
  )
}
