import { useEffect, useState, type FormEvent } from 'react'
import { getProfile, updateProfile } from '../../api/student'
import { ApiClientError } from '../../api/client'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Spinner } from '../../components/ui/helpers'
import { useAuth } from '../../context/AuthContext'

export function StudentProfilePage() {
  const { updateUser } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    getProfile()
      .then((student) => {
        setFullName(student.fullName)
        setEmail(student.email)
        setPhone(student.phone || '')
        setAddress(student.address || '')
      })
      .catch((err) =>
        setError(err instanceof ApiClientError ? err.message : 'Failed to load profile'),
      )
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      const payload: Record<string, string> = { fullName, phone, address }
      if (password) payload.password = password

      const updated = await updateProfile(payload)
      updateUser(updated)
      setPassword('')
      setSuccess('Profile updated successfully')
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Update failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          Update your personal information
        </p>
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
        <Input label="Email" type="email" value={email} disabled />
        <p className="-mt-2 text-xs text-slate-500">
          Email cannot be changed. Contact your administrator if needed.
        </p>
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
        <Input
          label="New Password (optional)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
        />

        <Button type="submit" loading={submitting}>
          Save Changes
        </Button>
      </form>
    </div>
  )
}
