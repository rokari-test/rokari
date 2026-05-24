import { useCallback, useRef, useState } from 'react'
import type { Series } from '../types'
import { ManhwaCard } from './ManhwaCard'
import './SeriesCarousel.css'

interface SeriesCarouselProps {
  series: Series[]
}

export function SeriesCarousel({ series }: SeriesCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)

  const updateArrows = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setCanPrev(el.scrollLeft > 8)
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 8)
  }, [])

  const scroll = (dir: -1 | 1) => {
    const el = trackRef.current
    if (!el) return
    const cardStep =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--card-w'),
      ) || 180
    const gap =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--card-gap'),
      ) || 16
    const amount = Math.min(el.clientWidth * 0.9, (cardStep + gap) * 4)
    el.scrollBy({ left: dir * amount, behavior: 'smooth' })
    setTimeout(updateArrows, 320)
  }

  if (series.length === 0) return null

  return (
    <div className="series-carousel">
      {canPrev && (
        <button
          type="button"
          className="series-carousel-btn series-carousel-btn--prev"
          aria-label="Scroll left"
          onClick={() => scroll(-1)}
        >
          ‹
        </button>
      )}
      <div
        ref={trackRef}
        className="series-carousel-track"
        onScroll={updateArrows}
      >
        {series.map((s) => (
          <ManhwaCard key={s.id} series={s} />
        ))}
      </div>
      {canNext && (
        <button
          type="button"
          className="series-carousel-btn series-carousel-btn--next"
          aria-label="Scroll right"
          onClick={() => scroll(1)}
        >
          ›
        </button>
      )}
    </div>
  )
}
