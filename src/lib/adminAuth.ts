import { canAccessAdminPanel, getCurrentUser } from './userAuth'

const SESSION_KEY = 'inkscroll-admin-session'

const DEFAULT_PASSWORD = 'changeme'

export function getAdminPassword(): string {
  return import.meta.env.VITE_ADMIN_PASSWORD ?? DEFAULT_PASSWORD
}

export function hasAdminPasswordSession(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === '1'
}

export function isAdminAuthenticated(): boolean {
  if (hasAdminPasswordSession()) return true
  const user = getCurrentUser()
  return canAccessAdminPanel(user?.role)
}

export function getAdminOperatorLabel(): string {
  const user = getCurrentUser()
  if (user && canAccessAdminPanel(user.role)) {
    return user.displayName || user.username
  }
  if (hasAdminPasswordSession()) return 'Admin session'
  return 'Guest'
}

export function loginAdmin(password: string): boolean {
  if (password !== getAdminPassword()) return false
  sessionStorage.setItem(SESSION_KEY, '1')
  return true
}

export function logoutAdmin() {
  sessionStorage.removeItem(SESSION_KEY)
}
