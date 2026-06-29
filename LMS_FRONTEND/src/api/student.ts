import { apiRequest, downloadFile } from './client'
import type { Certificate, Document, User } from '../types'

export async function getProfile() {
  const data = await apiRequest<{ student: User }>('/student/profile')
  return data.student
}

export async function updateProfile(payload: {
  fullName?: string
  phone?: string
  address?: string
  password?: string
}) {
  const data = await apiRequest<{ message: string; student: User }>(
    '/student/profile',
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  )
  return data.student
}

export async function listDocuments() {
  const data = await apiRequest<{ documents: Document[] }>('/student/documents')
  return data.documents
}

export async function uploadDocument(file: File) {
  const formData = new FormData()
  formData.append('document', file)

  const data = await apiRequest<{ message: string; document: Document }>(
    '/student/documents',
    {
      method: 'POST',
      body: formData,
    },
  )
  return data.document
}

export async function deleteDocument(documentId: string) {
  return apiRequest<{ message: string }>(`/student/documents/${documentId}`, {
    method: 'DELETE',
  })
}

export async function listCertificates() {
  const data = await apiRequest<{ certificates: Certificate[] }>(
    '/student/certificates',
  )
  return data.certificates
}

export async function downloadCertificate(
  certificateId: string,
  filename: string,
) {
  return downloadFile(
    `/student/certificates/${certificateId}/download`,
    filename,
  )
}
