import { Award, FileText, Pencil, Trash2, Upload, Download } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  deactivateStudent,
  deleteStudentPermanently,
  getStudent,
  uploadCertificate,
} from '../../api/admin'
import { ApiClientError, downloadFile } from '../../api/client'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import {
  EmptyState,
  formatBytes,
  formatDate,
  getUserId,
  Spinner,
} from '../../components/ui/helpers'
import type { User } from '../../types'

export function AdminStudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [student, setStudent] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [certModalOpen, setCertModalOpen] = useState(false)
  const [deactivateOpen, setDeactivateOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [certTitle, setCertTitle] = useState('')
  const [certFile, setCertFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [deactivating, setDeactivating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const loadStudent = () => {
    if (!id) return
    setLoading(true)
    getStudent(id)
      .then(setStudent)
      .catch((err) =>
        setError(err instanceof ApiClientError ? err.message : 'Failed to load student'),
      )
      .finally(() => setLoading(false))
  }

  useEffect(loadStudent, [id])

  const handleUploadCert = async (e: FormEvent) => {
    e.preventDefault()
    if (!id || !certFile || !certTitle.trim()) return

    setUploading(true)
    setError('')
    try {
      await uploadCertificate(id, certFile, certTitle.trim())
      setCertModalOpen(false)
      setCertTitle('')
      setCertFile(null)
      loadStudent()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDeactivate = async () => {
    if (!id) return
    setDeactivating(true)
    try {
      await deactivateStudent(id)
      navigate('/admin/students')
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Deactivation failed')
      setDeactivating(false)
    }
  }

  const handleDeletePermanent = async () => {
    if (!id) return
    setDeleting(true)
    try {
      await deleteStudentPermanently(id)
      navigate('/admin/students')
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Permanent deletion failed')
      setDeleting(false)
    }
  }

  const handleDownloadStudentResume = async () => {
    if (!student?.resumeFile || !id) return
    try {
      await downloadFile(`/admin/students/${id}/resume/download`, student.resumeFile.originalName)
    } catch (err) {
      setError('Failed to download student resume')
    }
  }

  if (loading) return <Spinner />
  if (!student) {
    return (
      <EmptyState
        title="Student not found"
        action={
          <Link to="/admin/students">
            <Button variant="secondary">Back to list</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/admin/students"
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            ← All Students
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">{student.fullName}</h1>
          <p className="text-sm text-slate-500">{student.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/admin/students/${getUserId(student)}/edit`}>
            <Button variant="secondary" size="sm">
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          {student.isActive !== false && (
            <Button variant="danger" size="sm" onClick={() => setDeactivateOpen(true)}>
              <Trash2 className="h-4 w-4" />
              Deactivate
            </Button>
          )}
          <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" />
            Delete permanently
          </Button>
        </div>
      </div>

      {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard label="Phone" value={student.phone || '—'} />
        <InfoCard label="Address" value={student.address || '—'} />
        <InfoCard
          label="Status"
          value={student.isActive !== false ? 'Active' : 'Inactive'}
        />
        <InfoCard label="Joined" value={formatDate(student.createdAt)} />
      </div>

      {student.isOnboarded ? (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Job Application Profile</h2>
              <p className="text-xs text-slate-500">First-time onboarding information submitted by student</p>
            </div>
            {student.resumeFile && (
              <Button
                size="sm"
                onClick={handleDownloadStudentResume}
                className="bg-cyan-600 hover:bg-cyan-700 flex items-center gap-1.5 text-white"
              >
                <Download className="h-4 w-4" />
                Download Resume
              </Button>
            )}
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Legal Name</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{student.fullName || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">US Contact Number</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{student.phone || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Date of Birth</p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Current Status / Location</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{student.currentStatusCityState || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Visa Status</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{student.visaStatus || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Visa Expiry Date</p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {student.visaExpiryDate ? new Date(student.visaExpiryDate).toLocaleDateString() : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Experience</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{student.totalExperience || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Preferred Designation</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{student.preferredDesignation || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Preferred Locations</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{student.preferredLocations || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Open to Relocation?</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{student.openToRelocation || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Preferred Job Type</p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {student.preferredJobType && student.preferredJobType.length > 0 
                  ? student.preferredJobType.join(', ') 
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Expected Salary</p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {student.expectedSalary} {student.expectedSalaryPeriod ? ` (${student.expectedSalaryPeriod})` : ''}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Security Clearance</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{student.securityClearance || '—'}</p>
            </div>
          </div>
        </section>
      ) : (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm text-center py-8">
          <p className="text-sm font-medium text-slate-500">
            This student has not completed their Job Application onboarding profile yet.
          </p>
        </section>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-brand-600" />
            <h2 className="text-lg font-semibold text-slate-900">Certificates</h2>
          </div>
          <Button size="sm" onClick={() => setCertModalOpen(true)}>
            <Upload className="h-4 w-4" />
            Upload Certificate
          </Button>
        </div>

        {!student.certificates?.length ? (
          <EmptyState
            title="No certificates yet"
            description="Upload a PDF, JPG, or PNG certificate for this student"
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {student.certificates.map((cert) => (
              <li key={cert._id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-brand-50 p-2 text-brand-600">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{cert.title}</p>
                    <p className="text-sm text-slate-500">
                      {cert.originalName} · {formatBytes(cert.size)} ·{' '}
                      {formatDate(cert.createdAt)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-900">
            Documents ({student.documents?.length ?? 0})
          </h2>
        </div>
        {!student.documents?.length ? (
          <p className="text-sm text-slate-500">
            Student has not uploaded any documents yet.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {student.documents.map((doc) => (
              <li key={doc._id} className="py-3 text-sm">
                <span className="font-medium text-slate-900">{doc.originalName}</span>
                <span className="text-slate-500">
                  {' '}
                  · {formatBytes(doc.size)} · {formatDate(doc.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Modal
        open={certModalOpen}
        title="Upload Certificate"
        onClose={() => setCertModalOpen(false)}
      >
        <form onSubmit={handleUploadCert} className="space-y-4">
          <Input
            label="Certificate Title"
            value={certTitle}
            onChange={(e) => setCertTitle(e.target.value)}
            placeholder="e.g. Course Completion Certificate"
            required
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              File (PDF, JPG, PNG — max 10 MB)
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setCertFile(e.target.files?.[0] || null)}
              required
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCertModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={uploading}>
              Upload
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={deactivateOpen}
        title="Deactivate Student"
        onClose={() => setDeactivateOpen(false)}
        size="sm"
      >
        <p className="text-sm text-slate-600">
          This will deactivate <strong>{student.fullName}</strong>&apos;s account. They
          will no longer be able to sign in.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeactivateOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" loading={deactivating} onClick={handleDeactivate}>
            Deactivate
          </Button>
        </div>
      </Modal>

      <Modal
        open={deleteOpen}
        title="Delete Student Permanently"
        onClose={() => setDeleteOpen(false)}
        size="sm"
      >
        <p className="text-sm text-slate-600">
          This will permanently remove <strong>{student.fullName}</strong>&apos;s account and
          all associated student data from the system. This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" loading={deleting} onClick={handleDeletePermanent}>
            Delete permanently
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
    </div>
  )
}
