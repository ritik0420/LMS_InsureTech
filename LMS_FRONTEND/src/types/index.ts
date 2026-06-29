export type Role = 'ADMIN' | 'STUDENT'

export interface User {
  id?: string
  _id?: string
  fullName: string
  email: string
  role: Role
  phone?: string
  address?: string
  isActive?: boolean
  documents?: Document[]
  certificates?: Certificate[]
  createdAt?: string
  updatedAt?: string
}

export interface Document {
  _id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  createdAt?: string
  updatedAt?: string
}

export interface Certificate {
  _id: string
  title: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  uploadedBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface AuthResponse {
  message: string
  token: string
  user: User
}

export interface ApiError {
  message: string
}
