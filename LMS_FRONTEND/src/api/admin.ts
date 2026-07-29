import { apiRequest } from './client'
import type { Certificate, ClassLink, Invoice, User } from '../types'

export async function listStudents() {
  const data = await apiRequest<{ students: User[] }>('/admin/students')
  return data.students
}

export async function getStudent(id: string) {
  const data = await apiRequest<{ student: User }>(`/admin/students/${id}`)
  return data.student
}

export async function createStudent(payload: {
  fullName: string
  email: string
  password: string
  phone?: string
  address?: string
}) {
  const data = await apiRequest<{ message: string; student: User }>(
    '/admin/students',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  )
  return data.student
}

export async function updateStudent(
  id: string,
  payload: Partial<{
    fullName: string
    email: string
    password: string
    phone: string
    address: string
    isActive: boolean
  }>,
) {
  const data = await apiRequest<{ message: string; student: User }>(
    `/admin/students/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  )
  return data.student
}

export async function deactivateStudent(id: string) {
  return apiRequest<{ message: string }>(`/admin/students/${id}`, {
    method: 'DELETE',
  })
}

export async function deleteStudentPermanently(id: string) {
  return apiRequest<{ message: string }>(`/admin/students/${id}/permanent`, {
    method: 'DELETE',
  })
}

export async function uploadCertificate(
  studentId: string,
  file: File,
  title: string,
) {
  const formData = new FormData()
  formData.append('certificate', file)
  formData.append('title', title)

  const data = await apiRequest<{ message: string; certificate: Certificate }>(
    `/admin/students/${studentId}/certificates`,
    {
      method: 'POST',
      body: formData,
    },
  )
  return data.certificate
}

// Manager management

export async function listManagers() {
  const data = await apiRequest<{ managers: User[] }>('/admin/managers')
  return data.managers
}

export async function createManager(payload: {
  fullName: string
  email: string
  password: string
  phone?: string
  address?: string
}) {
  const data = await apiRequest<{ message: string; manager: User }>(
    '/admin/managers',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  )
  return data.manager
}

export async function getManager(id: string) {
  const data = await apiRequest<{ manager: User }>(`/admin/managers/${id}`)
  return data.manager
}

export async function assignStudentToManager(managerId: string, studentId: string) {
  return apiRequest<{ message: string }>(
    `/admin/managers/${managerId}/assign/${studentId}`,
    { method: 'POST' },
  )
}

export async function unassignStudentFromManager(managerId: string, studentId: string) {
  return apiRequest<{ message: string }>(
    `/admin/managers/${managerId}/assign/${studentId}`,
    { method: 'DELETE' },
  )
}

// Class Links

export async function addClassLink(
  studentId: string,
  payload: { title: string; url: string; description?: string },
) {
  const data = await apiRequest<{ message: string; classLink: ClassLink }>(
    `/admin/students/${studentId}/class-links`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  )
  return data.classLink
}

export async function deleteClassLink(studentId: string, linkId: string) {
  return apiRequest<{ message: string }>(
    `/admin/students/${studentId}/class-links/${linkId}`,
    { method: 'DELETE' },
  )
}

// Invoices

export async function addInvoice(
  studentId: string,
  payload: {
    title: string
    amount: number
    currency?: string
    description?: string
    status?: string
    dueDate?: string
    paymentLink?: string
  },
) {
  const data = await apiRequest<{ message: string; invoice: Invoice }>(
    `/admin/students/${studentId}/invoices`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  )
  return data.invoice
}

export async function updateInvoice(
  studentId: string,
  invoiceId: string,
  payload: Partial<{
    title: string
    amount: number
    currency: string
    description: string
    status: string
    dueDate: string
    paymentLink: string
  }>,
) {
  const data = await apiRequest<{ message: string; invoice: Invoice }>(
    `/admin/students/${studentId}/invoices/${invoiceId}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  )
  return data.invoice
}

export async function deleteInvoice(studentId: string, invoiceId: string) {
  return apiRequest<{ message: string }>(
    `/admin/students/${studentId}/invoices/${invoiceId}`,
    { method: 'DELETE' },
  )
}

