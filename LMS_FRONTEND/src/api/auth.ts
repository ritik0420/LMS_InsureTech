import { apiRequest, setStoredUser, setToken } from './client'
import type { AuthResponse } from '../types'

export async function adminLogin(email: string, password: string) {
  const data = await apiRequest<AuthResponse>('/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  setToken(data.token)
  setStoredUser(data.user)
  return data
}

export async function studentLogin(email: string, password: string) {
  const data = await apiRequest<AuthResponse>('/auth/student/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  setToken(data.token)
  setStoredUser(data.user)
  return data
}

export function logout() {
  setToken(null)
  setStoredUser(null)
}
