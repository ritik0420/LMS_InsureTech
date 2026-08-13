import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

interface DatePickerProps {
  label?: string
  value: string            // YYYY-MM-DD
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  min?: string             // YYYY-MM-DD
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function formatDisplay(value: string) {
  if (!value) return ''
  const [y, m, d] = value.split('-')
  if (!y || !m || !d) return ''
  const date = new Date(Number(y), Number(m) - 1, Number(d))
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export function DatePicker({
  label,
  value,
  onChange,
  placeholder = 'Select a date',
  required,
  disabled,
  error,
  min,
}: DatePickerProps) {
  const today = new Date()
  const [open, setOpen] = useState(false)

  const initYear = value ? Number(value.split('-')[0]) : today.getFullYear()
  const initMonth = value ? Number(value.split('-')[1]) - 1 : today.getMonth()

  const [viewYear, setViewYear] = useState(initYear)
  const [viewMonth, setViewMonth] = useState(initMonth)
  const [mode, setMode] = useState<'day' | 'month' | 'year'>('day')

  const wrapRef = useRef<HTMLDivElement>(null)

  // Keep view in sync when value changes externally
  useEffect(() => {
    if (value) {
      setViewYear(Number(value.split('-')[0]))
      setViewMonth(Number(value.split('-')[1]) - 1)
    }
  }, [value])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
        setMode('day')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const selectDay = useCallback((day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    onChange(`${viewYear}-${mm}-${dd}`)
    setOpen(false)
    setMode('day')
  }, [viewYear, viewMonth, onChange])

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const totalDays = daysInMonth(viewYear, viewMonth)
  const firstDay = firstDayOfMonth(viewYear, viewMonth)

  // Parse selected & min
  const selY = value ? Number(value.split('-')[0]) : null
  const selM = value ? Number(value.split('-')[1]) - 1 : null
  const selD = value ? Number(value.split('-')[2]) : null
  const minDate = min ? new Date(min) : null

  const isDayDisabled = (day: number) => {
    if (!minDate) return false
    const d = new Date(viewYear, viewMonth, day)
    return d < minDate
  }

  // Year range for year picker
  const yearRangeStart = Math.floor(viewYear / 12) * 12
  const years = Array.from({ length: 12 }, (_, i) => yearRangeStart + i)

  return (
    <div className="dp-root" ref={wrapRef}>
      {label && (
        <label className="dp-label">
          {label}{required && <span className="dp-required">*</span>}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        className={`dp-trigger${error ? ' dp-trigger--error' : ''}${disabled ? ' dp-trigger--disabled' : ''}`}
        onClick={() => { setOpen(o => !o); setMode('day') }}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Calendar className="dp-trigger-icon" />
        <span className={value ? 'dp-trigger-value' : 'dp-trigger-placeholder'}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <ChevronRight className={`dp-trigger-chevron${open ? ' dp-trigger-chevron--open' : ''}`} />
      </button>

      {error && <p className="dp-error">{error}</p>}

      {/* Calendar Popup */}
      {open && (
        <div className="dp-popup" role="dialog" aria-label="Date picker calendar">
          {/* Header */}
          <div className="dp-header">
            <button type="button" className="dp-nav-btn" onClick={prevMonth} aria-label="Previous month">
              <ChevronLeft className="dp-nav-icon" />
            </button>

            <div className="dp-header-labels">
              <button
                type="button"
                className="dp-month-btn"
                onClick={() => setMode(mode === 'month' ? 'day' : 'month')}
              >
                {MONTHS[viewMonth]}
              </button>
              <button
                type="button"
                className="dp-year-btn"
                onClick={() => setMode(mode === 'year' ? 'day' : 'year')}
              >
                {viewYear}
              </button>
            </div>

            <button type="button" className="dp-nav-btn" onClick={nextMonth} aria-label="Next month">
              <ChevronRight className="dp-nav-icon" />
            </button>
          </div>

          {/* Month Picker */}
          {mode === 'month' && (
            <div className="dp-month-grid">
              {MONTHS.map((m, i) => (
                <button
                  key={m}
                  type="button"
                  className={`dp-month-cell${i === viewMonth ? ' dp-month-cell--active' : ''}`}
                  onClick={() => { setViewMonth(i); setMode('day') }}
                >
                  {m.slice(0, 3)}
                </button>
              ))}
            </div>
          )}

          {/* Year Picker */}
          {mode === 'year' && (
            <div className="dp-year-nav">
              <button type="button" className="dp-nav-btn dp-nav-btn--sm"
                onClick={() => setViewYear(y => y - 12)}>
                <ChevronLeft className="dp-nav-icon" />
              </button>
              <span className="dp-year-range">{yearRangeStart} – {yearRangeStart + 11}</span>
              <button type="button" className="dp-nav-btn dp-nav-btn--sm"
                onClick={() => setViewYear(y => y + 12)}>
                <ChevronRight className="dp-nav-icon" />
              </button>
            </div>
          )}
          {mode === 'year' && (
            <div className="dp-year-grid">
              {years.map(y => (
                <button
                  key={y}
                  type="button"
                  className={`dp-year-cell${y === viewYear ? ' dp-year-cell--active' : ''}`}
                  onClick={() => { setViewYear(y); setMode('day') }}
                >
                  {y}
                </button>
              ))}
            </div>
          )}

          {/* Day Grid */}
          {mode === 'day' && (
            <>
              <div className="dp-weekdays">
                {DAYS.map(d => <span key={d} className="dp-weekday">{d}</span>)}
              </div>
              <div className="dp-days">
                {Array.from({ length: firstDay }, (_, i) => (
                  <span key={`blank-${i}`} />
                ))}
                {Array.from({ length: totalDays }, (_, i) => {
                  const day = i + 1
                  const isSelected = selY === viewYear && selM === viewMonth && selD === day
                  const isToday = today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day
                  const disabled = isDayDisabled(day)
                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={disabled}
                      className={[
                        'dp-day',
                        isSelected ? 'dp-day--selected' : '',
                        isToday && !isSelected ? 'dp-day--today' : '',
                        disabled ? 'dp-day--disabled' : '',
                      ].join(' ')}
                      onClick={() => selectDay(day)}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>

              {/* Footer shortcuts */}
              <div className="dp-footer">
                <button type="button" className="dp-today-btn" onClick={() => {
                  const y = today.getFullYear()
                  const m = String(today.getMonth() + 1).padStart(2, '0')
                  const d = String(today.getDate()).padStart(2, '0')
                  onChange(`${y}-${m}-${d}`)
                  setOpen(false)
                  setMode('day')
                }}>
                  Today
                </button>
                {value && (
                  <button type="button" className="dp-clear-btn" onClick={() => {
                    onChange('')
                    setOpen(false)
                    setMode('day')
                  }}>
                    Clear
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
