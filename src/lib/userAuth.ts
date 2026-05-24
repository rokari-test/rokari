import { touchUserSession } from './userSessions'
import { ensureLoyalty, recordLogin } from './loyalty'

export const USER_AUTH_EVENT = 'sakura-user-auth'

const USERS_KEY = 'sakura-users'
const SESSION_KEY = 'sakura-user-session'

export type UserRole = 'user' | 'uploader' | 'moderator' | 'admin' | 'owner'

const UPLOAD_ROLES: UserRole[] = ['uploader', 'admin', 'owner']
const ADMIN_ROLES: UserRole[] = ['admin', 'owner']

export function canAccessUpload(role: UserRole | undefined): boolean {
  return role !== undefined && UPLOAD_ROLES.includes(role)
}

export interface UserAccount {
  id: string
  username: string
  email: string
  passwordHash: string
  displayName: string
  bio: string
  avatarHue: number
  avatarImageId: string | null
  bannerImageId: string | null
  profilePublic: boolean
  libraryPublic: boolean
  role: UserRole
  suspended: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt: string
}

export interface UserPublic {
  id: string
  username: string
  email: string
  displayName: string
  bio: string
  avatarHue: number
  avatarImageId: string | null
  bannerImageId: string | null
  profilePublic: boolean
  libraryPublic: boolean
  role: UserRole
  suspended: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt: string
}

export type AuthResult =
  | { ok: true; user: UserPublic }
  | { ok: false; error: string }

function dispatchAuth() {
  window.dispatchEvent(new Event(USER_AUTH_EVENT))
}

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function migrateUser(raw: Partial<UserAccount> & { id: string }): UserAccount {
  const now = new Date().toISOString()
  return {
    id: raw.id,
    username: raw.username ?? 'user',
    email: raw.email ?? '',
    passwordHash: raw.passwordHash ?? '',
    displayName: raw.displayName ?? raw.username ?? 'User',
    bio: raw.bio ?? '',
    avatarHue: raw.avatarHue ?? 320,
    avatarImageId: raw.avatarImageId ?? null,
    bannerImageId: raw.bannerImageId ?? null,
    profilePublic: raw.profilePublic ?? true,
    libraryPublic: raw.libraryPublic ?? true,
    role: raw.role ?? 'user',
    suspended: raw.suspended ?? false,
    createdAt: raw.createdAt ?? now,
    updatedAt: raw.updatedAt ?? raw.createdAt ?? now,
    lastLoginAt: raw.lastLoginAt ?? raw.createdAt ?? now,
  }
}

function loadUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Partial<UserAccount>[]
    return Array.isArray(parsed) ? parsed.map((u) => migrateUser(u as UserAccount)) : []
  } catch {
    return []
  }
}

