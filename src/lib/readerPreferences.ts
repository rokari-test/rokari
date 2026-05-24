export const READER_PREFS_EVENT = 'inkscroll-reader-prefs'

export type ReadingMode = 'single' | 'double' | 'scroll'
export type ReadingDirection = 'auto' | 'ltr' | 'rtl'

export interface ReaderPreferences {
  defaultReadingMode: ReadingMode
  defaultReadingDirection: ReadingDirection
  readerTabTitle: string
  zoomScroll: number
  zoomSingle: number
  zoomDouble: number
  preloadPages: boolean
  maxStripWidth: number | null
  pageGaps: boolean
  tapZonesEnabled: boolean
  hideReaderHint: boolean
  defaultComicWidth: 'standard' | 'wide'
  autoScrollEnabled: boolean
  autoScrollSpeed: number
  autoScrollMode: 'smooth' | 'page'
  showPageCounter: boolean
}

const KEY = 'readdex-reader-settings'

export const DEFAULT_READER_TAB_TITLE =
  '{series_title} - {volume_label} Ch. {chapter_number}'

const defaults: ReaderPreferences = {
  defaultReadingMode: 'scroll',
  defaultReadingDirection: 'auto',
  readerTabTitle: DEFAULT_READER_TAB_TITLE,
  zoomScroll: 100,
  zoomSingle: 100,
  zoomDouble: 100,
  preloadPages: true,
  maxStripWidth: null,
  pageGaps: true,
  tapZonesEnabled: true,
  hideReaderHint: false,
  defaultComicWidth: 'standard',
  autoScrollEnabled: false,
  autoScrollSpeed: 300,
  autoScrollMode: 'smooth',
  showPageCounter: true,
}

function dispatch() {
  window.dispatchEvent(new Event(READER_PREFS_EVENT))
}

export function loadReaderPreferences(): ReaderPreferences {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...defaults }
    const parsed = JSON.parse(raw) as Partial<ReaderPreferences>
    return { ...defaults, ...parsed }
  } catch {
    return { ...defaults }
  }
}

export function saveReaderPreferences(patch: Partial<ReaderPreferences>) {
  const next = { ...loadReaderPreferences(), ...patch }
  localStorage.setItem(KEY, JSON.stringify(next))
  dispatch()
}

export function formatReaderTabTitle(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? '')
}

export const READER_TAB_PREVIEW_VARS: Record<string, string> = {
  series_title: 'One Piece',
  volume_label: 'Vol. 1',
  chapter_number: '1',
  chapter_name: 'Romance Dawn',
}
