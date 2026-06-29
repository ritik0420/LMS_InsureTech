import { ArrowRight, GraduationCap, Shield, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute -right-32 bottom-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <header className="mb-20 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-semibold">InsureTech Skills LMS</p>
            <p className="text-sm text-slate-400">Learning Management Platform</p>
          </div>
        </header>

        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center rounded-full border border-brand-400/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-200">
              Insurance Skills Training
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Manage learners. Track documents. Issue certificates.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-slate-300">
              A focused LMS for InsureTech training programs — admins manage students
              and certificates, students manage profiles and download credentials.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              to="/admin/login"
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-brand-400/40 hover:bg-white/10"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/20 text-brand-300">
                <Shield className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold">Admin Portal</h2>
              <p className="mt-2 text-sm text-slate-400">
                Create students, manage accounts, and upload completion certificates.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-300 group-hover:gap-2 transition-all">
                Sign in as Admin <ArrowRight className="h-4 w-4" />
              </span>
            </Link>

            <Link
              to="/student/login"
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-cyan-400/40 hover:bg-white/10"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300">
                <Users className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold">Student Portal</h2>
              <p className="mt-2 text-sm text-slate-400">
                Update your profile, upload documents, and download certificates.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-cyan-300 group-hover:gap-2 transition-all">
                Sign in as Student <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
