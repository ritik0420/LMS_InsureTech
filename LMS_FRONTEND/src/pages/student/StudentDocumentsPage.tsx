import { FileText, Trash2, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { deleteDocument, listDocuments, uploadDocument } from '../../api/student'
import { ApiClientError } from '../../api/client'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import {
  EmptyState,
  formatBytes,
  formatDate,
  Spinner,
} from '../../components/ui/helpers'
import type { Document } from '../../types'

export function StudentDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const loadDocuments = () => {
    setLoading(true)
    listDocuments()
      .then(setDocuments)
      .catch((err) =>
        setError(err instanceof ApiClientError ? err.message : 'Failed to load documents'),
      )
      .finally(() => setLoading(false))
  }

  useEffect(loadDocuments, [])

  const handleUpload = async (file: File) => {
    setError('')
    setSuccess('')
    setUploading(true)
    try {
      await uploadDocument(file)
      setSuccess('Document uploaded successfully')
      loadDocuments()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return
    setDeletingId(id)
    setError('')
    try {
      await deleteDocument(id)
      setDocuments((prev) => prev.filter((d) => d._id !== id))
      setSuccess('Document deleted')
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Delete failed')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) return <Spinner label="Loading documents..." />

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Documents</h1>
          <p className="mt-1 text-sm text-slate-500">
            Upload PDF, JPG, or PNG files (max 10 MB each)
          </p>
        </div>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleUpload(file)
            }}
          />
          <Button loading={uploading} onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </div>

      {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')}>{success}</Alert>}

      {documents.length === 0 ? (
        <EmptyState
          title="No documents uploaded"
          description="Upload ID proofs, transcripts, or other supporting documents"
          action={
            <Button onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" />
              Upload Document
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <ul className="divide-y divide-slate-100">
            {documents.map((doc) => (
              <li
                key={doc._id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">
                      {doc.originalName}
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatBytes(doc.size)} · {formatDate(doc.createdAt)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  loading={deletingId === doc._id}
                  onClick={() => handleDelete(doc._id)}
                  aria-label="Delete document"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
