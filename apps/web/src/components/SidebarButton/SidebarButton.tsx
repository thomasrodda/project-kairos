// apps/web/src/components/SidebarButton/SidebarButton.tsx
import './SidebarButton.scss'
import { Icon, IconName } from '@kairos/ui'

export interface SidebarButtonProps {
  icon: IconName // Now uses the IconName type for autocompletion
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
      <span className="sidebar-button__icon">
        <Icon name={icon} size={20} />
      </span>
      {!isCollapsed && <span className="sidebar-button__text">{text}</span>}
    </button>
  )
}
