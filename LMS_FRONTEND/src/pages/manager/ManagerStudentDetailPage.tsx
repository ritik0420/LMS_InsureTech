import { Award, FileText, Download } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getAssignedStudent } from '../../api/manager'
import { ApiClientError, downloadFile } from '../../api/client'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import {
  EmptyState,
  formatBytes,
  formatDate,
  Spinner,
} from '../../components/ui/helpers'
import type { User } from '../../types'

export function ManagerStudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [student, setStudent] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getAssignedStudent(id)
      .then(setStudent)
      .catch((err) =>
        setError(err instanceof ApiClientError ? err.message : 'Failed to load student'),
      )
      .finally(() => setLoading(false))
  }, [id])

  const handleDownloadResume = async () => {
    if (!student?.resumeFile || !id) return
    try {
      await downloadFile(`/manager/students/${id}/resume/download`, student.resumeFile.originalName)
    } catch (_err) {
      setError('Failed to download student resume')
    }
  }

  const handleDownloadCertificate = async (certificateId: string, filename: string) => {
    if (!id) return
    try {
      await downloadFile(`/manager/students/${id}/certificates/${certificateId}/download`, filename)
    } catch (_err) {
      setError('Failed to download certificate')
    }
  }

  const handleDownloadDocument = async (documentId: string, filename: string) => {
    if (!id) return
    try {
      await downloadFile(`/manager/students/${id}/documents/${documentId}/download`, filename)
    } catch (_err) {
      setError('Failed to download document')
    }
  }

  if (loading) return <Spinner />
  if (!student) {
    return (
      <EmptyState
        title="Student not found"
        description="This student may not be assigned to you"
        action={
          <Link to="/manager/students">
            <Button variant="secondary">Back to list</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/manager/students"
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          ← Assigned Students
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{student.fullName}</h1>
        <p className="text-sm text-slate-500">{student.email}</p>
      </div>

      {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard label="Country" value={student.country || '—'} />
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
              <p className="text-xs text-slate-500">Onboarding information submitted by student</p>
            </div>
            {student.resumeFile && (
              <Button
                size="sm"
                onClick={handleDownloadResume}
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
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Country</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{student.country || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Contact Number</p>
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
        <div className="mb-4 flex items-center gap-2">
          <Award className="h-5 w-5 text-brand-600" />
          <h2 className="text-lg font-semibold text-slate-900">Certificates</h2>
        </div>

        {!student.certificates?.length ? (
          <EmptyState
            title="No certificates yet"
            description="No certificates have been uploaded for this student"
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
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleDownloadCertificate(cert._id, cert.originalName)}
                  className="flex items-center gap-1.5"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
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
              <li key={doc._id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-slate-50 p-2 text-slate-600">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{doc.originalName}</p>
                    <p className="text-sm text-slate-500">
                      {formatBytes(doc.size)} · {formatDate(doc.createdAt)}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleDownloadDocument(doc._id, doc.originalName)}
                  className="flex items-center gap-1.5"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
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
