import { Link } from 'react-router-dom'
import { formatReadingAgo } from '../lib/format'
import type { ReadingProgress } from '../lib/storage'
import type { Series } from '../types'
import './KeepReadingCard.css'

interface KeepReadingCardProps {
  series: Series
  progress: ReadingProgress
}

export function KeepReadingCard({ series, progress }: KeepReadingCardProps) {
  const total = Math.max(series.chapters.length, 1)
  const chapter = progress.chapterNumber
  const remaining = Math.max(0, total - chapter)
  const pct = Math.min(
    100,
    Math.round(((chapter - 1 + progress.scrollPercent / 100) / total) * 100),
  )
  const ago = formatReadingAgo(progress.updatedAt)
  const chapterLabel = progress.chapterTitle || `Chapter ${chapter}`

  return (
    <Link
      to={`/read/${series.slug}/${chapter}`}
      className="keep-card"
      aria-label={`Continue ${series.title}, chapter ${chapter}`}
    >
      <div className="keep-card-cover">
        <img src={series.coverUrl} alt="" loading="lazy" />
        <div className="keep-card-cover-shade" aria-hidden />
        <span className="keep-card-ch-pill">Ch. {chapter}</span>

        <div className="keep-card-hover" aria-hidden>
          <span className="keep-card-hover-label">Continue reading</span>
          <strong className="keep-card-hover-ch">
            Ch. {chapter}
            {progress.scrollPercent > 2 && (
              <span className="keep-card-hover-pct">
                · {Math.round(progress.scrollPercent)}% through
              </span>
            )}
          </strong>
          <p className="keep-card-hover-title">{chapterLabel}</p>
        </div>
      </div>

      <div className="keep-card-body">
        <h3 className="keep-card-series">{series.title}</h3>
        <p className="keep-card-meta">
          Ch. {chapter} · {ago}
        </p>
        <div
          className="keep-card-bar"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${pct}% complete`}
        >
          <span className="keep-card-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="keep-card-stats">
          <span className="keep-card-pct">{pct}%</span>
          <span className="keep-card-count">
            {chapter} / {total}
            {remaining > 0 && (
              <span className="keep-card-remaining"> ({remaining} left)</span>
            )}
          </span>
        </div>
      </div>
    </Link>
  )
}
