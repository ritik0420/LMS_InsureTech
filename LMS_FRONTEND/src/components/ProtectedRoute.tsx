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

    if (!user.isOnboarded) {
      if (user.studentCategory === 'Training') {
        if (location.pathname !== '/student/training-onboard') {
          return <Navigate to="/student/training-onboard" replace />
        }
      } else if (user.studentCategory === 'JobPlacement') {
        if (location.pathname !== '/student/onboarding') {
          return <Navigate to="/student/onboarding" replace />
        }
      } else if (!isPreOnboardPath) {
        return <Navigate to="/student/category" replace />
      }
    }

    if (user.isOnboarded && isPreOnboardPath) {
      return <Navigate to="/student" replace />
    }
  }

  return <Outlet />
}

