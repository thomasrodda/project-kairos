import React from 'react'
import styles from './EditorError.module.scss'

interface EditorErrorProps {
  error: Error | string
  onRetry?: () => void
}

export function EditorError({ error, onRetry }: EditorErrorProps) {
  const errorMessage = typeof error === 'string' ? error : error.message

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.icon}>⚠️</div>
        <h2 className={styles.title}>Unable to load editor</h2>
        <p className={styles.message}>{errorMessage}</p>
        {onRetry && (
          <button className={styles.retryButton} onClick={onRetry}>
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}
