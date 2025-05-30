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
    { icon: 'profile' as const, text: 'Workspace Name', id: 'workspace-name' },
    { icon: 'search' as const, text: 'Search', id: 'search' },
    { icon: 'image' as const, text: 'Image Library', id: 'image-library' },
    { icon: 'add' as const, text: 'Create Page', id: 'create-page' },
  ]

  // Bottom panel buttons data (5 buttons)
  const bottomButtons = [
    { icon: 'folder' as const, text: 'Page Templates', id: 'page-templates' },
    { icon: 'archive' as const, text: 'Archive', id: 'archive' },
    { icon: 'help' as const, text: 'Help', id: 'help' },
    { icon: 'settings' as const, text: 'Settings & Members', id: 'settings' },
    { icon: 'updates' as const, text: 'Updates & News', id: 'updates' },
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
