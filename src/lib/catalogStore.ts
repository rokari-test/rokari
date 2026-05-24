import { manhwaList } from '../data/manhwa'
import { novelList } from '../data/novels'
import { syncLatestChapterRelease } from './earlyAccess'
import type { Chapter, Series } from '../types'

const CATALOG_KEY = 'inkscroll-catalog'
export const CATALOG_EVENT = 'inkscroll-catalog'

const TAG_POOL = [
  'Full Color',
  'Webtoon',
  'Character Growth',
  'Romance fantasy',
  'Based On A Novel',
  'HD',
  'Nobility/Aristocracy',
  'Tragic Past',
  'Redemption',
  'Master-Servant Relationship',
]

function enrichSeries(s: Series, index: number): Series {
  const daysAgo = index * 3
  const added = new Date()
  added.setDate(added.getDate() - daysAgo - 14)
  const year =
    s.year ??
    Number(s.chapters[0]?.updatedAt?.slice(0, 4) ?? new Date().getFullYear())
  const tagCount = 4 + (index % 5)
  const tags =
    s.tags ??
    TAG_POOL.filter((t) => !s.genres.includes(t)).slice(0, tagCount)

  const ratings = ['SF', 'SG', 'ER', 'PR'] as const
  return syncLatestChapterRelease({
    ...s,
    language: s.language ?? 'EN',
    source: s.source,
    contentRating: s.contentRating ?? ratings[index % ratings.length],
    addedAt: s.addedAt ?? added.toISOString().slice(0, 10),
    year,
    tags,
    volumeCount:
      s.volumeCount ?? (s.type === 'novel' && index % 2 === 0 ? 3 + (index % 4) : undefined),
  })
}

function buildSeed(): Series[] {
  const all = [
    ...manhwaList.map((s) => ({ ...s, type: 'manhwa' as const })),
    ...novelList,
  ]
  return all.map((s, i) => enrichSeries(s, i))
}

export function getSeedCatalog(): Series[] {
  return buildSeed()
}

export function loadCatalog(): Series[] {
  try {
    const raw = localStorage.getItem(CATALOG_KEY)
    if (!raw) return buildSeed()
    const parsed = JSON.parse(raw) as Series[]
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((s, i) => enrichSeries(s, i))
    }
    return buildSeed()
  } catch {
    return buildSeed()
  }
}

export function saveCatalog(series: Series[]) {
  localStorage.setItem(CATALOG_KEY, JSON.stringify(series))
  window.dispatchEvent(new Event(CATALOG_EVENT))
}

export function resetCatalog() {
  localStorage.removeItem(CATALOG_KEY)
  window.dispatchEvent(new Event(CATALOG_EVENT))
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function nextSeriesId(catalog: Series[]): string {
  const nums = catalog
    .map((s) => Number(s.id))
    .filter((n) => !Number.isNaN(n))
  const max = nums.length ? Math.max(...nums) : 0
  return String(max + 1)
}

export function createChapterId(seriesId: string, number: number): string {
  return `${seriesId}-ch-${number}`
}

export function upsertSeries(catalog: Series[], series: Series): Series[] {
  const idx = catalog.findIndex((s) => s.id === series.id)
  if (idx >= 0) {
    const next = [...catalog]
    next[idx] = series
    return next
  }
  return [...catalog, series]
}

export function deleteSeries(catalog: Series[], id: string): Series[] {
  return catalog.filter((s) => s.id !== id)
}

export function addChapter(series: Series, chapter: Chapter): Series {
  const chapters = [...series.chapters, chapter].sort((a, b) => a.number - b.number)
  return { ...series, chapters }
}

export function updateChapter(series: Series, chapter: Chapter): Series {
  return {
    ...series,
    chapters: series.chapters
      .map((c) => (c.id === chapter.id ? chapter : c))
      .sort((a, b) => a.number - b.number),
  }
}

export function deleteChapter(series: Series, chapterId: string): Series {
  return {
    ...series,
    chapters: series.chapters.filter((c) => c.id !== chapterId),
  }
}
