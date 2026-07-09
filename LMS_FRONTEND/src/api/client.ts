import type { ApiError } from '../types'

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'production'
    ? 'https://lms-backend.k4yuwc.easypanel.host/api'
    : '/api')

export class ApiClientError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
  }
}

function getToken(): string | null {
  return localStorage.getItem('lms_token')
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem('lms_token', token)
  } else {
    localStorage.removeItem('lms_token')
  }
}

export function getStoredUser() {
  const raw = localStorage.getItem('lms_user')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setStoredUser(user: unknown | null) {
  if (user) {
    localStorage.setItem('lms_user', JSON.stringify(user))
  } else {
    localStorage.removeItem('lms_user')
  }
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as ApiError
    return data.message || 'Something went wrong'
  } catch {
    return response.statusText || 'Something went wrong'
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken()
  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const message = await parseError(response)
    throw new ApiClientError(message, response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    return response as unknown as T
  }

  return response.json() as Promise<T>
}

export async function downloadFile(path: string, filename: string) {
  const token = getToken()
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  if (!response.ok) {
    const message = await parseError(response)
    throw new ApiClientError(message, response.status)
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
