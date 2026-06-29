import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  createStudent,
  getStudent,
  updateStudent,
} from '../../api/admin'
import { ApiClientError } from '../../api/client'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Spinner } from '../../components/ui/helpers'

export function AdminStudentFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!id) return
    getStudent(id)
      .then((student) => {
        setFullName(student.fullName)
        setEmail(student.email)
        setPhone(student.phone || '')
        setAddress(student.address || '')
        setIsActive(student.isActive !== false)
      })
      .catch((err) =>
        setError(err instanceof ApiClientError ? err.message : 'Failed to load student'),
      )
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      if (isEdit && id) {
        const payload: Record<string, unknown> = {
          fullName,
          email,
          phone,
          address,
          isActive,
        }
        if (password) payload.password = password

        await updateStudent(id, payload)
        setSuccess('Student updated successfully')
      } else {
        await createStudent({
          fullName,
          email,
          password,
          phone: phone || undefined,
          address: address || undefined,
        })
        navigate('/admin/students')
      }
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link
          to={isEdit && id ? `/admin/students/${id}` : '/admin/students'}
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          ← Back
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          {isEdit ? 'Edit Student' : 'Add Student'}
        </h1>
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <Input
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label={isEdit ? 'New Password (optional)' : 'Password'}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={!isEdit}
          minLength={6}
        />
        <Input
          label="Phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Textarea
          label="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={3}
        />

        {isEdit && (
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            Active account
          </label>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={submitting}>
            {isEdit ? 'Save Changes' : 'Create Student'}
          </Button>
          <Link to="/admin/students">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
