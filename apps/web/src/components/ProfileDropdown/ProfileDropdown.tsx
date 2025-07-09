// apps/web/src/components/ProfileDropdown/ProfileDropdown.tsx
// Profile dropdown component that shows workspace selection, account details, and settings
// in a tabbed interface when clicked

import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@kairos/ui'
import { useDismiss } from '../../hooks/useDismiss'
import { useAuthContext } from '../../contexts/AuthContext'
import { useWorkspace } from '../../contexts/WorkspaceContext'
import './ProfileDropdown.scss'

interface ProfileDropdownProps {
  isCollapsed?: boolean
  onCreateWorkspace?: () => void
}

type TabType = 'workspaces' | 'account' | 'settings'

export function ProfileDropdown({ isCollapsed = false, onCreateWorkspace }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('workspaces')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { user, logout } = useAuthContext()
  const { workspaces, currentWorkspace, selectWorkspace, deleteWorkspace } = useWorkspace()

  // Use dismiss hook to close dropdown when clicking outside
  useDismiss(dropdownRef, {
    onDismiss: () => setIsOpen(false),
    enabled: isOpen,
  })

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleWorkspaceSelect = async (workspaceId: string) => {
    await selectWorkspace(workspaceId)
    setIsOpen(false)
  }

  const handleWorkspaceDelete = async (e: React.MouseEvent, workspaceId: string) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this workspace?')) {
      try {
        await deleteWorkspace(workspaceId)
      } catch (error) {
        console.error('Error deleting workspace:', error)
      }
    }
  }

  return (
    <div className="profile-dropdown" ref={dropdownRef}>
      <button
        className={`profile-dropdown__trigger ${isCollapsed ? 'profile-dropdown__trigger--collapsed' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Profile and workspace menu"
      >
        <Icon name="profile" size={24} />
        {!isCollapsed && (
          <>
            <span className="profile-dropdown__text">My Workspace</span>
            <Icon name="large-arrow" size={16} className={`profile-dropdown__arrow ${isOpen ? 'profile-dropdown__arrow--open' : ''}`} />
          </>
        )}
      </button>

      {isOpen && (
        <div className="profile-dropdown__menu">
          {/* Tabs */}
          <div className="profile-dropdown__tabs">
            <button
              className={`profile-dropdown__tab ${activeTab === 'workspaces' ? 'profile-dropdown__tab--active' : ''}`}
              onClick={() => setActiveTab('workspaces')}
            >
              Workspaces
            </button>
            <button
              className={`profile-dropdown__tab ${activeTab === 'account' ? 'profile-dropdown__tab--active' : ''}`}
              onClick={() => setActiveTab('account')}
            >
              Account
            </button>
            <button
              className={`profile-dropdown__tab ${activeTab === 'settings' ? 'profile-dropdown__tab--active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
          </div>

          {/* Tab content */}
          <div className="profile-dropdown__content">
            {/* Workspaces tab */}
            {activeTab === 'workspaces' && (
              <div className="profile-dropdown__workspace-list">
                {workspaces.map((workspace) => (
                  <button
                    key={workspace.id}
                    className={`profile-dropdown__workspace-item ${
                      currentWorkspace?.id === workspace.id ? 'profile-dropdown__workspace-item--active' : ''
                    }`}
                    onClick={() => handleWorkspaceSelect(workspace.id)}
                  >
                    <Icon name="workspace" size={20} />
                    <span className="profile-dropdown__workspace-name">{workspace.name}</span>
                    {currentWorkspace?.id === workspace.id && <Icon name="check" size={16} className="profile-dropdown__workspace-check" />}
                    {workspaces.length > 1 && (
                      <button
                        className="profile-dropdown__workspace-delete"
                        onClick={(e) => handleWorkspaceDelete(e, workspace.id)}
                        aria-label={`Delete ${workspace.name}`}
                      >
                        <Icon name="close" size={16} />
                      </button>
                    )}
                  </button>
                ))}
                <div className="profile-dropdown__divider" />
                <button className="profile-dropdown__action-item" onClick={onCreateWorkspace}>
                  <Icon name="add" size={20} />
                  <span>Create New Workspace</span>
                </button>
              </div>
            )}

            {/* Account tab */}
            {activeTab === 'account' && (
              <div className="profile-dropdown__account">
                <div className="profile-dropdown__user-info">
                  <Icon name="profile" size={48} className="profile-dropdown__avatar" />
                  <div className="profile-dropdown__user-details">
                    <div className="profile-dropdown__user-email">{user?.email}</div>
                    <div className="profile-dropdown__user-role">Free Plan</div>
                  </div>
                </div>
                <div className="profile-dropdown__divider" />
                <button className="profile-dropdown__action-item">
                  <Icon name="profile" size={20} />
                  <span>Edit Profile</span>
                </button>
                <button className="profile-dropdown__action-item">
                  <Icon name="settings" size={20} />
                  <span>Account Settings</span>
                </button>
                <button className="profile-dropdown__action-item">
                  <Icon name="archive" size={20} />
                  <span>Billing & Plans</span>
                </button>
                <div className="profile-dropdown__divider" />
                <button className="profile-dropdown__action-item profile-dropdown__action-item--danger" onClick={handleLogout}>
                  <Icon name="back" size={20} />
                  <span>Sign out</span>
                </button>
              </div>
            )}

            {/* Settings tab */}
            {activeTab === 'settings' && (
              <div className="profile-dropdown__settings">
                <button className="profile-dropdown__action-item">
                  <Icon name="settings" size={20} />
                  <span>General</span>
                </button>
                <button className="profile-dropdown__action-item">
                  <Icon name="settings" size={20} />
                  <span>Keyboard Shortcuts</span>
                </button>
                <button className="profile-dropdown__action-item">
                  <Icon name="updates" size={20} />
                  <span>Notifications</span>
                </button>
                <button className="profile-dropdown__action-item">
                  <Icon name="color-profile" size={20} />
                  <span>Appearance</span>
                </button>
                <div className="profile-dropdown__divider" />
                <button className="profile-dropdown__action-item">
                  <Icon name="help" size={20} />
                  <span>Help & Support</span>
                </button>
                <button className="profile-dropdown__action-item">
                  <Icon name="updates" size={20} />
                  <span>What&apos;s New</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
