import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { Icon } from '@kairos/ui'
import { GoogleLogo } from '../GoogleLogo'
import './Register.scss'

export const Register: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const { user, signInWithGoogle, signUpWithEmail, error, clearError } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      navigate('/workspace')
    }
  }, [user, navigate])

  useEffect(() => {
    // Clear errors when component unmounts
    return () => {
      clearError()
    }
  }, [clearError])

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setLocalError(null)
    const user = await signInWithGoogle()
    if (user) {
      navigate('/workspace')
    }
    setIsLoading(false)
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!email || !password || !confirmPassword) {
      return
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)
    const user = await signUpWithEmail(email, password)
    if (user) {
      navigate('/workspace')
    }
    setIsLoading(false)
  }

  const displayError = localError || error

  return (
    <div className="register">
      <div className="register__container">
        <div className="register__card">
          <div className="register__logo">
            <Icon name="color-profile" size={48} />
          </div>
          <h1 className="register__title">Create Your Account</h1>
          <p className="register__subtitle">Join Project Kairos to start your creative journey</p>

          {displayError && <div className="register__error">{displayError}</div>}

          <button className="register__google-button" onClick={handleGoogleSignIn} disabled={isLoading} type="button">
            <GoogleLogo className="register__google-icon" />
            Continue with Google
          </button>

          <div className="register__divider">
            <span>or</span>
          </div>

          <form className="register__form" onSubmit={handleEmailSignUp}>
            <div className="register__field">
              <label htmlFor="email" className="register__label">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="register__input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>

            <div className="register__field">
              <label htmlFor="password" className="register__label">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="register__input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password (min 6 characters)"
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>

            <div className="register__field">
              <label htmlFor="confirm-password" className="register__label">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                className="register__input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                disabled={isLoading}
              />
            </div>

            <button type="submit" className="register__submit-button" disabled={isLoading || !email || !password || !confirmPassword}>
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="register__footer">
            Already have an account?{' '}
            <Link to="/login" className="register__link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
