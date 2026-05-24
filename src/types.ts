export type ContentType = 'manhwa' | 'novel'
export type SeriesStatus = 'ongoing' | 'completed' | 'hiatus'

export interface Chapter {
  id: string
  number: number
  title: string
  updatedAt: string
  pageCount: number
  /** Admin-uploaded page image URLs; when set, overrides generated placeholders. */
  pages?: string[]
  /** Unlock price in coins; 0 = free override; omit = site default formula. */
  unlockCost?: number
  /** Hidden from public chapter list (soft delete). */
  trashed?: boolean
}

export type SeriesSource =
  | 'Webtoon'
  | 'Tapas'
  | 'Tappytoon'
  | 'Lezhin'
  | 'K MANGA'
  | 'Yen Press'
  | 'Asura Scans'
  | 'Original'

export interface Series {
  id: string
  slug: string
  type: ContentType
  title: string
  altTitles: string[]
  description: string
  coverUrl: string
  bannerUrl: string
  /** Banner crop focal point (0–100), used with object-position. */
  bannerFocalX?: number
  bannerFocalY?: number
  author: string
  artist: string
  status: SeriesStatus
  genres: string[]
  rating: number
  views: number
  chapters: Chapter[]
  language?: string
  source?: SeriesSource
  volumeCount?: number
  addedAt?: string
  year?: number
  tags?: string[]
  /** Content maturity for rating filter (SF → PR). */
  contentRating?: 'SF' | 'SG' | 'ER' | 'PR'
  /** Link manhwa adaptation ↔ source novel (NovelDex-style bridge). */
  relatedSlug?: string
  /** Extended metadata for Full info tab (ratings, links, localized titles). */
  fullInfo?: SeriesFullInfo
}

export interface SeriesTitleEntry {
  language: string
  label?: string
  title: string
  primary?: boolean
}

export interface SeriesExternalLinkEntry {
  label: string
  href: string
}

export interface SeriesFullInfo {
  voteCount?: number
  /** 0–10 scale */
  averageRating?: number
  /** 0–10 scale */
  bayesianRating?: number
  /** Vote counts for stars 1–10 (index 0 = 1★). */
  ratingDistribution?: number[]
  titles?: SeriesTitleEntry[]
  externalLinks?: SeriesExternalLinkEntry[]
}

/** @deprecated Use Series */
export type Manhwa = Series
