import {
  formatCountdown,
  getChapterReleaseUnlockAt,
  isLatestChapter,
  loadEarlyAccessSettings,
} from './earlyAccess'
import { isChapterCoinUnlocked } from './chapterUnlocks'
import type { Chapter, ContentType } from '../types'
import type { PlanId, UserSubscription } from './subscriptions'

/** Only the newest N chapters require coins; everything else is free. */
const LOCKED_RECENT_COUNT = 2

function isLockedRecentChapter(chapter: Chapter, chapters: Chapter[]): boolean {
  if (chapters.length === 0) return false
  const maxNum = chapters.reduce((m, c) => Math.max(m, c.number), 0)
  const lockFrom = Math.max(1, maxNum - (LOCKED_RECENT_COUNT - 1))
  return chapter.number >= lockFrom
}

const NEW_CHAPTER_MS = 48 * 60 * 60 * 1000

export interface ChapterAccess {
  locked: boolean
  coinPrice: number
  isNew: boolean
  showUnlockedBadge: boolean
  /** Waiting on subscription early-access window */
  earlyAccessWait: boolean
  unlockAt: number | null
  remainingMs: number
  canRead: boolean
}

export function hasPremiumChapterAccess(
  subscription: UserSubscription | null,
  planId: PlanId | null,
): boolean {
  if (!subscription || !planId) return false
  if (planId === 'free') return false
  return subscription.status === 'active' || subscription.status === 'trialing'
}

function isNewChapter(updatedAt: string): boolean {
  return Date.now() - new Date(updatedAt).getTime() < NEW_CHAPTER_MS
}

function coinPriceFor(chapter: Chapter, base: number): number {
  const cost = chapterUnlockCost(chapter)
  if (cost !== undefined && cost > 0) return cost
  return base + (chapter.number % 6) * 5
}

function chapterUnlockCost(chapter: Chapter): number | undefined {
  const raw = chapter.unlockCost
  if (raw === undefined || raw === null) return undefined
  const n = typeof raw === 'number' ? raw : Number(raw)
  return Number.isFinite(n) ? n : undefined
}

/** Publisher-set unlock cost overrides automatic free/early-access rules. */
function publisherOverrideAccess(chapter: Chapter): ChapterAccess | null {
  const cost = chapterUnlockCost(chapter)
  if (cost === undefined) return null

  if (cost === 0) {
    return {
      locked: false,
      coinPrice: 0,
      isNew: isNewChapter(chapter.updatedAt),
      showUnlockedBadge: true,
      earlyAccessWait: false,
      unlockAt: null,
      remainingMs: 0,
      canRead: true,
    }
  }

  if (cost > 0) {
    return {
      locked: true,
      coinPrice: cost,
      isNew: isNewChapter(chapter.updatedAt),
      showUnlockedBadge: false,
      earlyAccessWait: false,
      unlockAt: null,
      remainingMs: 0,
      canRead: false,
    }
  }

  return null
}

export interface ChapterAccessOptions {
  slug?: string
  userId?: string | null
}

export function getChapterAccess(
  chapter: Chapter,
  chapters: Chapter[],
  planId: PlanId | null,
  subscription: UserSubscription | null,
  opts?: ChapterAccessOptions,
): ChapterAccess {
  const settings = loadEarlyAccessSettings()
  const activePlan =
    subscription &&
    (subscription.status === 'active' || subscription.status === 'trialing')
      ? planId
      : null
  const effectivePlan: PlanId = activePlan ?? 'free'
  const coinPrice = coinPriceFor(chapter, settings.baseCoinPrice)

  if (
    opts?.slug &&
    opts.userId &&
    isChapterCoinUnlocked(opts.userId, opts.slug, chapter.number)
  ) {
    return {
      locked: false,
      coinPrice,
      isNew: isNewChapter(chapter.updatedAt),
      showUnlockedBadge: true,
      earlyAccessWait: false,
      unlockAt: null,
      remainingMs: 0,
      canRead: true,
    }
  }

  const publisher = publisherOverrideAccess(chapter)
  if (publisher) return publisher

  if (!isLockedRecentChapter(chapter, chapters)) {
    return {
      locked: false,
      coinPrice: 0,
      isNew: isNewChapter(chapter.updatedAt),
      showUnlockedBadge: !isNewChapter(chapter.updatedAt),
      earlyAccessWait: false,
      unlockAt: null,
      remainingMs: 0,
      canRead: true,
    }
  }

  const unlockAt = getChapterReleaseUnlockAt(chapter, effectivePlan, settings)
  const remainingMs = Math.max(0, unlockAt - Date.now())
  const isLatest = isLatestChapter(chapter, chapters)

  if (remainingMs <= 0) {
    return {
      locked: false,
      coinPrice,
      isNew: isNewChapter(chapter.updatedAt),
      showUnlockedBadge: !isNewChapter(chapter.updatedAt),
      earlyAccessWait: false,
      unlockAt: null,
      remainingMs: 0,
      canRead: true,
    }
  }

  return {
    locked: true,
    coinPrice,
    isNew: isNewChapter(chapter.updatedAt),
    showUnlockedBadge: false,
    earlyAccessWait: isLatest,
    unlockAt,
    remainingMs,
    canRead: false,
  }
}

export { formatCountdown }

export function chapterLabel(contentType: ContentType, number: number): string {
  return contentType === 'manhwa' ? `Ep. ${number}` : `Ch. ${number}`
}

export function seriesFullyUnlocked(
  chapters: Chapter[],
  planId: PlanId | null,
  subscription: UserSubscription | null,
): boolean {
  if (chapters.length === 0) return false
  return chapters.every(
    (ch) => !getChapterAccess(ch, chapters, planId, subscription).locked,
  )
}
