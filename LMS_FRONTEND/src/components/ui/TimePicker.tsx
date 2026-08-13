import { useState, useRef, useEffect } from 'react'
import { Clock, ChevronUp, ChevronDown } from 'lucide-react'

interface TimePickerProps {
  label?: string
  value: string            // HH:MM in 24h (what we store internally)
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
}

// Quick preset times (12h display, stored as 24h)
const PRESETS = [
  { label: '9:00 AM',  value: '09:00' },
  { label: '10:00 AM', value: '10:00' },
  { label: '11:00 AM', value: '11:00' },
  { label: '12:00 PM', value: '12:00' },
  { label: '1:00 PM',  value: '13:00' },
  { label: '2:00 PM',  value: '14:00' },
  { label: '3:00 PM',  value: '15:00' },
  { label: '4:00 PM',  value: '16:00' },
  { label: '5:00 PM',  value: '17:00' },
  { label: '6:00 PM',  value: '18:00' },
]

function to12h(val: string): { h: number; m: number; period: 'AM' | 'PM' } {
  if (!val) return { h: 12, m: 0, period: 'AM' }
  const [hStr, mStr] = val.split(':')
  const h24 = Number(hStr)
  const m = Number(mStr || 0)
  const period: 'AM' | 'PM' = h24 >= 12 ? 'PM' : 'AM'
  let h = h24 % 12
  if (h === 0) h = 12
  return { h, m, period }
}

function to24h(h: number, m: number, period: 'AM' | 'PM'): string {
  let h24 = h % 12
  if (period === 'PM') h24 += 12
  return `${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function formatDisplay(val: string): string {
  if (!val) return ''
  const { h, m, period } = to12h(val)
  return `${h}:${String(m).padStart(2, '0')} ${period}`
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val))
}

export function TimePicker({
  label,
  value,
  onChange,
  placeholder = 'Select a time',
  required,
  disabled,
  error,
}: TimePickerProps) {
  const { h: initH, m: initM, period: initPeriod } = to12h(value)
  const [open, setOpen] = useState(false)
  const [hour, setHour] = useState(initH)
  const [minute, setMinute] = useState(initM)
  const [period, setPeriod] = useState<'AM' | 'PM'>(initPeriod)

  const wrapRef = useRef<HTMLDivElement>(null)

  // Sync internal state when value changes externally
  useEffect(() => {
    const { h, m, period: p } = to12h(value)
    setHour(h)
    setMinute(m)
    setPeriod(p)
  }, [value])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const commit = (h: number, m: number, p: 'AM' | 'PM') => {
    onChange(to24h(h, m, p))
  }

  const changeHour = (delta: number) => {
    const next = ((hour - 1 + delta + 12) % 12) + 1
    setHour(next)
    commit(next, minute, period)
  }
  const changeMinute = (delta: number) => {
    const next = (minute + delta + 60) % 60
    setMinute(next)
    commit(hour, next, period)
  }

  const handleHourInput = (raw: string) => {
    const n = parseInt(raw, 10)
    if (isNaN(n)) return
    const clamped = clamp(n, 1, 12)
    setHour(clamped)
    commit(clamped, minute, period)
  }
  const handleMinuteInput = (raw: string) => {
    const n = parseInt(raw, 10)
    if (isNaN(n)) return
    const clamped = clamp(n, 0, 59)
    setMinute(clamped)
    commit(hour, clamped, period)
  }

  return (
    <div className="tp-root" ref={wrapRef}>
      {label && (
        <label className="tp-label">
          {label}{required && <span className="tp-required">*</span>}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        className={`tp-trigger${error ? ' tp-trigger--error' : ''}${disabled ? ' tp-trigger--disabled' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Clock className="tp-trigger-icon" />
        <span className={value ? 'tp-trigger-value' : 'tp-trigger-placeholder'}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <ChevronDown className={`tp-trigger-chevron${open ? ' tp-trigger-chevron--open' : ''}`} />
      </button>

      {error && <p className="tp-error">{error}</p>}

      {/* Popup */}
      {open && (
        <div className="tp-popup" role="dialog" aria-label="Time picker">
          {/* Spinner section */}
          <div className="tp-spinners">
            {/* Hours */}
            <div className="tp-column">
              <button type="button" className="tp-spin-btn" onClick={() => changeHour(1)} aria-label="Increase hour">
                <ChevronUp className="tp-spin-icon" />
              </button>
              <input
                type="text"
                inputMode="numeric"
                className="tp-spin-input"
                value={String(hour).padStart(2, '0')}
                onChange={e => handleHourInput(e.target.value)}
                maxLength={2}
                aria-label="Hour"
              />
              <button type="button" className="tp-spin-btn" onClick={() => changeHour(-1)} aria-label="Decrease hour">
                <ChevronDown className="tp-spin-icon" />
              </button>
            </div>

            <span className="tp-colon">:</span>

            {/* Minutes */}
            <div className="tp-column">
              <button type="button" className="tp-spin-btn" onClick={() => changeMinute(1)} aria-label="Increase minute">
                <ChevronUp className="tp-spin-icon" />
              </button>
              <input
                type="text"
                inputMode="numeric"
                className="tp-spin-input"
                value={String(minute).padStart(2, '0')}
                onChange={e => handleMinuteInput(e.target.value)}
                maxLength={2}
                aria-label="Minute"
              />
              <button type="button" className="tp-spin-btn" onClick={() => changeMinute(-1)} aria-label="Decrease minute">
                <ChevronDown className="tp-spin-icon" />
              </button>
            </div>

            {/* AM/PM */}
            <div className="tp-period-wrap">
              <button
                type="button"
                className={`tp-period-btn${period === 'AM' ? ' tp-period-btn--active' : ''}`}
                onClick={() => { setPeriod('AM'); commit(hour, minute, 'AM') }}
              >
                AM
              </button>
              <button
                type="button"
                className={`tp-period-btn${period === 'PM' ? ' tp-period-btn--active' : ''}`}
                onClick={() => { setPeriod('PM'); commit(hour, minute, 'PM') }}
              >
                PM
              </button>
            </div>
          </div>

          {/* Quick presets */}
          <div className="tp-divider" />
          <p className="tp-presets-label">Quick select</p>
          <div className="tp-presets">
            {PRESETS.map(p => (
              <button
                key={p.value}
                type="button"
                className={`tp-preset${value === p.value ? ' tp-preset--active' : ''}`}
                onClick={() => {
                  onChange(p.value)
                  setOpen(false)
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Done */}
          <div className="tp-footer">
            <button type="button" className="tp-done-btn" onClick={() => setOpen(false)}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
