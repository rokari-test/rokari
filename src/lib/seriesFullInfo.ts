import {
  buildRatingDistribution,
  buildTitleEntries,
  getVoteCount,
  type TitleEntry,
} from './extraInfo'
import { getSeriesExternalLinks } from './seriesExternalLinks'
import { canAccessAdminPanel, canAccessUpload, type UserRole } from './userAuth'
import { loadCatalog, saveCatalog, upsertSeries } from './catalogStore'
import type {
  Series,
  SeriesExternalLinkEntry,
  SeriesFullInfo,
  SeriesTitleEntry,
} from '../types'

export interface ResolvedFullInfo {
  voteCount: number
  averageRating: number
  bayesianRating: number
  distribution: { stars: number; count: number; pct: number }[]
  titles: SeriesTitleEntry[]
  externalLinks: SeriesExternalLinkEntry[]
}

export function canManageSeriesFullInfo(role: UserRole | undefined): boolean {
  return canAccessUpload(role) || canAccessAdminPanel(role)
}

export function resolveFullInfo(series: Series): ResolvedFullInfo {
  const stored = series.fullInfo
  const voteCount = stored?.voteCount ?? getVoteCount(series.views)
  const averageRating = stored?.averageRating ?? Math.min(10, series.rating * 2)
  const bayesianRating =
    stored?.bayesianRating ?? Math.min(10, Math.max(0, averageRating * 0.92 + 0.15))

  let distribution: { stars: number; count: number; pct: number }[]
  if (stored?.ratingDistribution?.length === 10) {
    const total = Math.max(
      1,
      stored.ratingDistribution.reduce((a, b) => a + b, 0),
    )
    distribution = stored.ratingDistribution.map((count, i) => ({
      stars: i + 1,
      count,
      pct: Math.round((count / total) * 100),
    }))
  } else {
    distribution = buildRatingDistribution(averageRating / 2, voteCount)
  }

  const titles: SeriesTitleEntry[] =
    stored?.titles?.length
      ? stored.titles
      : buildTitleEntries(series).map(mapLegacyTitle)

  const externalLinks: SeriesExternalLinkEntry[] =
    stored?.externalLinks?.length
      ? stored.externalLinks
      : getSeriesExternalLinks(series)

  return {
    voteCount,
    averageRating,
    bayesianRating,
    distribution,
    titles,
    externalLinks,
  }
}

function mapLegacyTitle(entry: TitleEntry): SeriesTitleEntry {
  return {
    language: entry.language,
    label: entry.label,
    title: entry.title,
    primary: entry.primary,
  }
}

export function saveSeriesFullInfo(seriesId: string, fullInfo: SeriesFullInfo): Series | null {
  const catalog = loadCatalog()
  const found = catalog.find((s) => s.id === seriesId)
  if (!found) return null
  const updated: Series = { ...found, fullInfo }
  saveCatalog(upsertSeries(catalog, updated))
  return updated
}

export function emptyFullInfo(): SeriesFullInfo {
  return {
    voteCount: 0,
    averageRating: 0,
    bayesianRating: 0,
    ratingDistribution: Array.from({ length: 10 }, () => 0),
    titles: [],
    externalLinks: [],
  }
}

export function fullInfoDraftFromSeries(series: Series): SeriesFullInfo {
  const r = resolveFullInfo(series)
  return {
    voteCount: r.voteCount,
    averageRating: r.averageRating,
    bayesianRating: r.bayesianRating,
    ratingDistribution: r.distribution.map((d) => d.count),
    titles: r.titles,
    externalLinks: r.externalLinks,
  }
}

export function linkHostname(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./, '')
  } catch {
    return href
  }
}
