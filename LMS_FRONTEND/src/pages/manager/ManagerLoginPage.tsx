
import { useState, type FormEvent, type MouseEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, AlertCircle, Mail, Lock, User } from 'lucide-react'
import { ApiClientError } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { AuthLayout } from '../../components/AuthLayout'
import { useRipple } from '../../hooks/useRipple'

export function ManagerLoginPage() {
  const { login, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const ripple = useRipple<HTMLButtonElement>()

  if (isAuthenticated && user?.role === 'MANAGER') {
    return <Navigate to="/manager" replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login('MANAGER', email, password)
      navigate('/manager')
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const togglePassword = (e: MouseEvent<HTMLButtonElement>) => {
    ripple(e)
    setShowPassword((prev) => !prev)
  }

  return (
    <AuthLayout mobileVariant="form" mobileBackTo="/">
      <img
        src="/insuretech logo (1).png"
        alt="InsureTech Logo"
        className="auth-form-logo auth-form-logo--in-card"
      />

      <div className="auth-form-avatar">
        <User />
      </div>

      <h1 className="auth-form-title">Manager Sign In</h1>
      <p className="auth-form-subtitle">
        View and manage your assigned students
      </p>

      {error && (
        <div className="auth-error">
          <AlertCircle />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="manager-email" className="auth-field-label">
            Email
          </label>
          <div className="auth-field-input-wrapper auth-field-input-wrapper--has-icon">
            <Mail className="auth-field-icon" aria-hidden />
            <input
              id="manager-email"
              type="email"
              className={`auth-field-input${error ? ' error' : ''}`}
              placeholder="e.g. ahmed@alkheerow.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="manager-password" className="auth-field-label">
            Password
          </label>
          <div className="auth-field-input-wrapper auth-field-input-wrapper--has-icon">
            <Lock className="auth-field-icon" aria-hidden />
            <input
              id="manager-password"
              type={showPassword ? 'text' : 'password'}
              className={`auth-field-input auth-field-input--password${error ? ' error' : ''}`}
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="auth-password-toggle auth-pressable"
              onClick={togglePassword}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-[18px] w-[18px]" />
              ) : (
                <Eye className="h-[18px] w-[18px]" />
              )}
            </button>
          </div>
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

      <p className="auth-footer auth-footer--switch">
        <Link to="/">← Back to home</Link>
      </p>
    </AuthLayout>
  )
}
