export const CHAPTER_LIKES_EVENT = 'sakura-chapter-likes'

const KEY = 'sakura-chapter-likes'

type LikeStore = Record<string, string[]>

export function chapterLikeKey(seriesSlug: string, chapterNumber: number): string {
  return `${seriesSlug}::${chapterNumber}`
}

function dispatch() {
  window.dispatchEvent(new Event(CHAPTER_LIKES_EVENT))
}

function load(): LikeStore {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    return JSON.parse(raw) as LikeStore
  } catch {
    return {}
  }
}

function save(store: LikeStore) {
  localStorage.setItem(KEY, JSON.stringify(store))
  dispatch()
}

export function getChapterLikeCount(seriesSlug: string, chapterNumber: number): number {
  return load()[chapterLikeKey(seriesSlug, chapterNumber)]?.length ?? 0
}

export function isChapterLiked(seriesSlug: string, chapterNumber: number, userId: string): boolean {
  const list = load()[chapterLikeKey(seriesSlug, chapterNumber)] ?? []
  return list.includes(userId)
}

export function toggleChapterLike(
  seriesSlug: string,
  chapterNumber: number,
  userId: string,
): { liked: boolean; count: number } {
  const store = load()
  const key = chapterLikeKey(seriesSlug, chapterNumber)
  const list = store[key] ?? []
  const liked = list.includes(userId)
  const next = liked ? list.filter((id) => id !== userId) : [...list, userId]
  store[key] = next
  save(store)
  return { liked: !liked, count: next.length }
}

export function getSeriesChapterLikeCounts(
  seriesSlug: string,
  chapterNumbers: number[],
): Record<number, number> {
  const store = load()
  const out: Record<number, number> = {}
  for (const n of chapterNumbers) {
    out[n] = store[chapterLikeKey(seriesSlug, n)]?.length ?? 0
  }
  return out
}
