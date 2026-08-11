import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { BookOpen, Briefcase, LogOut, ArrowRight } from 'lucide-react'

export function StudentCategoryPage() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  if (user?.isOnboarded) {
    return <Navigate to="/student" replace />
  }

  if (user?.studentCategory === 'Training') {
    return <Navigate to="/student/training-onboard" replace />
  }

  if (user?.studentCategory === 'JobPlacement') {
    return <Navigate to="/student/onboarding" replace />
  }

  const [selected, setSelected] = useState<'Training' | 'JobPlacement' | null>(null)
  const [hovering, setHovering] = useState<'Training' | 'JobPlacement' | null>(null)

  const handleContinue = () => {
    if (selected === 'Training') {
      navigate('/student/training-onboard')
    } else if (selected === 'JobPlacement') {
      navigate('/student/onboarding')
    }
  }

  return (
    <div className="category-page">
      <button
        type="button"
        className="category-page__logout"
        onClick={() => {
          logout()
          navigate('/student/login')
        }}
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>

      <div className="category-page__blob category-page__blob--1" />
      <div className="category-page__blob category-page__blob--2" />

      <div className="category-page__content">
        <div className="category-page__header">
          <div className="category-page__logo-wrap">
            <img
              src="/insuretech logo (1).png"
              alt="InsureTech Logo"
              className="category-page__logo"
            />
          </div>
          <h1 className="category-page__title">Welcome to InsureTech LMS</h1>
          <p className="category-page__subtitle">
            Choose your program to get started. This helps us personalise your experience.
          </p>
        </div>

        <div className="category-page__cards">
          <button
            type="button"
            id="category-training"
            className={[
              'category-card',
              'category-card--training',
              selected === 'Training' ? 'category-card--selected' : '',
              hovering === 'Training' ? 'category-card--hovered' : '',
            ].join(' ')}
            onClick={() => setSelected('Training')}
            onMouseEnter={() => setHovering('Training')}
            onMouseLeave={() => setHovering(null)}
          >
            <div className="category-card__glow" />
            <div className="category-card__icon-wrap category-card__icon-wrap--training">
              <BookOpen className="category-card__icon" />
            </div>
            <div className="category-card__body">
              <h2 className="category-card__title">Training</h2>
              <p className="category-card__desc">
                Enrol in a structured training program to build your skills and advance your knowledge in the InsureTech domain.
              </p>
              <ul className="category-card__features">
                <li>Quick registration — 8 fields only</li>
                <li>Schedule your preferred session</li>
                <li>Upload your resume</li>
              </ul>
            </div>
            <div className={`category-card__radio ${selected === 'Training' ? 'category-card__radio--selected' : ''}`}>
              {selected === 'Training' && <div className="category-card__radio-dot" />}
            </div>
          </button>

          <button
            type="button"
            id="category-job-placement"
            className={[
              'category-card',
              'category-card--job',
              selected === 'JobPlacement' ? 'category-card--selected' : '',
              hovering === 'JobPlacement' ? 'category-card--hovered' : '',
            ].join(' ')}
            onClick={() => setSelected('JobPlacement')}
            onMouseEnter={() => setHovering('JobPlacement')}
            onMouseLeave={() => setHovering(null)}
          >
            <div className="category-card__glow" />
            <div className="category-card__icon-wrap category-card__icon-wrap--job">
              <Briefcase className="category-card__icon" />
            </div>
            <div className="category-card__body">
              <h2 className="category-card__title">Job Placement</h2>
              <p className="category-card__desc">
                Get matched with top employers in the InsureTech industry. Our team actively assists your job search and placement.
              </p>
              <ul className="category-card__features">
                <li>Complete professional profile</li>
                <li>Visa status and preferences</li>
                <li>Resume, cover letter and job type</li>
              </ul>
            </div>
            <div className={`category-card__radio ${selected === 'JobPlacement' ? 'category-card__radio--selected' : ''}`}>
              {selected === 'JobPlacement' && <div className="category-card__radio-dot" />}
            </div>
          </button>
        </div>

        <div className="category-page__cta">
          <button
            type="button"
            id="category-continue-btn"
            className={`category-page__btn ${selected ? 'category-page__btn--active' : ''}`}
            disabled={!selected}
            onClick={handleContinue}
          >
            Continue
            <ArrowRight className="h-5 w-5" />
          </button>
          <p className="category-page__note">
            {selected === 'Training'
              ? 'Training selected — quick 8-field form ahead'
              : selected === 'JobPlacement'
                ? 'Job Placement selected — detailed profile setup ahead'
                : 'Select a program to continue'}
          </p>
        </div>
      </div>
    </div>
  )
}
