import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { getAdminOperatorLabel, hasAdminPasswordSession, logoutAdmin } from '../lib/adminAuth'
import { getCurrentUser, getRoleLabel } from '../lib/userAuth'
import { useSiteConfig } from '../hooks/useSiteConfig'
import './admin.css'

const NAV = [
  { to: '/admin', end: true, label: 'Dashboard' },
  { to: '/admin/users', label: 'Accounts' },
  { to: '/admin/packages', label: 'Packages' },
  { to: '/admin/subscriptions', label: 'Subscriptions' },
  { to: '/admin/reports', label: 'Moderation' },
  { to: '/admin/announcements', label: 'News' },
  { to: '/admin/loyalty', label: 'Loyalty' },
  { to: '/admin/series', label: 'Series' },
  { to: '/admin/series/new', label: 'Add series' },
  { to: '/admin/settings', label: 'Site settings' },
] as const

export function AdminLayout() {
  const navigate = useNavigate()
  const { siteName } = useSiteConfig()
  const user = getCurrentUser()
  const operator = getAdminOperatorLabel()

  const handleLogout = () => {
    logoutAdmin()
    navigate('/admin/login')
  }

  return (
    <div className="admin-root">
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <strong>{siteName} Admin</strong>
            <span>Owner & content panel</span>
          </div>
          <div className="admin-operator">
            <span className="admin-operator-label">Signed in as</span>
            <strong>{operator}</strong>
            {user && <span className="admin-operator-role">{getRoleLabel(user.role)}</span>}
            {hasAdminPasswordSession() && !user && (
              <span className="admin-operator-role">Password session</span>
            )}
          </div>
          <nav className="admin-nav" aria-label="Admin">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={'end' in item ? item.end : undefined}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="admin-sidebar-footer">
            <a href="/" className="admin-btn admin-btn--ghost" style={{ textAlign: 'center' }}>
              View site
            </a>
            <button type="button" className="admin-btn admin-btn--ghost" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </aside>
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
