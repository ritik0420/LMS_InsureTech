import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { trainingOnboard } from '../../api/student'
import { useAuth } from '../../context/AuthContext'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { DatePicker } from '../../components/ui/DatePicker'
import { TimePicker } from '../../components/ui/TimePicker'
import { Upload, Check, LogOut } from 'lucide-react'

const TIMEZONE_OPTIONS = [
  'America/New_York (EST/EDT)',
  'America/Chicago (CST/CDT)',
  'America/Denver (MST/MDT)',
  'America/Los_Angeles (PST/PDT)',
  'America/Anchorage (AKST/AKDT)',
  'Pacific/Honolulu (HST)',
  'America/Toronto (EST/EDT)',
  'America/Vancouver (PST/PDT)',
  'Europe/London (GMT/BST)',
  'Europe/Berlin (CET/CEST)',
  'Europe/Paris (CET/CEST)',
  'Asia/Kolkata (IST)',
  'Asia/Dubai (GST)',
  'Asia/Singapore (SGT)',
  'Asia/Tokyo (JST)',
  'Asia/Shanghai (CST)',
  'Australia/Sydney (AEST/AEDT)',
  'Pacific/Auckland (NZST/NZDT)',
]

export function StudentTrainingOnboardPage() {
  const navigate = useNavigate()
  const { user, updateUser, logout } = useAuth()

  if (user?.isOnboarded) {
    return <Navigate to="/student" replace />
  }

  if (!user?.studentCategory) {
    return <Navigate to="/student/category" replace />
  }

  if (user.studentCategory !== 'Training') {
    return <Navigate to="/student/onboarding" replace />
  }

  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [fullName, setFullName] = useState(user?.fullName || '')
  const [programName, setProgramName] = useState('')
  const [preferTime, setPreferTime] = useState('')
  const [preferDate, setPreferDate] = useState('')
  const [timeZone, setTimeZone] = useState('')
  const [phone, setPhone] = useState('')
  const [resume, setResume] = useState<File | null>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Resume file size must be under 10MB')
        setResume(null)
      } else {
        setError('')
        setResume(file)
      }
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!fullName.trim()) { setError('Name is required'); return }
    if (!programName.trim()) { setError('Program Name is required'); return }
    if (!preferTime) { setError('Preferred Time is required'); return }
    if (!preferDate) { setError('Preferred Date is required'); return }
    if (!timeZone) { setError('Time Zone is required'); return }
    if (!phone.trim()) { setError('Phone number is required'); return }

    setSubmitting(true)
    const formData = new FormData()
    formData.append('fullName', fullName)
    formData.append('programName', programName)
    formData.append('preferTime', preferTime)
    formData.append('preferDate', preferDate)
    formData.append('timeZone', timeZone)
    formData.append('phone', phone)
    if (resume) formData.append('resume', resume)

    try {
      const updatedUser = await trainingOnboard(formData)
      updateUser(updatedUser)
      navigate('/student')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="training-onboard-page">
      {/* Logout */}
      <div className="training-onboard-page__logout-wrap">
        <button
          type="button"
          onClick={() => { logout(); navigate('/student/login') }}
          className="training-onboard-page__logout-btn"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>

      <div className="training-onboard-page__inner">
        {/* Header */}
        <div className="training-onboard-page__header">
          <div className="training-onboard-page__badge">
            Training Program
          </div>
          <h2 className="training-onboard-page__title">Complete Your Registration</h2>
          <p className="training-onboard-page__subtitle">
            Fill in a few details so we can set up your training session.
          </p>
        </div>

        {/* Card */}
        <div className="training-onboard-page__card">
          {error && (
            <div className="mb-6">
              <Alert variant="error">{error}</Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} className="training-onboard-page__form">
            {/* Name */}
            <Input
              label="Full Name *"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              required
            />

            {/* Program Name */}
            <Input
              label="Program Name *"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              placeholder="e.g. InsureTech Certification Program"
              required
            />

            {/* Email (read-only) */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Mail ID</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400">Email is linked to your account and cannot be changed.</p>
            </div>

            {/* Preferred Date & Time */}
            <div className="training-onboard-page__row">
              <DatePicker
                label="Preferred Date *"
                value={preferDate}
                onChange={setPreferDate}
                required
                placeholder="Pick a date"
              />
              <TimePicker
                label="Preferred Time *"
                value={preferTime}
                onChange={setPreferTime}
                required
                placeholder="Pick a time"
              />
            </div>

            {/* Time Zone */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Time Zone *</label>
              <select
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="">Select your time zone</option>
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>

            {/* Phone */}
            <Input
              label="Phone Number *"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +1 555 019 2834"
              required
            />

            {/* Resume */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Resume
                <span className="ml-2 text-xs font-normal text-slate-400">(Optional)</span>
              </label>
              <div className="flex justify-center rounded-xl border border-dashed border-slate-300 px-6 py-6 transition hover:border-cyan-500 cursor-pointer">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-9 w-9 text-slate-400" />
                  <div className="flex text-sm text-slate-600">
                    <label className="relative cursor-pointer rounded-md bg-white font-semibold text-cyan-600 hover:text-cyan-500 focus-within:outline-none">
                      <span>Upload a file</span>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-slate-500">PDF, PNG, JPG, DOC up to 10MB</p>
                  {resume && (
                    <div className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800">
                      <Check className="h-4 w-4" />
                      {resume.name}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <Button
                type="submit"
                loading={submitting}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:opacity-95 shadow-md shadow-cyan-500/20 justify-center"
              >
                Complete Registration
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
