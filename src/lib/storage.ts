const STORAGE_KEY = 'readdex-library'

export interface ReadingProgress {
  slug: string
  chapterNumber: number
  chapterTitle: string
  scrollPercent: number
  updatedAt: number
}

export interface ChapterBookmark {
  slug: string
  chapterNumber: number
  chapterTitle: string
  addedAt: number
}

export interface LibraryState {
  bookmarks: string[]
  chapterBookmarks: ChapterBookmark[]
  progress: Record<string, ReadingProgress>
  recent: string[]
}

const defaultState = (): LibraryState => ({
  bookmarks: [],
  chapterBookmarks: [],
  progress: {},
  recent: [],
})

export function loadLibrary(): LibraryState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw) as LibraryState
    return {
      bookmarks: parsed.bookmarks ?? [],
      chapterBookmarks: parsed.chapterBookmarks ?? [],
      progress: parsed.progress ?? {},
      recent: parsed.recent ?? [],
    }
  } catch {
    return defaultState()
  }
}

export function saveLibrary(state: LibraryState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  window.dispatchEvent(new Event('readdex-library'))
}

export function toggleBookmark(slug: string): boolean {
  const state = loadLibrary()
  const has = state.bookmarks.includes(slug)
  state.bookmarks = has
    ? state.bookmarks.filter((s) => s !== slug)
    : [...state.bookmarks, slug]
  saveLibrary(state)
  return !has
}

export function isBookmarked(slug: string): boolean {
  return loadLibrary().bookmarks.includes(slug)
}

export function saveReadingProgress(
  slug: string,
  chapterNumber: number,
  chapterTitle: string,
  scrollPercent: number,
) {
  const state = loadLibrary()
  state.progress[slug] = {
    slug,
    chapterNumber,
    chapterTitle,
    scrollPercent: Math.min(100, Math.max(0, scrollPercent)),
    updatedAt: Date.now(),
  }
  state.recent = [slug, ...state.recent.filter((s) => s !== slug)].slice(0, 12)
  saveLibrary(state)
}

export function getReadingProgress(slug: string): ReadingProgress | undefined {
  return loadLibrary().progress[slug]
}

export function getContinueReading(): ReadingProgress[] {
  return Object.values(loadLibrary().progress).sort(
    (a, b) => b.updatedAt - a.updatedAt,
  )
}

export function getBookmarkedSlugs(): string[] {
  return loadLibrary().bookmarks
}

export function getRecentSlugs(): string[] {
  return loadLibrary().recent
}

export function chapterBookmarkId(slug: string, chapterNumber: number): string {
  return `${slug}::${chapterNumber}`
}

export function isChapterBookmarked(slug: string, chapterNumber: number): boolean {
  const id = chapterBookmarkId(slug, chapterNumber)
  return loadLibrary().chapterBookmarks.some(
    (b) => chapterBookmarkId(b.slug, b.chapterNumber) === id,
  )
}

export function getChapterBookmarks(): ChapterBookmark[] {
  return [...loadLibrary().chapterBookmarks].sort((a, b) => b.addedAt - a.addedAt)
}

export function toggleChapterBookmark(
  slug: string,
  chapterNumber: number,
  chapterTitle: string,
): boolean {
  const state = loadLibrary()
  const id = chapterBookmarkId(slug, chapterNumber)
  const idx = state.chapterBookmarks.findIndex(
    (b) => chapterBookmarkId(b.slug, b.chapterNumber) === id,
  )
  if (idx >= 0) {
    state.chapterBookmarks = state.chapterBookmarks.filter((_, i) => i !== idx)
    saveLibrary(state)
    return false
  }
  state.chapterBookmarks = [
    {
      slug,
      chapterNumber,
      chapterTitle,
      addedAt: Date.now(),
    },
    ...state.chapterBookmarks,
  ]
  saveLibrary(state)
  return true
}

export function removeChapterBookmark(slug: string, chapterNumber: number) {
  const state = loadLibrary()
  const id = chapterBookmarkId(slug, chapterNumber)
  state.chapterBookmarks = state.chapterBookmarks.filter(
    (b) => chapterBookmarkId(b.slug, b.chapterNumber) !== id,
  )
  saveLibrary(state)
}

export type LibrarySortMode = 'updated' | 'added'

/** Slugs for "Your Library" rails (bookmarks + reading progress), excluding one series. */
export function getLibrarySeriesSlugs(
  sort: LibrarySortMode,
  excludeSlug?: string,
): string[] {
  const lib = loadLibrary()
  const all = new Set<string>()
  for (const s of lib.bookmarks) {
    if (s !== excludeSlug) all.add(s)
  }
  for (const s of Object.keys(lib.progress)) {
    if (s !== excludeSlug) all.add(s)
  }
  for (const s of lib.recent) {
    if (s !== excludeSlug) all.add(s)
  }

  const slugs = [...all]
  if (sort === 'updated') {
    return slugs.sort((a, b) => {
      const ta = lib.progress[a]?.updatedAt ?? 0
      const tb = lib.progress[b]?.updatedAt ?? 0
      if (tb !== ta) return tb - ta
      const ra = lib.recent.indexOf(a)
      const rb = lib.recent.indexOf(b)
      return (ra === -1 ? 999 : ra) - (rb === -1 ? 999 : rb)
    })
  }

  const bookmarkOrder = lib.bookmarks.filter((s) => s !== excludeSlug)
  return slugs.sort((a, b) => {
    const ba = bookmarkOrder.indexOf(a)
    const bb = bookmarkOrder.indexOf(b)
    if (ba !== -1 && bb !== -1) return bb - ba
    if (ba !== -1) return -1
    if (bb !== -1) return 1
    const ra = lib.recent.indexOf(a)
    const rb = lib.recent.indexOf(b)
    return (ra === -1 ? 999 : ra) - (rb === -1 ? 999 : rb)
  })
}

const READER_SETTINGS_KEY = 'readdex-reader-settings'

export interface ReaderSettings {
  fontSize: number
  theme: 'dark' | 'sepia' | 'light'
  comicWidth: 'standard' | 'wide'
}

const defaultReaderSettings: ReaderSettings = {
  fontSize: 18,
  theme: 'dark',
  comicWidth: 'standard',
}

export function loadReaderSettings(): ReaderSettings {
  try {
    const raw = localStorage.getItem(READER_SETTINGS_KEY)
    if (!raw) return defaultReaderSettings
    return { ...defaultReaderSettings, ...JSON.parse(raw) }
  } catch {
    return defaultReaderSettings
  }
}

export function saveReaderSettings(settings: Partial<ReaderSettings>) {
  const next = { ...loadReaderSettings(), ...settings }
  localStorage.setItem(READER_SETTINGS_KEY, JSON.stringify(next))
}
