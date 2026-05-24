import { Link } from 'react-router-dom'
import { getStatusLabel, type ReadingStatus, type SeriesTracking } from '../lib/seriesStatus'
import type { ReadingProgress } from '../lib/storage'
import type { Series } from '../types'
import './LibraryStatusCard.css'

interface LibraryStatusCardProps {
  series: Series
  tracking: SeriesTracking
  progress?: ReadingProgress
}

export function LibraryStatusCard({
  series,
  tracking,
  progress,
}: LibraryStatusCardProps) {
  const status = tracking.status!
  const total = Math.max(series.chapters.length, 1)
  const current = progress?.chapterNumber ?? 0
  const progressLabel = current > 0 ? `${current}/${total}` : '—'
  const scoreLabel =
    tracking.score != null && tracking.score > 0
      ? tracking.score > 5
        ? `${Math.min(5, Math.round(tracking.score / 2))}★`
        : `${Math.round(tracking.score)}★`
      : '—'
  const timesLabel =
    tracking.timesRead != null && tracking.timesRead > 0
      ? String(tracking.timesRead)
      : '—'

  const readHref =
    progress && progress.chapterNumber > 0
      ? `/read/${series.slug}/${progress.chapterNumber}`
      : series.chapters[0]
        ? `/read/${series.slug}/${series.chapters[0].number}`
        : `/series/${series.slug}`

  return (
    <article className={`lib-status-card lib-status-card--${status}`}>
      <Link to={readHref} className="lib-status-card-media">
        <img src={series.coverUrl} alt="" loading="lazy" />
        <span className="lib-status-card-glow" aria-hidden />
      </Link>

      <div className="lib-status-card-body">
        <div className="lib-status-card-head">
          <Link to={`/series/${series.slug}`} className="lib-status-card-title">
            {series.title}
          </Link>
          <StatusPill status={status} />
        </div>

        <div className="lib-status-card-metrics">
          <Metric icon="star" label="Score" value={scoreLabel} />
          <Metric icon="progress" label="Progress" value={progressLabel} />
          <Metric icon="times" label="Times" value={timesLabel} />
        </div>

        {progress && progress.chapterNumber > 0 && (
          <p className="lib-status-card-chapter">
            Ch. {progress.chapterNumber}
            {progress.scrollPercent > 0 && (
              <span> · {Math.round(progress.scrollPercent)}% through</span>
            )}
          </p>
        )}

        <Link to={readHref} className="lib-status-card-cta">
          {progress ? 'Continue' : 'Open'}
        </Link>
      </div>
    </article>
  )
}

function StatusPill({ status }: { status: ReadingStatus }) {
  return (
    <span className={`lib-status-pill lib-status-pill--${status}`}>
      {getStatusLabel(status)}
    </span>
  )
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: 'star' | 'progress' | 'times'
  label: string
  value: string
}) {
  return (
    <div className="lib-status-metric">
      <span className="lib-status-metric-icon" aria-hidden>
        {icon === 'star' && '★'}
        {icon === 'progress' && '▮'}
        {icon === 'times' && '↻'}
      </span>
      <span className="lib-status-metric-label">{label}</span>
      <strong className="lib-status-metric-value">{value}</strong>
    </div>
  )
}
