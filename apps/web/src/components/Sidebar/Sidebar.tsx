import { useState } from 'react'
import './Sidebar.scss'

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true)

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  // Primary buttons data (4 buttons)
  const primaryButtons = [
    { icon: '📝', text: 'New Page', id: 'new-page' },
    { icon: '🔍', text: 'Search', id: 'search' },
    { icon: '📊', text: 'Analytics', id: 'analytics' },
    { icon: '⚡', text: 'AI Assistant', id: 'ai-assistant' },
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
        <button
          className="sidebar__toggle"
          onClick={toggleExpanded}
          aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isExpanded ? '←' : '→'}
        </button>
      </div>

      {/* Primary buttons section */}
      <div className="sidebar__primary-buttons">
        {primaryButtons.map((button) => (
          <button key={button.id} className="sidebar__button sidebar__button--primary">
            <span className="sidebar__button-icon">{button.icon}</span>
            {isExpanded && <span className="sidebar__button-text">{button.text}</span>}
          </button>
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
            <button key={button.id} className="sidebar__button sidebar__button--secondary">
              <span className="sidebar__button-icon">{button.icon}</span>
              {isExpanded && <span className="sidebar__button-text">{button.text}</span>}
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
