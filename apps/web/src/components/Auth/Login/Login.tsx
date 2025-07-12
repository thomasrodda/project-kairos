import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { Icon } from '@kairos/ui'
import { GoogleLogo } from '../GoogleLogo'
import './Login.scss'

export const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { user, signInWithGoogle, signInWithEmail, error, clearError } = useAuth()
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
    const user = await signInWithGoogle()
    if (user) {
      navigate('/workspace')
    }
    setIsLoading(false)
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      return
    }

    setIsLoading(true)
    const user = await signInWithEmail(email, password)
    if (user) {
      navigate('/workspace')
    }
    setIsLoading(false)
  }

  return (
    <div className="login">
      <div className="login__container">
        <div className="login__card">
          <div className="login__logo">
            <Icon name="color-profile" size={48} />
          </div>
          <h1 className="login__title">Welcome to Project Kairos</h1>
          <p className="login__subtitle">Sign in to access your creative workspace</p>

          {error && <div className="login__error">{error}</div>}

          <button className="login__google-button" onClick={handleGoogleSignIn} disabled={isLoading} type="button">
            <GoogleLogo className="login__google-icon" />
            Continue with Google
          </button>

          <div className="login__divider">
            <span>or</span>
          </div>

          <form className="login__form" onSubmit={handleEmailSignIn}>
            <div className="login__field">
              <label htmlFor="email" className="login__label">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="login__input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>

            <div className="login__field">
              <label htmlFor="password" className="login__label">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="login__input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>

            <button type="submit" className="login__submit-button" disabled={isLoading || !email || !password}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="login__footer">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="login__link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