function saveUsers(users: UserAccount[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function toPublic(user: UserAccount): UserPublic {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.displayName,
    bio: user.bio,
    avatarHue: user.avatarHue,
    avatarImageId: user.avatarImageId,
    bannerImageId: user.bannerImageId,
    profilePublic: user.profilePublic,
    libraryPublic: user.libraryPublic,
    role: user.role,
    suspended: user.suspended,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt,
  }
}

function usernameHue(username: string): number {
  let n = 0
  for (let i = 0; i < username.length; i++) n += username.charCodeAt(i) * 17
  return n % 360
}

function stampLogin(user: UserAccount): UserAccount {
  const now = new Date().toISOString()
  return { ...user, lastLoginAt: now, updatedAt: now }
}

export function getSessionUserId(): string | null {
  return localStorage.getItem(SESSION_KEY)
}

export function getCurrentUser(): UserPublic | null {
  const id = getSessionUserId()
  if (!id) return null
  const user = loadUsers().find((u) => u.id === id)
  return user ? toPublic(user) : null
}

export function getUserById(id: string): UserPublic | null {
  const user = loadUsers().find((u) => u.id === id)
  return user ? toPublic(user) : null
}

export function getUserByIdOrUsername(key: string): UserPublic | null {
  const trimmed = key.trim()
  if (!trimmed) return null
  const byId = getUserById(trimmed)
  if (byId) return byId
  const un = trimmed.replace(/^@/, '').toLowerCase()
  const user = loadUsers().find((u) => u.username === un)
  return user ? toPublic(user) : null
}

export function isUserLoggedIn(): boolean {
  return Boolean(getCurrentUser())
}

export async function registerUser(input: {
  username: string
  email: string
  password: string
}): Promise<AuthResult> {
  const username = input.username.trim().toLowerCase()
  const email = input.email.trim().toLowerCase()
  const password = input.password

  if (username.length < 5) {
    return { ok: false, error: 'Username must be at least 5 characters.' }
  }
  if (!/^[a-z0-9_]+$/.test(username)) {
    return {
      ok: false,
      error: 'Username can only use letters, numbers, and underscores.',
    }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'Enter a valid email address.' }
  }
  if (password.length < 6) {
    return { ok: false, error: 'Password must be at least 6 characters.' }
  }

  const users = loadUsers()
  if (users.some((u) => u.username === username)) {
    return { ok: false, error: 'That username is already taken.' }
  }
  if (users.some((u) => u.email === email)) {
    return { ok: false, error: 'An account with this email already exists.' }
  }

  const now = new Date().toISOString()
  const user: UserAccount = {
    id: crypto.randomUUID(),
    username,
    email,
    passwordHash: await hashPassword(password),
    displayName: input.username.trim(),
    bio: '',
    avatarHue: usernameHue(username),
    avatarImageId: null,
    bannerImageId: null,
    profilePublic: true,
    libraryPublic: true,
    role: 'user',
    suspended: false,
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
  }

  saveUsers([...users, user])
  localStorage.setItem(SESSION_KEY, user.id)
  touchUserSession(user.id)
  ensureLoyalty(user.id)
  dispatchAuth()
  return { ok: true, user: toPublic(user) }
}

export async function loginUser(input: {
  login: string
  password: string
}): Promise<AuthResult> {
  const key = input.login.trim().toLowerCase()
  const passwordHash = await hashPassword(input.password)
  const users = loadUsers()
  const idx = users.findIndex((u) => u.username === key || u.email === key)
  if (idx < 0 || users[idx].passwordHash !== passwordHash) {
    return { ok: false, error: 'Invalid email/username or password.' }
  }
  if (users[idx].suspended) {
    return { ok: false, error: 'This account has been suspended. Contact support.' }
  }

  const updated = stampLogin(users[idx])
  users[idx] = updated
  saveUsers(users)
  localStorage.setItem(SESSION_KEY, updated.id)
  touchUserSession(updated.id)
  ensureLoyalty(updated.id)
  recordLogin(updated.id)
  dispatchAuth()
  return { ok: true, user: toPublic(updated) }
}

export function logoutUser() {
  const id = getSessionUserId()
  localStorage.removeItem(SESSION_KEY)
  if (id) sessionStorage.removeItem('sakura-device-session-id')
  dispatchAuth()
}

export async function updateUserProfile(
  patch: Partial<
    Pick<
      UserAccount,
      | 'displayName'
      | 'bio'
      | 'email'
      | 'profilePublic'
      | 'libraryPublic'
      | 'avatarImageId'
      | 'bannerImageId'
    >
  >,
): Promise<AuthResult> {
  const id = getSessionUserId()
  if (!id) return { ok: false, error: 'Not signed in.' }

  const users = loadUsers()
  const idx = users.findIndex((u) => u.id === id)
  if (idx < 0) return { ok: false, error: 'Account not found.' }

  const next = { ...users[idx] }
  if (patch.displayName !== undefined) {
    next.displayName = patch.displayName.trim().slice(0, 48) || next.username
  }
  if (patch.bio !== undefined) {
    next.bio = patch.bio.trim().slice(0, 280)
  }
  if (patch.email !== undefined) {
    const email = patch.email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, error: 'Enter a valid email address.' }
    }
    if (users.some((u) => u.email === email && u.id !== id)) {
      return { ok: false, error: 'That email is already in use.' }
    }
    next.email = email
  }
  if (patch.profilePublic !== undefined) next.profilePublic = patch.profilePublic
  if (patch.libraryPublic !== undefined) next.libraryPublic = patch.libraryPublic
  if (patch.avatarImageId !== undefined) next.avatarImageId = patch.avatarImageId
  if (patch.bannerImageId !== undefined) next.bannerImageId = patch.bannerImageId

  next.updatedAt = new Date().toISOString()
  users[idx] = next
  saveUsers(users)
  dispatchAuth()
  return { ok: true, user: toPublic(next) }
}

