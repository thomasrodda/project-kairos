import { useState, useRef, useEffect, FormEvent } from 'react'
import { Icon } from '@kairos/ui'
import { useWorkspace } from '../../contexts/WorkspaceContext'
import './WorkspaceCreationDialog.scss'

interface WorkspaceCreationDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function WorkspaceCreationDialog({ isOpen, onClose }: WorkspaceCreationDialogProps) {
  const { createWorkspace } = useWorkspace()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      nameInputRef.current.focus()
    }
  }, [isOpen])

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setName('')
      setDescription('')
      setError(null)
    }
  }, [isOpen])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // Validate name
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Workspace name is required')
      return
    }

    if (trimmedName.length > 50) {
      setError('Workspace name must be 50 characters or less')
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      await createWorkspace(trimmedName, description.trim() || undefined)
      onClose()
    } catch (error) {
      console.error('Failed to create workspace:', error)
      setError(error instanceof Error ? error.message : 'Failed to create workspace')
    } finally {
      setIsCreating(false)
    }
  }

  const handleCancel = () => {
    if (!isCreating) {
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isCreating) {
      onClose()
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="workspace-dialog-overlay" onClick={handleCancel} onKeyDown={handleKeyDown}>
      <div className="workspace-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="workspace-dialog__header">
          <h2 className="workspace-dialog__title">Create New Workspace</h2>
          <button className="workspace-dialog__close" onClick={handleCancel} disabled={isCreating} aria-label="Close dialog">
            <Icon name="close" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="workspace-dialog__form">
          <div className="workspace-dialog__field">
            <label htmlFor="workspace-name" className="workspace-dialog__label">
              Workspace Name <span className="workspace-dialog__required">*</span>
            </label>
            <input
              ref={nameInputRef}
              id="workspace-name"
              type="text"
              className="workspace-dialog__input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Workspace"
              maxLength={50}
              disabled={isCreating}
              required
            />
          </div>

          <div className="workspace-dialog__field">
            <label htmlFor="workspace-description" className="workspace-dialog__label">
              Description
            </label>
            <textarea
              id="workspace-description"
              className="workspace-dialog__textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description for your workspace"
              rows={3}
              maxLength={200}
              disabled={isCreating}
            />
          </div>

          {error && (
            <div className="workspace-dialog__error" role="alert">
              <Icon name="help" size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="workspace-dialog__actions">
            <button
              type="button"
              className="workspace-dialog__button workspace-dialog__button--secondary"
              onClick={handleCancel}
              disabled={isCreating}
            >
              Cancel
            </button>
            <button type="submit" className="workspace-dialog__button workspace-dialog__button--primary" disabled={isCreating || !name.trim()}>
              {isCreating ? (
                <>
                  <span className="workspace-dialog__spinner" aria-hidden="true">
                    ⟳
                  </span>
                  Creating...
                </>
              ) : (
                'Create Workspace'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
