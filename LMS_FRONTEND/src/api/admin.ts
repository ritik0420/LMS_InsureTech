import { apiRequest } from './client'
import type { Certificate, User } from '../types'

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
