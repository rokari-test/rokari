import type { Chapter, Series } from '../types'
import type { PlanId } from './planId'

export const EARLY_ACCESS_EVENT = 'sakura-early-access'

const SETTINGS_KEY = 'sakura-early-access-settings'
const SETTINGS_VERSION = 2

/** Hours after chapter release before that plan can read the newest chapter. */
export const DEFAULT_PLAN_DELAYS_HOURS: Record<PlanId, number> = {
  free: 168, // 7 days
  supporter: 24,
  premium: 6,
  studio: 0, // instant at release
}

export interface EarlyAccessSettings {
  version: number
  planDelays: Record<PlanId, number>
  baseCoinPrice: number
}

const DEFAULT_SETTINGS: EarlyAccessSettings = {
  version: SETTINGS_VERSION,
  planDelays: { ...DEFAULT_PLAN_DELAYS_HOURS },
  baseCoinPrice: 30,
}

function dispatch() {
  window.dispatchEvent(new Event(EARLY_ACCESS_EVENT))
}

function cloneDefault(): EarlyAccessSettings {
  return {
    version: SETTINGS_VERSION,
    planDelays: { ...DEFAULT_PLAN_DELAYS_HOURS },
    baseCoinPrice: DEFAULT_SETTINGS.baseCoinPrice,
  }
}

export function loadEarlyAccessSettings(): EarlyAccessSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return cloneDefault()
    const parsed = JSON.parse(raw) as Partial<EarlyAccessSettings>

    if (parsed.version === SETTINGS_VERSION && parsed.planDelays) {
      return {
        version: SETTINGS_VERSION,
        planDelays: { ...DEFAULT_PLAN_DELAYS_HOURS, ...parsed.planDelays },
        baseCoinPrice:
          typeof parsed.baseCoinPrice === 'number'
            ? parsed.baseCoinPrice
            : DEFAULT_SETTINGS.baseCoinPrice,
      }
    }

    const upgraded = cloneDefault()
    if (typeof parsed.baseCoinPrice === 'number') {
      upgraded.baseCoinPrice = parsed.baseCoinPrice
    }
    saveEarlyAccessSettings(upgraded)
    return upgraded
  } catch {
    return cloneDefault()
  }
}

export function saveEarlyAccessSettings(settings: EarlyAccessSettings) {
  const payload: EarlyAccessSettings = {
    version: SETTINGS_VERSION,
    planDelays: { ...DEFAULT_PLAN_DELAYS_HOURS, ...settings.planDelays },
    baseCoinPrice: settings.baseCoinPrice,
  }
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(payload))
  dispatch()
}

export function getPlanEarlyAccessDelayHours(
  planId: PlanId | null | undefined,
  settings = loadEarlyAccessSettings(),
): number {
  const id = planId ?? 'free'
  const hours = settings.planDelays[id]
  return typeof hours === 'number' && hours >= 0
    ? hours
    : DEFAULT_PLAN_DELAYS_HOURS[id]
}

/** Human label for a plan's newest-chapter wait (Shop, admin, tooltips). */
export function describePlanEarlyAccess(
  planId: PlanId,
  settings = loadEarlyAccessSettings(),
): string {
  const hours = getPlanEarlyAccessDelayHours(planId, settings)
  if (hours <= 0) return 'Instant access when chapters drop'
  if (hours % 24 === 0) {
    const days = hours / 24
    return `New chapters after ${days} day${days === 1 ? '' : 's'}`
  }
  return `New chapters after ${hours} hours`
}

export function isLatestChapter(chapter: Chapter, chapters: Chapter[]): boolean {
  if (chapters.length === 0) return false
  const maxNum = chapters.reduce((m, c) => Math.max(m, c.number), 0)
  return chapter.number === maxNum
}

export function getChapterReleaseUnlockAt(
  chapter: Chapter,
  planId: PlanId | null | undefined,
  settings = loadEarlyAccessSettings(),
): number {
  const released = new Date(chapter.updatedAt).getTime()
  const hours = getPlanEarlyAccessDelayHours(planId, settings)
  return released + hours * 60 * 60 * 1000
}

/** When the newest chapter is free for everyone (Free plan delay). */
export function getPublicChapterUnlockAt(
  chapter: Chapter,
  settings = loadEarlyAccessSettings(),
): number {
  return getChapterReleaseUnlockAt(chapter, 'free', settings)
}

const PLAN_LABELS: Record<PlanId, string> = {
  free: 'Free',
  supporter: 'Supporter',
  premium: 'Premium',
  studio: 'Studio',
}

export interface PlanUnlockSlot {
  planId: PlanId
  planName: string
  unlockAt: number
  remainingMs: number
  ready: boolean
}

export function getPlanUnlockSchedule(
  chapter: Chapter,
  settings = loadEarlyAccessSettings(),
): PlanUnlockSlot[] {
  const plans: PlanId[] = ['studio', 'premium', 'supporter', 'free']
  return plans.map((planId) => {
    const unlockAt = getChapterReleaseUnlockAt(chapter, planId, settings)
    const remainingMs = Math.max(0, unlockAt - Date.now())
    return {
      planId,
      planName: PLAN_LABELS[planId],
      unlockAt,
      remainingMs,
      ready: remainingMs <= 0,
    }
  })
}

export function findLatestChapter(chapters: Chapter[]): Chapter | null {
  if (chapters.length === 0) return null
  const maxNum = chapters.reduce((m, c) => Math.max(m, c.number), 0)
  return chapters.find((c) => c.number === maxNum) ?? null
}

/** Refresh stale newest-chapter release dates so early-access timers stay visible. */
export function syncLatestChapterRelease(series: Series): Series {
  const latest = findLatestChapter(
    series.chapters.filter((c) => !c.trashed),
  )
  if (!latest) return series

  const publicUnlock = getChapterReleaseUnlockAt(latest, 'free')
  if (Date.now() < publicUnlock) return series

  const release = new Date(Date.now() - 2 * 60 * 60 * 1000)
  const updatedAt = release.toISOString()
  return {
    ...series,
    chapters: series.chapters.map((c) =>
      c.id === latest.id ? { ...c, updatedAt } : c,
    ),
  }
}

export function formatCountdown(ms: number): { value: string; unit: string } {
  if (ms <= 0) return { value: 'Now', unit: 'ready' }
  const totalMin = Math.ceil(ms / 60000)
  const hours = Math.floor(totalMin / 60)
  const mins = totalMin % 60
  if (hours >= 48) {
    const days = Math.floor(hours / 24)
    return { value: String(days), unit: days === 1 ? 'day' : 'days' }
  }
  if (hours > 0) return { value: `${hours}h`, unit: mins > 0 ? `${mins}m` : 'left' }
  return { value: String(mins), unit: mins === 1 ? 'min' : 'mins' }
}

/** Live countdown: days, hours, minutes, seconds (e.g. `6d 5h 42m 08s`). */
export function formatCountdownClock(ms: number): string {
  if (ms <= 0) return '0s'
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const days = Math.floor(totalSec / 86400)
  const hours = Math.floor((totalSec % 86400) / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  const seconds = totalSec % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  const parts: string[] = []
  if (days > 0) parts.push(`${days}d`)
  if (days > 0 || hours > 0) parts.push(`${hours}h`)
  if (days > 0 || hours > 0 || minutes > 0) parts.push(`${pad(minutes)}m`)
  parts.push(`${pad(seconds)}s`)
  return parts.join(' ')
}
