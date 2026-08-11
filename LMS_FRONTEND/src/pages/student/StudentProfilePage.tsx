import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { getProfile, updateProfile, downloadResume, updateResume, updateResume2, updateCoverLetter, downloadResume2, downloadCoverLetter } from '../../api/student'
import { ApiClientError } from '../../api/client'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Spinner } from '../../components/ui/helpers'
import { useAuth } from '../../context/AuthContext'
import { FileText, Download, Upload, BookOpen, Briefcase, CheckCircle2, Circle } from 'lucide-react'

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

const JOB_TYPE_OPTIONS = [
  'Full-time',
  'Part-time',
  'Contract',
  'Intern',
  'Hybrid',
  'Remote',
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

export function StudentProfilePage() {
  const { updateUser } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState('')
  const [address, setAddress] = useState('')
  const [password, setPassword] = useState('')
  const [studentCategory, setStudentCategory] = useState<'Training' | 'JobPlacement' | null>(null)

  // Shared fields
  const [currentStatusCityState, setCurrentStatusCityState] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')

  // Training-specific fields
  const [programName, setProgramName] = useState('')
  const [preferDate, setPreferDate] = useState('')
  const [preferTime, setPreferTime] = useState('')
  const [timeZone, setTimeZone] = useState('')

  // Job Placement fields
  const [visaStatus, setVisaStatus] = useState('')
  const [visaExpiryDate, setVisaExpiryDate] = useState('')
  const [resumeFile, setResumeFile] = useState<any>(null)
  const [resume2File, setResume2File] = useState<any>(null)
  const [coverLetterFile, setCoverLetterFile] = useState<any>(null)
  const [totalExperience, setTotalExperience] = useState('')
  const [preferredDesignation, setPreferredDesignation] = useState('')
  const [preferredLocations, setPreferredLocations] = useState('')
  const [openToRelocation, setOpenToRelocation] = useState('')
  const [expectedSalary, setExpectedSalary] = useState('')
  const [preferredJobType, setPreferredJobType] = useState<string[]>([])
  const [expectedSalaryPeriod, setExpectedSalaryPeriod] = useState('')
  const [securityClearance, setSecurityClearance] = useState('')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [resumeReplacing, setResumeReplacing] = useState(false)
  const [resume2Replacing, setResume2Replacing] = useState(false)
  const [coverLetterReplacing, setCoverLetterReplacing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    getProfile()
      .then((student) => {
        setFullName(student.fullName)
        setEmail(student.email)
        setPhone(student.phone || '')
        setCountry(student.country || '')
        setAddress(student.address || '')
        setCurrentStatusCityState(student.currentStatusCityState || '')
        setDateOfBirth(student.dateOfBirth ? student.dateOfBirth.substring(0, 10) : '')
        setStudentCategory(student.studentCategory || null)
        // Training fields
        setProgramName(student.programName || '')
        setPreferDate(student.preferDate || '')
        setPreferTime(student.preferTime || '')
        setTimeZone(student.timeZone || '')
        // Job Placement fields
        setVisaStatus(student.visaStatus || '')
        setVisaExpiryDate(student.visaExpiryDate ? student.visaExpiryDate.substring(0, 10) : '')
        setResumeFile(student.resumeFile || null)
        setResume2File(student.resume2File || null)
        setCoverLetterFile(student.coverLetterFile || null)
        setTotalExperience(student.totalExperience || '')
        setPreferredDesignation(student.preferredDesignation || '')
        setPreferredLocations(student.preferredLocations || '')
        setOpenToRelocation(student.openToRelocation || '')
        setExpectedSalary(student.expectedSalary || '')
        setPreferredJobType(student.preferredJobType || [])
        setExpectedSalaryPeriod(student.expectedSalaryPeriod || '')
        setSecurityClearance(student.securityClearance || '')
      })
      .catch((err) =>
        setError(err instanceof ApiClientError ? err.message : 'Failed to load profile'),
      )
      .finally(() => setLoading(false))
  }, [])

  const handleJobTypeChange = (option: string, checked: boolean) => {
    if (checked) {
      setPreferredJobType((prev) => [...prev, option])
    } else {
      setPreferredJobType((prev) => prev.filter((item) => item !== option))
    }
  }

  const handleResumeReplace = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(''); setSuccess(''); setResumeReplacing(true)
    try {
      const updatedResume = await updateResume(file)
      setResumeFile(updatedResume)
      setSuccess('Resume updated successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to replace resume')
    } finally { setResumeReplacing(false) }
  }

  const handleResume2Replace = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(''); setSuccess(''); setResume2Replacing(true)
    try {
      const updated = await updateResume2(file)
      setResume2File(updated)
      setSuccess('Secondary resume updated successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to replace secondary resume')
    } finally { setResume2Replacing(false) }
  }

  const handleCoverLetterReplace = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(''); setSuccess(''); setCoverLetterReplacing(true)
    try {
      const updated = await updateCoverLetter(file)
      setCoverLetterFile(updated)
      setSuccess('Cover letter updated successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to replace cover letter')
    } finally { setCoverLetterReplacing(false) }
  }

  const handleDownloadResume = async () => {
    if (!resumeFile) return
    try { await downloadResume(resumeFile.originalName) } catch { setError('Failed to download resume') }
  }

  const handleDownloadResume2 = async () => {
    if (!resume2File) return
    try { await downloadResume2(resume2File.originalName) } catch { setError('Failed to download secondary resume') }
  }

  const handleDownloadCoverLetter = async () => {
    if (!coverLetterFile) return
    try { await downloadCoverLetter(coverLetterFile.originalName) } catch { setError('Failed to download cover letter') }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      const payload: Record<string, any> = {
        fullName,
        phone,
        country,
        address,
        currentStatusCityState,
        dateOfBirth: dateOfBirth || null,
      }
      if (password) payload.password = password

      if (studentCategory === 'Training') {
        payload.programName = programName
        payload.preferDate = preferDate
        payload.preferTime = preferTime
        payload.timeZone = timeZone
      } else if (studentCategory === 'JobPlacement') {
        payload.visaStatus = visaStatus
        payload.visaExpiryDate = visaExpiryDate || null
        payload.totalExperience = totalExperience
        payload.preferredDesignation = preferredDesignation
        payload.preferredLocations = preferredLocations
        payload.openToRelocation = openToRelocation
        payload.expectedSalary = expectedSalary
        payload.preferredJobType = preferredJobType
        payload.expectedSalaryPeriod = expectedSalaryPeriod
        payload.securityClearance = securityClearance
      }

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

  const isTraining = studentCategory === 'Training'
  const isJobPlacement = studentCategory === 'JobPlacement'

  // Profile completion tracking
  const completionFields = isTraining
    ? [fullName, phone, programName, preferDate, preferTime, timeZone]
    : [fullName, phone, visaStatus, totalExperience, preferredDesignation, preferredLocations, expectedSalary, resumeFile ? 'has-resume' : '']
  const completedCount = completionFields.filter(Boolean).length
  const completionPct = studentCategory ? Math.round((completedCount / completionFields.length) * 100) : 0

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <p className="mt-1 text-sm text-slate-500">
            View and update your personal and program details.
          </p>
        </div>
        {studentCategory && (
          <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold flex-shrink-0 ${
            isTraining
              ? 'bg-cyan-100 text-cyan-700 border border-cyan-200'
              : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
          }`}>
            {isTraining ? <BookOpen className="h-3.5 w-3.5" /> : <Briefcase className="h-3.5 w-3.5" />}
            {isTraining ? 'Training' : 'Job Placement'}
          </div>
        )}
      </div>

      {/* Profile Completion Banner */}
      {studentCategory && completionPct < 100 && (
        <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-semibold text-amber-800">
                Complete your profile — {completionPct}% done
              </span>
            </div>
            <span className="text-xs text-amber-600">{completedCount}/{completionFields.length} fields</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-amber-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-amber-700">
            {isTraining
              ? 'Fill in your program name and preferred session time so we can set up your training.'
              : 'Complete your visa status, experience, and job preferences to get matched with employers.'}
          </p>
        </div>
      )}
      {studentCategory && completionPct === 100 && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span className="text-sm font-semibold text-emerald-700">Profile complete — your information is up to date!</span>
        </div>
      )}

      {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')}>{success}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Section 1: Personal & Contact */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4 sm:p-6">
          <h3 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">1</span>
            Personal &amp; Contact Details
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Full Legal Name *"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input label="Email" type="email" value={email} disabled className="bg-slate-50 cursor-not-allowed" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="">Select your country</option>
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Contact Number</label>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-lg border border-r-0 border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-500">
                  {country ? COUNTRY_OPTIONS.find((c) => c.code === country)?.dial || '—' : '—'}
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={country === 'US' ? '(555) 019-2834' : 'Enter phone number'}
                  className="block w-full rounded-r-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Current Location / City, State"
              value={currentStatusCityState}
              onChange={(e) => setCurrentStatusCityState(e.target.value)}
            />
            <Input
              label="Date of Birth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </div>
          <Textarea
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
          />
          <Input
            label="New Password (optional)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            placeholder="Leave empty to keep current password"
          />
        </div>

        {/* Section 2A: Training Program Details */}
        {isTraining && (
          <div className="rounded-xl border border-cyan-200 bg-white p-4 shadow-sm space-y-4 sm:p-6">
            <h3 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-cyan-100 text-xs font-bold text-cyan-700">2</span>
              Training Program Details
              <span className="ml-auto text-xs font-normal text-slate-400">Schedule your session</span>
            </h3>
            <Input
              label="Program Name *"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              placeholder="e.g. InsureTech Certification Program"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Preferred Date</label>
                <input
                  type="date"
                  value={preferDate}
                  onChange={(e) => setPreferDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Preferred Time</label>
                <input
                  type="time"
                  value={preferTime}
                  onChange={(e) => setPreferTime(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Time Zone</label>
              <select
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="">Select your time zone</option>
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
            {/* Resume for Training */}
            <div className="space-y-2 pt-1">
              <label className="block text-sm font-medium text-slate-700">
                Resume
                <span className="ml-2 text-xs font-normal text-slate-400">(Optional)</span>
              </label>
              {resumeFile ? (
                <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="rounded-lg bg-cyan-100 p-2 text-cyan-600"><FileText className="h-5 w-5" /></div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 break-all">{resumeFile.originalName}</p>
                      <p className="text-xs text-slate-500">Uploaded on {new Date(resumeFile.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="secondary" size="sm" onClick={handleDownloadResume} className="flex items-center gap-1">
                      <Download className="h-4 w-4" />Download
                    </Button>
                    <label className="cursor-pointer">
                      <span className="inline-flex items-center gap-1 justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition">
                        <Upload className="h-3.5 w-3.5" />Replace
                      </span>
                      <input type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" className="sr-only" onChange={handleResumeReplace} disabled={resumeReplacing} />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center rounded-xl border border-dashed border-slate-300 px-6 py-4">
                  <label className="cursor-pointer text-center">
                    <Upload className="mx-auto h-8 w-8 text-slate-400" />
                    <span className="mt-1 block text-sm font-semibold text-cyan-600">Upload Resume</span>
                    <input type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" className="sr-only" onChange={handleResumeReplace} />
                  </label>
                </div>
              )}
              {resumeReplacing && <p className="text-xs text-cyan-600 animate-pulse">Uploading resume...</p>}
            </div>
          </div>
        )}

        {/* Section 2B: Job Placement — Visa & Professional */}
        {isJobPlacement && (
          <>
            <div className="rounded-xl border border-indigo-200 bg-white p-4 shadow-sm space-y-4 sm:p-6">
              <h3 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">2</span>
                Visa &amp; Professional Details
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Current Visa Status *</label>
                  <select
                    value={visaStatus}
                    onChange={(e) => setVisaStatus(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="">Select Visa Status</option>
                    {VISA_STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <Input label="Visa Expiry Date" type="date" value={visaExpiryDate} onChange={(e) => setVisaExpiryDate(e.target.value)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Total Experience *" value={totalExperience} onChange={(e) => setTotalExperience(e.target.value)} placeholder="e.g. 3 years in sales" required />
                <Input label="Security Clearance *" value={securityClearance} onChange={(e) => setSecurityClearance(e.target.value)} placeholder="e.g. None / Active Secret" required />
              </div>

              {/* Resume */}
              <div className="space-y-2 pt-2">
                <label className="block text-sm font-medium text-slate-700">Resume Document</label>
                {resumeFile ? (
                  <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="rounded-lg bg-cyan-100 p-2 text-cyan-600"><FileText className="h-5 w-5" /></div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 break-all">{resumeFile.originalName}</p>
                        <p className="text-xs text-slate-500">Uploaded on {new Date(resumeFile.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="secondary" size="sm" onClick={handleDownloadResume} className="flex items-center gap-1"><Download className="h-4 w-4" />Download</Button>
                      <label className="cursor-pointer">
                        <span className="inline-flex items-center gap-1 justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition"><Upload className="h-3.5 w-3.5" />Replace</span>
                        <input type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" className="sr-only" onChange={handleResumeReplace} disabled={resumeReplacing} />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center rounded-xl border border-dashed border-slate-300 px-6 py-4">
                    <label className="cursor-pointer text-center">
                      <Upload className="mx-auto h-8 w-8 text-slate-400" />
                      <span className="mt-1 block text-sm font-semibold text-cyan-600">Upload Resume</span>
                      <input type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" className="sr-only" onChange={handleResumeReplace} />
                    </label>
                  </div>
                )}
                {resumeReplacing && <p className="text-xs text-cyan-600 animate-pulse">Uploading new resume...</p>}
              </div>

              {/* Secondary Resume */}
              <div className="space-y-2 pt-2">
                <label className="block text-sm font-medium text-slate-700">Secondary Resume <span className="ml-2 text-xs font-normal text-slate-400">(Optional)</span></label>
                {resume2File ? (
                  <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="rounded-lg bg-cyan-100 p-2 text-cyan-600"><FileText className="h-5 w-5" /></div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 break-all">{resume2File.originalName}</p>
                        <p className="text-xs text-slate-500">Uploaded on {new Date(resume2File.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="secondary" size="sm" onClick={handleDownloadResume2} className="flex items-center gap-1"><Download className="h-4 w-4" />Download</Button>
                      <label className="cursor-pointer">
                        <span className="inline-flex items-center gap-1 justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition"><Upload className="h-3.5 w-3.5" />Replace</span>
                        <input type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" className="sr-only" onChange={handleResume2Replace} disabled={resume2Replacing} />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-4">
                    <label className="cursor-pointer text-center">
                      <Upload className="mx-auto h-7 w-7 text-slate-300" />
                      <span className="mt-1 block text-sm font-semibold text-cyan-600">Upload Secondary Resume</span>
                      <p className="text-xs text-slate-400 mt-0.5 italic">e.g. a tailored version</p>
                      <input type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" className="sr-only" onChange={handleResume2Replace} />
                    </label>
                  </div>
                )}
                {resume2Replacing && <p className="text-xs text-cyan-600 animate-pulse">Uploading secondary resume...</p>}
              </div>

              {/* Cover Letter */}
              <div className="space-y-2 pt-2">
                <label className="block text-sm font-medium text-slate-700">Cover Letter <span className="ml-2 text-xs font-normal text-slate-400">(Optional)</span></label>
                {coverLetterFile ? (
                  <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="rounded-lg bg-blue-100 p-2 text-blue-600"><FileText className="h-5 w-5" /></div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 break-all">{coverLetterFile.originalName}</p>
                        <p className="text-xs text-slate-500">Uploaded on {new Date(coverLetterFile.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="secondary" size="sm" onClick={handleDownloadCoverLetter} className="flex items-center gap-1"><Download className="h-4 w-4" />Download</Button>
                      <label className="cursor-pointer">
                        <span className="inline-flex items-center gap-1 justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition"><Upload className="h-3.5 w-3.5" />Replace</span>
                        <input type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" className="sr-only" onChange={handleCoverLetterReplace} disabled={coverLetterReplacing} />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-4">
                    <label className="cursor-pointer text-center">
                      <Upload className="mx-auto h-7 w-7 text-slate-300" />
                      <span className="mt-1 block text-sm font-semibold text-blue-600">Upload Cover Letter</span>
                      <p className="text-xs text-slate-400 mt-0.5 italic">A compelling cover letter can help you stand out</p>
                      <input type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" className="sr-only" onChange={handleCoverLetterReplace} />
                    </label>
                  </div>
                )}
                {coverLetterReplacing && <p className="text-xs text-blue-600 animate-pulse">Uploading cover letter...</p>}
              </div>
            </div>

            {/* Section 3: Job Preferences */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4 sm:p-6">
              <h3 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">3</span>
                Job Preferences
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Preferred Job Designation *" value={preferredDesignation} onChange={(e) => setPreferredDesignation(e.target.value)} placeholder="e.g. InsureTech Analyst" required />
                <Input label="Preferred Locations *" value={preferredLocations} onChange={(e) => setPreferredLocations(e.target.value)} placeholder="e.g. Austin, TX / Remote" required />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 font-semibold">Open to Relocation? *</label>
                <div className="flex gap-4">
                  {['Yes', 'No'].map((option) => (
                    <label key={option} className={`flex flex-1 items-center justify-center gap-2 rounded-lg border p-2.5 cursor-pointer transition hover:bg-slate-50 ${openToRelocation === option ? 'border-cyan-500 bg-cyan-50/20' : 'border-slate-200 bg-white'}`}>
                      <input type="radio" name="openToRelocation" value={option} checked={openToRelocation === option} onChange={(e) => setOpenToRelocation(e.target.value)} className="h-4 w-4 border-slate-300 text-cyan-600 focus:ring-cyan-500" />
                      <span className="text-sm font-semibold text-slate-800">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Preferred Job Type *</label>
                <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
                  {JOB_TYPE_OPTIONS.map((option) => {
                    const isChecked = preferredJobType.includes(option)
                    return (
                      <label key={option} className={`flex items-center gap-2 rounded-lg border p-2 cursor-pointer transition hover:bg-slate-50 ${isChecked ? 'border-cyan-500 bg-cyan-50/20' : 'border-slate-200 bg-white'}`}>
                        <input type="checkbox" checked={isChecked} onChange={(e) => handleJobTypeChange(option, e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500" />
                        <span className="text-xs font-medium text-slate-700">{option}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Expected Salary *" value={expectedSalary} onChange={(e) => setExpectedSalary(e.target.value)} placeholder="e.g. $80,000 / $55/hr" required />
                <Input label="Expected Salary Period *" value={expectedSalaryPeriod} onChange={(e) => setExpectedSalaryPeriod(e.target.value)} placeholder="e.g. Annual / Hourly" required />
              </div>
            </div>
          </>
        )}

        {!studentCategory && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <p className="text-sm text-slate-500">Your program type is not set. Please contact support to assign your category.</p>
          </div>
        )}

        <div className="flex gap-4">
          <Button type="submit" loading={submitting} className="flex-1 bg-cyan-600 hover:bg-cyan-700">
            Save Profile Changes
          </Button>
        </div>

      </form>
    </div>
  )
}
