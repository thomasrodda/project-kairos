import { useEffect, useRef, MouseEvent, KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '@kairos/ui'
import styles from './ConfirmationDialog.module.scss'

export interface ConfirmationDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean
  /** Callback when user confirms the action */
  onConfirm: () => void
  /** Callback when user cancels or closes the dialog */
  onCancel: () => void
  /** Dialog title */
  title: string
  /** Dialog message/content */
  message: string
  /** Text for the confirm button (default: "Delete") */
  confirmText?: string
  /** Text for the cancel button (default: "Cancel") */
  cancelText?: string
  /** Variant for the confirm button styling (default: "danger") */
  confirmButtonVariant?: 'danger' | 'primary'
}

export function ConfirmationDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  confirmButtonVariant = 'danger',
}: ConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  // Focus management
  useEffect(() => {
    if (isOpen && confirmButtonRef.current) {
      // Focus the confirm button when dialog opens
      confirmButtonRef.current.focus()
    }
  }, [isOpen])

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onCancel])

  // Handle Enter key for confirmation
  const handleDialogKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault()
      onConfirm()
    }
  }

  // Handle backdrop click
  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onCancel()
    }
  }

  // Prevent event propagation from dialog content
  const handleDialogClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
  }

  if (!isOpen) {
    return null
  }

  // Render using React Portal
  return createPortal(
    <div className={styles.overlay} onClick={handleBackdropClick} role="presentation" aria-hidden="true">
      <div
        ref={dialogRef}
        className={styles.dialog}
        onClick={handleDialogClick}
        onKeyDown={handleDialogKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-message"
      >
        <div className={styles.dialog__header}>
          <h2 id="dialog-title" className={styles.dialog__title}>
            {title}
          </h2>
          <button className={styles.dialog__close} onClick={onCancel} aria-label="Close dialog" type="button">
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className={styles.dialog__body}>
          <p id="dialog-message" className={styles.dialog__message}>
            {message}
          </p>
        </div>

        <div className={styles.dialog__footer}>
          <button className={`${styles.dialog__button} ${styles['dialog__button--secondary']}`} onClick={onCancel} type="button">
            {cancelText}
          </button>
          <button
            ref={confirmButtonRef}
            className={`${styles.dialog__button} ${styles[`dialog__button--${confirmButtonVariant}`]}`}
            onClick={onConfirm}
            type="button"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
