import { useState, useRef, useEffect } from 'react'
import { Icon } from '@kairos/ui'
import { useWorkspace } from '../../contexts/WorkspaceContext'
import { useDismiss } from '../../hooks/useDismiss'
import './WorkspaceSelector.scss'

interface WorkspaceSelectorProps {
  isCollapsed?: boolean
  onCreateWorkspace: () => void
}

export function WorkspaceSelector({ isCollapsed = false, onCreateWorkspace }: WorkspaceSelectorProps) {
  const { workspaces, currentWorkspace, selectWorkspace, loading } = useWorkspace()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useDismiss(dropdownRef, {
    onDismiss: () => setIsOpen(false),
    enabled: isOpen,
  })

  // Close dropdown when workspace changes
  useEffect(() => {
    setIsOpen(false)
  }, [currentWorkspace?.id])

  const handleToggle = () => {
    if (!isCollapsed) {
      setIsOpen(!isOpen)
    }
  }

  const handleSelectWorkspace = async (workspaceId: string) => {
    try {
      await selectWorkspace(workspaceId)
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to select workspace:', error)
    }
  }

  const handleCreateWorkspace = () => {
    setIsOpen(false)
    onCreateWorkspace()
  }

  // Don't render if no workspaces loaded
  if (!currentWorkspace) {
    return null
  }

  return (
    <div className="workspace-selector" ref={dropdownRef}>
      <button
        className={`workspace-selector__trigger ${isCollapsed ? 'workspace-selector__trigger--collapsed' : ''}`}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        disabled={loading}
      >
        <span className="workspace-selector__icon">
          <Icon name="workspace" size={24} />
        </span>
        {!isCollapsed && (
          <>
            <span className="workspace-selector__name">{currentWorkspace.name}</span>
            <span className="workspace-selector__chevron">
              <Icon name="double-arrow" size={16} className={isOpen ? 'workspace-selector__chevron--up' : 'workspace-selector__chevron--down'} />
            </span>
          </>
        )}
      </button>

      {isOpen && !isCollapsed && (
        <div className="workspace-selector__dropdown" role="menu">
          <div className="workspace-selector__dropdown-header">Workspaces</div>

          <div className="workspace-selector__dropdown-list">
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                className={`workspace-selector__dropdown-item ${
                  workspace.id === currentWorkspace.id ? 'workspace-selector__dropdown-item--active' : ''
                }`}
                onClick={() => handleSelectWorkspace(workspace.id)}
                role="menuitem"
              >
                <span className="workspace-selector__dropdown-item-icon">
                  <Icon name="workspace" size={20} />
                </span>
                <span className="workspace-selector__dropdown-item-name">{workspace.name}</span>
                {workspace.id === currentWorkspace.id && (
                  <span className="workspace-selector__dropdown-item-check">
                    <Icon name="check" size={16} />
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="workspace-selector__dropdown-divider" />

          <button
            className="workspace-selector__dropdown-item workspace-selector__dropdown-item--create"
            onClick={handleCreateWorkspace}
            role="menuitem"
          >
            <span className="workspace-selector__dropdown-item-icon">
              <Icon name="add" size={20} />
            </span>
            <span className="workspace-selector__dropdown-item-name">Create New Workspace</span>
          </button>
        </div>
      )}
    </div>
  )
}
