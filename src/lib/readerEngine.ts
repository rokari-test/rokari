import type { ReadingDirection, ReadingMode } from './readerPreferences'

export function resolveDirection(
  pref: ReadingDirection,
  _seriesType: 'manhwa' | 'novel',
): 'ltr' | 'rtl' {
  if (pref === 'ltr') return 'ltr'
  if (pref === 'rtl') return 'rtl'
  return 'ltr'
}

export function virtualPageCount(mode: ReadingMode, pageTotal: number): number {
  if (pageTotal <= 0) return 0
  if (mode === 'double') return Math.ceil(pageTotal / 2)
  if (mode === 'single') return pageTotal
  return 1
}

export function slicePagesForVirtualIndex(
  mode: ReadingMode,
  pages: string[],
  virtualIndex: number,
): string[] {
  if (mode === 'scroll') return pages
  if (mode === 'single') return pages[virtualIndex] ? [pages[virtualIndex]] : []
  const start = virtualIndex * 2
  return pages.slice(start, start + 2)
}

export function zoomForMode(
  mode: ReadingMode,
  prefs: { zoomScroll: number; zoomSingle: number; zoomDouble: number },
): number {
  if (mode === 'single') return prefs.zoomSingle
  if (mode === 'double') return prefs.zoomDouble
  return prefs.zoomScroll
}

export function progressFromVirtualIndex(
  mode: ReadingMode,
  virtualIndex: number,
  pageTotal: number,
): number {
  if (mode === 'scroll' || pageTotal <= 0) return 0
  const total = virtualPageCount(mode, pageTotal)
  if (total <= 0) return 0
  return Math.min(100, ((virtualIndex + 1) / total) * 100)
}

export function virtualIndexFromProgress(
  mode: ReadingMode,
  percent: number,
  pageTotal: number,
): number {
  const total = virtualPageCount(mode, pageTotal)
  if (total <= 0) return 0
  const idx = Math.floor((percent / 100) * total)
  return Math.min(total - 1, Math.max(0, idx))
}
