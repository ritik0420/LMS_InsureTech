import { Plus, Trash2, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  assignStudentToManager,
  getManager,
  listStudents,
  unassignStudentFromManager,
} from '../../api/admin'
import { ApiClientError } from '../../api/client'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import {
  EmptyState,
  formatDate,
  getUserId,
  Spinner,
} from '../../components/ui/helpers'
import type { User } from '../../types'

export function AdminManagerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [manager, setManager] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [assignOpen, setAssignOpen] = useState(false)
  const [allStudents, setAllStudents] = useState<User[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [assigning, setAssigning] = useState<string | null>(null)
  const [unassigning, setUnassigning] = useState<string | null>(null)

  const loadManager = () => {
    if (!id) return
    setLoading(true)
    getManager(id)
      .then(setManager)
      .catch((err) =>
        setError(err instanceof ApiClientError ? err.message : 'Failed to load manager'),
      )
      .finally(() => setLoading(false))
  }

  useEffect(loadManager, [id])

  const openAssignModal = async () => {
    setAssignOpen(true)
    setLoadingStudents(true)
    try {
      const students = await listStudents()
      setAllStudents(students)
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load students')
    } finally {
      setLoadingStudents(false)
    }
  }

  const assignedIds = new Set(
    ((manager as any)?.assignedStudents || []).map((s: any) =>
      typeof s === 'string' ? s : s._id || s.id,
    ),
  )

  const unassignedStudents = allStudents.filter(
    (s) => !assignedIds.has(getUserId(s)),
  )

  const handleAssign = async (studentId: string) => {
    if (!id) return
    setAssigning(studentId)
    setError('')
    setSuccess('')
    try {
      await assignStudentToManager(id, studentId)
      setSuccess('Student assigned successfully')
      setAssignOpen(false)
      loadManager()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to assign student')
    } finally {
      setAssigning(null)
    }
  }

  const handleUnassign = async (studentId: string) => {
    if (!id) return
    setUnassigning(studentId)
    setError('')
    setSuccess('')
    try {
      await unassignStudentFromManager(id, studentId)
      setSuccess('Student unassigned successfully')
      loadManager()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to unassign student')
    } finally {
      setUnassigning(null)
    }
  }

  if (loading) return <Spinner />
  if (!manager) {
    return (
      <EmptyState
        title="Manager not found"
        action={
          <Link to="/admin/managers">
            <Button variant="secondary">Back to list</Button>
          </Link>
        }
      />
    )
  }

  const assignedStudents = (manager as any).assignedStudents || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/admin/managers"
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            ← All Managers
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">{manager.fullName}</h1>
          <p className="text-sm text-slate-500">{manager.email}</p>
        </div>
      </div>

      {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')}>{success}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard label="Phone" value={manager.phone || '—'} />
        <InfoCard label="Email" value={manager.email} />
        <InfoCard label="Joined" value={formatDate(manager.createdAt)} />
        <InfoCard label="Assigned Students" value={String(assignedStudents.length)} />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-brand-600" />
            <h2 className="text-lg font-semibold text-slate-900">
              Assigned Students ({assignedStudents.length})
            </h2>
          </div>
          <Button size="sm" onClick={openAssignModal}>
            <Plus className="h-4 w-4" />
            Assign Student
          </Button>
        </div>

        {assignedStudents.length === 0 ? (
          <EmptyState
            title="No students assigned"
            description="Assign students to this manager so they can view and manage them"
            action={
              <Button onClick={openAssignModal}>Assign Student</Button>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-100">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Student
                  </th>
                  <th className="hidden px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:table-cell">
                    Status
                  </th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {assignedStudents.map((student: any) => {
                  const sid = student._id || student.id || student
                  return (
                    <tr key={sid} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">
                          {student.fullName || sid}
                        </p>
                        {student.email && (
                          <p className="text-sm text-slate-500">{student.email}</p>
                        )}
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        {student.isActive !== undefined && (
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              student.isActive !== false
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {student.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="danger"
                          size="sm"
                          loading={unassigning === sid}
                          onClick={() => handleUnassign(sid)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Unassign
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        open={assignOpen}
        title="Assign Student"
        onClose={() => setAssignOpen(false)}
      >
        {loadingStudents ? (
          <Spinner label="Loading students..." />
        ) : unassignedStudents.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-500">
            All students are already assigned to this manager.
          </p>
        ) : (
          <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
            {unassignedStudents.map((student) => {
              const sid = getUserId(student)
              return (
                <div
                  key={sid}
                  className="flex items-center justify-between px-1 py-3"
                >
                  <div>
                    <p className="font-medium text-slate-900">{student.fullName}</p>
                    <p className="text-sm text-slate-500">{student.email}</p>
                  </div>
                  <Button
                    size="sm"
                    loading={assigning === sid}
                    onClick={() => handleAssign(sid)}
                  >
                    Assign
                  </Button>
                </div>
              )
            })}
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <Button variant="secondary" onClick={() => setAssignOpen(false)}>
            Close
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
    </div>
  )
}
