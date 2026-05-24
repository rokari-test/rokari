const SESSIONS_KEY = 'sakura-user-sessions'

export interface UserSession {
  id: string
  userId: string
  label: string
  userAgent: string
  createdAt: string
  lastActiveAt: string
  isCurrent: boolean
}

function loadAll(): Record<string, UserSession[]> {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, UserSession[]>
  } catch {
    return {}
  }
}

function saveAll(data: Record<string, UserSession[]>) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(data))
}

function deviceLabel(): string {
  const ua = navigator.userAgent
  if (/iPhone|iPad/i.test(ua)) return 'iOS device'
  if (/Android/i.test(ua)) return 'Android device'
  if (/Windows/i.test(ua)) return 'Windows'
  if (/Mac/i.test(ua)) return 'Mac'
  if (/Linux/i.test(ua)) return 'Linux'
  return 'Web browser'
}

export function touchUserSession(userId: string): string {
  const all = loadAll()
  const currentId = sessionStorage.getItem('sakura-device-session-id')
  const now = new Date().toISOString()
  let sessions = all[userId] ?? []

  if (currentId) {
    const idx = sessions.findIndex((s) => s.id === currentId)
    if (idx >= 0) {
      sessions[idx] = { ...sessions[idx], lastActiveAt: now, isCurrent: true }
      sessions = sessions.map((s, i) => ({
        ...s,
        isCurrent: i === idx,
      }))
      all[userId] = sessions
      saveAll(all)
      return currentId
    }
  }

  const id = crypto.randomUUID()
  sessionStorage.setItem('sakura-device-session-id', id)
  sessions = [
    {
      id,
      userId,
      label: deviceLabel(),
      userAgent: navigator.userAgent.slice(0, 120),
      createdAt: now,
      lastActiveAt: now,
      isCurrent: true,
    },
    ...sessions.map((s) => ({ ...s, isCurrent: false })),
  ].slice(0, 8)

  all[userId] = sessions
  saveAll(all)
  return id
}

export function getUserSessions(userId: string): UserSession[] {
  return loadAll()[userId] ?? []
}

export function refreshSessionActivity(userId: string) {
  touchUserSession(userId)
}

export function revokeSession(userId: string, sessionId: string): boolean {
  const all = loadAll()
  const sessions = all[userId] ?? []
  const target = sessions.find((s) => s.id === sessionId)
  if (!target || target.isCurrent) return false
  all[userId] = sessions.filter((s) => s.id !== sessionId)
  saveAll(all)
  return true
}

export function clearUserSessions(userId: string) {
  const all = loadAll()
  delete all[userId]
  saveAll(all)
  sessionStorage.removeItem('sakura-device-session-id')
}
