import { Award, FileText, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProfile } from '../../api/student'
import { ApiClientError } from '../../api/client'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/helpers'
import { useAuth } from '../../context/AuthContext'
import type { User as UserType } from '../../types'

export function StudentDashboardPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch((err) =>
        setError(err instanceof ApiClientError ? err.message : 'Failed to load profile'),
      )
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const docCount = profile?.documents?.length ?? 0
  const certCount = profile?.certificates?.length ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.fullName?.split(' ')[0] || 'Student'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your profile, documents, and certificates
        </p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardCard
          icon={User}
          title="Profile"
          description="Update your personal information"
          to="/student/profile"
          color="brand"
        />
        <DashboardCard
          icon={FileText}
          title="Documents"
          description={`${docCount} document${docCount !== 1 ? 's' : ''} uploaded`}
          to="/student/documents"
          color="cyan"
        />
        <DashboardCard
          icon={Award}
          title="Certificates"
          description={`${certCount} certificate${certCount !== 1 ? 's' : ''} available`}
          to="/student/certificates"
          color="emerald"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Quick Overview</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase text-slate-500">Email</dt>
            <dd className="mt-1 text-sm text-slate-900">{profile?.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-slate-500">Phone</dt>
            <dd className="mt-1 text-sm text-slate-900">{profile?.phone || 'Not set'}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase text-slate-500">Address</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {profile?.address || 'Not set'}
            </dd>
          </div>
        </dl>
        <Link to="/student/profile" className="mt-4 inline-block">
          <Button variant="secondary" size="sm">
            Edit Profile
          </Button>
        </Link>
      </div>
    </div>
  )
}

function DashboardCard({
  icon: Icon,
  title,
  description,
  to,
  color,
}: {
  icon: typeof User
  title: string
  description: string
  to: string
  color: 'brand' | 'cyan' | 'emerald'
}) {
  const colors = {
    brand: 'bg-brand-50 text-brand-600 group-hover:bg-brand-100',
    cyan: 'bg-cyan-50 text-cyan-600 group-hover:bg-cyan-100',
    emerald: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100',
  }

  return (
    <Link
      to={to}
      className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
    >
      <div className={`mb-3 inline-flex rounded-lg p-2.5 transition ${colors[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </Link>
  )
}