export async function changeUserPassword(input: {
  currentPassword: string
  newPassword: string
}): Promise<AuthResult> {
  const id = getSessionUserId()
  if (!id) return { ok: false, error: 'Not signed in.' }

  if (input.newPassword.length < 6) {
    return { ok: false, error: 'New password must be at least 6 characters.' }
  }

  const users = loadUsers()
  const idx = users.findIndex((u) => u.id === id)
  if (idx < 0) return { ok: false, error: 'Account not found.' }

  const currentHash = await hashPassword(input.currentPassword)
  if (users[idx].passwordHash !== currentHash) {
    return { ok: false, error: 'Current password is incorrect.' }
  }

  users[idx] = {
    ...users[idx],
    passwordHash: await hashPassword(input.newPassword),
    updatedAt: new Date().toISOString(),
  }
  saveUsers(users)
  dispatchAuth()
  return { ok: true, user: toPublic(users[idx]) }
}

export function getUserInitial(user: UserPublic): string {
  return (user.displayName || user.username).charAt(0).toUpperCase()
}

export function formatJoinedDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'long',
    year: 'numeric',
  })
}

export function formatKaganeDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function formatRelativeActive(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

export function getRoleLabel(role: UserRole): string {
  if (role === 'owner') return 'Site owner'
  if (role === 'admin') return 'Admin'
  if (role === 'moderator') return 'Moderator'
  if (role === 'uploader') return 'Uploader'
  return 'User'
}

export function canAccessAdminPanel(role: UserRole | undefined): boolean {
  return role !== undefined && ADMIN_ROLES.includes(role)
}

export function listUsersForAdmin(): UserPublic[] {
  return loadUsers().map(toPublic)
}

export function setUserRole(userId: string, role: UserRole): UserPublic | null {
  const users = loadUsers()
  const idx = users.findIndex((u) => u.id === userId)
  if (idx < 0) return null
  users[idx] = { ...users[idx], role, updatedAt: new Date().toISOString() }
  saveUsers(users)
  dispatchAuth()
  return toPublic(users[idx])
}

export function setUserSuspended(userId: string, suspended: boolean): UserPublic | null {
  const users = loadUsers()
  const idx = users.findIndex((u) => u.id === userId)
  if (idx < 0) return null
  users[idx] = { ...users[idx], suspended, updatedAt: new Date().toISOString() }
  saveUsers(users)
  dispatchAuth()
  return toPublic(users[idx])
}

export function deleteUserAccount(userId: string): boolean {
  const users = loadUsers()
  const next = users.filter((u) => u.id !== userId)
  if (next.length === users.length) return false
  saveUsers(next)
  if (getSessionUserId() === userId) logoutUser()
  dispatchAuth()
  return true
}

export async function adminResetUserPassword(
  userId: string,
  newPassword: string,
): Promise<AuthResult> {
  if (newPassword.length < 6) {
    return { ok: false, error: 'Password must be at least 6 characters.' }
  }

  const users = loadUsers()
  const idx = users.findIndex((u) => u.id === userId)
  if (idx < 0) return { ok: false, error: 'Account not found.' }

  users[idx] = {
    ...users[idx],
    passwordHash: await hashPassword(newPassword),
    updatedAt: new Date().toISOString(),
  }
  saveUsers(users)
  dispatchAuth()
  return { ok: true, user: toPublic(users[idx]) }
}
