import React from 'react'
import { useEditorSync } from '../../../contexts/EditorProvider'
import styles from './SyncStatus.module.scss'

export function SyncStatus() {
  const { syncStatus } = useEditorSync()

  const getStatusText = () => {
    switch (syncStatus) {
      case 'saved':
        return 'All changes saved'
      case 'saving':
        return 'Saving...'
      case 'error':
        return 'Error saving changes'
      case 'offline':
        return 'Offline - changes will sync when online'
      default:
        return ''
    }
  }

  const getStatusClass = () => {
    switch (syncStatus) {
      case 'saved':
        return styles.saved
      case 'saving':
        return styles.saving
      case 'error':
        return styles.error
      case 'offline':
        return styles.offline
      default:
        return ''
    }
  }

  return (
    <div className={`${styles.syncStatus} ${getStatusClass()}`}>
      <span className={styles.indicator} />
      <span className={styles.text}>{getStatusText()}</span>
    </div>
  )
}
