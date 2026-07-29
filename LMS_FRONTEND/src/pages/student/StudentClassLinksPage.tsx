import { ExternalLink, Link2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { listClassLinks } from '../../api/student'
import { ApiClientError } from '../../api/client'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { EmptyState, formatDate, Spinner } from '../../components/ui/helpers'
import type { ClassLink } from '../../types'

export function StudentClassLinksPage() {
  const [links, setLinks] = useState<ClassLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    listClassLinks()
      .then(setLinks)
      .catch((err) =>
        setError(err instanceof ApiClientError ? err.message : 'Failed to load class links'),
      )
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner label="Loading class links..." />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Class Links</h1>
        <p className="mt-1 text-sm text-slate-500">
          Meeting and class links shared by your administrator
        </p>
      </div>

      {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}

      {links.length === 0 ? (
        <EmptyState
          title="No class links yet"
          description="Your administrator will share meeting links here when available"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {links.map((link) => (
            <div
              key={link._id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
            >
              <div className="mb-4 flex items-start gap-3">
                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                  <Link2 className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900">{link.title}</h3>
                  {link.description && (
                    <p className="mt-1 text-sm text-slate-500">{link.description}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-400">
                    Shared {formatDate(link.createdAt)}
                  </p>
                </div>
              </div>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200"
                >
                  <ExternalLink className="h-4 w-4" />
                  Join Class
                </Button>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
