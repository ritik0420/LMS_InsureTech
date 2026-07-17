import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { onboardStudent } from '../../api/student'
import { useAuth } from '../../context/AuthContext'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { ArrowRight, ArrowLeft, Upload, Check, LogOut } from 'lucide-react'

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

export function StudentOnboardingPage() {
  const navigate = useNavigate()
  const { user, updateUser, logout } = useAuth()
  
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [fullName, setFullName] = useState(user?.fullName || '')
  const [phone, setPhone] = useState('')
  const [currentStatusCityState, setCurrentStatusCityState] = useState('')
  const [visaStatus, setVisaStatus] = useState('')
  const [visaExpiryDate, setVisaExpiryDate] = useState('')
  const [resume, setResume] = useState<File | null>(null)
  const [totalExperience, setTotalExperience] = useState('')
  const [preferredDesignation, setPreferredDesignation] = useState('')
  const [preferredLocations, setPreferredLocations] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [openToRelocation, setOpenToRelocation] = useState('')
  const [expectedSalary, setExpectedSalary] = useState('')
  const [preferredJobType, setPreferredJobType] = useState<string[]>([])
  const [expectedSalaryPeriod, setExpectedSalaryPeriod] = useState('')
  const [securityClearance, setSecurityClearance] = useState('')

  const handleJobTypeChange = (option: string, checked: boolean) => {
    if (checked) {
      setPreferredJobType((prev) => [...prev, option])
    } else {
      setPreferredJobType((prev) => prev.filter((item) => item !== option))
    }
  }

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

  const validateStep = (currentStep: number) => {
    setError('')
    if (currentStep === 1) {
      if (!fullName.trim()) return 'Full Legal Name is required'
      if (!phone.trim()) return 'US Contact Number is required'
      if (!currentStatusCityState.trim()) return 'Current Status / City, State is required'
    } else if (currentStep === 2) {
      if (!visaStatus) return 'Current Visa Status is required'
      if (!resume) return 'Resume upload is required'
      if (!totalExperience.trim()) return 'Total Experience description is required'
      if (!securityClearance.trim()) return 'Security Clearance details are required'
    } else if (currentStep === 3) {
      if (!preferredDesignation.trim()) return 'Preferred Job Designation is required'
      if (!preferredLocations.trim()) return 'Preferred Locations is required'
      if (!openToRelocation) return 'Relocation preference is required'
      if (preferredJobType.length === 0) return 'Select at least one Preferred Job Type'
      if (!expectedSalary.trim()) return 'Expected Salary is required'
      if (!expectedSalaryPeriod.trim()) return 'Expected salary period is required'
    }
    return ''
  }

  const nextStep = () => {
    const validationError = validateStep(step)
    if (validationError) {
      setError(validationError)
      return
    }
    setStep((prev) => Math.min(prev + 1, 3))
  }

  const prevStep = () => {
    setError('')
    setStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    const validationError = validateStep(3)
    if (validationError) {
      setError(validationError)
      return
    }

    if (!resume) {
      setError('Please upload your resume')
      return
    }

    setSubmitting(true)
    const formData = new FormData()
    formData.append('fullName', fullName)
    formData.append('phone', phone)
    formData.append('currentStatusCityState', currentStatusCityState)
    formData.append('visaStatus', visaStatus)
    if (visaExpiryDate) formData.append('visaExpiryDate', visaExpiryDate)
    formData.append('resume', resume)
    formData.append('totalExperience', totalExperience)
    formData.append('preferredDesignation', preferredDesignation)
    formData.append('preferredLocations', preferredLocations)
    if (dateOfBirth) formData.append('dateOfBirth', dateOfBirth)
    formData.append('openToRelocation', openToRelocation)
    formData.append('expectedSalary', expectedSalary)
    formData.append('preferredJobType', JSON.stringify(preferredJobType))
    formData.append('expectedSalaryPeriod', expectedSalaryPeriod)
    formData.append('securityClearance', securityClearance)

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
    <div className="flex min-h-screen flex-col bg-slate-50 py-12 sm:px-6 lg:px-8">
      {/* Logout Button */}
      <div className="fixed top-4 right-4 z-50 sm:absolute sm:top-6 sm:right-6">
        <button
          type="button"
          onClick={() => {
            logout()
            navigate('/login')
          }}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-200 hover:shadow-md active:scale-95"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="flex justify-center">
          <img
            src="/insuretech logo (1).png"
            alt="InsureTech Logo"
            className="h-12 w-12 rounded-xl object-cover shadow-lg shadow-cyan-500/20"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-slate-900">
          Job Application Information
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Please fill out the details below to complete your profile setup.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-100 sm:p-8">
          
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
              <span className={step >= 1 ? 'text-cyan-600' : ''}>1. Contact & Personal</span>
              <span className={step >= 2 ? 'text-cyan-600' : ''}>2. Visa & Resume</span>
              <span className={step >= 3 ? 'text-cyan-600' : ''}>3. Preferences</span>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-blue-500 transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          {error && (
            <div className="mb-6">
              <Alert variant="error">{error}</Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* STEP 1: Personal Info */}
            {step === 1 && (
              <div className="space-y-5">
                <h3 className="text-lg font-medium text-slate-900 border-b border-slate-100 pb-2">
                  Contact & Personal Details
                </h3>
                <Input
                  label="Full Legal Name (as per passport) *"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Fitzgerald Doe"
                  required
                />
                <Input
                  label="Email ID *"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed"
                />
                <p className="-mt-3 text-xs text-slate-400">
                  Email is linked to your signup account and cannot be modified.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="US Contact Number *"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 019-2834"
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
                  placeholder="e.g. Austin, TX"
                  required
                />
              </div>
            )}

            {/* STEP 2: Visa & Experience */}
            {step === 2 && (
              <div className="space-y-5">
                <h3 className="text-lg font-medium text-slate-900 border-b border-slate-100 pb-2">
                  Visa & Professional Information
                </h3>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Current Visa Status *
                  </label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {VISA_STATUS_OPTIONS.map((option) => (
                      <label
                        key={option}
                        className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition hover:bg-slate-50 ${
                          visaStatus === option
                            ? 'border-cyan-500 bg-cyan-50/50 ring-1 ring-cyan-500'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="visaStatus"
                          value={option}
                          checked={visaStatus === option}
                          onChange={(e) => setVisaStatus(e.target.value)}
                          className="h-4 w-4 border-slate-300 text-cyan-600 focus:ring-cyan-500"
                        />
                        <span className="text-sm font-medium text-slate-800">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Input
                  label="Visa Expiry Date"
                  type="date"
                  value={visaExpiryDate}
                  onChange={(e) => setVisaExpiryDate(e.target.value)}
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Upload updated resume *
                  </label>
                  <div className="flex justify-center rounded-xl border border-dashed border-slate-300 px-6 py-6 transition hover:border-cyan-500">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-10 w-10 text-slate-400" />
                      <div className="flex text-sm text-slate-600">
                        <label className="relative cursor-pointer rounded-md bg-white font-semibold text-cyan-600 hover:text-cyan-500 focus-within:outline-none">
                          <span>Upload a file</span>
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={handleFileChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-slate-500">PDF, PNG, JPG up to 10MB</p>
                      {resume && (
                        <div className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800">
                          <Check className="h-4 w-4" />
                          {resume.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Input
                  label="Total Experience * (e.g. '5 years of frontend development')"
                  value={totalExperience}
                  onChange={(e) => setTotalExperience(e.target.value)}
                  placeholder="e.g. 3 years in sales, 2 years in tech support"
                  required
                />

                <Input
                  label="Security Clearance * (e.g. None / Active Secret / Public Trust)"
                  value={securityClearance}
                  onChange={(e) => setSecurityClearance(e.target.value)}
                  placeholder="e.g. None"
                  required
                />
              </div>
            )}

            {/* STEP 3: Job Preferences */}
            {step === 3 && (
              <div className="space-y-5">
                <h3 className="text-lg font-medium text-slate-900 border-b border-slate-100 pb-2">
                  Job & Location Preferences
                </h3>

                <Input
                  label="Preferred Job Designation *"
                  value={preferredDesignation}
                  onChange={(e) => setPreferredDesignation(e.target.value)}
                  placeholder="e.g. InsureTech Analyst / Underwriting Assistant"
                  required
                />

                <Input
                  label="Preferred Locations (US/CA) *"
                  value={preferredLocations}
                  onChange={(e) => setPreferredLocations(e.target.value)}
                  placeholder="e.g. Austin, TX / Remote"
                  required
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Open to Relocation? *
                  </label>
                  <div className="flex gap-4">
                    {['Yes', 'No'].map((option) => (
                      <label
                        key={option}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg border p-3 cursor-pointer transition hover:bg-slate-50 ${
                          openToRelocation === option
                            ? 'border-cyan-500 bg-cyan-50/50 ring-1 ring-cyan-500'
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
                    Preferred Job Type * (Select all that apply)
                  </label>
                  <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
                    {JOB_TYPE_OPTIONS.map((option) => {
                      const isChecked = preferredJobType.includes(option)
                      return (
                        <label
                          key={option}
                          className={`flex items-center gap-2.5 rounded-lg border p-2.5 cursor-pointer transition hover:bg-slate-50 ${
                            isChecked
                              ? 'border-cyan-500 bg-cyan-50/30'
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => handleJobTypeChange(option, e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                          />
                          <span className="text-sm font-medium text-slate-700">{option}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Expected Salary (Annual in USD / Hourly Rate for contract) *"
                    value={expectedSalary}
                    onChange={(e) => setExpectedSalary(e.target.value)}
                    placeholder="e.g. $80,000 / $55/hr"
                    required
                  />
                  <Input
                    label="Expected salary period *"
                    value={expectedSalaryPeriod}
                    onChange={(e) => setExpectedSalaryPeriod(e.target.value)}
                    placeholder="e.g. Annual / Hourly"
                    required
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4 border-t border-slate-100">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={prevStep}
                  className="flex items-center gap-1.5"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              ) : (
                <div /> // Spacer
              )}

              {step < 3 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-700"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  loading={submitting}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:opacity-95 shadow-md shadow-cyan-500/20"
                >
                  Complete Onboarding
                </Button>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}
