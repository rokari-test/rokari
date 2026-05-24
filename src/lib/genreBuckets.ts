import {
  getBrowseGenreGroups,
  isBlockedGenre,
  sanitizeGenreList,
} from './rokariGenres'

export interface GenreBrowseGroup {
  label: string
  items: string[]
}

export function groupGenresForBrowse(
  catalogGenres: string[],
  query: string,
): GenreBrowseGroup[] {
  return getBrowseGenreGroups(catalogGenres, query)
}

export function filterOptionList(items: string[], query: string): string[] {
  const q = query.trim().toLowerCase()
  const safe = sanitizeGenreList(items)
  if (!q) return safe
  return safe.filter((item) => item.toLowerCase().includes(q))
}

export { isBlockedGenre, sanitizeGenreList }
