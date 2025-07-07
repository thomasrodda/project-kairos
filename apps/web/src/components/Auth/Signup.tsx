import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../contexts/AuthContext'
import styles from './Auth.module.scss'

export function Signup() {
  const navigate = useNavigate()
  const { signup, error, clearError } = useAuthContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    if (!email || !password || !confirmPassword) {
      setValidationError('Please fill in all required fields')
      return
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters')
      return
    }

    setIsSubmitting(true)
    try {
      await signup(email, password, displayName || undefined)
      navigate('/')
    } catch {
      // Error is handled in AuthContext
    } finally {
      setIsSubmitting(false)
    }
  }

  const displayError = validationError || error

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.authTitle}>Create your account</h1>
        <p className={styles.authSubtitle}>Start building amazing stories with Project Kairos</p>

        <form onSubmit={handleSubmit} className={styles.authForm}>
          {displayError && (
            <div className={styles.errorMessage}>
              {displayError}
              <button
                type="button"
                onClick={() => {
                  clearError()
                  setValidationError(null)
                }}
                className={styles.errorClose}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="displayName" className={styles.label}>
              Display Name (optional)
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={styles.input}
              placeholder="Your name"
              autoComplete="name"
              disabled={isSubmitting}
            />
          </div>

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
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="At least 6 characters"
              required
              autoComplete="new-password"
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.input}
              placeholder="Re-enter your password"
              required
              autoComplete="new-password"
              disabled={isSubmitting}
            />
          </div>

          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className={styles.authFooter}>
          <p>
            Already have an account?{' '}
            <Link to="/login" className={styles.link}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
