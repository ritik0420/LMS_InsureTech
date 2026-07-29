import { CreditCard, ExternalLink } from 'lucide-react'
import { useEffect, useState } from 'react'
import { listInvoices } from '../../api/student'
import { ApiClientError } from '../../api/client'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { EmptyState, formatDate, Spinner } from '../../components/ui/helpers'
import type { Invoice } from '../../types'

export function StudentPaymentsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    listInvoices()
      .then(setInvoices)
      .catch((err) =>
        setError(err instanceof ApiClientError ? err.message : 'Failed to load invoices'),
      )
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner label="Loading payments..." />

  const totalDue = invoices
    .filter((inv) => inv.status !== 'Paid')
    .reduce((sum, inv) => sum + inv.amount, 0)

  const paidCount = invoices.filter((inv) => inv.status === 'Paid').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
        <p className="mt-1 text-sm text-slate-500">
          View invoices and payment details from your administrator
        </p>
      </div>

      {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}

      {invoices.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Total Invoices
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{invoices.length}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">
              Paid
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">{paidCount}</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-600">
              Outstanding Balance
            </p>
            <p className="mt-1 text-2xl font-bold text-amber-700">
              ${totalDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}

      {invoices.length === 0 ? (
        <EmptyState
          title="No invoices yet"
          description="Invoices and payment details will appear here once your administrator sends them"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {invoices.map((inv) => (
            <div
              key={inv._id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`rounded-xl p-3 ${
                    inv.status === 'Paid'
                      ? 'bg-emerald-50 text-emerald-600'
                      : inv.status === 'Overdue'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-amber-50 text-amber-600'
                  }`}>
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{inv.title}</h3>
                    {inv.description && (
                      <p className="mt-1 text-sm text-slate-500">{inv.description}</p>
                    )}
                  </div>
                </div>
                <StatusBadge status={inv.status} />
              </div>

              <div className="mb-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium uppercase text-slate-500">Amount</p>
                  <p className="mt-0.5 text-lg font-bold text-slate-900">
                    {inv.currency} {inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-slate-500">Due Date</p>
                  <p className="mt-0.5 text-sm font-medium text-slate-700">
                    {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}
                  </p>
                </div>
              </div>

              <p className="mb-3 text-xs text-slate-400">
                Created {formatDate(inv.createdAt)}
              </p>

              {inv.paymentLink && inv.status !== 'Paid' && (
                <a
                  href={inv.paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="sm"
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Pay Now
                  </Button>
                </a>
              )}

              {inv.status === 'Paid' && (
                <div className="w-full rounded-lg bg-emerald-50 py-2 text-center text-sm font-medium text-emerald-700">
                  ✓ Payment Completed
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Overdue: 'bg-red-50 text-red-700 border-red-200',
  }

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}
    >
      {status}
    </span>
  )
}
