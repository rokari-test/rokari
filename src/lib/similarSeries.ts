import type { Series } from '../types'

const DEFAULT_LIMIT = 14

function sharedGenreCount(a: Series, b: Series): number {
  const set = new Set(a.genres)
  return b.genres.filter((g) => set.has(g)).length
}

/** Rank catalog titles by shared genres with the reference series. */
export function getSimilarSeries(
  series: Series,
  catalog: Series[],
  limit = DEFAULT_LIMIT,
): Series[] {
  const exclude = new Set<string>([series.slug])
  if (series.relatedSlug) exclude.add(series.relatedSlug)

  const scored = catalog
    .filter((s) => !exclude.has(s.slug))
    .map((s) => {
      const genreScore = sharedGenreCount(series, s)
      const typeBonus = s.type === series.type ? 0.5 : 0
      return { series: s, score: genreScore + typeBonus }
    })
    .filter((e) => e.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return b.series.rating - a.series.rating
    })

  if (scored.length > 0) {
    return scored.slice(0, limit).map((e) => e.series)
  }

  return catalog
    .filter((s) => !exclude.has(s.slug) && s.type === series.type)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit)
}

export function similarWorksBrowseHref(series: Series): string {
  const genre = series.genres[0]
  if (!genre) return '/browse'
  return `/browse?genre=${encodeURIComponent(genre)}`
}
