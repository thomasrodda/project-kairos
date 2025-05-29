// apps/web/src/components/Sidebar/Sidebar.tsx
import { useState } from 'react'
import { SidebarButton } from '../SidebarButton'
import './Sidebar.scss'

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true)

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  // Primary buttons data (4 buttons)
  const primaryButtons = [
    { icon: '📝', text: 'Workspace Name', id: 'workspace-name' },
    { icon: '🔍', text: 'Search', id: 'search' },
    { icon: '📊', text: 'Image Library', id: 'image-library' },
    { icon: '📝', text: 'Create Page', id: 'create-page' },
  ]

  // Bottom panel buttons data (5 buttons)
  const bottomButtons = [
    { icon: '⚙️', text: 'Settings', id: 'settings' },
    { icon: '👤', text: 'Profile', id: 'profile' },
    { icon: '💾', text: 'Export', id: 'export' },
    { icon: '📱', text: 'Mobile App', id: 'mobile' },
    { icon: '❓', text: 'Help', id: 'help' },
  ]

  return (
    <aside className={`sidebar ${isExpanded ? '' : 'sidebar--collapsed'}`}>
      {/* Header with logo and toggle */}
      <div className="sidebar__header">
        <div className="sidebar__logo">{isExpanded ? 'Kairos' : 'K'}</div>
        <button className="sidebar__toggle" onClick={toggleExpanded} aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}>
          {isExpanded ? '←' : '→'}
        </button>
      </div>

      {/* Primary buttons section */}
      <div className="sidebar__primary-buttons">
        {primaryButtons.map((button) => (
          <SidebarButton key={button.id} icon={button.icon} text={button.text} variant="standard" isCollapsed={!isExpanded} id={button.id} />
        ))}
      </div>

      {/* File tree section - empty for now */}
      <div className="sidebar__file-tree">
        {isExpanded && (
          <div className="sidebar__file-tree-placeholder">
            <p>File tree will go here</p>
          </div>
        )}
      </div>

      {/* Bottom elevated panel */}
      <div className="sidebar__bottom-panel">
        <div className="sidebar__bottom-buttons">
          {bottomButtons.map((button) => (
            <SidebarButton key={button.id} icon={button.icon} text={button.text} variant="slim" isCollapsed={!isExpanded} id={button.id} />
          ))}
        </div>
      </div>
    </aside>
  )
}
