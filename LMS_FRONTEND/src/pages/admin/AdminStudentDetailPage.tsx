import { Award, CreditCard, ExternalLink, FileText, Link2, Pencil, Plus, Trash2, Upload, Download } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  addClassLink,
  addInvoice,
  deactivateStudent,
  deleteClassLink,
  deleteInvoice,
  deleteStudentPermanently,
  getStudent,
  updateInvoice,
  uploadCertificate,
} from '../../api/admin'
import { ApiClientError, downloadFile } from '../../api/client'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Textarea } from '../../components/ui/Textarea'
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

  // Certificate modal
  const [certModalOpen, setCertModalOpen] = useState(false)
  const [certTitle, setCertTitle] = useState('')
  const [certFile, setCertFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  // Class link modal
  const [linkModalOpen, setLinkModalOpen] = useState(false)
  const [linkTitle, setLinkTitle] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [linkDescription, setLinkDescription] = useState('')
  const [addingLink, setAddingLink] = useState(false)

  // Invoice modal
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false)
  const [invTitle, setInvTitle] = useState('')
  const [invAmount, setInvAmount] = useState('')
  const [invCurrency, setInvCurrency] = useState('USD')
  const [invDescription, setInvDescription] = useState('')
  const [invStatus, setInvStatus] = useState('Pending')
  const [invDueDate, setInvDueDate] = useState('')
  const [invPaymentLink, setInvPaymentLink] = useState('')
  const [addingInvoice, setAddingInvoice] = useState(false)

  // Confirm modals
  const [deactivateOpen, setDeactivateOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
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

  const handleAddClassLink = async (e: FormEvent) => {
    e.preventDefault()
    if (!id || !linkTitle.trim() || !linkUrl.trim()) return

    setAddingLink(true)
    setError('')
    try {
      await addClassLink(id, {
        title: linkTitle.trim(),
        url: linkUrl.trim(),
        description: linkDescription.trim(),
      })
      setLinkModalOpen(false)
      setLinkTitle('')
      setLinkUrl('')
      setLinkDescription('')
      loadStudent()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to add class link')
    } finally {
      setAddingLink(false)
    }
  }

  const handleDeleteClassLink = async (linkId: string) => {
    if (!id) return
    setError('')
    try {
      await deleteClassLink(id, linkId)
      loadStudent()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to delete class link')
    }
  }

  const handleAddInvoice = async (e: FormEvent) => {
    e.preventDefault()
    if (!id || !invTitle.trim() || !invAmount) return

    setAddingInvoice(true)
    setError('')
    try {
      await addInvoice(id, {
        title: invTitle.trim(),
        amount: parseFloat(invAmount),
        currency: invCurrency,
        description: invDescription.trim(),
        status: invStatus,
        dueDate: invDueDate || undefined,
        paymentLink: invPaymentLink.trim() || undefined,
      })
      setInvoiceModalOpen(false)
      setInvTitle('')
      setInvAmount('')
      setInvCurrency('USD')
      setInvDescription('')
      setInvStatus('Pending')
      setInvDueDate('')
      setInvPaymentLink('')
      loadStudent()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to add invoice')
    } finally {
      setAddingInvoice(false)
    }
  }

  const handleToggleInvoiceStatus = async (invoiceId: string, currentStatus: string) => {
    if (!id) return
    setError('')
    try {
      await updateInvoice(id, invoiceId, {
        status: currentStatus === 'Paid' ? 'Pending' : 'Paid',
      })
      loadStudent()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to update invoice')
    }
  }

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!id) return
    setError('')
    try {
      await deleteInvoice(id, invoiceId)
      loadStudent()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to delete invoice')
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

  const handleDownloadStudentCertificate = async (certificateId: string, filename: string) => {
    if (!id) return
    try {
      await downloadFile(`/admin/students/${id}/certificates/${certificateId}/download`, filename)
    } catch (err) {
      setError('Failed to download certificate')
    }
  }

  const handleDownloadStudentDocument = async (documentId: string, filename: string) => {
    if (!id) return
    try {
      await downloadFile(`/admin/students/${id}/documents/${documentId}/download`, filename)
    } catch (err) {
      setError('Failed to download document')
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
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-6 sm:p-6">
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

      {/* Certificates Section */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
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
              <li key={cert._id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="rounded-lg bg-brand-50 p-2 text-brand-600">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{cert.title}</p>
                    <p className="text-sm text-slate-500 break-all">
                      {cert.originalName} · {formatBytes(cert.size)} ·{' '}
                      {formatDate(cert.createdAt)}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleDownloadStudentCertificate(cert._id, cert.originalName)}
                  className="flex items-center gap-1.5 self-start sm:self-auto shrink-0"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Class Links Section */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-900">Class Links</h2>
          </div>
          <Button size="sm" onClick={() => setLinkModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Class Link
          </Button>
        </div>

        {!student.classLinks?.length ? (
          <EmptyState
            title="No class links shared"
            description="Share a meeting or class link (Zoom, Google Meet, etc.) with this student"
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {student.classLinks.map((link) => (
              <li key={link._id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                    <ExternalLink className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{link.title}</p>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:text-indigo-700 break-all"
                    >
                      {link.url}
                    </a>
                    {link.description && (
                      <p className="text-sm text-slate-500 mt-0.5">{link.description}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(link.createdAt)}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDeleteClassLink(link._id)}
                  className="flex items-center gap-1.5 self-start sm:self-auto shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Invoices / Payments Section */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-slate-900">Invoices / Payments</h2>
          </div>
          <Button size="sm" onClick={() => setInvoiceModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Invoice
          </Button>
        </div>

        {!student.invoices?.length ? (
          <EmptyState
            title="No invoices yet"
            description="Create an invoice or send payment details to this student"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Title</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Amount</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                  <th className="hidden sm:table-cell px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Due Date</th>
                  <th className="hidden sm:table-cell px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Pay Link</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {student.invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50/80">
                    <td className="px-3 py-3">
                      <p className="font-medium text-slate-900 text-sm">{inv.title}</p>
                      {inv.description && (
                        <p className="text-xs text-slate-500 mt-0.5">{inv.description}</p>
                      )}
                    </td>
                    <td className="px-3 py-3 text-sm font-medium text-slate-900">
                      {inv.currency} {inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 py-3">
                      <InvoiceStatusBadge status={inv.status} />
                    </td>
                    <td className="hidden sm:table-cell px-3 py-3 text-sm text-slate-600">
                      {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="hidden sm:table-cell px-3 py-3 text-sm">
                      {inv.paymentLink ? (
                        <a
                          href={inv.paymentLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-700 break-all"
                        >
                          Link ↗
                        </a>
                      ) : '—'}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleInvoiceStatus(inv._id, inv.status)}
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium transition ${
                            inv.status === 'Paid'
                              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {inv.status === 'Paid' ? 'Unpay' : 'Mark Paid'}
                        </button>
                        <button
                          onClick={() => handleDeleteInvoice(inv._id)}
                          className="inline-flex items-center rounded-md p-1 text-red-500 hover:bg-red-50 transition"
                          title="Delete invoice"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Documents Section */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
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
              <li key={doc._id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="rounded-lg bg-slate-50 p-2 text-slate-600">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 break-all">{doc.originalName}</p>
                    <p className="text-sm text-slate-500">
                      {formatBytes(doc.size)} · {formatDate(doc.createdAt)}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleDownloadStudentDocument(doc._id, doc.originalName)}
                  className="flex items-center gap-1.5 self-start sm:self-auto shrink-0"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Upload Certificate Modal */}
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
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
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

      {/* Add Class Link Modal */}
      <Modal
        open={linkModalOpen}
        title="Share Class Link"
        onClose={() => setLinkModalOpen(false)}
      >
        <form onSubmit={handleAddClassLink} className="space-y-4">
          <Input
            label="Title"
            value={linkTitle}
            onChange={(e) => setLinkTitle(e.target.value)}
            placeholder="e.g. Weekly Zoom Session"
            required
          />
          <Input
            label="URL"
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://zoom.us/j/..."
            required
          />
          <Textarea
            label="Description (optional)"
            value={linkDescription}
            onChange={(e) => setLinkDescription(e.target.value)}
            placeholder="Meeting details, schedule notes..."
            rows={3}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setLinkModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={addingLink}>
              Share Link
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Invoice Modal */}
      <Modal
        open={invoiceModalOpen}
        title="Create Invoice"
        onClose={() => setInvoiceModalOpen(false)}
        size="lg"
      >
        <form onSubmit={handleAddInvoice} className="space-y-4">
          <Input
            label="Invoice Title"
            value={invTitle}
            onChange={(e) => setInvTitle(e.target.value)}
            placeholder="e.g. Course Fee — Module 1"
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Amount"
              type="number"
              step="0.01"
              min="0"
              value={invAmount}
              onChange={(e) => setInvAmount(e.target.value)}
              placeholder="0.00"
              required
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Currency</label>
              <select
                value={invCurrency}
                onChange={(e) => setInvCurrency(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
                <option value="CAD">CAD</option>
                <option value="AUD">AUD</option>
              </select>
            </div>
          </div>
          <Textarea
            label="Description (optional)"
            value={invDescription}
            onChange={(e) => setInvDescription(e.target.value)}
            placeholder="Payment details, breakdown, notes..."
            rows={3}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Status</label>
              <select
                value={invStatus}
                onChange={(e) => setInvStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
            <Input
              label="Due Date"
              type="date"
              value={invDueDate}
              onChange={(e) => setInvDueDate(e.target.value)}
            />
          </div>
          <Input
            label="Payment Link (optional)"
            type="url"
            value={invPaymentLink}
            onChange={(e) => setInvPaymentLink(e.target.value)}
            placeholder="https://pay.stripe.com/..."
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setInvoiceModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={addingInvoice}>
              Create Invoice
            </Button>
          </div>
        </form>
      </Modal>

      {/* Deactivate Modal */}
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

      {/* Delete Permanently Modal */}
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

function InvoiceStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Pending: 'bg-amber-50 text-amber-700',
    Paid: 'bg-emerald-50 text-emerald-700',
    Overdue: 'bg-red-50 text-red-700',
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || 'bg-slate-100 text-slate-600'}`}
    >
      {status}
    </span>
  )
}
