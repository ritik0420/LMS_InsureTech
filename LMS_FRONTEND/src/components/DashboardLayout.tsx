import { Award, Bell, ChevronDown, CreditCard, FileText, LayoutDashboard, Link2, LogOut, Menu, User, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface NavItem {
  to: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
}

interface DashboardLayoutProps {
  navItems: NavItem[]
  title: string
}

// Map labels to icons for the student sidebar
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Dashboard: LayoutDashboard,
  Profile: User,
  Documents: FileText,
  Certificates: Award,
  'Class Links': Link2,
  Payments: CreditCard,
  Students: User,
  'Assigned Students': User,
  Managers: User,
}

function getInitials(name?: string | null) {
  if (!name) return '?'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('')
}

export function DashboardLayout({ navItems, title }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const initials = getInitials(user?.fullName)

  // Close dropdown when clicking outside
  const handleDropdownBlur = (e: React.FocusEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.relatedTarget as Node)) {
      setDropdownOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Left: Hamburger + Logo */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 md:hidden transition-colors"
              onClick={() => setMobileNavOpen((prev) => !prev)}
              aria-label="Toggle navigation"
            >
              {mobileNavOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            <img
              src="/insuretech logo (1).png"
              alt="InsureTech Logo"
              className="h-9 w-auto max-w-[120px] shrink-0 object-contain sm:h-14 sm:max-w-[180px]"
            />
            <div className="hidden border-l border-slate-200 pl-3 sm:block">
              <p className="text-sm font-semibold text-slate-900">InsureTech LMS</p>
              <p className="text-xs text-slate-500">{title}</p>
            </div>
          </div>

          {/* Right: Notification + Avatar Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell */}
            <button type="button" className="db-notif-btn" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="db-notif-badge" aria-hidden="true" />
            </button>

            {/* Avatar Dropdown */}
            <div
              className="db-header-dropdown"
              ref={dropdownRef}
              onBlur={handleDropdownBlur}
            >
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-1.5 py-1 sm:gap-2 sm:px-2 sm:py-1.5 hover:bg-slate-50 transition-colors"
                onClick={() => setDropdownOpen((p) => !p)}
                aria-label="User menu"
              >
                <div className="db-header-avatar" style={{ width: 32, height: 32, fontSize: '0.8rem' }} aria-hidden="true">
                  {initials}
                </div>
                <div className="hidden text-left sm:block max-w-[140px]">
                  <p className="text-sm font-semibold text-slate-900 truncate">{user?.fullName}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
                <ChevronDown
                  className={`hidden sm:block h-4 w-4 text-slate-400 transition-transform duration-200 ${
                    dropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {dropdownOpen && (
                <div className="db-header-dropdown__menu">
                  <div className="db-header-dropdown__user">
                    <p className="db-header-dropdown__name">{user?.fullName}</p>
                    <p className="db-header-dropdown__email">{user?.email}</p>
                  </div>
                  {user?.role === 'STUDENT' && (
                    <NavLink
                      to="/student/profile"
                      className="db-header-dropdown__item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      View Profile
                    </NavLink>
                  )}
                  <button
                    type="button"
                    className="db-header-dropdown__item db-header-dropdown__item--danger"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {mobileNavOpen && (
          <div className="border-t border-slate-100 bg-white px-4 pb-4 pt-3 md:hidden">
            <div className="mb-3 flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="db-header-avatar">{initials}</div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{user?.fullName}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <nav className="db-sidebar-nav">
              {navItems.map((item) => {
                const Icon = item.icon ?? ICON_MAP[item.label]
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/student' || item.to === '/admin' || item.to === '/manager'}
                    onClick={() => setMobileNavOpen(false)}
                    className={({ isActive }) =>
                      `db-sidebar-link${isActive ? ' active' : ''}`
                    }
                  >
                    {Icon && <Icon className="db-sidebar-icon" />}
                    <span className="db-sidebar-label">{item.label}</span>
                  </NavLink>
                )
              })}
              <button
                type="button"
                className="db-sidebar-link mt-2 border-t border-slate-100 pt-3 text-red-500 hover:bg-red-50 hover:text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="db-sidebar-icon" />
                <span className="db-sidebar-label">Logout</span>
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* ===== BODY ===== */}
      <div className="mx-auto flex max-w-7xl gap-8 px-3 py-4 sm:px-6 sm:py-8">
        {/* Sidebar */}
        <aside className="hidden w-60 shrink-0 md:block">
          {/* Sidebar header label */}
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Navigation
          </p>
          <nav className="db-sidebar-nav">
            {navItems.map((item) => {
              const Icon = item.icon ?? ICON_MAP[item.label]
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/student' || item.to === '/admin' || item.to === '/manager'}
                  className={({ isActive }) =>
                    `db-sidebar-link${isActive ? ' active' : ''}`
                  }
                >
                  {Icon && <Icon className="db-sidebar-icon" />}
                  <span className="db-sidebar-label">{item.label}</span>
                </NavLink>
              )
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="mt-6 border-t border-slate-100 pt-4">
            <button
              type="button"
              className="db-sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="db-sidebar-icon" />
              <span className="db-sidebar-label">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
