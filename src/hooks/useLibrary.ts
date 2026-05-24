import { useCallback, useEffect, useState } from 'react'
import {
  getBookmarkedSlugs,
  getChapterBookmarks,
  getContinueReading,
  getReadingProgress,
  isBookmarked,
  isChapterBookmarked,
  loadLibrary,
  removeChapterBookmark,
  toggleBookmark as toggleBookmarkStorage,
  toggleChapterBookmark as toggleChapterBookmarkStorage,
  type ChapterBookmark,
  type ReadingProgress,
} from '../lib/storage'

export function useLibrarySync() {
  const [, setTick] = useState(0)

  useEffect(() => {
    const refresh = () => setTick((t) => t + 1)
    window.addEventListener('readdex-library', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('readdex-library', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])
}

export function useBookmarks() {
  useLibrarySync()
  const slugs = getBookmarkedSlugs()
  const toggle = useCallback((slug: string) => toggleBookmarkStorage(slug), [])
  const check = useCallback((slug: string) => isBookmarked(slug), [])
  return { slugs, toggle, isBookmarked: check }
}

export function useContinueReading(): ReadingProgress[] {
  useLibrarySync()
  return getContinueReading()
}

export function useSeriesProgress(slug: string | undefined) {
  useLibrarySync()
  if (!slug) return undefined
  return getReadingProgress(slug)
}

export function useLibraryCount() {
  useLibrarySync()
  const lib = loadLibrary()
  return {
    bookmarks: lib.bookmarks.length,
    chapterBookmarks: lib.chapterBookmarks.length,
    reading: Object.keys(lib.progress).length,
  }
}

export function useChapterBookmarks() {
  useLibrarySync()
  const items = getChapterBookmarks()
  const toggle = useCallback(
    (slug: string, chapterNumber: number, chapterTitle: string) =>
      toggleChapterBookmarkStorage(slug, chapterNumber, chapterTitle),
    [],
  )
  const remove = useCallback(
    (slug: string, chapterNumber: number) => removeChapterBookmark(slug, chapterNumber),
    [],
  )
  const check = useCallback(
    (slug: string, chapterNumber: number) => isChapterBookmarked(slug, chapterNumber),
    [],
  )
  return { items, toggle, remove, isBookmarked: check }
}

export type { ChapterBookmark }
