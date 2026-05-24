import { Link } from 'react-router-dom'
import { getSourceColor } from '../lib/sources'
import type { Series } from '../types'
import { SeriesInfoButton } from './SeriesInfoButton'
import './ManhwaCard.css'

interface ManhwaCardProps {
  series: Series
}

export function ManhwaCard({ series }: ManhwaCardProps) {
  const latest = series.chapters[series.chapters.length - 1]
  const chapterCount = series.chapters.length
  const lang = series.language ?? 'EN'
  const sourceColor = getSourceColor(series.source)
  const rating =
    Number.isFinite(series.rating) ? series.rating.toFixed(1) : '—'

  return (
    <article className="manhwa-card">
      <Link to={`/series/${series.slug}`} className="manhwa-card-link">
      <div className="manhwa-card-media">
        <img src={series.coverUrl} alt="" loading="lazy" />
        <span className="manhwa-card-lang">{lang}</span>

        <div className="manhwa-card-overlay">
          <h3 className="manhwa-card-title">{series.title}</h3>
          <p className="manhwa-card-meta">
            <span className="manhwa-card-rating">
              <StarIcon />
              {rating}
            </span>
            <span className="manhwa-card-dot" aria-hidden>
              ·
            </span>
            <span>{chapterCount} ch</span>
            {series.status === 'ongoing' && (
              <>
                <span className="manhwa-card-dot" aria-hidden>
                  ·
                </span>
                <span className="manhwa-card-live">Live</span>
              </>
            )}
          </p>
          {series.source ? (
            <span
              className="manhwa-card-source"
              style={{ '--source-color': sourceColor } as React.CSSProperties}
            >
              {series.source}
            </span>
          ) : null}
        </div>
      </div>

      <span className="sr-only">
        {series.title}, {chapterCount} chapters
        {latest ? `, latest chapter ${latest.number}` : ''}
      </span>
      </Link>
      <SeriesInfoButton slug={series.slug} />
    </article>
  )
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 7.1-1.01L12 2z" />
    </svg>
  )
}
