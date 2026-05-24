import {
  filterSfwGenres,
  getAllSfwGenresFlat,
  normalizeGenreSelection,
  SFW_DEMOGRAPHICS,
  type SfwDemographic,
} from './rokariGenres'

export type WorkDemographic = SfwDemographic

/** SFW demographics only — stored in `series.genres` alongside genre tags. */
export const WORK_DEMOGRAPHICS = SFW_DEMOGRAPHICS

const DEMOGRAPHIC_IDS = new Set(WORK_DEMOGRAPHICS.map((d) => d.id.toLowerCase()))

function genresForPicker(): string[] {
  return getAllSfwGenresFlat().filter((g) => !DEMOGRAPHIC_IDS.has(g.toLowerCase()))
}

/** SFW genres for the admin picker (demographics shown separately). */
export const WORK_GENRES = genresForPicker()

export function filterWorkGenres(query: string): string[] {
  return filterSfwGenres(query, genresForPicker())
}

export function isWorkDemographicId(value: string): boolean {
  return DEMOGRAPHIC_IDS.has(value.trim().toLowerCase())
}

export function normalizeWorkGenreSelection(values: string[]): string[] {
  return normalizeGenreSelection(values)
}
