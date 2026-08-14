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
import { DatePicker } from '../../components/ui/DatePicker'
import { TimePicker } from '../../components/ui/TimePicker'

const JOB_TYPE_OPTIONS = [
  'Full-Time',
  'Part-Time',
  'Contract',
  'Remote',
  'Hybrid',
  'On-site',
  'Internship',
]

const VISA_STATUS_OPTIONS = [
  'US Citizen',
  'Green Card',
  'H1B',
  'H4 EAD',
  'OPT',
  'CPT',
  'TN Visa',
  'L1 Visa',
  'Other',
]

const SECURITY_CLEARANCE_OPTIONS = [
  'None',
  'Public Trust',
  'Secret',
  'Top Secret',
  'Top Secret/SCI',
]

const SALARY_PERIOD_OPTIONS = ['Per Hour', 'Per Year', 'Per Month']

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="border-b border-slate-200 pb-2 mb-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </h2>
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  )
}

export function AdminStudentFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  // --- Account Info ---
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isActive, setIsActive] = useState(true)

  // --- Contact & Location ---
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState('')
  const [address, setAddress] = useState('')

  // --- Program Details ---
  const [studentCategory, setStudentCategory] = useState('')
  const [programName, setProgramName] = useState('')
  const [preferTime, setPreferTime] = useState('')
  const [preferDate, setPreferDate] = useState('')
  const [timeZone, setTimeZone] = useState('')

  // --- Job Application Profile ---
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [currentStatusCityState, setCurrentStatusCityState] = useState('')
  const [visaStatus, setVisaStatus] = useState('')
  const [visaExpiryDate, setVisaExpiryDate] = useState('')
  const [totalExperience, setTotalExperience] = useState('')
  const [preferredDesignation, setPreferredDesignation] = useState('')
  const [preferredLocations, setPreferredLocations] = useState('')
  const [openToRelocation, setOpenToRelocation] = useState('')
  const [expectedSalary, setExpectedSalary] = useState('')
  const [expectedSalaryPeriod, setExpectedSalaryPeriod] = useState('')
  const [preferredJobType, setPreferredJobType] = useState<string[]>([])
  const [securityClearance, setSecurityClearance] = useState('')

  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!id) return
    getStudent(id)
      .then((student) => {
        setFullName(student.fullName || '')
        setEmail(student.email || '')
        setPhone(student.phone || '')
        setCountry(student.country || '')
        setAddress(student.address || '')
        setIsActive(student.isActive !== false)
        setStudentCategory(student.studentCategory || '')
        setProgramName(student.programName || '')
        setPreferTime(student.preferTime || '')
        setPreferDate(student.preferDate || '')
        setTimeZone(student.timeZone || '')
        setCurrentStatusCityState(student.currentStatusCityState || '')
        setVisaStatus(student.visaStatus || '')
        setVisaExpiryDate(
          student.visaExpiryDate
            ? new Date(student.visaExpiryDate).toISOString().split('T')[0]
            : '',
        )
        setTotalExperience(student.totalExperience || '')
        setPreferredDesignation(student.preferredDesignation || '')
        setPreferredLocations(student.preferredLocations || '')
        setDateOfBirth(
          student.dateOfBirth
            ? new Date(student.dateOfBirth).toISOString().split('T')[0]
            : '',
        )
        setOpenToRelocation(student.openToRelocation || '')
        setExpectedSalary(student.expectedSalary || '')
        setExpectedSalaryPeriod(student.expectedSalaryPeriod || '')
        setPreferredJobType(student.preferredJobType || [])
        setSecurityClearance(student.securityClearance || '')
      })
      .catch((err) =>
        setError(err instanceof ApiClientError ? err.message : 'Failed to load student'),
      )
      .finally(() => setLoading(false))
  }, [id])

  const toggleJobType = (type: string) => {
    setPreferredJobType((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    )
  }

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
          country,
          address,
          isActive,
          studentCategory: studentCategory || null,
          programName,
          preferTime,
          preferDate,
          timeZone,
          currentStatusCityState,
          visaStatus,
          visaExpiryDate: visaExpiryDate || null,
          totalExperience,
          preferredDesignation,
          preferredLocations,
          dateOfBirth: dateOfBirth || null,
          openToRelocation,
          expectedSalary,
          expectedSalaryPeriod,
          preferredJobType,
          securityClearance,
        }
        if (password) payload.password = password

        await updateStudent(id, payload)
        setSuccess('Student updated successfully')
        window.scrollTo({ top: 0, behavior: 'smooth' })
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
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
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
        {isEdit && (
          <p className="mt-1 text-sm text-slate-500">
            Update any field below. Leave "New Password" blank to keep the current password.
          </p>
        )}
      </div>

      {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')}>{success}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ── Account Info ── */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <SectionHeader title="Account Info" />
          <div className="grid gap-4 sm:grid-cols-2">
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
          </div>
          <Input
            label={isEdit ? 'New Password (leave blank to keep current)' : 'Password'}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!isEdit}
            minLength={6}
          />
          {isEdit && (
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              Active account
            </label>
          )}
        </section>

        {/* ── Contact & Location ── */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <SectionHeader title="Contact & Location" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. United States"
            />
          </div>
          <Textarea
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            placeholder="Street, City, State, ZIP"
          />
        </section>

        {/* ── Program Details ── */}
        {isEdit && (
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <SectionHeader title="Program Details" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Student Category</label>
                <select
                  value={studentCategory}
                  onChange={(e) => setStudentCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="">— Not set —</option>
                  <option value="Training">Training</option>
                  <option value="JobPlacement">Job Placement</option>
                </select>
              </div>
              <Input
                label="Program Name"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                placeholder="e.g. Insurance Tech Bootcamp"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <TimePicker
                label="Preferred Time"
                value={preferTime}
                onChange={setPreferTime}
                placeholder="Select a time"
              />
              <DatePicker
                label="Preferred Date"
                value={preferDate}
                onChange={setPreferDate}
                placeholder="Select a date"
              />
              <Input
                label="Time Zone"
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
                placeholder="e.g. EST, PST"
              />
            </div>
          </section>
        )}

        {/* ── Job Application Profile ── */}
        {isEdit && (
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <SectionHeader title="Job Application Profile" />

            <div className="grid gap-4 sm:grid-cols-2">
              <DatePicker
                label="Date of Birth"
                value={dateOfBirth}
                onChange={setDateOfBirth}
                placeholder="Select date of birth"
              />
              <Input
                label="Current Location (City, State)"
                value={currentStatusCityState}
                onChange={(e) => setCurrentStatusCityState(e.target.value)}
                placeholder="e.g. Austin, TX"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Visa Status"
                value={visaStatus}
                onChange={setVisaStatus}
                options={VISA_STATUS_OPTIONS}
                placeholder="— Select —"
              />
              <DatePicker
                label="Visa Expiry Date"
                value={visaExpiryDate}
                onChange={setVisaExpiryDate}
                placeholder="Select expiry date"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Total Experience"
                value={totalExperience}
                onChange={(e) => setTotalExperience(e.target.value)}
                placeholder="e.g. 3 years"
              />
              <Input
                label="Preferred Designation"
                value={preferredDesignation}
                onChange={(e) => setPreferredDesignation(e.target.value)}
                placeholder="e.g. Software Engineer"
              />
            </div>

            <Input
              label="Preferred Locations"
              value={preferredLocations}
              onChange={(e) => setPreferredLocations(e.target.value)}
              placeholder="e.g. New York, Chicago, Remote"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Open to Relocation?</label>
                <select
                  value={openToRelocation}
                  onChange={(e) => setOpenToRelocation(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="">— Select —</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Maybe">Maybe</option>
                </select>
              </div>
              <SelectField
                label="Security Clearance"
                value={securityClearance}
                onChange={setSecurityClearance}
                options={SECURITY_CLEARANCE_OPTIONS}
                placeholder="— Select —"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Expected Salary"
                value={expectedSalary}
                onChange={(e) => setExpectedSalary(e.target.value)}
                placeholder="e.g. 80000"
              />
              <SelectField
                label="Salary Period"
                value={expectedSalaryPeriod}
                onChange={setExpectedSalaryPeriod}
                options={SALARY_PERIOD_OPTIONS}
                placeholder="— Select —"
              />
            </div>

            {/* Preferred Job Type — pill checkboxes */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Preferred Job Type</label>
              <div className="flex flex-wrap gap-2">
                {JOB_TYPE_OPTIONS.map((type) => (
                  <label
                    key={type}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition select-none ${
                      preferredJobType.includes(type)
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={preferredJobType.includes(type)}
                      onChange={() => toggleJobType(type)}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Actions ── */}
        <div className="flex gap-3">
          <Button type="submit" loading={submitting}>
            {isEdit ? 'Save Changes' : 'Create Student'}
          </Button>
          <Link to={isEdit && id ? `/admin/students/${id}` : '/admin/students'}>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
