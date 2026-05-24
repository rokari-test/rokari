import { loadCatalog } from './catalogStore'
import { filterSeriesForUser } from './catalogFilters'
import { isBlockedGenre } from './rokariGenres'
import type { Series } from '../types'

function searchablePool(pool?: Series[]): Series[] {
  const catalog = pool ?? filterSeriesForUser(loadCatalog())
  return catalog.filter((s) => !s.genres.some(isBlockedGenre))
}

function subsequenceMatch(text: string, pattern: string): boolean {
  if (!pattern) return true
  let i = 0
  for (const c of text) {
    if (c === pattern[i]) i += 1
    if (i === pattern.length) return true
  }
  return false
}

function termMatches(series: Series, term: string): boolean {
  if (!term) return true

  const fields = [
    series.title,
    ...series.altTitles,
    series.author,
    series.artist ?? '',
    ...series.genres,
    ...(series.tags ?? []),
  ]

  for (const field of fields) {
    const hay = field.toLowerCase()
    if (hay.includes(term)) return true
    if (hay.split(/\s+/).some((word) => word.startsWith(term))) return true
    if (subsequenceMatch(hay.replace(/\s+/g, ''), term)) return true
  }

  return false
}

export function scoreSeriesSearch(series: Series, query: string): number {
  const q = query.trim().toLowerCase()
  if (!q) return 0

  let score = 0
  const title = series.title.toLowerCase()

  if (title === q) score += 120
  else if (title.startsWith(q)) score += 95
  else if (title.split(/\s+/).some((w) => w.startsWith(q))) score += 85
  else if (title.includes(q)) score += 70
  else if (subsequenceMatch(title.replace(/\s+/g, ''), q)) score += 55

  if (series.altTitles.some((t) => t.toLowerCase().includes(q))) score += 40
  if (series.author.toLowerCase().includes(q)) score += 30
  if (series.genres.some((g) => g.toLowerCase().includes(q))) score += 15

  return score
}

export function matchSeriesSearch(series: Series, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const terms = q.split(/\s+/).filter(Boolean)
  return terms.every((term) => termMatches(series, term))
}

export function suggestSeries(query: string, limit = 6, pool?: Series[]): Series[] {
  const q = query.trim()
  if (q.length < 1) return []

  return searchablePool(pool)
    .map((series) => ({ series, score: scoreSeriesSearch(series, q) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.series.title.localeCompare(b.series.title))
    .slice(0, limit)
    .map((row) => row.series)
}

export function searchSeriesRanked(query: string, pool?: Series[]): Series[] {
  const q = query.trim()
  if (!q) return searchablePool(pool)

  return searchablePool(pool)
    .filter((s) => matchSeriesSearch(s, q))
    .sort((a, b) => scoreSeriesSearch(b, q) - scoreSeriesSearch(a, q))
}
