import { loadCatalog } from '../lib/catalogStore'
import { filterSeriesForUser } from '../lib/catalogFilters'
import { loadPreferences } from '../lib/preferences'
import { isBlockedGenre, sanitizeGenreList } from '../lib/rokariGenres'
import type { Series } from '../types'

export function getAllSeries(): Series[] {
  const prefs = loadPreferences()
  let list = loadCatalog().filter((s) => !s.genres.some(isBlockedGenre))
  if (prefs.excludeGenres.length > 0) {
    list = list.filter(
      (s) => !s.genres.some((g) => prefs.excludeGenres.includes(g)),
    )
  }
  return filterSeriesForUser(list)
}

export function getAllGenres(): string[] {
  return sanitizeGenreList([
    ...new Set(loadCatalog().flatMap((s) => s.genres)),
  ])
}

/** @deprecated Use getAllGenres() */
export const allGenres = getAllGenres()

export function getSeriesBySlug(slug: string): Series | undefined {
  return loadCatalog().find((s) => s.slug === slug)
}

export function getChapter(
  slug: string,
  chapterNumber: number,
): { series: Series; chapter: Series['chapters'][0] } | undefined {
  const series = loadCatalog().find((s) => s.slug === slug)
  if (!series) return undefined
  const chapter = series.chapters.find(
    (c) => c.number === chapterNumber && !c.trashed,
  )
  if (!chapter) return undefined
  return { series, chapter }
}

export function getChapterPages(
  slug: string,
  chapterNumber: number,
  pageCount: number,
  customPages?: string[],
): string[] {
  if (customPages && customPages.length > 0) return customPages
  const prefs = loadPreferences()
  const w = prefs.dataSaver ? 480 : 800
  const h = prefs.dataSaver ? 720 : 1200
  return Array.from(
    { length: pageCount },
    (_, i) =>
      `https://picsum.photos/seed/${slug}-ch${chapterNumber}-p${i + 1}/${w}/${h}`,
  )
}

export function formatViews(views: number): string {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`
  return String(views)
}

export function pickRandomSeries(count: number, pool?: Series[]): Series[] {
  const source = pool ?? getAllSeries()
  const copy = [...source]
  const picked: Series[] = []
  while (picked.length < count && copy.length > 0) {
    const i = Math.floor(Math.random() * copy.length)
    picked.push(copy.splice(i, 1)[0])
  }
  return picked
}

export interface LatestUpdate {
  series: Series
  chapter: Series['chapters'][0]
}

export function getLatestUpdates(limit = 10): LatestUpdate[] {
  return loadCatalog()
    .flatMap((series) =>
      series.chapters.map((chapter) => ({ series, chapter })),
    )
    .sort((a, b) => b.chapter.updatedAt.localeCompare(a.chapter.updatedAt))
    .slice(0, limit)
}

export type SortOption = 'popular' | 'rating' | 'latest' | 'title'

export function getLatestChapterDate(series: Series): string {
  const last = series.chapters[series.chapters.length - 1]
  return last?.updatedAt ?? ''
}

export function sortSeries(list: Series[], sort: SortOption): Series[] {
  const copy = [...list]
  switch (sort) {
    case 'popular':
      return copy.sort((a, b) => b.views - a.views)
    case 'rating':
      return copy.sort((a, b) => b.rating - a.rating)
    case 'latest':
      return copy.sort((a, b) =>
        getLatestChapterDate(b).localeCompare(getLatestChapterDate(a)),
      )
    case 'title':
      return copy.sort((a, b) => a.title.localeCompare(b.title))
    default:
      return copy
  }
}

export function getCarouselFeatured(count = 4): Series[] {
  return sortSeries(getAllSeries(), 'popular').slice(0, count)
}

export type PopularPeriod = 'today' | 'week' | 'month' | 'all'

function periodWeight(iso: string, period: PopularPeriod): number {
  const days = (Date.now() - new Date(iso).getTime()) / 86400000
  switch (period) {
    case 'today':
      return days <= 1 ? 1 : 0.15
    case 'week':
      return days <= 7 ? 1 : days <= 30 ? 0.4 : 0.1
    case 'month':
      return days <= 30 ? 1 : 0.25
    default:
      return 1
  }
}

export function getPopularSeries(
  period: PopularPeriod,
  limit = 24,
  pool?: Series[],
): Series[] {
  const list = pool ?? getAllSeries()
  return [...list]
    .map((s) => {
      const latest = getLatestChapterDate(s) || s.addedAt || '2020-01-01'
      return {
        series: s,
        score: s.views * periodWeight(latest, period),
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.series)
}

export function getRecentlyAdded(limit = 24, pool?: Series[]): Series[] {
  const list = pool ?? getAllSeries()
  return [...list]
    .sort((a, b) => {
      const da = a.addedAt ?? getLatestChapterDate(a)
      const db = b.addedAt ?? getLatestChapterDate(b)
      return db.localeCompare(da)
    })
    .slice(0, limit)
}

export function getRecentlyUpdated(limit = 24, pool?: Series[]): Series[] {
  const list = pool ?? getAllSeries()
  return sortSeries(list, 'latest').slice(0, limit)
}

export function searchSeries(query: string, pool?: Series[]): Series[] {
  const q = query.trim().toLowerCase()
  const list = pool ?? getAllSeries()
  if (!q) return list
  return list.filter(
    (s) =>
      s.title.toLowerCase().includes(q) ||
      s.altTitles.some((t) => t.toLowerCase().includes(q)) ||
      s.author.toLowerCase().includes(q) ||
      s.genres.some((g) => g.toLowerCase().includes(q)),
  )
}
