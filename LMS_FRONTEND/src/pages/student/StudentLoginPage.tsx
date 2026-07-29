
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AlertCircle, Mail, Lock } from 'lucide-react'
import { ApiClientError } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { AuthLayout } from '../../components/AuthLayout'
import { useRipple } from '../../hooks/useRipple'

export function StudentLoginPage() {
  const { login, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const ripple = useRipple<HTMLButtonElement>()

  if (isAuthenticated && user?.role === 'STUDENT') {
    return <Navigate to="/student" replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login('STUDENT', email, password)
      navigate('/student')
    } catch (err) {
      if (err instanceof ApiClientError) {
        // Mask all backend errors — never expose internal messages like
        // "Access denied" or "Student account required" to the user.
        setError('Invalid email or password. Please try again.')
      } else {
        setError('Unable to connect. Please check your internet connection.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      mobileVariant="form"
      mobileHeroTitle="Hello!"
      mobileHeroSubtitle="Securely log in with your email and password."
    >
      <div className='auth-mobile-only'>
        <form onSubmit={handleSubmit} className="auth-mobile-form">
          <h2 className="auth-card-title">Sign in</h2>

          {error && (
            <div className="auth-error">
              <AlertCircle />
              <span>{error}</span>
            </div>
          )}

          <div className="auth-field auth-field--anim-1">
            <label htmlFor="student-email" className="auth-field-label">
              Email
            </label>
            <div className="auth-field-input-wrapper auth-field-input-wrapper--has-icon">
              <Mail className="auth-field-icon" aria-hidden />
              <input
                id="student-email"
                type="email"
                className={`auth-field-input${error ? ' error' : ''}`}
                placeholder="Enter your mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="auth-field auth-field--anim-2">
            <label htmlFor="student-password" className="auth-field-label">
              Password
            </label>
            <div className="auth-field-input-wrapper auth-field-input-wrapper--has-icon">
              <Lock className="auth-field-icon" aria-hidden />
              <input
                id="student-password"
                type="password"
                className={`auth-field-input${error ? ' error' : ''}`}
                placeholder="Enter your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <div className="auth-extras-row">
            <label className="auth-remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="auth-remember-checkbox"
              />
              <span>Remember me</span>
            </label>
            <button type="button" className="auth-forgot-link">
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="auth-submit-btn auth-pressable"
            disabled={loading}
            onClick={ripple}
          >
            {loading && <span className="auth-spinner" />}
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>

      <div className="auth-desktop-only">
        <img
          src="/insuretech logo (1).png"
          alt="InsureTech"
          className="auth-form-logo"
        />
        <h1 className="auth-form-title">Welcome Back</h1>
        <p className="auth-form-subtitle">
          Access your profile, documents, and certificates
        </p>

        {error && (
          <div className="auth-error">
            <AlertCircle />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="student-email-desktop" className="auth-field-label">
              Email
            </label>
            <input
              id="student-email-desktop"
              type="email"
              className={`auth-field-input${error ? ' error' : ''}`}
              placeholder="e.g. ahmed@alkheerow.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="student-password-desktop" className="auth-field-label">
              Password
            </label>
            <input
              id="student-password-desktop"
              type="password"
              className={`auth-field-input${error ? ' error' : ''}`}
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn auth-pressable"
            disabled={loading}
            onClick={ripple}
          >
            {loading && <span className="auth-spinner" />}
            Sign In
          </button>
        </form>

        <p className="auth-footer auth-footer--switch auth-footer--desktop-only">
          <Link to="/">← Back to home</Link>
        </p>
      </div>

      <p className="auth-footer auth-footer--switch auth-footer--mobile-only">
        Don&apos;t have an account?{' '}
        <Link to="/">Sign up</Link>
      </p>
    </AuthLayout>
  )
}
