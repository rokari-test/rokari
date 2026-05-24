import { getSeriesBySlug } from '../data/catalog'
import { loadLibrary } from './storage'

/** Average read-through % across saved library titles (bookmarks + in-progress). */
export function getLibraryCatchUpPercent(): number {
  const lib = loadLibrary()
  const slugs = [...new Set([...lib.bookmarks, ...Object.keys(lib.progress)])]
  if (slugs.length === 0) return 0

  let sum = 0
  for (const slug of slugs) {
    const series = getSeriesBySlug(slug)
    const chapters = series?.chapters.filter((c) => !c.trashed) ?? []
    if (chapters.length === 0) continue

    const prog = lib.progress[slug]
    if (!prog) continue

    const idx = chapters.findIndex((c) => c.number === prog.chapterNumber)
    const chapterIndex = idx >= 0 ? idx : Math.max(0, prog.chapterNumber - 1)
    const fraction = (chapterIndex + prog.scrollPercent / 100) / chapters.length
    sum += Math.min(100, fraction * 100)
  }

  return Math.round(sum / slugs.length)
}

export function getLibraryCatchUpLabel(): string {
  const lib = loadLibrary()
  const count = new Set([...lib.bookmarks, ...Object.keys(lib.progress)]).size
  if (count === 0) return 'Save series to track your catch-up progress'
  const pct = getLibraryCatchUpPercent()
  return `${pct}% caught up across ${count} saved ${count === 1 ? 'title' : 'titles'}`
}
