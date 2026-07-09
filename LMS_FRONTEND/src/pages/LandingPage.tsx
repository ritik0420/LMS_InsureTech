import { CheckCircle2, Eye, EyeOff, Lock, Mail, UserRound, Users, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'

const initialFormData = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export function LandingPage() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [showSignupForm, setShowSignupForm] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [formData, setFormData] = useState(initialFormData)

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitMessage(null)

    if (formData.password !== formData.confirmPassword) {
      setSubmitMessage({ type: 'error', text: 'Passwords do not match.' })
      return
    }

    setIsSubmitting(true)

    try {
      const fullName = [formData.firstName, formData.lastName].filter(Boolean).join(' ').trim()
      await signup(fullName, formData.email, formData.password)

      setFormData(initialFormData)
      setShowSignupForm(false)
      setSubmitMessage({ type: 'success', text: 'Account created. You are signed in.' })
      navigate('/student')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create account right now.'
      setSubmitMessage({ type: 'error', text: message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const highlights = ['Student onboarding', 'Document tracking', 'Instant certificates']

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <section className="relative overflow-hidden bg-white px-4 pt-4 pb-12 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8 lg:pb-16">
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-2xl">
            <img
              src="/insuretech logo (1).png"
              alt="InsureTech Skills logo"
              className="mb-4 h-20 w-20 rounded-xl object-cover object-center sm:h-24 sm:w-24"
            />
            <h2 className="mb-4 font-black leading-tight tracking-tight text-slate-900 sm:text-2xl lg:text-2xl">
              Manage learners and credentials in one polished experience.
            </h2>
            <p className="mb-6 max-w-xl text-lg leading-8 text-slate-600">
              A modern LMS for InsureTech programs where admins stay organized and students can access their profile, documents, and certificates smoothly.
            </p>

            <div className="mb-8 flex flex-wrap gap-3">
              {highlights.map(item => (
                <span key={item} className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-medium text-cyan-700">
                  <CheckCircle2 className="h-4 w-4" />
                  {item}
                </span>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { value: '24/7', label: 'Access' },
                { value: '100%', label: 'Digital records' },
                { value: '3x', label: 'Faster onboarding' },
              ].map(item => (
                <div key={item.label} className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
                  <div className="text-2xl font-semibold text-slate-900">{item.value}</div>
                  <div className="mt-1 text-sm text-slate-600">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[2rem] border border-cyan-100 bg-white p-6 shadow-[0_20px_60px_rgba(6,182,212,0.12)] sm:p-8">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-600">Join now</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Create your student account</h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-600">
                  <Users className="h-6 w-6" />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">First name</label>
                    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-cyan-500 focus-within:bg-white">
                      <UserRound className="mr-2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full bg-transparent text-sm outline-none"
                        placeholder="John"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Last name</label>
                    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-cyan-500 focus-within:bg-white">
                      <UserRound className="mr-2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full bg-transparent text-sm outline-none"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Email address</label>
                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-cyan-500 focus-within:bg-white">
                    <Mail className="mr-2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-transparent text-sm outline-none"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-cyan-500 focus-within:bg-white">
                    <Lock className="mr-2 h-4 w-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full bg-transparent text-sm outline-none"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="ml-2 text-slate-400 transition hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Confirm password</label>
                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-cyan-500 focus-within:bg-white">
                    <Lock className="mr-2 h-4 w-4 text-slate-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full bg-transparent text-sm outline-none"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(prev => !prev)}
                      className="ml-2 text-slate-400 transition hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {submitMessage && (
                  <p className={`text-sm ${submitMessage.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {submitMessage.text}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 w-full rounded-xl bg-cyan-600 px-4 py-3 font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-cyan-400"
                >
                  {isSubmitting ? 'Creating account...' : 'Create Account'}
                </button>

                <p className="text-center text-sm text-slate-500">
                  Already have an account?{' '}
                  <Link to="/student/login" className="font-semibold text-cyan-600 hover:text-cyan-700">
                    Sign in
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-cyan-100 bg-cyan-50/70 p-8 shadow-sm">
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { title: 'Simple onboarding', text: 'Guide students through account setup with a calm, modern flow.' },
                { title: 'Secure records', text: 'Keep documents and approval history in one trusted place.' },
                { title: 'Professional credentials', text: 'Issue certificates that feel polished and easy to share.' },
              ].map(item => (
                <div key={item.title}>
                  <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {showSignupForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] border border-cyan-100 bg-white p-7 shadow-[0_20px_70px_rgba(6,182,212,0.18)] sm:p-8">
            <div className="mb-6 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-600">Create account</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">Welcome aboard</h2>
              </div>
              <button
                onClick={() => setShowSignupForm(false)}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">First name</label>
                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-cyan-500 focus-within:bg-white">
                    <UserRound className="mr-2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full bg-transparent text-sm outline-none"
                      placeholder="John"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Last name</label>
                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-cyan-500 focus-within:bg-white">
                    <UserRound className="mr-2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full bg-transparent text-sm outline-none"
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email address</label>
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-cyan-500 focus-within:bg-white">
                  <Mail className="mr-2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-transparent text-sm outline-none"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-cyan-500 focus-within:bg-white">
                  <Lock className="mr-2 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full bg-transparent text-sm outline-none"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="ml-2 text-slate-400 transition hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Confirm password</label>
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-cyan-500 focus-within:bg-white">
                  <Lock className="mr-2 h-4 w-4 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full bg-transparent text-sm outline-none"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                    className="ml-2 text-slate-400 transition hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {submitMessage && (
                <p className={`text-sm ${submitMessage.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {submitMessage.text}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Creating account...' : 'Create Account'}
              </button>

              <p className="text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/student/login" className="font-semibold text-cyan-600 hover:text-cyan-700">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
