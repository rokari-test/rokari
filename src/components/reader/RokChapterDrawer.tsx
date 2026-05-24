import { useEffect, useMemo, useRef, useState } from 'react'
import { useChapterLikes } from '../../hooks/useChapterLikes'
import type { Chapter } from '../../types'
import './RokReaderOverlays.css'

function ChapterHeartCount({ seriesSlug, chapterNumber }: { seriesSlug: string; chapterNumber: number }) {
  const { count } = useChapterLikes(seriesSlug, chapterNumber)
  if (count <= 0) return null
  return <span className="rok-chapter-row-hearts">{count} ♥</span>
}

interface RokChapterDrawerProps {
  open: boolean
  chapters: Chapter[]
  currentNumber: number
  seriesSlug: string
  onClose: () => void
  onSelect: (chapterNumber: number) => void
}

export function RokChapterDrawer({
  open,
  chapters,
  currentNumber,
  seriesSlug,
  onClose,
  onSelect,
}: RokChapterDrawerProps) {
  const [query, setQuery] = useState('')
  const listRef = useRef<HTMLUListElement>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return chapters
    return chapters.filter(
      (c) => String(c.number).includes(q) || c.title.toLowerCase().includes(q),
    )
  }, [chapters, query])

  useEffect(() => {
    if (!open) return
    const active = listRef.current?.querySelector('.rok-chapter-row.is-active')
    if (active instanceof HTMLElement) {
      active.scrollIntoView({ block: 'nearest' })
    }
  }, [open, currentNumber, filtered.length])

  if (!open) return null

  return (
    <>
      <div className="rok-sheet-backdrop" onClick={onClose} aria-hidden />
      <aside className="rok-sheet rok-sheet--chapters" aria-label="Chapters">
        <div className="rok-sheet-grab" aria-hidden />
        <header className="rok-sheet-head">
          <div>
            <p className="rok-sheet-kicker">Reel</p>
            <h2>Chapters · {chapters.length}</h2>
          </div>
          <button type="button" className="rok-sheet-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <div className="rok-sheet-search">
          <input
            type="search"
            placeholder="Search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <ul className="rok-chapter-list" ref={listRef}>
          {filtered.map((ch) => {
            const active = ch.number === currentNumber
            return (
              <li key={ch.number}>
                <button
                  type="button"
                  className={`rok-chapter-row${active ? ' is-active' : ''}`}
                  onClick={() => {
                    onSelect(ch.number)
                    onClose()
                  }}
                >
                  <span className="rok-chapter-row-num">{ch.number}</span>
                  <span className="rok-chapter-row-body">
                    <span className="rok-chapter-row-title">{ch.title}</span>
                    <span className="rok-chapter-row-meta">
                      {ch.pageCount} pg
                      <ChapterHeartCount seriesSlug={seriesSlug} chapterNumber={ch.number} />
                    </span>
                  </span>
                  {active ? <span className="rok-chapter-row-tag">Now</span> : null}
                </button>
              </li>
            )
          })}
        </ul>
      </aside>
    </>
  )
}
