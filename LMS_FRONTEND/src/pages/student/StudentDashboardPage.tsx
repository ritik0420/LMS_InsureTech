import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  FileText,
  Link2,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProfile } from '../../api/student'
import { ApiClientError } from '../../api/client'
import { Alert } from '../../components/ui/Alert'
import { Spinner } from '../../components/ui/helpers'
import { useAuth } from '../../context/AuthContext'
import type { User as UserType } from '../../types'

/* ─────────────────── helpers ─────────────────── */

function getInitials(name?: string | null) {
  if (!name) return '?'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('')
}

function timeAgo(dateStr?: string | null) {
  if (!dateStr) return 'Unknown'
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

type ProfileField = { label: string; value: unknown }

function calcCompletion(profile: UserType | null): { pct: number; missing: string[] } {
  if (!profile) return { pct: 0, missing: [] }

  const fields: ProfileField[] = [
    { label: 'Email', value: profile.email },
    { label: 'Phone', value: profile.phone },
    { label: 'Country', value: profile.country },
    { label: 'Address', value: profile.address },
    { label: 'Date of Birth', value: profile.dateOfBirth },
    { label: 'Visa Status', value: profile.visaStatus },
    { label: 'Total Experience', value: profile.totalExperience },
    { label: 'Preferred Designation', value: profile.preferredDesignation },
    { label: 'Preferred Locations', value: profile.preferredLocations },
    { label: 'Expected Salary', value: profile.expectedSalary },
  ]

  const missing = fields.filter((f) => !f.value).map((f) => f.label)
  const pct = Math.round(((fields.length - missing.length) / fields.length) * 100)
  return { pct, missing }
}

/* ─────────────────── Main Page ─────────────────── */

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
  const linkCount = profile?.classLinks?.length ?? 0
  const invoiceCount = profile?.invoices?.length ?? 0

  const firstName = user?.fullName?.split(' ')[0] || 'Student'
  const initials = getInitials(user?.fullName)
  const { pct, missing } = calcCompletion(profile)

  /* Recent Activity: merge docs, certs, links, invoices and pick latest 5 */
  type ActivityItem = { type: 'doc' | 'cert' | 'link' | 'payment'; name: string; date?: string }
  const activity: ActivityItem[] = [
    ...(profile?.documents ?? []).map((d) => ({
      type: 'doc' as const,
      name: d.originalName,
      date: d.createdAt,
    })),
    ...(profile?.certificates ?? []).map((c) => ({
      type: 'cert' as const,
      name: c.title || c.originalName,
      date: c.createdAt,
    })),
    ...(profile?.classLinks ?? []).map((l) => ({
      type: 'link' as const,
      name: l.title,
      date: l.createdAt,
    })),
    ...(profile?.invoices ?? []).map((i) => ({
      type: 'payment' as const,
      name: i.title,
      date: i.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime())
    .slice(0, 5)

  const upcomingClasses = (profile?.classLinks ?? []).slice(0, 4)
  const classAccents = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0, overflow: 'hidden' }}>
      {error && <Alert variant="error">{error}</Alert>}

      {/* ══════════ HERO BANNER ══════════ */}
      <div className="db-hero">
        <div className="db-hero__inner">
          {/* Avatar */}
          <div className="db-hero__avatar" aria-label={`Avatar for ${user?.fullName}`}>
            {initials}
          </div>

          {/* Text */}
          <div className="db-hero__text">
            <p className="db-hero__greeting">Welcome back</p>
            <h1 className="db-hero__name">{firstName} 👋</h1>
            <p className="db-hero__email">{user?.email}</p>

            {/* Stat badges */}
            <div className="db-hero__stats">
              <span className="db-hero__stat">
                <FileText style={{ width: 14, height: 14 }} />
                <span className="db-hero__stat-num">{docCount}</span>
                Document{docCount !== 1 ? 's' : ''}
              </span>
              <span className="db-hero__stat">
                <Award style={{ width: 14, height: 14 }} />
                <span className="db-hero__stat-num">{certCount}</span>
                Certificate{certCount !== 1 ? 's' : ''}
              </span>
              <span className="db-hero__stat">
                <CreditCard style={{ width: 14, height: 14 }} />
                <span className="db-hero__stat-num">{invoiceCount}</span>
                Invoice{invoiceCount !== 1 ? 's' : ''}
              </span>
            </div>

            <Link to="/student/profile" className="db-hero__cta">
              <User style={{ width: 14, height: 14 }} />
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      {/* ══════════ NAVIGATION CARDS ══════════ */}
      <div className="db-cards-grid">
        <DashboardCard
          icon={User}
          title="Profile"
          count={null}
          description="Personal information"
          to="/student/profile"
          color="brand"
        />
        <DashboardCard
          icon={FileText}
          title="Documents"
          count={docCount}
          description="Uploaded files"
          to="/student/documents"
          color="cyan"
        />
        <DashboardCard
          icon={Award}
          title="Certificates"
          count={certCount}
          description="Earned certificates"
          to="/student/certificates"
          color="emerald"
        />
        <DashboardCard
          icon={Link2}
          title="Class Links"
          count={linkCount}
          description="Shared class links"
          to="/student/class-links"
          color="indigo"
        />
        <DashboardCard
          icon={CreditCard}
          title="Payments"
          count={invoiceCount}
          description="Invoices & billing"
          to="/student/payments"
          color="amber"
        />
      </div>

      {/* ══════════ PROFILE COMPLETION + PERSONAL INFO ══════════ */}
      <div className="db-bottom-grid">
        {/* Profile Completion */}
        <div className="db-widget">
          <div className="db-widget__header">
            <div className="db-widget__title-group">
              <div className="db-widget__icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                <CheckCircle2 style={{ width: 18, height: 18 }} />
              </div>
              <div>
                <p className="db-widget__title">Profile Completion</p>
                <p className="db-widget__subtitle">{pct}% complete</p>
              </div>
            </div>
            <Link to="/student/profile" className="db-widget__action">
              Complete
            </Link>
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom: '1rem' }}>
            <div className="db-progress-bar-track">
              <div
                className="db-progress-bar-fill"
                style={{ width: `${pct}%` }}
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>0%</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: pct >= 80 ? '#16a34a' : pct >= 50 ? '#2563eb' : '#d97706' }}>
                {pct}%
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>100%</span>
            </div>
          </div>

          {/* Missing fields */}
          {missing.length > 0 ? (
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Missing fields
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.125rem' }}>
                {missing.slice(0, 6).map((f) => (
                  <div key={f} className="db-missing-field">
                    <span className="db-missing-field__dot" />
                    {f}
                  </div>
                ))}
                {missing.length > 6 && (
                  <div className="db-missing-field" style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                    +{missing.length - 6} more
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', fontSize: '0.875rem', fontWeight: 600 }}>
              <CheckCircle2 style={{ width: 16, height: 16 }} />
              Profile is complete!
            </div>
          )}
        </div>

        {/* Personal Information */}
        <div className="db-widget">
          <div className="db-widget__header">
            <div className="db-widget__title-group">
              <div className="db-widget__icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                <User style={{ width: 18, height: 18 }} />
              </div>
              <div>
                <p className="db-widget__title">Personal Information</p>
                <p className="db-widget__subtitle">Your contact details</p>
              </div>
            </div>
            <Link to="/student/profile" className="db-widget__action">
              Edit
            </Link>
          </div>

          <div className="db-info-grid">
            <div className="db-info-row">
              <div className="db-info-row__icon">
                <Mail style={{ width: 14, height: 14 }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p className="db-info-row__label">Email</p>
                <p className="db-info-row__value">{profile?.email || '—'}</p>
              </div>
            </div>

            <div className="db-info-row">
              <div className="db-info-row__icon">
                <Phone style={{ width: 14, height: 14 }} />
              </div>
              <div>
                <p className="db-info-row__label">Phone</p>
                <p className="db-info-row__value">{profile?.phone || 'Not set'}</p>
              </div>
            </div>

            <div className="db-info-row">
              <div className="db-info-row__icon" style={{ background: '#faf5ff', color: '#7c3aed' }}>
                <Shield style={{ width: 14, height: 14 }} />
              </div>
              <div>
                <p className="db-info-row__label">Visa Status</p>
                <p className="db-info-row__value">{profile?.visaStatus || 'Not set'}</p>
              </div>
            </div>

            <div className="db-info-row">
              <div className="db-info-row__icon" style={{ background: '#fff7ed', color: '#ea580c' }}>
                <MapPin style={{ width: 14, height: 14 }} />
              </div>
              <div>
                <p className="db-info-row__label">Country</p>
                <p className="db-info-row__value">{profile?.country || 'Not set'}</p>
              </div>
            </div>

            {profile?.address && (
              <div className="db-info-row db-info-row--span">
                <div className="db-info-row__icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                  <MapPin style={{ width: 14, height: 14 }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p className="db-info-row__label">Address</p>
                  <p className="db-info-row__value">{profile.address}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════ RECENT ACTIVITY + UPCOMING CLASSES ══════════ */}
      <div className="db-bottom-grid">
        {/* Recent Activity */}
        <div className="db-widget">
          <div className="db-widget__header">
            <div className="db-widget__title-group">
              <div className="db-widget__icon" style={{ background: '#faf5ff', color: '#7c3aed' }}>
                <BookOpen style={{ width: 18, height: 18 }} />
              </div>
              <div>
                <p className="db-widget__title">Recent Activity</p>
                <p className="db-widget__subtitle">Latest uploads & updates</p>
              </div>
            </div>
          </div>

          {activity.length === 0 ? (
            <div className="db-empty">
              <BookOpen className="db-empty__icon" />
              <p className="db-empty__text">No activity yet. Start by uploading a document.</p>
            </div>
          ) : (
            <div className="db-activity-list">
              {activity.map((item, i) => {
                const iconClass =
                  item.type === 'doc'
                    ? 'db-activity-icon--doc'
                    : item.type === 'cert'
                      ? 'db-activity-icon--cert'
                      : item.type === 'payment'
                        ? 'db-activity-icon--payment'
                        : 'db-activity-icon--link'
                const badge =
                  item.type === 'doc'
                    ? 'Doc'
                    : item.type === 'cert'
                      ? 'Cert'
                      : item.type === 'payment'
                        ? 'Invoice'
                        : 'Link'
                const badgeClass =
                  item.type === 'doc'
                    ? 'db-activity-badge--doc'
                    : item.type === 'cert'
                      ? 'db-activity-badge--cert'
                      : 'db-activity-badge--link'
                const ActivityIcon =
                  item.type === 'doc'
                    ? FileText
                    : item.type === 'cert'
                      ? Award
                      : item.type === 'payment'
                        ? CreditCard
                        : Link2
                return (
                  <div key={i} className="db-activity-item">
                    <div className={`db-activity-icon ${iconClass}`}>
                      <ActivityIcon style={{ width: 16, height: 16 }} />
                    </div>
                    <div className="db-activity-content">
                      <p className="db-activity-name">{item.name}</p>
                      <p className="db-activity-meta">{timeAgo(item.date)}</p>
                    </div>
                    <span className={`db-activity-badge ${badgeClass}`}>{badge}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Upcoming Classes */}
        <div className="db-widget">
          <div className="db-widget__header">
            <div className="db-widget__title-group">
              <div className="db-widget__icon" style={{ background: '#fffbeb', color: '#d97706' }}>
                <Link2 style={{ width: 18, height: 18 }} />
              </div>
              <div>
                <p className="db-widget__title">Class Links</p>
                <p className="db-widget__subtitle">Access your classes</p>
              </div>
            </div>
            <Link to="/student/class-links" className="db-widget__action">
              View all
            </Link>
          </div>

          {upcomingClasses.length === 0 ? (
            <div className="db-empty">
              <Link2 className="db-empty__icon" />
              <p className="db-empty__text">No class links yet. Check back soon.</p>
            </div>
          ) : (
            <div>
              {upcomingClasses.map((cls, i) => (
                <div key={cls._id} className="db-class-item">
                  <div
                    className="db-class-accent"
                    style={{ background: classAccents[i % classAccents.length] }}
                  />
                  <div className="db-class-info">
                    <p className="db-class-title">{cls.title}</p>
                    <p className="db-class-desc">
                      {cls.description || 'Click to join the session'}
                    </p>
                  </div>
                  <a
                    href={cls.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="db-class-join-btn"
                    aria-label={`Join ${cls.title}`}
                  >
                    <ExternalLink style={{ width: 13, height: 13 }} />
                    Join
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────── DashboardCard ─────────────────── */

type CardColor = 'brand' | 'cyan' | 'emerald' | 'indigo' | 'amber'

function DashboardCard({
  icon: Icon,
  title,
  count,
  description,
  to,
  color,
}: {
  icon: typeof User
  title: string
  count: number | null
  description: string
  to: string
  color: CardColor
}) {
  return (
    <Link to={to} className={`db-card db-card--${color}`}>
      <div className="db-card__icon-wrap">
        <Icon style={{ width: 24, height: 24 }} />
      </div>
      {count !== null && <div className="db-card__count">{count}</div>}
      <h3 className="db-card__title">{title}</h3>
      <p className="db-card__desc">{description}</p>
      <div className="db-card__arrow">
        <ArrowRight style={{ width: 14, height: 14 }} />
      </div>
    </Link>
  )
}
