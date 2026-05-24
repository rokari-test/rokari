import { formatShortRelative } from './format'
import type { Chapter, Series } from '../types'

/** Stable pseudo view count per chapter for display. */
export function getChapterViewCount(series: Series, chapter: Chapter): number {
  const base = Math.max(1, Math.floor(series.views / Math.max(series.chapters.length, 1)))
  const bump =
    chapter.id.split('').reduce((n, c) => n + c.charCodeAt(0), 0) % 37
  return base + bump
}

export function formatChapterTimeAgo(iso: string): { when: string; label: string } {
  return { when: formatShortRelative(iso), label: 'ago' }
}

export function chapterHeading(
  contentType: Series['type'],
  number: number,
): string {
  return contentType === 'manhwa' ? `Episode ${number}` : `Chapter ${number}`
}

export function chapterShortLabel(
  contentType: Series['type'],
  number: number,
): string {
  return contentType === 'manhwa' ? `Ch. ${number}` : `Ch. ${number}`
}

export function seriesUploaderHandle(series: Series): string {
  const name = series.author.split(/[,&]/)[0]?.trim() || 'staff'
  return name.split(/\s+/)[0]?.toLowerCase() || 'staff'
}
