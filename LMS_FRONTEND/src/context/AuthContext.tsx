import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { adminLogin, logout as apiLogout, managerLogin, registerStudent, studentLogin } from '../api/auth'
import { getStoredUser, setStoredUser } from '../api/client'
import type { Role, User } from '../types'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  login: (role: Role, email: string, password: string) => Promise<User>
  signup: (fullName: string, email: string, password: string) => Promise<User>
  logout: () => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredUser())

  const login = useCallback(async (role: Role, email: string, password: string) => {
    let response
    if (role === 'ADMIN') {
      response = await adminLogin(email, password)
    } else if (role === 'MANAGER') {
      response = await managerLogin(email, password)
    } else {
      response = await studentLogin(email, password)
    }
    setUser(response.user)
    return response.user
  }, [])

  const signup = useCallback(async (fullName: string, email: string, password: string) => {
    const user = await registerStudent({ fullName, email, password })
    setUser(user)
    return user
  }, [])

  const logout = useCallback(() => {
    apiLogout()
    setUser(null)
  }, [])

  const updateUser = useCallback((nextUser: User) => {
    setUser(nextUser)
    setStoredUser(nextUser)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      signup,
      logout,
      updateUser,
    }),
    [user, login, logout, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

