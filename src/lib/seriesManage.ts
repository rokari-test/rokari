import { canAccessAdminPanel, canAccessUpload, type UserRole } from './userAuth'

export function canManageSeries(role: UserRole | undefined): boolean {
  return canAccessUpload(role) || canAccessAdminPanel(role)
}
