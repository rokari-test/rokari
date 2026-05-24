import type { SeriesSource } from '../types'

export const SOURCE_COLORS: Record<SeriesSource, string> = {
  Webtoon: '#00c853',
  Tapas: '#ffc107',
  Tappytoon: '#00bcd4',
  Lezhin: '#7c4dff',
  'K MANGA': '#e91e63',
  'Yen Press': '#ff5722',
  'Asura Scans': '#ff9800',
  Original: '#ff4d8d',
}

/** Platforms shown in series edit forms (optional field). */
export const SERIES_SOURCE_OPTIONS: SeriesSource[] = [
  'Webtoon',
  'Lezhin',
  'Tapas',
  'Tappytoon',
  'K MANGA',
  'Yen Press',
  'Asura Scans',
  'Original',
]

export function getSourceColor(source: SeriesSource | undefined): string {
  if (!source) return 'transparent'
  return SOURCE_COLORS[source] ?? SOURCE_COLORS.Original
}