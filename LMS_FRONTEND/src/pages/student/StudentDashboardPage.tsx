import { Award, FileText, User, type LucideIcon } from 'lucide-react'
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

      {/* HORIZONTAL SINGLE ROW FOR BOTH MOBILE & DESKTOP */}
      <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
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
            description={`${docCount} uploaded`}
            to="/student/documents"
            color="cyan"
          />
          <DashboardCard
            icon={Award}
            title="Certificates"
            description={`${certCount} available`}
            to="/student/certificates"
            color="emerald"
          />
        </div>
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
  icon: LucideIcon
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
      className="group block rounded-lg p-2.5 transition hover:bg-slate-50 sm:rounded-xl sm:border sm:border-slate-200 sm:bg-white sm:p-5 sm:shadow-sm sm:hover:border-slate-300 sm:hover:shadow-md sm:hover:bg-white"
    >
      <div className={`mb-2 inline-flex rounded-lg p-2 transition sm:mb-3 sm:p-2.5 ${colors[color]}`}>
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>
      <h3 className="text-xs font-semibold text-slate-900 sm:text-base">{title}</h3>
      <p className="mt-0.5 text-[11px] text-slate-500 sm:mt-1 sm:text-sm">{description}</p>
    </Link>
  )
}