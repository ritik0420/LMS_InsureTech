import {
  CheckCircle2,
  Eye,
  EyeOff,
  Users,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Star,
} from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'

const initialFormData = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
}

/* ── Testimonials (same data as AuthLayout for consistency) ── */
const testimonials = [
  {
    quote:
      'Cloud DevOps support was exceptional with a successful result.',
    name: 'Celestine Ndip',
    role: '2 reviews',
    company: '5 months ago',
    rating: 5,
  },
  {
    quote:
      'My experience with the InsureTech Skills classes for cyber security has been positive. The sessions are practical, well-structured, and focused on real-world applications.',
    name: 'Derrick Enohnyaket',
    role: '1 review',
    company: '5 months ago',
    rating: 5,
  },
  {
    quote:
      'Great team! I have had a great experience so far with AWS Solutions Architecture. They are flexible, supportive, and professional. I highly recommend them.',
    name: 'TCHINDRO SOSSA',
    role: '5 reviews',
    company: '2 months ago',
    rating: 5,
  },
]

export function LandingPage() {
  const navigate = useNavigate()
  const { signup, user, isAuthenticated } = useAuth()

  if (isAuthenticated && user) {
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />
    if (user.role === 'MANAGER') return <Navigate to="/manager" replace />
    return <Navigate to="/student" replace />
  }
  const [showSignupForm, setShowSignupForm] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [formData, setFormData] = useState(initialFormData)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

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

  const testimonial = testimonials[currentTestimonial]



  /* ── Shared signup form markup ── */
  const signupForm = (
    <form onSubmit={handleSubmit}>
      {/* Name row */}
      <div className="landing-name-row">
        <div className="auth-field">
          <label htmlFor="signup-firstName" className="auth-field-label">
            First name
          </label>
          <div className="auth-field-input-wrapper">
            <input
              id="signup-firstName"
              type="text"
              name="firstName"
              className="auth-field-input"
              placeholder="John"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        <div className="auth-field">
          <label htmlFor="signup-lastName" className="auth-field-label">
            Last name
          </label>
          <div className="auth-field-input-wrapper">
            <input
              id="signup-lastName"
              type="text"
              name="lastName"
              className="auth-field-input"
              placeholder="Doe"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
      </div>

      {/* Email */}
      <div className="auth-field">
        <label htmlFor="signup-email" className="auth-field-label">
          Email
        </label>
        <div className="auth-field-input-wrapper">
          <input
            id="signup-email"
            type="email"
            name="email"
            className="auth-field-input"
            placeholder="e.g. ahmed@alkheerow.com"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      {/* Password */}
      <div className="auth-field">
        <label htmlFor="signup-password" className="auth-field-label">
          Password
        </label>
        <div className="auth-field-input-wrapper">
          <input
            id="signup-password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            className="auth-field-input"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleInputChange}
            required
            style={{ paddingRight: '2.75rem' }}
          />
          <button
            type="button"
            className="auth-password-toggle"
            onClick={() => setShowPassword(prev => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div className="auth-field">
        <label htmlFor="signup-confirmPassword" className="auth-field-label">
          Confirm password
        </label>
        <div className="auth-field-input-wrapper">
          <input
            id="signup-confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            className="auth-field-input"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
            style={{ paddingRight: '2.75rem' }}
          />
          <button
            type="button"
            className="auth-password-toggle"
            onClick={() => setShowConfirmPassword(prev => !prev)}
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
          </button>
        </div>
      </div>

      {submitMessage && (
        <div className={submitMessage.type === 'error' ? 'auth-error' : 'landing-success-msg'}>
          {submitMessage.type === 'error' ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
          <span>{submitMessage.text}</span>
        </div>
      )}

      <button
        type="submit"
        className="auth-submit-btn"
        disabled={isSubmitting}
      >
        {isSubmitting && <span className="auth-spinner" />}
        {isSubmitting ? 'Creating account...' : 'Create an account'}
      </button>

      <p className="auth-footer">
        Already have an account?{' '}
        <Link to="/student/login">Log in</Link>
      </p>
    </form>
  )

  return (
    <div className="landing-page">
      {/* ═══════════════  HERO ═══════════════ */}
      <section className="landing-hero">
        {/* ── Left Panel (blue gradient) ── */}
        <div className="landing-hero-left">

          {/* Globe */}
          <div className="auth-globe-container">
            <img
              src="/globe_illustration.png"
              alt="Global Network"
              className="auth-globe-image"
            />
            <div className="auth-floating-avatar auth-avatar-1">
              <svg viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="14" r="6" fill="rgba(255,255,255,0.9)" />
                <path d="M6 32c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="rgba(255,255,255,0.9)" strokeWidth="2" fill="rgba(255,255,255,0.3)" />
              </svg>
            </div>
            <div className="auth-floating-avatar auth-avatar-2">
              <svg viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="14" r="6" fill="rgba(255,255,255,0.9)" />
                <path d="M6 32c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="rgba(255,255,255,0.9)" strokeWidth="2" fill="rgba(255,255,255,0.3)" />
              </svg>
            </div>
            <div className="auth-floating-avatar auth-avatar-3">
              <svg viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="14" r="6" fill="rgba(255,255,255,0.9)" />
                <path d="M6 32c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="rgba(255,255,255,0.9)" strokeWidth="2" fill="rgba(255,255,255,0.3)" />
              </svg>
            </div>
            <div className="auth-connection-dot auth-dot-1" />
            <div className="auth-connection-dot auth-dot-2" />
            <div className="auth-connection-dot auth-dot-3" />
          </div>

          {/* Testimonial */}
          <div className="auth-testimonial">
            <p className="auth-testimonial-quote">
              &ldquo;{testimonial.quote}&rdquo;
            </p>
            <div className="auth-testimonial-footer">
              <div className="auth-testimonial-info">
                <p className="auth-testimonial-name">{testimonial.name}</p>
                <p className="auth-testimonial-role">{testimonial.role}</p>
                <p className="auth-testimonial-company">{testimonial.company}</p>
              </div>
              <div className="auth-testimonial-rating">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="auth-star" />
                ))}
              </div>
            </div>
            <div className="auth-testimonial-nav">
              <button
                type="button"
                onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                className="auth-nav-btn"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="auth-nav-icon" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
                className="auth-nav-btn"
                aria-label="Next testimonial"
              >
                <ChevronRight className="auth-nav-icon" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Right Panel (form) ── */}
        <div className="landing-hero-right">
          <div className="landing-hero-form-wrap">
            {/* Logo */}
            <img
              src="/insuretech logo (1).png"
              alt="InsureTech Logo"
              className="auth-form-logo"
            />

            <h1 className="auth-form-title">Create Account</h1>
            <p className="auth-form-subtitle">
              Your informations are secure and will not be shared with anyone
            </p>

            {signupForm}
          </div>
        </div>
      </section>

      {/* ═══════════════  FOOTER ═══════════════ */}
      <footer className="landing-footer">
        <p>
          © {new Date().getFullYear()} InsureTech LMS. Built with precision.
        </p>
      </footer>

      {/* ═══════════════  SIGNUP MODAL ═══════════════ */}
      {showSignupForm && (
        <div className="landing-modal-overlay" onClick={() => setShowSignupForm(false)}>
          <div className="landing-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowSignupForm(false)}
              className="landing-modal-close"
              aria-label="Close"
            >
              ×
            </button>
            <div className="auth-form-avatar" style={{ marginTop: '0.2rem' }}>
              <Users />
            </div>
            <h2 className="auth-form-title">Create Account</h2>
            <p className="auth-form-subtitle">
              Your informations are secure and will not be shared with anyone
            </p>
            {signupForm}
          </div>
        </div>
      )}
    </div>
  )
}
