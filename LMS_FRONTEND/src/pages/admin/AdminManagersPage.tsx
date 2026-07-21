import { Plus, Search, Users } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { createManager, listManagers } from '../../api/admin'
import { ApiClientError } from '../../api/client'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { EmptyState, getUserId, Spinner } from '../../components/ui/helpers'
import type { User } from '../../types'

export function AdminManagersPage() {
  const [managers, setManagers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadManagers = () => {
    setLoading(true)
    listManagers()
      .then(setManagers)
      .catch((err) =>
        setError(err instanceof ApiClientError ? err.message : 'Failed to load managers'),
      )
      .finally(() => setLoading(false))
  }

  useEffect(loadManagers, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return managers
    return managers.filter(
      (m) =>
        m.fullName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q),
    )
  }, [managers, search])

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await createManager({
        fullName: formName,
        email: formEmail,
        password: formPassword,
        phone: formPhone || undefined,
      })
      setCreateOpen(false)
      setFormName('')
      setFormEmail('')
      setFormPassword('')
      setFormPhone('')
      loadManagers()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to create manager')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Spinner label="Loading managers..." />

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Managers</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create managers and assign students to them
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Manager
        </Button>
      </div>

      {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-brand-50 p-2 text-brand-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{managers.length}</p>
              <p className="text-sm text-slate-500">Total Managers</p>
            </div>
          </div>
        </div>
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
          title="No managers found"
          description={
            search
              ? 'Try a different search term'
              : 'Create your first manager to get started'
          }
          action={
            !search ? (
              <Button onClick={() => setCreateOpen(true)}>Add Manager</Button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Manager
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:table-cell">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Assigned Students
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((manager) => (
                <tr key={getUserId(manager)} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{manager.fullName}</p>
                    <p className="text-sm text-slate-500">{manager.email}</p>
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-slate-600 sm:table-cell">
                    {manager.phone || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                      {(manager as any).assignedStudents?.length ?? 0} students
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/admin/managers/${getUserId(manager)}`}
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

      <Modal
        open={createOpen}
        title="Add Manager"
        onClose={() => setCreateOpen(false)}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Full Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            value={formPassword}
            onChange={(e) => setFormPassword(e.target.value)}
            required
            minLength={6}
          />
          <Input
            label="Phone"
            type="tel"
            value={formPhone}
            onChange={(e) => setFormPhone(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Create Manager
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
