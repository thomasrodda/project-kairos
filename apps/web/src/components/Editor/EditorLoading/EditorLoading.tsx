import React from 'react'
import styles from './EditorLoading.module.scss'

export function EditorLoading() {
  return (
    <div className={styles.container}>
      <div className={styles.loader}>
        <div className={styles.spinner} />
        <p className={styles.text}>Loading editor...</p>
      </div>
    </div>
  )
}
