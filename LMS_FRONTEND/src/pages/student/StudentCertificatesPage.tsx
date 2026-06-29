import { Award, Download } from 'lucide-react'
import { useEffect, useState } from 'react'
import { downloadCertificate, listCertificates } from '../../api/student'
import { ApiClientError } from '../../api/client'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import {
  EmptyState,
  formatBytes,
  formatDate,
  Spinner,
} from '../../components/ui/helpers'
import type { Certificate } from '../../types'

export function StudentCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    listCertificates()
      .then(setCertificates)
      .catch((err) =>
        setError(err instanceof ApiClientError ? err.message : 'Failed to load certificates'),
      )
      .finally(() => setLoading(false))
  }, [])

  const handleDownload = async (cert: Certificate) => {
    setDownloadingId(cert._id)
    setError('')
    try {
      await downloadCertificate(cert._id, cert.originalName)
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Download failed')
    } finally {
      setDownloadingId(null)
    }
  }

  if (loading) return <Spinner label="Loading certificates..." />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Certificates</h1>
        <p className="mt-1 text-sm text-slate-500">
          Download certificates issued by your administrator
        </p>
      </div>

      {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}

      {certificates.length === 0 ? (
        <EmptyState
          title="No certificates yet"
          description="Certificates will appear here once your administrator uploads them"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {certificates.map((cert) => (
            <div
              key={cert._id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex items-start gap-3">
                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                  <Award className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900">{cert.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {cert.originalName}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {formatBytes(cert.size)} · Issued {formatDate(cert.createdAt)}
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                loading={downloadingId === cert._id}
                onClick={() => handleDownload(cert)}
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
