import { getChapterAccess } from './chapterAccess'
import { getUserById } from './userAuth'
import { spendCoins } from './userWallet'
import type { Chapter } from '../types'
import type { PlanId, UserSubscription } from './subscriptions'

export const CHAPTER_UNLOCK_EVENT = 'sakura-chapter-unlock'

const KEY = 'sakura-chapter-unlocks'

/** userId -> slug -> chapter numbers purchased with coins */
type UnlockStore = Record<string, Record<string, number[]>>

function dispatch() {
  window.dispatchEvent(new Event(CHAPTER_UNLOCK_EVENT))
}

function load(): UnlockStore {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    return JSON.parse(raw) as UnlockStore
  } catch {
    return {}
  }
}

function save(store: UnlockStore) {
  localStorage.setItem(KEY, JSON.stringify(store))
  dispatch()
}

export function isChapterCoinUnlocked(
  userId: string | null | undefined,
  slug: string,
  chapterNumber: number,
): boolean {
  if (!userId) return false
  const list = load()[userId]?.[slug]
  return Boolean(list?.includes(chapterNumber))
}

export function recordChapterCoinUnlock(
  userId: string,
  slug: string,
  chapterNumber: number,
): void {
  const store = load()
  const bySeries = store[userId] ?? {}
  const chapters = new Set(bySeries[slug] ?? [])
  chapters.add(chapterNumber)
  store[userId] = { ...bySeries, [slug]: [...chapters].sort((a, b) => a - b) }
  save(store)
}

export type PurchaseChapterUnlockResult =
  | { ok: true; balance: number; price: number }
  | {
      ok: false
      code: 'login' | 'balance' | 'already_unlocked' | 'free'
      error: string
      balance?: number
      price?: number
    }

export function purchaseChapterUnlock(args: {
  userId: string
  slug: string
  chapter: Chapter
  allChapters: Chapter[]
  planId: PlanId | null
  subscription: UserSubscription | null
}): PurchaseChapterUnlockResult {
  const { userId, slug, chapter, allChapters, planId, subscription } = args

  const unlocked = getChapterAccess(chapter, allChapters, planId, subscription, {
    slug,
    userId,
  })
  if (unlocked.canRead) {
    return { ok: false, code: 'already_unlocked', error: 'Chapter already unlocked.' }
  }

  const pricing = getChapterAccess(chapter, allChapters, planId, subscription, { slug })
  const price = pricing.coinPrice
  if (price <= 0) {
    return { ok: false, code: 'free', error: 'This chapter does not require coins.' }
  }

  const spent = spendCoins(userId, price, getUserById(userId)?.username)
  if (!spent.ok) {
    return {
      ok: false,
      code: 'balance',
      error: `You need ${price} coins (balance: ${spent.balance}).`,
      balance: spent.balance,
      price,
    }
  }

  recordChapterCoinUnlock(userId, slug, chapter.number)
  return { ok: true, balance: spent.balance, price }
}
