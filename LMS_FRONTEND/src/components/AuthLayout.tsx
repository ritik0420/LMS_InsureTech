import { useState, useEffect, type ReactNode, type MouseEvent } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useRipple } from '../hooks/useRipple'

interface Testimonial {
  quote: string
  name: string
  role: string
  company: string
  rating: number
}

const testimonials: Testimonial[] = [
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

interface AuthLayoutProps {
  children: ReactNode
  /** `welcome` = blue hero (landing). `form` = mobile auth card (login/register). */
  mobileVariant?: 'welcome' | 'form'
  mobileBackTo?: string
  onMobileBack?: () => void
  showMobileBack?: boolean
  mobileHeroTitle?: string
  mobileHeroSubtitle?: string
}

export function AuthLayout({
  children,
  mobileVariant = 'form',
  mobileBackTo,
  onMobileBack,
  showMobileBack = false,
  mobileHeroTitle,
  mobileHeroSubtitle,
}: AuthLayoutProps) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [formEntered, setFormEntered] = useState(false)
  const rippleLink = useRipple<HTMLAnchorElement>()
  const rippleBtn = useRipple<HTMLButtonElement>()

  useEffect(() => {
    const frame = requestAnimationFrame(() => setFormEntered(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    )
  }

  const testimonial = testimonials[currentTestimonial]

  const handleMobileBack = (e: MouseEvent<HTMLButtonElement>) => {
    rippleBtn(e)
    onMobileBack?.()
  }

  const mobileBack =
    showMobileBack && (mobileBackTo || onMobileBack) ? (
      mobileBackTo ? (
        <Link
          to={mobileBackTo}
          className="auth-mobile-back auth-pressable"
          onClick={rippleLink}
        >
          <ChevronLeft className="auth-mobile-back-icon" />
          Back
        </Link>
      ) : (
        <button
          type="button"
          onClick={handleMobileBack}
          className="auth-mobile-back auth-pressable"
        >
          <ChevronLeft className="auth-mobile-back-icon" />
          Back
        </button>
      )
    ) : null

  return (
    <div className={`auth-layout auth-layout--mobile-${mobileVariant}`}>
      {mobileVariant === 'form' && mobileHeroTitle && (
        <div className="auth-mobile-header">
          <div className="auth-mobile-header-waves" aria-hidden>
            <svg viewBox="0 0 390 200" preserveAspectRatio="none" className="auth-mobile-header-wave-svg">
              <path
                d="M0 120 C80 60 160 180 260 100 C320 50 360 80 390 60 L390 0 L0 0 Z"
                fill="rgba(96, 165, 250, 0.35)"
              />
              <path
                d="M0 160 C100 90 200 200 300 130 C340 100 370 120 390 100 L390 0 L0 0 Z"
                fill="rgba(147, 197, 253, 0.25)"
              />
              <path
                d="M0 190 C120 140 220 220 390 150 L390 0 L0 0 Z"
                fill="rgba(59, 130, 246, 0.2)"
              />
            </svg>
          </div>
          <div className="auth-mobile-header-content">
            <div className="auth-mobile-header-title-row">
              <img
                src="/cropped-favicon.png"
                alt="InsureTech"
                className="auth-mobile-header-favicon"
              />
              <h1 className="auth-mobile-header-title">{mobileHeroTitle}</h1>
            </div>
            {mobileHeroSubtitle && (
              <p className="auth-mobile-header-subtitle">{mobileHeroSubtitle}</p>
            )}
          </div>
        </div>
      )}

      {mobileVariant === 'welcome' && (
        <div className="auth-mobile-hero">
          <div className="auth-mobile-hero-bg" aria-hidden />
          <div className="auth-mobile-hero-content">
            <div className="auth-mobile-hero-logo-ring">
              <img
                src="/insuretech logo (1).png"
                alt="InsureTech"
                className="auth-mobile-hero-logo"
              />
            </div>
            <div className="auth-globe-container auth-globe-container--mobile">
              <img
                src="/globe_illustration.png"
                alt=""
                className="auth-globe-image"
              />
            </div>
            <p className="auth-mobile-hero-tagline">
              Skills training for the insurance and tech workforce
            </p>
          </div>
        </div>
      )}

      {/* Left Panel — Blue gradient with globe & testimonial (desktop) */}
      <div className="auth-left-panel">
        <div className="auth-globe-container">
          <img
            src="/globe_illustration.png"
            alt="Global Network"
            className="auth-globe-image"
          />
          <div className="auth-floating-avatar auth-avatar-1">
            <svg viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="14" r="6" fill="rgba(255,255,255,0.9)" />
              <path
                d="M6 32c0-6.627 5.373-12 12-12s12 5.373 12 12"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="2"
                fill="rgba(255,255,255,0.3)"
              />
            </svg>
          </div>
          <div className="auth-floating-avatar auth-avatar-2">
            <svg viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="14" r="6" fill="rgba(255,255,255,0.9)" />
              <path
                d="M6 32c0-6.627 5.373-12 12-12s12 5.373 12 12"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="2"
                fill="rgba(255,255,255,0.3)"
              />
            </svg>
          </div>
          <div className="auth-floating-avatar auth-avatar-3">
            <svg viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="14" r="6" fill="rgba(255,255,255,0.9)" />
              <path
                d="M6 32c0-6.627 5.373-12 12-12s12 5.373 12 12"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="2"
                fill="rgba(255,255,255,0.3)"
              />
            </svg>
          </div>
          <div className="auth-connection-dot auth-dot-1" />
          <div className="auth-connection-dot auth-dot-2" />
          <div className="auth-connection-dot auth-dot-3" />
        </div>

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
              onClick={prevTestimonial}
              className="auth-nav-btn"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="auth-nav-icon" />
            </button>
            <button
              type="button"
              onClick={nextTestimonial}
              className="auth-nav-btn"
              aria-label="Next testimonial"
            >
              <ChevronRight className="auth-nav-icon" />
            </button>
          </div>
        </div>
      </div>

      <div className="auth-right-panel">
        {mobileBack}
        <div className={`auth-form-wrapper auth-form-card${formEntered ? ' auth-form-card--entered' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  )
}
