export type Role = 'ADMIN' | 'MANAGER' | 'STUDENT'

export interface User {
  id?: string
  _id?: string
  fullName: string
  email: string
  role: Role
  phone?: string
  country?: string
  address?: string
  isActive?: boolean
  documents?: Document[]
  certificates?: Certificate[]
  classLinks?: ClassLink[]
  invoices?: Invoice[]
  isOnboarded?: boolean
  currentStatusCityState?: string
  visaStatus?: string
  visaExpiryDate?: string
  resumeFile?: Document
  resume2File?: Document
  coverLetterFile?: Document
  totalExperience?: string
  preferredDesignation?: string
  preferredLocations?: string
  dateOfBirth?: string
  openToRelocation?: string
  expectedSalary?: string
  preferredJobType?: string[]
  expectedSalaryPeriod?: string
  securityClearance?: string
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

export interface ClassLink {
  _id: string
  title: string
  url: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

export interface Invoice {
  _id: string
  title: string
  amount: number
  currency: string
  description?: string
  status: 'Pending' | 'Paid' | 'Overdue'
  dueDate?: string
  paymentLink?: string
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

