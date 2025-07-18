// apps/web/src/components/SaveStatusIndicator/SaveStatusIndicator.tsx
// Visual indicator for auto-save status
// Shows saving, saved, or error states with appropriate messages

import { SaveStatus } from '../../hooks/useAutoSave'
import './SaveStatusIndicator.scss'

interface SaveStatusIndicatorProps {
  status: SaveStatus
  lastSaved: Date | null
  isDirty: boolean
  onRetry?: () => void
}

export function SaveStatusIndicator({ status, isDirty, onRetry }: SaveStatusIndicatorProps) {
  // Simple approach: show based on isDirty flag
  const getText = () => {
    if (status === 'error') {
      return 'Save failed'
    }

    return isDirty ? 'Unsaved changes' : 'All changes saved'
  }

  return (
    <div className={`save-status save-status--${isDirty ? 'unsaved' : 'saved'}`} role="status" aria-live="polite">
      <span className="save-status__text">{getText()}</span>
      {status === 'error' && onRetry && (
        <button className="save-status__retry" onClick={onRetry} aria-label="Retry save">
          Retry
        </button>
      )}
    </div>
  )
}
