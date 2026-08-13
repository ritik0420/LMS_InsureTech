import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { onboardStudent } from '../../api/student'
import { useAuth } from '../../context/AuthContext'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Upload, Check, LogOut } from 'lucide-react'

const VISA_STATUS_OPTIONS = [
  'US Citizen',
  'Green Card Holder',
  'H1B',
  'H4 EAD',
  'OPT',
  'CPT',
  'L1/L2',
  'F1 (No)',
  'Other visa status',
]

const COUNTRY_OPTIONS = [
  { code: 'US', name: 'United States', dial: '+1' },
  { code: 'IN', name: 'India', dial: '+91' },
  { code: 'CA', name: 'Canada', dial: '+1' },
  { code: 'GB', name: 'United Kingdom', dial: '+44' },
  { code: 'AU', name: 'Australia', dial: '+61' },
  { code: 'DE', name: 'Germany', dial: '+49' },
  { code: 'FR', name: 'France', dial: '+33' },
  { code: 'JP', name: 'Japan', dial: '+81' },
  { code: 'CN', name: 'China', dial: '+86' },
  { code: 'BR', name: 'Brazil', dial: '+55' },
  { code: 'MX', name: 'Mexico', dial: '+52' },
  { code: 'KR', name: 'South Korea', dial: '+82' },
  { code: 'SG', name: 'Singapore', dial: '+65' },
  { code: 'AE', name: 'United Arab Emirates', dial: '+971' },
  { code: 'ZA', name: 'South Africa', dial: '+27' },
  { code: 'NG', name: 'Nigeria', dial: '+234' },
  { code: 'PH', name: 'Philippines', dial: '+63' },
  { code: 'PK', name: 'Pakistan', dial: '+92' },
  { code: 'BD', name: 'Bangladesh', dial: '+880' },
  { code: 'ID', name: 'Indonesia', dial: '+62' },
  { code: 'MY', name: 'Malaysia', dial: '+60' },
  { code: 'NZ', name: 'New Zealand', dial: '+64' },
  { code: 'IE', name: 'Ireland', dial: '+353' },
  { code: 'NL', name: 'Netherlands', dial: '+31' },
  { code: 'IT', name: 'Italy', dial: '+39' },
  { code: 'ES', name: 'Spain', dial: '+34' },
  { code: 'SE', name: 'Sweden', dial: '+46' },
  { code: 'CH', name: 'Switzerland', dial: '+41' },
  { code: 'SA', name: 'Saudi Arabia', dial: '+966' },
  { code: 'KE', name: 'Kenya', dial: '+254' },
]

export function StudentOnboardingPage() {
  const navigate = useNavigate()
  const { user, updateUser, logout } = useAuth()

  if (user?.isOnboarded) {
    return <Navigate to="/student" replace />
  }

  if (!user?.studentCategory) {
    return <Navigate to="/student/category" replace />
  }

  if (user.studentCategory !== 'JobPlacement') {
    return <Navigate to="/student/training-onboard" replace />
  }

  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [fullName, setFullName] = useState(user?.fullName || '')
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState('')
  const [currentStatusCityState, setCurrentStatusCityState] = useState('')
  const [visaStatus, setVisaStatus] = useState('')
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

    if (!fullName.trim()) { setError('Full Name is required'); return }
    if (!country) { setError('Country is required'); return }
    if (!phone.trim()) { setError('Phone number is required'); return }
    if (!currentStatusCityState.trim()) { setError('Current City/State is required'); return }
    if (!visaStatus) { setError('Current Visa Status is required'); return }
    if (!resume) { setError('Resume upload is required'); return }

    setSubmitting(true)
    const formData = new FormData()
    formData.append('fullName', fullName)
    formData.append('phone', phone)
    formData.append('country', country)
    formData.append('currentStatusCityState', currentStatusCityState)
    formData.append('visaStatus', visaStatus)
    formData.append('resume', resume)

    try {
      const updatedUser = await onboardStudent(formData)
      updateUser(updatedUser)
      navigate('/student')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Onboarding failed')
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
          <div className="training-onboard-page__badge !bg-indigo-100 !text-indigo-700">
            Job Placement
          </div>
          <h2 className="training-onboard-page__title">Complete Your Profile</h2>
          <p className="training-onboard-page__subtitle">
            Fill in a few details to get started with job placement. You can add more information later in your profile.
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
              placeholder="Your full legal name"
              required
            />

            {/* Email (read-only) */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Email ID</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400">Email is linked to your account and cannot be changed.</p>
            </div>

            {/* Country & Phone */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Country *</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="">Select your country</option>
                  {COUNTRY_OPTIONS.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Phone Number *</label>
                <div className="flex">
                  <span className="inline-flex items-center rounded-l-lg border border-r-0 border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-500">
                    {country ? COUNTRY_OPTIONS.find((c) => c.code === country)?.dial || '—' : '—'}
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={country === 'US' ? '(555) 019-2834' : 'Enter phone number'}
                    required
                    className="block w-full rounded-r-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>

            <Input
              label="Current Location / City, State *"
              value={currentStatusCityState}
              onChange={(e) => setCurrentStatusCityState(e.target.value)}
              placeholder={country === 'US' ? 'e.g. Austin, TX' : 'e.g. London, England'}
              required
            />

            {/* Visa Status */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Current Visa Status *</label>
              <select
                value={visaStatus}
                onChange={(e) => setVisaStatus(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="">Select Visa Status</option>
                {VISA_STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Resume */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Upload Resume *
              </label>
              <div className="flex justify-center rounded-xl border border-dashed border-slate-300 px-6 py-6 transition hover:border-indigo-500 cursor-pointer">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-9 w-9 text-slate-400" />
                  <div className="flex text-sm text-slate-600">
                    <label className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                      <span>Upload a file</span>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                        onChange={handleFileChange}
                        className="sr-only"
                        required
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
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:opacity-95 shadow-md shadow-indigo-500/20 justify-center"
              >
                Complete Onboarding
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
