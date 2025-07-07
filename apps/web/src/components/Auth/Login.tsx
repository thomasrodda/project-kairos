import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../contexts/AuthContext'
import styles from './Auth.module.scss'

export function Login() {
  const navigate = useNavigate()
  const { login, error, clearError } = useAuthContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      return
    }

    setIsSubmitting(true)
    try {
      await login(email, password)
      navigate('/')
    } catch {
      // Error is handled in AuthContext
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.authTitle}>Welcome back</h1>
        <p className={styles.authSubtitle}>Sign in to your account to continue</p>

        <form onSubmit={handleSubmit} className={styles.authForm}>
          {error && (
            <div className={styles.errorMessage}>
              {error}
              <button type="button" onClick={clearError} className={styles.errorClose} aria-label="Dismiss error">
                ×
              </button>
            </div>
          )}

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
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.forgotPassword}>
            <Link to="/forgot-password" className={styles.link}>
              Forgot your password?
            </Link>
          </div>

          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className={styles.authFooter}>
          <p>
            Don&apos;t have an account?{' '}
            <Link to="/signup" className={styles.link}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
