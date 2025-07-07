import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../../contexts/AuthContext'
import styles from './Auth.module.scss'

export function ForgotPassword() {
  const { resetPassword, error, clearError } = useAuthContext()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      return
    }

    setIsSubmitting(true)
    setIsSuccess(false)

    try {
      await resetPassword(email)
      setIsSuccess(true)
    } catch {
      // Error is handled in AuthContext
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.authTitle}>Reset your password</h1>
        <p className={styles.authSubtitle}>Enter your email and we&apos;ll send you a link to reset your password</p>

        <form onSubmit={handleSubmit} className={styles.authForm}>
          {error && (
            <div className={styles.errorMessage}>
              {error}
              <button type="button" onClick={clearError} className={styles.errorClose} aria-label="Dismiss error">
                ×
              </button>
            </div>
          )}

          {isSuccess && <div className={styles.successMessage}>Password reset email sent! Check your inbox.</div>}

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="you@example.com"
              required
              autoComplete="email"
              disabled={isSubmitting || isSuccess}
            />
          </div>

          <button type="submit" className={styles.submitButton} disabled={isSubmitting || isSuccess}>
            {isSubmitting ? 'Sending...' : 'Send reset email'}
          </button>
        </form>

        <div className={styles.authFooter}>
          <p>
            Remember your password?{' '}
            <Link to="/login" className={styles.link}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
