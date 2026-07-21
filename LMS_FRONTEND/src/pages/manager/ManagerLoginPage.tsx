
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ApiClientError } from '../../api/client'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useAuth } from '../../context/AuthContext'

export function ManagerLoginPage() {
  const { login, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img
            src="/insuretech logo (1).png"
            alt="InsureTech Logo"
            className="mx-auto mb-4 h-16 w-16 rounded-2xl object-cover shadow-md"
          />
          <h1 className="text-2xl font-bold text-slate-900">Manager Sign In</h1>
          <p className="mt-1 text-sm text-slate-500">
            View and manage your assigned students
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          {error && (
            <div className="mb-4">
              <Alert variant="error">{error}</Alert>
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" className="mt-6 w-full" loading={loading}>
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link to="/" className="font-medium text-brand-600 hover:text-brand-700">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}
