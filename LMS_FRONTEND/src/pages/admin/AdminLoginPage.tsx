
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, AlertCircle, User } from 'lucide-react'
import { ApiClientError } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { AuthLayout } from '../../components/AuthLayout'

export function AdminLoginPage() {
  const { login, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@insuretech.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  if (isAuthenticated && user?.role === 'ADMIN') {
    return <Navigate to="/admin" replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login('ADMIN', email, password)
      navigate('/admin')
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      {/* Avatar icon */}
      <div className="auth-form-avatar">
        <User />
      </div>

      <h1 className="auth-form-title">Admin Sign In</h1>
      <p className="auth-form-subtitle">
        Manage students and certificates
      </p>

      {error && (
        <div className="auth-error">
          <AlertCircle />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Email */}
        <div className="auth-field">
          <label htmlFor="admin-email" className="auth-field-label">
            Email
          </label>
          <div className="auth-field-input-wrapper">
            <input
              id="admin-email"
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

        {/* Password */}
        <div className="auth-field">
          <label htmlFor="admin-password" className="auth-field-label">
            Password
          </label>
          <div className="auth-field-input-wrapper">
            <input
              id="admin-password"
              type={showPassword ? 'text' : 'password'}
              className={`auth-field-input${error ? ' error' : ''}`}
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{ paddingRight: '2.75rem' }}
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
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
          className="auth-submit-btn"
          disabled={loading}
        >
          {loading && <span className="auth-spinner" />}
          Sign In
        </button>
      </form>

      <p className="auth-footer">
        <Link to="/">← Back to home</Link>
      </p>

    </AuthLayout>
  )
}
