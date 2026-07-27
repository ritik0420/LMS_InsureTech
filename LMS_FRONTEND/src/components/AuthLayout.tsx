import { useState, useEffect, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'

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
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

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

  return (
    <div className="auth-layout">
      {/* Left Panel — Blue gradient with globe & testimonial */}
      <div className="auth-left-panel">
        {/* Brand Logo */}
        <div className="auth-brand">
          <img
            src="/insuretech logo (1).png"
            alt="InsureTech Logo"
            className="auth-brand-logo"
          />
        </div>

        {/* Globe Illustration */}
        <div className="auth-globe-container">
          <img
            src="/globe_illustration.png"
            alt="Global Network"
            className="auth-globe-image"
          />
          {/* Floating profile avatars */}
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
          {/* Connection lines (decorative dots) */}
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

      {/* Right Panel — Form content */}
      <div className="auth-right-panel">
        <div className="auth-form-wrapper">{children}</div>
      </div>
    </div>
  )
}
