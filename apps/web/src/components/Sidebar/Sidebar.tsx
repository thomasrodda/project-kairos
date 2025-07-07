// apps/web/src/components/Sidebar/Sidebar.tsx
// Main navigation sidebar containing workspace controls, search, file tree,
// and settings. Supports collapsed/expanded states with smooth transitions.
//
// Features:
// - Collapsible sidebar with toggle button
// - Primary action buttons (workspace, search, image library, create page)
// - File tree section (placeholder for now)
// - Bottom elevated panel with secondary actions
// - Icon-based navigation with text labels when expanded
//
// Props: None (self-contained component)
// State: isExpanded (boolean) - controls sidebar collapse/expand

import { useState, forwardRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { SidebarButton } from '../SidebarButton'
import { Icon } from '@kairos/ui'
import { PageTree } from './PageTree'
import { useAuthContext } from '../../contexts/AuthContext'
import './Sidebar.scss'

interface SidebarProps {
  workspaceId?: string
  currentPageId?: string
  onPageSelect?: (pageId: string) => void
}

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(({ workspaceId, currentPageId, onPageSelect }, ref) => {
  // Component state - manages sidebar collapse/expand

  const [isExpanded, setIsExpanded] = useState(true)
  const navigate = useNavigate()
  const { user, logout } = useAuthContext()

  // Event handlers

  // Toggle sidebar expanded/collapsed state
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Button configuration data

  // Primary buttons data (4 buttons) - main workspace actions
  const primaryButtons = [
    { icon: 'profile' as const, text: 'Workspace Name', id: 'workspace-name' },
    { icon: 'search' as const, text: 'Search', id: 'search' },
    { icon: 'image' as const, text: 'Image Library', id: 'image-library' },
    { icon: 'add' as const, text: 'Create Page', id: 'create-page' },
  ]

  // Bottom panel buttons data (5 buttons) - secondary actions and settings
  const bottomButtons = [
    { icon: 'folder' as const, text: 'Page Templates', id: 'page-templates' },
    { icon: 'archive' as const, text: 'Archive', id: 'archive' },
    { icon: 'help' as const, text: 'Help', id: 'help' },
    { icon: 'settings' as const, text: 'Settings & Members', id: 'settings' },
    { icon: 'updates' as const, text: 'Updates & News', id: 'updates' },
  ]

  // Render component

  return (
    <aside ref={ref} className={`sidebar ${isExpanded ? '' : 'sidebar--collapsed'}`} tabIndex={-1} aria-label="Navigation sidebar">
      {/* Header section - Logo and collapse/expand toggle */}
      <div className="sidebar__header">
        {/* Logo - only visible when expanded */}
        {isExpanded && (
          <div className="sidebar__logo">
            <Icon name="color-profile" size={24} />
          </div>
        )}

        {/* Toggle button - always visible, flips arrow direction based on state */}
        <button className="sidebar__toggle" onClick={toggleExpanded} aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}>
          <Icon name="double-arrow" size={20} className={`sidebar__toggle-icon ${isExpanded ? '' : 'sidebar__toggle-icon--flipped'}`} />
        </button>
      </div>

      {/* Primary buttons section - Main workspace actions */}
      <div className="sidebar__primary-buttons">
        {primaryButtons.map((button) => (
          <SidebarButton key={button.id} icon={button.icon} text={button.text} variant="standard" isCollapsed={!isExpanded} id={button.id} />
        ))}
      </div>

      {/* File tree section - Expandable file/page navigation */}
      <div className="sidebar__file-tree">
        {isExpanded && workspaceId && onPageSelect && (
          <PageTree workspaceId={workspaceId} currentPageId={currentPageId} onPageSelect={onPageSelect} />
        )}
      </div>

      {/* Bottom panel section - Elevated secondary actions and settings */}
      <div className="sidebar__bottom-panel">
        <div className="sidebar__bottom-buttons">
          {bottomButtons.map((button) => (
            <SidebarButton key={button.id} icon={button.icon} text={button.text} variant="slim" isCollapsed={!isExpanded} id={button.id} />
          ))}
        </div>

        {/* User section - Show user info and logout */}
        {user && (
          <div className="sidebar__user-section">
            <div className="sidebar__divider" />
            <div className="sidebar__user-info">
              {isExpanded && <span className="sidebar__user-email">{user.email}</span>}
              <button className="sidebar__logout-button" onClick={handleLogout} aria-label="Sign out" title="Sign out">
                <Icon name="back" size={20} />
                {isExpanded && <span>Sign out</span>}
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
})

Sidebar.displayName = 'Sidebar'
