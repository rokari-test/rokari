import type { ContentRating } from './preferences'

export const CONTENT_RATINGS: ContentRating[] = ['SF', 'SG', 'ER', 'PR']

const RATING_LEVEL: Record<ContentRating, number> = {
  SF: 0,
  SG: 1,
  ER: 2,
  PR: 3,
}

export const RATING_LABELS: Record<ContentRating, string> = {
  SF: 'Safe',
  SG: 'Suggestive',
  ER: 'Erotica',
  PR: 'Explicit',
}

/** User max rating — series above this level are hidden. */
export function seriesPassesRatingFilter(
  seriesRating: ContentRating | undefined,
  userMax: ContentRating,
): boolean {
  const level = RATING_LEVEL[seriesRating ?? 'SF']
  return level <= RATING_LEVEL[userMax]
}
