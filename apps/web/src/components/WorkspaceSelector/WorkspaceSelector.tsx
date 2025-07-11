import React, { useState, useRef, useEffect } from 'react'
import { Icon } from '@kairos/ui'
import { useWorkspace } from '../../contexts/WorkspaceContext'
import { useDismiss } from '../../hooks/useDismiss'
import './WorkspaceSelector.scss'

interface WorkspaceSelectorProps {
  isCollapsed: boolean
}

export const WorkspaceSelector: React.FC<WorkspaceSelectorProps> = ({ isCollapsed }) => {
  const { workspaces, currentWorkspace, selectWorkspace, createWorkspace, isLoading } = useWorkspace()
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Handle click outside to close dropdown
  useDismiss(dropdownRef, {
    onDismiss: () => {
      setIsOpen(false)
      setIsCreating(false)
      setNewWorkspaceName('')
      setError(null)
    },
    enabled: isOpen,
  })

  // Focus input when creating
  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isCreating])

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  const handleSelectWorkspace = (workspaceId: string) => {
    selectWorkspace(workspaceId)
    setIsOpen(false)
  }

  const handleStartCreate = () => {
    setIsCreating(true)
    setError(null)
  }

  const handleCancelCreate = () => {
    setIsCreating(false)
    setNewWorkspaceName('')
    setError(null)
  }

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) {
      setError('Workspace name is required')
      return
    }

    try {
      const newWorkspace = await createWorkspace(newWorkspaceName.trim())
      selectWorkspace(newWorkspace.id)
      setIsOpen(false)
      setIsCreating(false)
      setNewWorkspaceName('')
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create workspace')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateWorkspace()
    } else if (e.key === 'Escape') {
      handleCancelCreate()
    }
  }

  if (isLoading || !currentWorkspace) {
    return (
      <button className="workspace-selector workspace-selector--loading" disabled>
        <Icon name="profile" size={20} />
        {!isCollapsed && <span className="workspace-selector__text">Loading...</span>}
      </button>
    )
  }

  return (
    <div className="workspace-selector-container" ref={dropdownRef}>
      <button
        ref={buttonRef}
        className={`workspace-selector ${isOpen ? 'workspace-selector--active' : ''}`}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={isCollapsed ? currentWorkspace.name : undefined}
      >
        <Icon name="profile" size={20} />
        {!isCollapsed && (
          <>
            <span className="workspace-selector__text">{currentWorkspace.name}</span>
            <Icon name="large-arrow" size={16} className={`workspace-selector__chevron ${isOpen ? 'workspace-selector__chevron--open' : ''}`} />
          </>
        )}
      </button>

      {isOpen && (
        <div className="workspace-selector__dropdown" role="listbox">
          <div className="workspace-selector__dropdown-header">
            <span className="workspace-selector__dropdown-title">Workspaces</span>
          </div>

          <div className="workspace-selector__dropdown-list">
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                className={`workspace-selector__dropdown-item ${
                  workspace.id === currentWorkspace.id ? 'workspace-selector__dropdown-item--active' : ''
                }`}
                onClick={() => handleSelectWorkspace(workspace.id)}
                role="option"
                aria-selected={workspace.id === currentWorkspace.id}
              >
                <Icon name="folder" size={16} />
                <span className="workspace-selector__dropdown-item-text">{workspace.name}</span>
                {workspace.id === currentWorkspace.id && <Icon name="check" size={16} className="workspace-selector__dropdown-item-check" />}
              </button>
            ))}
          </div>

          <div className="workspace-selector__dropdown-footer">
            {isCreating ? (
              <div className="workspace-selector__create-form">
                <input
                  ref={inputRef}
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Workspace name"
                  className="workspace-selector__create-input"
                  aria-label="New workspace name"
                />
                {error && (
                  <div className="workspace-selector__error" role="alert">
                    {error}
                  </div>
                )}
                <div className="workspace-selector__create-actions">
                  <button className="workspace-selector__create-cancel" onClick={handleCancelCreate}>
                    Cancel
                  </button>
                  <button className="workspace-selector__create-confirm" onClick={handleCreateWorkspace}>
                    Create
                  </button>
                </div>
              </div>
            ) : (
              <button className="workspace-selector__create-button" onClick={handleStartCreate}>
                <Icon name="add" size={16} />
                <span>Create workspace</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
