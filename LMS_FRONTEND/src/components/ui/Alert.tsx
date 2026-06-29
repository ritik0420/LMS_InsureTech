import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import type { ReactNode } from 'react'

type AlertVariant = 'success' | 'error' | 'info'

interface AlertProps {
  variant?: AlertVariant
  children: ReactNode
  onClose?: () => void
}

const styles: Record<AlertVariant, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-brand-200 bg-brand-50 text-brand-800',
}

const icons: Record<AlertVariant, typeof Info> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

export function Alert({ variant = 'info', children, onClose }: AlertProps) {
  const Icon = icons[variant]

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${styles[variant]}`}
      role="alert"
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="rounded p-0.5 opacity-70 hover:opacity-100"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
