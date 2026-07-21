import { apiRequest, setStoredUser, setToken } from './client'
import type { AuthResponse, User } from '../types'

export async function adminLogin(email: string, password: string) {
  const data = await apiRequest<AuthResponse>('/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  setToken(data.token)
  setStoredUser(data.user)
  return data
}

export async function managerLogin(email: string, password: string) {
  const data = await apiRequest<AuthResponse>('/auth/manager/login', {
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

export async function registerStudent(payload: {
  fullName: string
  email: string
  password: string
  phone?: string
  address?: string
}) {
  const data = await apiRequest<AuthResponse & { student?: User }>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  setToken(data.token)
  setStoredUser(data.user)
  return data.user
}

export function logout() {
  setToken(null)
  setStoredUser(null)
}

