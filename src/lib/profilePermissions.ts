import type { UserRole } from './userAuth'

export type ProfilePermIcon =
  | 'login'
  | 'comment'
  | 'supporter'
  | 'upload'
  | 'edit'
  | 'moderate'
  | 'administer'

export interface ProfilePermission {
  id: string
  label: string
  icon: ProfilePermIcon
  granted: boolean
}

export function getProfilePermissions(
  role: UserRole,
  options?: { hasPaidSubscription?: boolean },
): ProfilePermission[] {
  const all: Omit<ProfilePermission, 'granted'>[] = [
    { id: 'login', label: 'Login', icon: 'login' },
    { id: 'comment', label: 'Comment', icon: 'comment' },
    { id: 'supporter', label: 'Supporter', icon: 'supporter' },
    { id: 'upload', label: 'Upload', icon: 'upload' },
    { id: 'edit', label: 'Edit', icon: 'edit' },
    { id: 'moderate', label: 'Moderate', icon: 'moderate' },
    { id: 'administer', label: 'Administer', icon: 'administer' },
  ]

  const grants: Record<UserRole, Set<string>> = {
    user: new Set(['login', 'comment']),
    uploader: new Set(['login', 'comment', 'upload']),
    moderator: new Set(['login', 'comment', 'moderate']),
    admin: new Set(['login', 'comment', 'supporter', 'upload', 'edit', 'moderate', 'administer']),
    owner: new Set(['login', 'comment', 'supporter', 'upload', 'edit', 'moderate', 'administer']),
  }

  const allowed = grants[role]
  return all.map((p) => {
    let granted = allowed.has(p.id)
    if (p.id === 'supporter' && options?.hasPaidSubscription) granted = true
    return { ...p, granted }
  })
}
