import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from './components/DashboardLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { AdminLoginPage } from './pages/admin/AdminLoginPage'
import { AdminManagerDetailPage } from './pages/admin/AdminManagerDetailPage'
import { AdminManagersPage } from './pages/admin/AdminManagersPage'
import { AdminStudentDetailPage } from './pages/admin/AdminStudentDetailPage'
import { AdminStudentFormPage } from './pages/admin/AdminStudentFormPage'
import { AdminStudentsPage } from './pages/admin/AdminStudentsPage'
import { LandingPage } from './pages/LandingPage'
import { ManagerLoginPage } from './pages/manager/ManagerLoginPage'
import { ManagerStudentDetailPage } from './pages/manager/ManagerStudentDetailPage'
import { ManagerStudentsPage } from './pages/manager/ManagerStudentsPage'
import { StudentCertificatesPage } from './pages/student/StudentCertificatesPage'
import { StudentDashboardPage } from './pages/student/StudentDashboardPage'
import { StudentDocumentsPage } from './pages/student/StudentDocumentsPage'
import { StudentLoginPage } from './pages/student/StudentLoginPage'
import { StudentOnboardingPage } from './pages/student/StudentOnboardingPage'
import { StudentProfilePage } from './pages/student/StudentProfilePage'

const adminNav = [
  { to: '/admin/students', label: 'Students' },
  { to: '/admin/managers', label: 'Managers' },
]

const managerNav = [
  { to: '/manager/students', label: 'Assigned Students' },
]

const studentNav = [
  { to: '/student', label: 'Dashboard' },
  { to: '/student/profile', label: 'Profile' },
  { to: '/student/documents', label: 'Documents' },
  { to: '/student/certificates', label: 'Certificates' },
]

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />

        {/* Authentication Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/manager/login" element={<ManagerLoginPage />} />
        <Route path="/student/login" element={<StudentLoginPage />} />

        {/* Admin Portal Routes - Protected */}
        <Route element={<ProtectedRoute role="ADMIN" />}>
          <Route
            element={<DashboardLayout navItems={adminNav} title="Admin Portal" />}
          >
            <Route path="/admin" element={<Navigate to="/admin/students" replace />} />
            <Route path="/admin/students" element={<AdminStudentsPage />} />
            <Route path="/admin/students/new" element={<AdminStudentFormPage />} />
            <Route path="/admin/students/:id" element={<AdminStudentDetailPage />} />
            <Route path="/admin/students/:id/edit" element={<AdminStudentFormPage />} />
            <Route path="/admin/managers" element={<AdminManagersPage />} />
            <Route path="/admin/managers/:id" element={<AdminManagerDetailPage />} />
          </Route>
        </Route>

        {/* Manager Portal Routes - Protected */}
        <Route element={<ProtectedRoute role="MANAGER" />}>
          <Route
            element={<DashboardLayout navItems={managerNav} title="Manager Portal" />}
          >
            <Route path="/manager" element={<Navigate to="/manager/students" replace />} />
            <Route path="/manager/students" element={<ManagerStudentsPage />} />
            <Route path="/manager/students/:id" element={<ManagerStudentDetailPage />} />
          </Route>
        </Route>

        {/* Student Portal Routes - Protected */}
        <Route element={<ProtectedRoute role="STUDENT" />}>
          <Route path="/student/onboarding" element={<StudentOnboardingPage />} />
          <Route
            element={<DashboardLayout navItems={studentNav} title="Student Portal" />}
          >
            <Route path="/student" element={<StudentDashboardPage />} />
            <Route path="/student/profile" element={<StudentProfilePage />} />
            <Route path="/student/documents" element={<StudentDocumentsPage />} />
            <Route path="/student/certificates" element={<StudentCertificatesPage />} />
          </Route>
        </Route>

        {/* Catch-all - Redirect to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

