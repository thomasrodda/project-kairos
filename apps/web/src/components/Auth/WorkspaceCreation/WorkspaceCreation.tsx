import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { apiClient } from '../../../services/api'
import './WorkspaceCreation.scss'

export const WorkspaceCreation: React.FC = () => {
  const navigate = useNavigate()
  const { refreshUserData } = useAuth()
  const [workspaceName, setWorkspaceName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!workspaceName.trim()) {
      setError('Please enter a workspace name')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create the workspace
      const { workspace } = await apiClient.createWorkspace({
        name: workspaceName.trim(),
      })

      // Refresh user data to update the workspace list
      await refreshUserData()

      // Navigate to the new workspace
      navigate(`/workspace/${workspace.id}`)
    } catch (err) {
      console.error('Error creating workspace:', err)
      setError(err instanceof Error ? err.message : 'Failed to create workspace')
      setLoading(false)
    }
  }

  return (
    <div className="workspace-creation">
      <div className="workspace-creation__container">
        <div className="workspace-creation__header">
          <h1>Welcome to Project Kairos!</h1>
          <p>Let&apos;s create your first workspace to get started.</p>
        </div>

        <form onSubmit={handleSubmit} className="workspace-creation__form">
          <div className="workspace-creation__field">
            <label htmlFor="workspace-name">Workspace Name</label>
            <input
              id="workspace-name"
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="My Creative Project"
              disabled={loading}
              autoFocus
            />
            <p className="workspace-creation__hint">You can always rename this later or create additional workspaces.</p>
          </div>

          {error && <div className="workspace-creation__error">{error}</div>}

          <button type="submit" className="workspace-creation__submit" disabled={loading || !workspaceName.trim()}>
            {loading ? 'Creating...' : 'Create Workspace'}
          </button>
        </form>
      </div>
    </div>
  )
}
