import { Link } from 'react-router-dom'
import { useUserSubscription } from '../hooks/useUserSubscription'
import { formatRating } from '../lib/format'
import type { PlanId } from '../lib/subscriptions'
import type { Chapter, Series, SeriesStatus } from '../types'
import { ChapterUpdateRow } from './ChapterUpdateRow'
import { SeriesInfoButton } from './SeriesInfoButton'
import './SeriesUpdateCard.css'

const FEED_CHAPTER_COUNT = 4

const PUBLISH_STATUS: Record<SeriesStatus, string> = {
  ongoing: 'Ongoing',
  completed: 'Completed',
  hiatus: 'Hiatus',
}

interface SeriesUpdateCardProps {
  series: Series
  chapters?: Chapter[]
  tick: number
}

export function SeriesUpdateCard({ series, chapters, tick }: SeriesUpdateCardProps) {
  const { subscription, plan } = useUserSubscription()
  /** Guests use Free-tier early-access rules; logged-in users use their plan. */
  const planId: PlanId = plan?.id ?? 'free'
  const planName = plan?.name ?? 'Free'
  const list = chapters ?? [...series.chapters]
  const recent = [...list]
    .sort((a, b) => b.number - a.number)
    .slice(0, FEED_CHAPTER_COUNT)

  if (recent.length === 0) return null

  const ratingLine = formatRating(series.rating, series.views)
  const typeLabel = series.type === 'novel' ? 'Novel' : 'Manhwa'

  return (
    <article className="feed-tile">
      <div className="feed-tile-cover-wrap">
        <Link
          to={`/series/${series.slug}`}
          className="feed-tile-cover"
          aria-label={series.title}
        >
          <img src={series.coverUrl} alt="" loading="lazy" />
          <span className="feed-tile-cover-glow" aria-hidden />
          <span className={`feed-tile-type feed-tile-type--${series.type}`}>
            {typeLabel}
          </span>
        </Link>
        <SeriesInfoButton slug={series.slug} />
      </div>

      <div className="feed-tile-body">
        <header className="feed-tile-head">
          <div className="feed-tile-head-row">
            <h3 className="feed-tile-title">
              <Link to={`/series/${series.slug}`}>{series.title}</Link>
            </h3>
            <span
              className={`feed-tile-status feed-tile-status--${series.status}`}
            >
              <span className="feed-tile-status-dot" aria-hidden />
              {PUBLISH_STATUS[series.status] ?? series.status}
            </span>
          </div>
          <div className="feed-tile-meta">
            <span className="feed-tile-rating-pill" aria-label="Rating">
              <span className="feed-tile-star" aria-hidden>
                ★
              </span>
              {ratingLine}
            </span>
          </div>
        </header>

        <div className="feed-tile-chapters-panel">
          <ul className="feed-tile-chapters">
            {recent.map((ch, i) => (
              <ChapterUpdateRow
                key={ch.id}
                slug={series.slug}
                contentType={series.type}
                chapter={ch}
                allChapters={series.chapters}
                planId={planId}
                subscription={subscription}
                planName={planName}
                tick={tick}
                isLead={i === 0}
                variant="feed"
              />
            ))}
          </ul>
        </div>
      </div>
    </article>
  )
}
