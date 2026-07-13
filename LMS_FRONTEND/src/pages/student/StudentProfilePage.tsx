import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { getProfile, updateProfile, downloadResume, updateResume } from '../../api/student'
import { ApiClientError } from '../../api/client'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Spinner } from '../../components/ui/helpers'
import { useAuth } from '../../context/AuthContext'
import { FileText, Download, Upload } from 'lucide-react'

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

export function StudentProfilePage() {
  const { updateUser } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [password, setPassword] = useState('')

  // Onboarding fields
  const [currentStatusCityState, setCurrentStatusCityState] = useState('')
  const [visaStatus, setVisaStatus] = useState('')
  const [visaExpiryDate, setVisaExpiryDate] = useState('')
  const [resumeFile, setResumeFile] = useState<any>(null)
  const [totalExperience, setTotalExperience] = useState('')
  const [preferredDesignation, setPreferredDesignation] = useState('')
  const [preferredLocations, setPreferredLocations] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [openToRelocation, setOpenToRelocation] = useState('')
  const [expectedSalary, setExpectedSalary] = useState('')
  const [preferredJobType, setPreferredJobType] = useState<string[]>([])
  const [expectedSalaryPeriod, setExpectedSalaryPeriod] = useState('')
  const [securityClearance, setSecurityClearance] = useState('')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [resumeReplacing, setResumeReplacing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    getProfile()
      .then((student) => {
        setFullName(student.fullName)
        setEmail(student.email)
        setPhone(student.phone || '')
        setAddress(student.address || '')
        setCurrentStatusCityState(student.currentStatusCityState || '')
        setVisaStatus(student.visaStatus || '')
        setVisaExpiryDate(student.visaExpiryDate ? student.visaExpiryDate.substring(0, 10) : '')
        setResumeFile(student.resumeFile || null)
        setTotalExperience(student.totalExperience || '')
        setPreferredDesignation(student.preferredDesignation || '')
        setPreferredLocations(student.preferredLocations || '')
        setDateOfBirth(student.dateOfBirth ? student.dateOfBirth.substring(0, 10) : '')
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

    setError('')
    setSuccess('')
    setResumeReplacing(true)

    try {
      const updatedResume = await updateResume(file)
      setResumeFile(updatedResume)
      setSuccess('Resume updated successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to replace resume')
    } finally {
      setResumeReplacing(false)
    }
  }

  const handleDownloadResume = async () => {
    if (!resumeFile) return
    try {
      await downloadResume(resumeFile.originalName)
    } catch (err) {
      setError('Failed to download resume')
    }
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
        address,
        currentStatusCityState,
        visaStatus,
        visaExpiryDate: visaExpiryDate || null,
        totalExperience,
        preferredDesignation,
        preferredLocations,
        dateOfBirth: dateOfBirth || null,
        openToRelocation,
        expectedSalary,
        preferredJobType,
        expectedSalaryPeriod,
        securityClearance,
      }
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
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          View and update your personal, visa, and professional details.
        </p>
      </div>

      {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')}>{success}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Personal Info */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">
            1. Personal & Contact Details
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
            <Input
              label="US Contact Number *"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Input
              label="Date of Birth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </div>
          <Input
            label="Current Status / City, State (ST) *"
            value={currentStatusCityState}
            onChange={(e) => setCurrentStatusCityState(e.target.value)}
            required
          />
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

        {/* Section 2: Visa & Resume */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">
            2. Visa & Resume Details
          </h3>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Current Visa Status *
              </label>
              <select
                value={visaStatus}
                onChange={(e) => setVisaStatus(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none"
              >
                <option value="">Select Visa Status</option>
                {VISA_STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <Input
              label="Visa Expiry Date"
              type="date"
              value={visaExpiryDate}
              onChange={(e) => setVisaExpiryDate(e.target.value)}
            />
          </div>

          <div className="space-y-2 pt-2">
            <label className="block text-sm font-medium text-slate-700">
              Resume Document
            </label>
            {resumeFile ? (
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-cyan-100 p-2 text-cyan-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{resumeFile.originalName}</p>
                    <p className="text-xs text-slate-500">
                      Uploaded on {new Date(resumeFile.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleDownloadResume}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  <label className="cursor-pointer">
                    <span className="inline-flex items-center gap-1 justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition">
                      <Upload className="h-3.5 w-3.5" />
                      Replace
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="sr-only"
                      onChange={handleResumeReplace}
                      disabled={resumeReplacing}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="flex justify-center rounded-xl border border-dashed border-slate-300 px-6 py-4">
                <label className="cursor-pointer text-center">
                  <Upload className="mx-auto h-8 w-8 text-slate-400" />
                  <span className="mt-1 block text-sm font-semibold text-cyan-600">Upload Resume</span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="sr-only"
                    onChange={handleResumeReplace}
                  />
                </label>
              </div>
            )}
            {resumeReplacing && <p className="text-xs text-cyan-600 animate-pulse">Uploading new resume...</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Total Experience *"
              value={totalExperience}
              onChange={(e) => setTotalExperience(e.target.value)}
              required
            />
            <Input
              label="Security Clearance *"
              value={securityClearance}
              onChange={(e) => setSecurityClearance(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Section 3: Job Preferences */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">
            3. Job Preferences
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Preferred Job Designation *"
              value={preferredDesignation}
              onChange={(e) => setPreferredDesignation(e.target.value)}
              required
            />
            <Input
              label="Preferred Locations (US/CA) *"
              value={preferredLocations}
              onChange={(e) => setPreferredLocations(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 font-semibold">
              Open to Relocation? *
            </label>
            <div className="flex gap-4">
              {['Yes', 'No'].map((option) => (
                <label
                  key={option}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg border p-2.5 cursor-pointer transition hover:bg-slate-50 ${
                    openToRelocation === option
                      ? 'border-cyan-500 bg-cyan-50/20'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="openToRelocation"
                    value={option}
                    checked={openToRelocation === option}
                    onChange={(e) => setOpenToRelocation(e.target.value)}
                    className="h-4 w-4 border-slate-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span className="text-sm font-semibold text-slate-800">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Preferred Job Type *
            </label>
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
              {JOB_TYPE_OPTIONS.map((option) => {
                const isChecked = preferredJobType.includes(option)
                return (
                  <label
                    key={option}
                    className={`flex items-center gap-2 rounded-lg border p-2 cursor-pointer transition hover:bg-slate-50 ${
                      isChecked
                        ? 'border-cyan-500 bg-cyan-50/20'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => handleJobTypeChange(option, e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                    />
                    <span className="text-xs font-medium text-slate-700">{option}</span>
                  </label>
                )
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Expected Salary *"
              value={expectedSalary}
              onChange={(e) => setExpectedSalary(e.target.value)}
              required
            />
            <Input
              label="Expected Salary Period *"
              value={expectedSalaryPeriod}
              onChange={(e) => setExpectedSalaryPeriod(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" loading={submitting} className="flex-1 bg-cyan-600 hover:bg-cyan-700">
            Save Profile Changes
          </Button>
        </div>

      </form>
    </div>
  )
}
