import { getCurrentUser } from './userAuth'
import { recordSeriesCompleted } from './loyalty'

const STATUS_KEY = 'sakura-series-tracking'
export const SERIES_STATUS_EVENT = 'sakura-series-status'

export type ReadingStatus =
  | 'reading'
  | 'planned'
  | 'completed'
  | 'hold'
  | 'dropped'
  | 'rereading'

export interface SeriesTracking {
  status?: ReadingStatus
  score?: number | null
  timesRead?: number
  addedAt?: number
}

export const STATUS_GRID: {
  id: ReadingStatus
  label: string
}[] = [
  { id: 'reading', label: 'Reading' },
  { id: 'planned', label: 'Planned' },
  { id: 'completed', label: 'Completed' },
  { id: 'hold', label: 'On Hold' },
  { id: 'dropped', label: 'Dropped' },
  { id: 'rereading', label: 'Rereading' },
]

const LABELS: Record<ReadingStatus, string> = {
  reading: 'Reading',
  planned: 'Planned',
  completed: 'Completed',
  hold: 'On Hold',
  dropped: 'Dropped',
  rereading: 'Rereading',
}

/** @deprecated use STATUS_GRID */
export const ALL_STATUSES: ReadingStatus[] = STATUS_GRID.map((s) => s.id)

export function getStatusLabel(status: ReadingStatus): string {
  return LABELS[status]
}

function migrate(raw: Record<string, unknown>): Record<string, SeriesTracking> {
  const out: Record<string, SeriesTracking> = {}
  for (const [slug, val] of Object.entries(raw)) {
    if (typeof val === 'string') {
      const status =
        val === 'plan' ? 'planned' : (val as ReadingStatus)
      out[slug] = { status }
    } else if (val && typeof val === 'object') {
      const t = val as SeriesTracking & { status?: string }
      const rawStatus = t.status as string | undefined
      out[slug] = {
        ...t,
        status:
          rawStatus === 'plan'
            ? 'planned'
            : (rawStatus as ReadingStatus | undefined),
      }
    }
  }
  return out
}

export function loadAllTracking(): Record<string, SeriesTracking> {
  try {
    const raw = localStorage.getItem(STATUS_KEY)
    if (!raw) return {}
    return migrate(JSON.parse(raw) as Record<string, unknown>)
  } catch {
    return {}
  }
}

export function getSeriesTracking(slug: string): SeriesTracking {
  return loadAllTracking()[slug] ?? {}
}

export function getSeriesStatus(slug: string): ReadingStatus | undefined {
  return getSeriesTracking(slug).status
}

function saveAll(all: Record<string, SeriesTracking>) {
  localStorage.setItem(STATUS_KEY, JSON.stringify(all))
  window.dispatchEvent(new Event(SERIES_STATUS_EVENT))
}

function ensureLibraryMembership(slug: string) {
  try {
    const raw = localStorage.getItem('readdex-library')
    const state = raw
      ? (JSON.parse(raw) as { bookmarks?: string[] })
      : { bookmarks: [] as string[] }
    const bookmarks = state.bookmarks ?? []
    if (bookmarks.includes(slug)) return
    state.bookmarks = [...bookmarks, slug]
    localStorage.setItem('readdex-library', JSON.stringify(state))
    window.dispatchEvent(new Event('readdex-library'))
  } catch {
    /* ignore */
  }
}

export interface TrackedLibraryEntry {
  slug: string
  tracking: SeriesTracking
}

export function getTrackedLibraryEntries(): TrackedLibraryEntry[] {
  const all = loadAllTracking()
  return Object.entries(all)
    .filter((entry): entry is [string, SeriesTracking & { status: ReadingStatus }] =>
      Boolean(entry[1]?.status),
    )
    .map(([slug, tracking]) => ({ slug, tracking }))
    .sort((a, b) => (b.tracking.addedAt ?? 0) - (a.tracking.addedAt ?? 0))
}

export function countByStatus(): Record<ReadingStatus, number> {
  const counts: Record<ReadingStatus, number> = {
    reading: 0,
    planned: 0,
    completed: 0,
    hold: 0,
    dropped: 0,
    rereading: 0,
  }
  for (const { tracking } of getTrackedLibraryEntries()) {
    if (tracking.status) counts[tracking.status] += 1
  }
  return counts
}

export function setSeriesStatus(slug: string, status: ReadingStatus) {
  const all = loadAllTracking()
  const prev = all[slug]
  all[slug] = {
    ...prev,
    status,
    addedAt: prev?.addedAt ?? Date.now(),
  }
  saveAll(all)
  ensureLibraryMembership(slug)
  if (status === 'completed') {
    const user = getCurrentUser()
    if (user) recordSeriesCompleted(user.id, slug)
  }
}

export function updateSeriesTracking(slug: string, patch: Partial<SeriesTracking>) {
  const all = loadAllTracking()
  const prev = all[slug]
  all[slug] = {
    ...prev,
    ...patch,
    addedAt: prev?.addedAt ?? Date.now(),
  }
  saveAll(all)
  if (all[slug].status) ensureLibraryMembership(slug)
}
