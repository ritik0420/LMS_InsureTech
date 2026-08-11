import { Filter, Plus, Search, Trash2, UserCheck, UserX, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteStudentPermanently, listStudents } from '../../api/admin'
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
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'Training' | 'JobPlacement'>('all')
  const [onboardingFilter, setOnboardingFilter] = useState<'all' | 'onboarded' | 'not_onboarded'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)

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
    return students.filter((s) => {
      // Search filter
      if (q && !s.fullName.toLowerCase().includes(q) && !s.email.toLowerCase().includes(q)) return false
      // Category filter
      if (categoryFilter === 'Training' && s.studentCategory !== 'Training') return false
      if (categoryFilter === 'JobPlacement' && s.studentCategory !== 'JobPlacement') return false
      // Onboarding filter
      if (onboardingFilter === 'onboarded' && !s.isOnboarded) return false
      if (onboardingFilter === 'not_onboarded' && s.isOnboarded) return false
      // Status filter
      if (statusFilter === 'active' && s.isActive === false) return false
      if (statusFilter === 'inactive' && s.isActive !== false) return false
      return true
    })
  }, [students, search, categoryFilter, onboardingFilter, statusFilter])

  const activeCount = students.filter((s) => s.isActive !== false).length

  const hasActiveFilters = categoryFilter !== 'all' || onboardingFilter !== 'all' || statusFilter !== 'all'

  function clearFilters() {
    setCategoryFilter('all')
    setOnboardingFilter('all')
    setStatusFilter('all')
    setSearch('')
  }

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((s) => selected.has(getUserId(s)))
  const someFilteredSelected = filtered.some((s) => selected.has(getUserId(s)))

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allFilteredSelected) {
        filtered.forEach((s) => next.delete(getUserId(s)))
      } else {
        filtered.forEach((s) => next.add(getUserId(s)))
      }
      return next
    })
  }

  async function handleBulkDelete() {
    const ids = Array.from(selected)
    if (ids.length === 0) return
    const confirmed = window.confirm(
      `Permanently delete ${ids.length} student${ids.length > 1 ? 's' : ''}? This cannot be undone.`,
    )
    if (!confirmed) return

    setDeleting(true)
    setError('')
    try {
      await Promise.all(ids.map((id) => deleteStudentPermanently(id)))
      setStudents((prev) => prev.filter((s) => !ids.includes(getUserId(s))))
      setSelected(new Set())
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to delete students')
    } finally {
      setDeleting(false)
    }
  }

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={Users} label="Total Students" value={students.length} />
        <StatCard icon={UserCheck} label="Active" value={activeCount} color="emerald" />
        <StatCard
          icon={UserX}
          label="Inactive"
          value={students.length - activeCount}
          color="slate"
        />
      </div>

      <div className="flex flex-col gap-3">
        {/* Search + bulk delete row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {someFilteredSelected && (
            <Button variant="danger" onClick={handleBulkDelete} disabled={deleting}>
              <Trash2 className="h-4 w-4" />
              {deleting ? 'Deleting...' : `Delete ${selected.size} selected`}
            </Button>
          )}
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Filter className="h-3.5 w-3.5" />
            Filters:
          </span>

          {/* Category filter */}
          <select
            id="filter-category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="all">All Categories</option>
            <option value="Training">Training</option>
            <option value="JobPlacement">Job Placement</option>
          </select>

          {/* Onboarding filter */}
          <select
            id="filter-onboarding"
            value={onboardingFilter}
            onChange={(e) => setOnboardingFilter(e.target.value as typeof onboardingFilter)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="all">All Onboarding</option>
            <option value="onboarded">Job Profile Submitted</option>
            <option value="not_onboarded">Not Yet Submitted</option>
          </select>

          {/* Status filter */}
          <select
            id="filter-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm hover:bg-slate-50 hover:text-slate-700 transition"
            >
              Clear filters
            </button>
          )}

          {hasActiveFilters && (
            <span className="ml-1 text-xs text-slate-400">
              {filtered.length} of {students.length} shown
            </span>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No students found"
          description={
            hasActiveFilters || search
              ? 'Try adjusting your filters or search term'
              : 'Create your first student to get started'
          }
          action={
            !hasActiveFilters && !search ? (
              <Link to="/admin/students/new">
                <Button>Add Student</Button>
              </Link>
            ) : (
              <button
                onClick={clearFilters}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition"
              >
                Clear filters
              </button>
            )
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      checked={allFilteredSelected}
                      onChange={toggleAll}
                      aria-label="Select all students"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Student
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:table-cell">
                    Category
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:table-cell">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:table-cell">
                    Certs
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((student) => {
                  const id = getUserId(student)
                  const isChecked = selected.has(id)
                  return (
                    <tr
                      key={id}
                      className={`hover:bg-slate-50/80 ${isChecked ? 'bg-brand-50/40' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                          checked={isChecked}
                          onChange={() => toggleOne(id)}
                          aria-label={`Select ${student.fullName}`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{student.fullName}</p>
                        <p className="text-sm text-slate-500 break-all">{student.email}</p>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <CategoryBadge category={student.studentCategory} />
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-slate-600 sm:table-cell">
                        {student.phone || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge active={student.isActive !== false} />
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-slate-600 sm:table-cell">
                        {student.certificates?.length ?? 0}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/admin/students/${id}`}
                          className="text-sm font-medium text-brand-600 hover:text-brand-700"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
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
  color?: 'brand' | 'emerald' | 'slate' | 'indigo' | 'amber'
}) {
  const colors = {
    brand: 'bg-brand-50 text-brand-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    slate: 'bg-slate-100 text-slate-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    amber: 'bg-amber-50 text-amber-600',
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
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
        }`}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

function CategoryBadge({ category }: { category?: 'Training' | 'JobPlacement' | null }) {
  if (!category) {
    return <span className="text-xs text-slate-400">—</span>
  }
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${category === 'Training'
        ? 'bg-indigo-50 text-indigo-700'
        : 'bg-amber-50 text-amber-700'
        }`}
    >
      {category === 'Training' ? 'Training' : 'Job Placement'}
    </span>
  )
}