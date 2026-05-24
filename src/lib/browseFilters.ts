import {
  getAllGenres,
  getLatestChapterDate,
  getPopularSeries,
  type PopularPeriod,
} from '../data/catalog'
import { loadCatalog } from '../lib/catalogStore'
import { filterSeriesForUser } from '../lib/catalogFilters'
import { isBlockedGenre } from '../lib/rokariGenres'
import { loadPreferences } from '../lib/preferences'
import { matchSeriesSearch, scoreSeriesSearch } from '../lib/seriesSearch'
import type { ContentType, Series, SeriesSource } from '../types'

export type BrowseSortOption =
  | 'relevance'
  | 'updated'
  | 'newest'
  | 'oldest'
  | 'views'
  | 'popular'
  | 'trending-today'
  | 'trending-week'
  | 'trending-month'
  | 'rating'
  | 'title'

export type SearchMode = 'fuzzy' | 'exact'

export interface BrowseFilters {
  query: string
  searchMode: SearchMode
  type: ContentType | 'all'
  genre: string | null
  tag: string | null
  source: SeriesSource | null
  contentRating: Series['contentRating'] | null
  language: string | null
  sort: BrowseSortOption
}

export const BROWSE_SORT_LABELS: Record<BrowseSortOption, string> = {
  relevance: 'RELEVANCE',
  updated: 'RECENTLY UPDATED',
  newest: 'NEWEST ADDED',
  oldest: 'OLDEST ADDED',
  views: 'MOST VIEWS',
  popular: 'MOST POPULAR',
  'trending-today': 'TRENDING · TODAY',
  'trending-week': 'TRENDING · WEEK',
  'trending-month': 'TRENDING · MONTH',
  rating: 'TOP RATED',
  title: 'A–Z',
}

export const CONTENT_RATINGS = ['SF', 'SG', 'ER', 'PR'] as const

export function getAllTags(): string[] {
  return [...new Set(loadCatalog().flatMap((s) => s.tags ?? []))].sort()
}

export function getAllLanguages(): string[] {
  return [
    ...new Set(
      loadCatalog()
        .map((s) => s.language ?? 'EN')
        .filter(Boolean),
    ),
  ].sort()
}

export function getAllSources(): SeriesSource[] {
  const known = new Set<SeriesSource>()
  for (const s of loadCatalog()) {
    if (s.source) known.add(s.source)
  }
  return [...known].sort()
}

function matchesSearch(series: Series, query: string, mode: SearchMode): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true

  if (mode === 'exact') {
    const haystack = [
      series.title,
      ...series.altTitles,
      series.author,
      series.artist,
      ...series.genres,
      ...(series.tags ?? []),
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(q) || series.title.toLowerCase() === q
  }

  return matchSeriesSearch(series, query)
}

function trendingPeriod(sort: BrowseSortOption): PopularPeriod | null {
  if (sort === 'trending-today') return 'today'
  if (sort === 'trending-week') return 'week'
  if (sort === 'trending-month') return 'month'
  return null
}

export function filterBrowseSeries(filters: BrowseFilters, pool?: Series[]): Series[] {
  const prefs = loadPreferences()
  const catalog = pool ?? filterSeriesForUser(loadCatalog())

  let list = catalog.filter((s) => {
    if (s.genres.some(isBlockedGenre)) return false
    if (prefs.excludeGenres.some((g) => s.genres.includes(g))) return false
    if (filters.type !== 'all' && s.type !== filters.type) return false
    if (filters.genre && !s.genres.includes(filters.genre)) return false
    if (filters.tag && !(s.tags ?? []).includes(filters.tag)) return false
    if (filters.source && s.source !== filters.source) return false
    if (filters.contentRating && s.contentRating !== filters.contentRating) return false
    if (filters.language && (s.language ?? 'EN') !== filters.language) return false
    return matchesSearch(s, filters.query, filters.searchMode)
  })

  let sorted: Series[]
  const period = trendingPeriod(filters.sort)
  if (period) {
    sorted = getPopularSeries(period, list.length, list)
  } else {
    sorted = sortBrowseList(list, filters.sort, filters.query)
  }

  if (prefs.highlightGenres.length === 0) return sorted
  return [...sorted].sort((a, b) => {
    const aH = a.genres.some((g) => prefs.highlightGenres.includes(g)) ? 1 : 0
    const bH = b.genres.some((g) => prefs.highlightGenres.includes(g)) ? 1 : 0
    return bH - aH
  })
}

function sortBrowseList(
  list: Series[],
  sort: BrowseSortOption,
  query: string,
): Series[] {
  const copy = [...list]
  switch (sort) {
    case 'relevance':
      if (!query.trim()) return copy.sort((a, b) => b.views - a.views)
      return copy.sort(
        (a, b) => scoreRelevance(b, query) - scoreRelevance(a, query),
      )
    case 'updated':
      return copy.sort((a, b) =>
        getLatestChapterDate(b).localeCompare(getLatestChapterDate(a)),
      )
    case 'newest':
      return copy.sort((a, b) => {
        const da = a.addedAt ?? getLatestChapterDate(a)
        const db = b.addedAt ?? getLatestChapterDate(b)
        return db.localeCompare(da)
      })
    case 'oldest':
      return copy.sort((a, b) => {
        const da = a.addedAt ?? getLatestChapterDate(a)
        const db = b.addedAt ?? getLatestChapterDate(b)
        return da.localeCompare(db)
      })
    case 'views':
    case 'popular':
      return copy.sort((a, b) => b.views - a.views)
    case 'rating':
      return copy.sort((a, b) => b.rating - a.rating)
    case 'title':
      return copy.sort((a, b) => a.title.localeCompare(b.title))
    default:
      return copy
  }
}

function scoreRelevance(series: Series, query: string): number {
  return scoreSeriesSearch(series, query)
}

export function countActiveBrowseFilters(filters: BrowseFilters): number {
  let n = 0
  if (filters.type !== 'all') n += 1
  if (filters.genre) n += 1
  if (filters.tag) n += 1
  if (filters.source) n += 1
  if (filters.contentRating) n += 1
  if (filters.language) n += 1
  return n
}

export { getAllGenres }
