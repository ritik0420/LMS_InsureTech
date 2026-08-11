import {
  CheckCircle2,
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  BadgeCheck,
  BookOpen,
  Briefcase,
} from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { ApiClientError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { AuthLayout } from '../components/AuthLayout'
import { useRipple } from '../hooks/useRipple'

const initialFormData = {
  email: '',
  password: '',
  confirmPassword: '',
  referralId: '',
}

const initialLoginData = {
  email: '',
  password: '',
}

export function LandingPage() {
  const navigate = useNavigate()
  const { signup, login, user, isAuthenticated } = useAuth()

  if (isAuthenticated && user) {
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />
    if (user.role === 'MANAGER') return <Navigate to="/manager" replace />
    return <Navigate to="/student" replace />
  }

  const [mobileScreen, setMobileScreen] = useState<'signin' | 'signup'>('signin')
  const ripple = useRipple<HTMLButtonElement>()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loginError, setLoginError] = useState('')
  const [formData, setFormData] = useState(initialFormData)
  const [loginData, setLoginData] = useState(initialLoginData)
  const [studentCategory, setStudentCategory] = useState<'Training' | 'JobPlacement' | null>(null)

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleLoginChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLoginData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setIsLoggingIn(true)

    try {
      await login('STUDENT', loginData.email, loginData.password)
      navigate('/student')
    } catch (err) {
      if (err instanceof ApiClientError) {
        setLoginError('Invalid email or password. Please try again.')
      } else {
        setLoginError('Unable to connect. Please check your internet connection.')
      }
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitMessage(null)

    if (formData.password !== formData.confirmPassword) {
      setSubmitMessage({ type: 'error', text: 'Passwords do not match.' })
      return
    }

    if (!studentCategory) {
      setSubmitMessage({ type: 'error', text: 'Please select your program type (Training or Job Placement).' })
      return
    }

    setIsSubmitting(true)

    try {
      const fullName = formData.email.split('@')[0] || 'Student'
      await signup(fullName, formData.email, formData.password, studentCategory)

      setFormData(initialFormData)
      setStudentCategory(null)
      navigate('/student')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create account right now.'
      setSubmitMessage({ type: 'error', text: message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const authExtrasRow = (
    <div className="auth-extras-row">
      <label className="auth-remember">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="auth-remember-checkbox"
        />
        <span>Remember me</span>
      </label>
      <button type="button" className="auth-forgot-link">
        Forgot password?
      </button>
    </div>
  )

  const signInForm = (
    <form onSubmit={handleLoginSubmit} className="auth-mobile-form">
      <h2 className="auth-card-title">Login</h2>

      {loginError && (
        <div className="auth-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{loginError}</span>
        </div>
      )}

      <div className="auth-field">
        <label htmlFor="login-email" className="auth-field-label">
          Email
        </label>
        <div className="auth-field-input-wrapper auth-field-input-wrapper--has-icon">
          <Mail className="auth-field-icon" aria-hidden />
          <input
            id="login-email"
            type="email"
            name="email"
            className="auth-field-input"
            placeholder="Enter your mail"
            value={loginData.email}
            onChange={handleLoginChange}
            required
            autoComplete="email"
          />
        </div>
      </div>

      <div className="auth-field">
        <label htmlFor="login-password" className="auth-field-label">
          Password
        </label>
        <div className="auth-field-input-wrapper auth-field-input-wrapper--has-icon">
          <Lock className="auth-field-icon" aria-hidden />
          <input
            id="login-password"
            type="password"
            name="password"
            className="auth-field-input"
            placeholder="Enter your Password"
            value={loginData.password}
            onChange={handleLoginChange}
            required
            autoComplete="current-password"
          />
        </div>
      </div>

      {authExtrasRow}

      <button
        type="submit"
        className="auth-submit-btn auth-pressable"
        disabled={isLoggingIn}
        onClick={ripple}
      >
        {isLoggingIn && <span className="auth-spinner" />}
        {isLoggingIn ? 'Signing in...' : 'Sign in'}
      </button>

      <p className="auth-footer auth-footer--switch auth-footer--mobile-only">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          className="auth-footer-link-btn"
          onClick={() => setMobileScreen('signup')}
        >
          Sign up
        </button>
      </p>
    </form>
  )

  const signUpForm = (
    <form onSubmit={handleSubmit} className="auth-mobile-form">
      <h2 className="auth-card-title">Sign up</h2>

      {submitMessage && (
        <div className={submitMessage.type === 'error' ? 'auth-error' : 'landing-success-msg'}>
          {submitMessage.type === 'error' ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
          <span>{submitMessage.text}</span>
        </div>
      )}

      <div className="auth-field">
        <label htmlFor="signup-email" className="auth-field-label">
          Email
        </label>
        <div className="auth-field-input-wrapper auth-field-input-wrapper--has-icon">
          <Mail className="auth-field-icon" aria-hidden />
          <input
            id="signup-email"
            type="email"
            name="email"
            className="auth-field-input"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="auth-field">
        <label htmlFor="signup-password" className="auth-field-label">
          Password
        </label>
        <div className="auth-field-input-wrapper auth-field-input-wrapper--has-icon">
          <Lock className="auth-field-icon" aria-hidden />
          <input
            id="signup-password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            className="auth-field-input auth-field-input--password"
            placeholder="Enter your Password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
          <button
            type="button"
            className="auth-password-toggle auth-pressable auth-password-toggle--desktop"
            onClick={(e) => {
              ripple(e)
              setShowPassword(prev => !prev)
            }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-[18px] w-[18px] auth-eye-icon" /> : <Eye className="h-[18px] w-[18px] auth-eye-icon" />}
          </button>
        </div>
      </div>

      <div className="auth-field">
        <label htmlFor="signup-confirmPassword" className="auth-field-label">
          Confirm password
        </label>
        <div className="auth-field-input-wrapper auth-field-input-wrapper--has-icon">
          <Lock className="auth-field-icon" aria-hidden />
          <input
            id="signup-confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            className="auth-field-input auth-field-input--password"
            placeholder="Confirm your Password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
          />
          <button
            type="button"
            className="auth-password-toggle auth-password-toggle--desktop"
            onClick={() => setShowConfirmPassword(prev => !prev)}
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
          </button>
        </div>
      </div>

      <div className="auth-field">
        <label htmlFor="signup-referralId" className="auth-field-label">
          Referral ID
        </label>
        <div className="auth-field-input-wrapper auth-field-input-wrapper--has-icon">
          <BadgeCheck className="auth-field-icon" aria-hidden />
          <input
            id="signup-referralId"
            type="text"
            name="referralId"
            className="auth-field-input"
            placeholder="Enter referral ID (Optional)"
            value={formData.referralId}
            onChange={handleInputChange}
          />
        </div>
      </div>

      {/* Program Type Selection */}
      <div className="auth-field">
        <label className="auth-field-label">Program Type *</label>
        <div className="signup-category-cards">
          <button
            type="button"
            id="signup-category-training"
            className={`signup-category-card signup-category-card--training${studentCategory === 'Training' ? ' signup-category-card--selected' : ''}`}
            onClick={() => setStudentCategory('Training')}
          >
            <BookOpen className="signup-category-card__icon" />
            <span className="signup-category-card__title">Training</span>
            <span className="signup-category-card__desc">Build skills in InsureTech</span>
          </button>
          <button
            type="button"
            id="signup-category-job"
            className={`signup-category-card signup-category-card--job${studentCategory === 'JobPlacement' ? ' signup-category-card--selected' : ''}`}
            onClick={() => setStudentCategory('JobPlacement')}
          >
            <Briefcase className="signup-category-card__icon" />
            <span className="signup-category-card__title">Job Placement</span>
            <span className="signup-category-card__desc">Get matched with employers</span>
          </button>
        </div>
      </div>

      {authExtrasRow}

      <button
        type="submit"
        className="auth-submit-btn auth-pressable"
        disabled={isSubmitting}
        onClick={ripple}
      >
        {isSubmitting && <span className="auth-spinner" />}
        {isSubmitting ? 'Creating account...' : 'Sign up'}
      </button>

      <p className="auth-footer auth-footer--switch auth-footer--mobile-only">
        Already have an account?{' '}
        <button
          type="button"
          className="auth-footer-link-btn"
          onClick={() => setMobileScreen('signin')}
        >
          Login
        </button>
      </p>
    </form>
  )

  const desktopSignupForm = (
    <form onSubmit={handleSubmit}>
      <div className="auth-field">
        <label htmlFor="desktop-email" className="auth-field-label">
          Email
        </label>
        <div className="auth-field-input-wrapper auth-field-input-wrapper--has-icon">
          <Mail className="auth-field-icon" aria-hidden />
          <input
            id="desktop-email"
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

      <div className="auth-field">
        <label htmlFor="desktop-password" className="auth-field-label">
          Password
        </label>
        <div className="auth-field-input-wrapper auth-field-input-wrapper--has-icon">
          <Lock className="auth-field-icon" aria-hidden />
          <input
            id="desktop-password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            className="auth-field-input auth-field-input--password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
          <button
            type="button"
            className="auth-password-toggle auth-pressable"
            onClick={(e) => {
              ripple(e)
              setShowPassword(prev => !prev)
            }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-[18px] w-[18px] auth-eye-icon" /> : <Eye className="h-[18px] w-[18px] auth-eye-icon" />}
          </button>
        </div>
      </div>

      <div className="auth-field">
        <label htmlFor="desktop-confirmPassword" className="auth-field-label">
          Confirm password
        </label>
        <div className="auth-field-input-wrapper auth-field-input-wrapper--has-icon">
          <Lock className="auth-field-icon" aria-hidden />
          <input
            id="desktop-confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            className="auth-field-input auth-field-input--password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
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

      {/* Program Type Selection */}
      <div className="auth-field">
        <label className="auth-field-label">Program Type *</label>
        <div className="signup-category-cards">
          <button
            type="button"
            id="desktop-category-training"
            className={`signup-category-card signup-category-card--training${studentCategory === 'Training' ? ' signup-category-card--selected' : ''}`}
            onClick={() => setStudentCategory('Training')}
          >
            <BookOpen className="signup-category-card__icon" />
            <span className="signup-category-card__title">Training</span>
            <span className="signup-category-card__desc">Build skills in InsureTech</span>
          </button>
          <button
            type="button"
            id="desktop-category-job"
            className={`signup-category-card signup-category-card--job${studentCategory === 'JobPlacement' ? ' signup-category-card--selected' : ''}`}
            onClick={() => setStudentCategory('JobPlacement')}
          >
            <Briefcase className="signup-category-card__icon" />
            <span className="signup-category-card__title">Job Placement</span>
            <span className="signup-category-card__desc">Get matched with employers</span>
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
        className="auth-submit-btn auth-pressable"
        disabled={isSubmitting}
        onClick={ripple}
      >
        {isSubmitting && <span className="auth-spinner" />}
        {isSubmitting ? 'Creating account...' : 'Create an account'}
      </button>

      <p className="auth-footer auth-footer--switch auth-footer--desktop-only">
        Already have an account?{' '}
        <Link to="/student/login">Login</Link>
      </p>
    </form>
  )

  const isSignIn = mobileScreen === 'signin'

  return (
    <div
      className={[
        'landing-page',
        'landing-page--auth',
        `landing-page--mobile-${mobileScreen}`,
      ].join(' ')}
    >
      <div className="landing-auth-form">
        <AuthLayout
          mobileVariant="form"
          mobileHeroTitle={isSignIn ? 'Hello!' : 'Create Account'}
          mobileHeroSubtitle={
            isSignIn
              ? 'Securely log in with your email and password.'
              : 'Register your account today using a valid email and password.'
          }
        >
          <div className="auth-mobile-screens">
            <div className={`auth-mobile-screen${isSignIn ? ' auth-mobile-screen--active' : ''}`}>
              {signInForm}
            </div>
            <div className={`auth-mobile-screen auth-mobile-screen--signup${!isSignIn ? ' auth-mobile-screen--active' : ''}`}>
              {signUpForm}
            </div>
          </div>

          <div className="auth-desktop-only">
            <img
              src="/insuretech logo (1).png"
              alt="InsureTech Logo"
              className="auth-form-logo auth-form-logo--in-card"
            />

            <h1 className="auth-form-title">Register</h1>
            <p className="auth-form-subtitle">
              Your informations are secure and will not be shared with anyone
            </p>

            {desktopSignupForm}
          </div>
        </AuthLayout>
      </div>

      <footer className="landing-footer landing-footer--auth auth-desktop-only">
        <p>
          © {new Date().getFullYear()} InsureTech LMS. Built with precision.
        </p>
      </footer>
    </div>
  )
}
