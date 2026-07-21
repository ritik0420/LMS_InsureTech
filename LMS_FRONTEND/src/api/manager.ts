import { apiRequest } from './client'
import type { User } from '../types'

export async function listAssignedStudents() {
  const data = await apiRequest<{ students: User[] }>('/manager/students')
  return data.students
}

export async function getAssignedStudent(id: string) {
  const data = await apiRequest<{ student: User }>(`/manager/students/${id}`)
  return data.student
}
