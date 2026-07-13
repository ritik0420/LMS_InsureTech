import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../types'

interface ProtectedRouteProps {
  role: Role
}

export function ProtectedRoute({ role }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated || !user) {
    return <Navigate to={role === 'ADMIN' ? '/admin/login' : '/student/login'} replace />
  }

  if (user.role !== role) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/student'} replace />
  }

  if (role === 'STUDENT') {
    if (!user.isOnboarded && location.pathname !== '/student/onboarding') {
      return <Navigate to="/student/onboarding" replace />
    }
    if (user.isOnboarded && location.pathname === '/student/onboarding') {
      return <Navigate to="/student" replace />
    }
  }

  return <Outlet />
}
