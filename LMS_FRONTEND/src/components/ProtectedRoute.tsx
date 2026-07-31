import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../types'

interface ProtectedRouteProps {
  role: Role
}

function getLoginPath(role: Role) {
  if (role === 'ADMIN') return '/admin/login'
  if (role === 'MANAGER') return '/manager/login'
  return '/student/login'
}

function getHomePath(role: Role) {
  if (role === 'ADMIN') return '/admin'
  if (role === 'MANAGER') return '/manager'
  return '/student'
}

export function ProtectedRoute({ role }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated || !user) {
    return <Navigate to={getLoginPath(role)} replace />
  }

  if (user.role !== role) {
    return <Navigate to={getHomePath(user.role)} replace />
  }

  if (role === 'STUDENT') {
    const PRE_ONBOARD_PATHS = [
      '/student/category',
      '/student/onboarding',
      '/student/training-onboard',
    ]
    const isPreOnboardPath = PRE_ONBOARD_PATHS.includes(location.pathname)

    // Not yet onboarded → must be on one of the pre-onboard pages
    if (!user.isOnboarded && !isPreOnboardPath) {
      return <Navigate to="/student/category" replace />
    }

    // Already onboarded → don't let them revisit the setup pages
    if (user.isOnboarded && isPreOnboardPath) {
      return <Navigate to="/student" replace />
    }
  }

  return <Outlet />
}

