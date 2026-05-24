export const ADMIN_ACTIVITY_EVENT = 'sakura-admin-activity'

export type ActivityKind =
  | 'signup'
  | 'login'
  | 'subscription'
  | 'chapter'
  | 'report'
  | 'role'
  | 'settings'

export interface AdminActivity {
  id: string
  kind: ActivityKind
  title: string
  detail?: string
  at: string
}

const KEY = 'sakura-admin-activity'
const MAX = 80

function dispatch() {
  window.dispatchEvent(new Event(ADMIN_ACTIVITY_EVENT))
}

export function listActivity(limit = 30): AdminActivity[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const items = JSON.parse(raw) as AdminActivity[]
    return items.slice(0, limit)
  } catch {
    return []
  }
}

export function logActivity(
  kind: ActivityKind,
  title: string,
  detail?: string,
): AdminActivity {
  const entry: AdminActivity = {
    id: crypto.randomUUID(),
    kind,
    title,
    detail,
    at: new Date().toISOString(),
  }
  const prev = listActivity(MAX)
  localStorage.setItem(KEY, JSON.stringify([entry, ...prev].slice(0, MAX)))
  dispatch()
  return entry
}

export function seedActivityIfEmpty() {
  if (listActivity(1).length > 0) return
  const samples: Omit<AdminActivity, 'id' | 'at'>[] = [
    { kind: 'settings', title: 'Site name updated', detail: 'Sakura' },
    { kind: 'chapter', title: 'Chapter batch published', detail: '12 series updated' },
    { kind: 'subscription', title: 'Premium plan renewed', detail: '+$9.99 MRR' },
    { kind: 'signup', title: 'New reader registered', detail: '@nightowl' },
    { kind: 'report', title: 'Comment flagged', detail: 'Spam — pending review' },
    { kind: 'role', title: 'Uploader role granted', detail: '@scan_team' },
  ]
  const now = Date.now()
  const items: AdminActivity[] = samples.map((s, i) => ({
    ...s,
    id: crypto.randomUUID(),
    at: new Date(now - i * 3600_000 * 4).toISOString(),
  }))
  localStorage.setItem(KEY, JSON.stringify(items))
  dispatch()
}
