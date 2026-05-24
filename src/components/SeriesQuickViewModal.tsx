import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookmarkButton } from './BookmarkButton'
import { useSeriesProgress } from '../hooks/useLibrary'
import { formatRating } from '../lib/format'
import { getSeriesExternalLinks } from '../lib/seriesExternalLinks'
import {
  getSeriesTracking,
  setSeriesStatus,
  STATUS_GRID,
  type ReadingStatus,
} from '../lib/seriesStatus'
import type { Series, SeriesStatus } from '../types'
import './SeriesQuickViewModal.css'

const PUBLISH_LABEL: Record<SeriesStatus, string> = {
  ongoing: 'Ongoing',
  completed: 'Completed',
  hiatus: 'Hiatus',
}

const GENRE_VISIBLE = 8

interface SeriesQuickViewModalProps {
  series: Series
  onClose: () => void
}

export function SeriesQuickViewModal({ series, onClose }: SeriesQuickViewModalProps) {
  const progress = useSeriesProgress(series.slug)
  const [tracking, setTracking] = useState(() => getSeriesTracking(series.slug))
  const [genresExpanded, setGenresExpanded] = useState(false)

  useEffect(() => {
    const sync = () => setTracking(getSeriesTracking(series.slug))
    sync()
    window.addEventListener('sakura-series-status', sync)
    return () => window.removeEventListener('sakura-series-status', sync)
  }, [series.slug])

  const chapterCount = series.chapters.length
  const readCh = progress?.chapterNumber ?? 0
  const chapterLine = `${readCh}/${chapterCount} Ch`
  const ratingLine = formatRating(series.rating, series.views)
  const lang =
    series.language === 'KO'
      ? 'Korean'
      : series.language === 'EN'
        ? 'English'
        : (series.language ?? 'English')
  const yearLabel = series.year ? `${series.year}–` : ''
  const typeLabel = series.type === 'manhwa' ? 'Manhwa' : 'Novel'

  const credits = formatCredits(series)
  const visibleGenres = genresExpanded
    ? series.genres
    : series.genres.slice(0, GENRE_VISIBLE)
  const hiddenGenreCount = Math.max(0, series.genres.length - GENRE_VISIBLE)
  const externalLinks = getSeriesExternalLinks(series)

  const pickStatus = (status: ReadingStatus) => {
    setSeriesStatus(series.slug, status)
  }

  return (
    <div className="sqv-backdrop" role="presentation" onClick={onClose}>
      <dialog
        className="sqv-dialog"
        open
        aria-labelledby="sqv-title"
        onClick={(e) => e.stopPropagation()}
        onClose={onClose}
      >
        <button
          type="button"
          className="sqv-close"
          aria-label="Close"
          onClick={onClose}
        >
          ×
        </button>

        <div className="sqv-layout">
          <aside className="sqv-sidebar">
            <div className="sqv-cover">
              <img src={series.coverUrl} alt="" />
            </div>

            <ul className="sqv-stats">
              <li>
                <span className="sqv-stat-icon sqv-stat-icon--book" aria-hidden>
                  <BookIcon />
                </span>
                <span>{chapterLine}</span>
              </li>
              <li>
                <span className="sqv-stat-icon sqv-stat-icon--star" aria-hidden>
                  <StarIcon />
                </span>
                <span>{ratingLine}</span>
              </li>
              <li>
                <span className="sqv-stat-icon sqv-stat-icon--globe" aria-hidden>
                  <GlobeIcon />
                </span>
                <span>
                  {lang} {yearLabel}
                </span>
              </li>
            </ul>

            <div className="sqv-actions">
              <Link
                to={`/series/${series.slug}`}
                className="sqv-btn sqv-btn--primary"
                onClick={onClose}
              >
                View Series
                <ChevronIcon />
              </Link>
              <BookmarkButton slug={series.slug} variant="sqv" />
              <button type="button" className="sqv-btn sqv-btn--secondary" disabled title="Coming soon">
                <ListPlusIcon />
                Add to List
              </button>
            </div>
          </aside>

          <div className="sqv-main">
            <h2 id="sqv-title" className="sqv-title">
              {series.title}
            </h2>
            {credits && <p className="sqv-credits">{credits}</p>}
            {series.altTitles.length > 0 && (
              <p className="sqv-alts">{series.altTitles[0]}</p>
            )}

            <div className="sqv-badges">
              <span className={`sqv-badge sqv-badge--${series.status}`}>
                {PUBLISH_LABEL[series.status]}
              </span>
              <span className="sqv-badge sqv-badge--type">{typeLabel}</span>
            </div>

            <p className="sqv-desc">{series.description}</p>

            {series.genres.length > 0 && (
              <div className="sqv-genres">
                {visibleGenres.map((g) => (
                  <Link
                    key={g}
                    to={`/browse?genre=${encodeURIComponent(g)}`}
                    className="sqv-genre"
                    onClick={onClose}
                  >
                    {g}
                  </Link>
                ))}
                {!genresExpanded && hiddenGenreCount > 0 && (
                  <button
                    type="button"
                    className="sqv-genre sqv-genre--more"
                    onClick={() => setGenresExpanded(true)}
                  >
                    +{hiddenGenreCount} more
                  </button>
                )}
              </div>
            )}

            <div className="sqv-links">
              {externalLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="sqv-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                  <ExternalIcon />
                </a>
              ))}
            </div>

            <section className="sqv-status-section" aria-labelledby="sqv-status-heading">
              <h3 id="sqv-status-heading">Reading status</h3>
              <div className="sqv-status-grid">
                {STATUS_GRID.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`sqv-status-cell${
                      tracking.status === item.id ? ' sqv-status-cell--active' : ''
                    }`}
                    onClick={() => pickStatus(item.id)}
                  >
                    <StatusIcon status={item.id} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      </dialog>
    </div>
  )
}

function formatCredits(series: Series): string {
  const parts: string[] = []
  if (series.author && series.author !== '—') {
    parts.push(`${series.author} (Author)`)
  }
  if (
    series.artist &&
    series.artist !== '—' &&
    series.artist !== series.author
  ) {
    parts.push(`${series.artist} (Artist)`)
  }
  return parts.join(', ')
}

function StatusIcon({ status }: { status: ReadingStatus }) {
  const props = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    'aria-hidden': true as const,
  }
  switch (status) {
    case 'reading':
      return (
        <svg {...props}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      )
    case 'planned':
      return (
        <svg {...props}>
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      )
    case 'completed':
      return (
        <svg {...props}>
          <path d="M20 6L9 17l-5-5" />
        </svg>
      )
    case 'hold':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      )
    case 'dropped':
      return (
        <svg {...props}>
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      )
    case 'rereading':
      return (
        <svg {...props}>
          <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
          <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
        </svg>
      )
  }
}

function BookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#fbbf24" aria-hidden>
      <path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 7.1-1.01L12 2z" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

function ListPlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 5v14M5 12h14" />
      <path d="M6 6h12v12H6z" strokeOpacity="0.35" />
    </svg>
  )
}

function ExternalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6M10 14L21 3" />
    </svg>
  )
}
