import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatRating } from '../lib/format'
import { getBannerObjectPosition } from '../lib/seriesBanner'
import { getSourceColor } from '../lib/sources'
import type { Series, SeriesStatus } from '../types'
import './PopularFeatured.css'

const FEATURED_COUNT = 6
/** Time each title stays in the hero before auto-advance */
const AUTO_ADVANCE_MS = 5500

const STATUS_LABEL: Record<SeriesStatus, string> = {
  ongoing: 'Ongoing',
  completed: 'Completed',
  hiatus: 'On hiatus',
}

interface PopularFeaturedProps {
  series: Series[]
}

export function PopularFeatured({ series }: PopularFeaturedProps) {
  const items = useMemo(() => series.slice(0, FEATURED_COUNT), [series])
  const [activeIndex, setActiveIndex] = useState(0)
  const [progressKey, setProgressKey] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const hoverPausedRef = useRef(false)
  const manualPauseUntilRef = useRef(0)

  const count = items.length

  useEffect(() => {
    setActiveIndex(0)
    manualPauseUntilRef.current = 0
    setProgressKey((k) => k + 1)
  }, [series])

  const safeIndex = items.length === 0 ? 0 : Math.min(activeIndex, items.length - 1)

  useEffect(() => {
    setProgressKey((k) => k + 1)
  }, [safeIndex])

  useEffect(() => {
    if (count <= 1) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reducedMotion.matches) return

    const advance = () => {
      if (hoverPausedRef.current) return
      if (Date.now() < manualPauseUntilRef.current) return
      setActiveIndex((i) => (i + 1) % count)
    }

    const id = window.setInterval(advance, AUTO_ADVANCE_MS)
    return () => window.clearInterval(id)
  }, [count, series])

  const selectIndex = useCallback((index: number) => {
    setActiveIndex(index)
    manualPauseUntilRef.current = Date.now() + AUTO_ADVANCE_MS * 2
  }, [])

  useEffect(() => {
    for (const s of items) {
      const src = s.bannerUrl || s.coverUrl
      if (!src) continue
      const img = new Image()
      img.src = src
    }
  }, [items])

  if (items.length === 0) return null

  const active = items[safeIndex]!
  const latest = active.chapters[active.chapters.length - 1]
  const readHref = latest
    ? `/read/${active.slug}/${latest.number}`
    : `/series/${active.slug}`
  const heroImage = active.bannerUrl || active.coverUrl
  const ratingLine = formatRating(active.rating, active.views)
  const blurb =
    active.description.length > 200
      ? `${active.description.slice(0, 197).trim()}…`
      : active.description

  return (
    <div
      className={`popular-featured${isPaused ? ' popular-featured--paused' : ''}`}
      onMouseEnter={() => {
        hoverPausedRef.current = true
        setIsPaused(true)
      }}
      onMouseLeave={() => {
        hoverPausedRef.current = false
        setIsPaused(false)
      }}
    >
      <div className="popular-hero">
        <div className="popular-hero-media">
          <img
            src={heroImage}
            alt=""
            className="popular-hero-img"
            decoding="async"
            style={{ objectPosition: getBannerObjectPosition(active) }}
          />
          <div className="popular-hero-scrim" aria-hidden />
        </div>

        <div className="popular-hero-content" aria-live="polite" aria-atomic="true">
          <div className="popular-hero-badges">
            <span className={`popular-hero-status popular-hero-status--${active.status}`}>
              {STATUS_LABEL[active.status] ?? active.status}
            </span>
            <span className="popular-hero-rating">
              <StarIcon />
              {ratingLine}
            </span>
          </div>

          <h3 className="popular-hero-title">{active.title}</h3>

          <p className="popular-hero-desc">{blurb}</p>

          <div className="popular-hero-meta">
            <span>{active.chapters.length} chapters</span>
            {active.genres.length > 0 && (
              <>
                <span className="popular-hero-dot" aria-hidden>
                  ·
                </span>
                <span>{active.genres.slice(0, 3).join(' · ')}</span>
              </>
            )}
          </div>

          <div className="popular-hero-actions">
            <Link to={readHref} className="popular-hero-cta">
              {latest ? `Read ${latest.number === 1 ? 'Ch. 1' : `Ch. ${latest.number}`}` : 'Start reading'}
            </Link>
            <Link to={`/series/${active.slug}`} className="popular-hero-secondary">
              Series page
            </Link>
          </div>
        </div>
      </div>

      <nav className="popular-rail" aria-label="Popular picks">
        <ul className="popular-rail-list">
          {items.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                className={`popular-rail-item${i === safeIndex ? ' popular-rail-item--active' : ''}`}
                aria-current={i === safeIndex ? 'true' : undefined}
                onClick={() => selectIndex(i)}
              >
                {i === safeIndex && (
                  <span
                    key={progressKey}
                    className="popular-rail-fill"
                    style={{ animationDuration: `${AUTO_ADVANCE_MS}ms` }}
                    aria-hidden
                  />
                )}
                <span className="popular-rail-thumb">
                  <img src={s.coverUrl} alt="" loading="eager" decoding="async" />
                </span>
                <span className="popular-rail-text">
                  <span className="popular-rail-title">{s.title}</span>
                  {s.source ? (
                    <span
                      className="popular-rail-source"
                      style={
                        {
                          '--source-color': getSourceColor(s.source),
                        } as React.CSSProperties
                      }
                    >
                      {s.source}
                    </span>
                  ) : null}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 7.1-1.01L12 2z" />
    </svg>
  )
}
