import React from 'react'
import { Icon } from '@kairos/ui'
import './SaveStatus.scss'

export type SaveStatusType = 'idle' | 'saving' | 'saved' | 'error'

interface SaveStatusProps {
  status: SaveStatusType
  className?: string
}

export function SaveStatus({ status, className = '' }: SaveStatusProps) {
  const getStatusDisplay = () => {
    switch (status) {
      case 'saving':
        return (
          <>
            <span className="save-status__icon save-status__icon--spinning">●</span>
            <span className="save-status__text">Saving...</span>
          </>
        )
      case 'saved':
        return (
          <>
            <Icon name="check" className="save-status__icon" />
            <span className="save-status__text">Saved</span>
          </>
        )
      case 'error':
        return (
          <>
            <Icon name="close" className="save-status__icon" />
            <span className="save-status__text">Save failed</span>
          </>
        )
      case 'idle':
      default:
        return null
    }
  }

  const display = getStatusDisplay()
  if (!display) return null

  return <div className={`save-status save-status--${status} ${className}`}>{display}</div>
}
