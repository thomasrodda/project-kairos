// apps/web/src/components/SaveStatusIndicator/SaveStatusIndicator.tsx
// Visual indicator for auto-save status
// Shows saving, saved, or error states with appropriate icons and messages

import { useEffect, useState } from 'react'
import { Icon } from '@kairos/ui'
import { SaveStatus } from '../../hooks/useAutoSave'
import './SaveStatusIndicator.scss'

interface SaveStatusIndicatorProps {
  status: SaveStatus
  lastSaved: Date | null
  onRetry?: () => void
}

export function SaveStatusIndicator({ status, lastSaved, onRetry }: SaveStatusIndicatorProps) {
  const [showSavedMessage, setShowSavedMessage] = useState(false)

  // Show "Saved" message for a few seconds after successful save
  useEffect(() => {
    if (status === 'saved') {
      setShowSavedMessage(true)
      const timer = setTimeout(() => {
        setShowSavedMessage(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [status])

  // Format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)

    if (diffSecs < 5) return 'just now'
    if (diffSecs < 60) return `${diffSecs} seconds ago`
    if (diffMins === 1) return '1 minute ago'
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours === 1) return '1 hour ago'
    return `${diffHours} hours ago`
  }

  // Don't show anything if idle and no recent save
  if (status === 'idle' && !showSavedMessage && !lastSaved) {
    return null
  }

  return (
    <div className={`save-status save-status--${status}`} role="status" aria-live="polite">
      {status === 'saving' && (
        <>
          <Icon name="updates" className="save-status__icon save-status__icon--spinning" size={16} />
          <span className="save-status__text">Saving...</span>
        </>
      )}

      {status === 'saved' && showSavedMessage && (
        <>
          <Icon name="check" className="save-status__icon save-status__icon--success" size={16} />
          <span className="save-status__text">All changes saved</span>
        </>
      )}

      {status === 'idle' && !showSavedMessage && lastSaved && (
        <>
          <Icon name="check" className="save-status__icon save-status__icon--idle" size={16} />
          <span className="save-status__text">Last saved {formatRelativeTime(lastSaved)}</span>
        </>
      )}

      {status === 'error' && (
        <>
          <Icon name="close" className="save-status__icon save-status__icon--error" size={16} />
          <span className="save-status__text">Save failed</span>
          {onRetry && (
            <button className="save-status__retry" onClick={onRetry} aria-label="Retry save">
              Retry
            </button>
          )}
        </>
      )}
    </div>
  )
}
