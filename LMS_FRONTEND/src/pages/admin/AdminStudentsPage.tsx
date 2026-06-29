import { Plus, Search, UserCheck, UserX, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listStudents } from '../../api/admin'
import { ApiClientError } from '../../api/client'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { EmptyState, getUserId, Spinner } from '../../components/ui/helpers'
import type { User } from '../../types'

export function AdminStudentsPage() {
  const [students, setStudents] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    listStudents()
      .then(setStudents)
      .catch((err) =>
        setError(err instanceof ApiClientError ? err.message : 'Failed to load students'),
      )
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return students
    return students.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q),
    )
  }, [students, search])

  const activeCount = students.filter((s) => s.isActive !== false).length

  if (loading) return <Spinner label="Loading students..." />

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Students</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage enrolled learners and their certificates
          </p>
        </div>
        <Link to="/admin/students/new">
          <Button>
            <Plus className="h-4 w-4" />
            Add Student
          </Button>
        </Link>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Users} label="Total Students" value={students.length} />
        <StatCard icon={UserCheck} label="Active" value={activeCount} color="emerald" />
        <StatCard
          icon={UserX}
          label="Inactive"
          value={students.length - activeCount}
          color="slate"
        />
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No students found"
          description={
            search
              ? 'Try a different search term'
              : 'Create your first student to get started'
          }
          action={
            !search ? (
              <Link to="/admin/students/new">
                <Button>Add Student</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Student
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:table-cell">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Certs
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((student) => (
                <tr key={getUserId(student)} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{student.fullName}</p>
                    <p className="text-sm text-slate-500">{student.email}</p>
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-slate-600 sm:table-cell">
                    {student.phone || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge active={student.isActive !== false} />
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {student.certificates?.length ?? 0}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/admin/students/${getUserId(student)}`}
                      className="text-sm font-medium text-brand-600 hover:text-brand-700"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color = 'brand',
}: {
  icon: typeof Users
  label: string
  value: number
  color?: 'brand' | 'emerald' | 'slate'
}) {
  const colors = {
    brand: 'bg-brand-50 text-brand-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    slate: 'bg-slate-100 text-slate-600',
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-2 ${colors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
        active
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-slate-100 text-slate-600'
      }`}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}
