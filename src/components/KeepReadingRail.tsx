import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../hooks/useCatalog'
import { useContinueReading } from '../hooks/useLibrary'
import type { ContentType } from '../types'
import { KeepReadingCard } from './KeepReadingCard'
import './KeepReadingRail.css'

const MAX_ITEMS = 14

interface KeepReadingRailProps {
  excludeSlug?: string
  className?: string
  /** When set, only show continue-reading entries for this format. */
  contentType?: ContentType
  viewAllHref?: string
  title?: string
}

export function KeepReadingRail({
  excludeSlug,
  className = '',
  contentType,
  viewAllHref = '/history',
  title = 'Keep Reading',
}: KeepReadingRailProps) {
  const catalog = useCatalog()
  const continueItems = useContinueReading()
  const trackRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const entries = useMemo(() => {
    return continueItems
      .filter((p) => p.slug !== excludeSlug)
      .slice(0, MAX_ITEMS)
      .map((progress) => {
        const series = catalog.find((s) => s.slug === progress.slug)
        if (!series) return null
        if (contentType && series.type !== contentType) return null
        return { series, progress }
      })
      .filter((e): e is NonNullable<typeof e> => Boolean(e))
  }, [continueItems, excludeSlug, catalog, contentType])

  const updateArrows = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setCanPrev(el.scrollLeft > 8)
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 8)
  }, [])

  const scroll = (dir: -1 | 1) => {
    const el = trackRef.current
    if (!el) return
    const step =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--keep-card-w'),
      ) || 168
    const gap =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--card-gap'),
      ) || 16
    el.scrollBy({ left: dir * (step + gap) * 2, behavior: 'smooth' })
    setTimeout(updateArrows, 320)
  }

  useEffect(() => {
    updateArrows()
  }, [entries.length, updateArrows])

  if (entries.length === 0) return null

  return (
    <section
      className={`keep-rail ${className}`.trim()}
      aria-labelledby="keep-reading-heading"
    >
      <div className="keep-rail-head">
        <h2 id="keep-reading-heading">{title}</h2>
        <Link to={viewAllHref} className="keep-rail-view-all">
          View all
        </Link>
      </div>

      <div className="keep-rail-carousel">
        {canPrev && (
          <button
            type="button"
            className="keep-rail-btn keep-rail-btn--prev"
            aria-label="Scroll left"
            onClick={() => scroll(-1)}
          >
            ‹
          </button>
        )}
        <div
          ref={trackRef}
          className="keep-rail-track"
          onScroll={updateArrows}
        >
          {entries.map(({ series, progress }) => (
            <KeepReadingCard key={series.id} series={series} progress={progress} />
          ))}
        </div>
        {canNext && (
          <button
            type="button"
            className="keep-rail-btn keep-rail-btn--next"
            aria-label="Scroll right"
            onClick={() => scroll(1)}
          >
            ›
          </button>
        )}
      </div>
    </section>
  )
}
