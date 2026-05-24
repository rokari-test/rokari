import { useEffect, useState } from 'react'
import { formatRating } from '../lib/format'
import { getSeriesTracking, updateSeriesTracking } from '../lib/seriesStatus'
import { StarRating } from './StarRating'
import './SeriesCoverRating.css'

interface SeriesCoverRatingProps {
  slug: string
  averageRating: number
  views: number
}

export function SeriesCoverRating({ slug, averageRating, views }: SeriesCoverRatingProps) {
  const [tracking, setTracking] = useState(() => getSeriesTracking(slug))

  useEffect(() => {
    const sync = () => setTracking(getSeriesTracking(slug))
    sync()
    window.addEventListener('sakura-series-status', sync)
    return () => window.removeEventListener('sakura-series-status', sync)
  }, [slug])

  return (
    <div className="series-cover-rating" aria-label="Series rating">
      <div className="series-cover-rating-avg">
        <StarRating value={averageRating} readOnly size="sm" label="Rating" />
        <span className="series-cover-rating-meta">{formatRating(averageRating, views)}</span>
      </div>
      <StarRating
        label="Your rating"
        value={tracking.score}
        onChange={(score) => updateSeriesTracking(slug, { score })}
        size="sm"
      />
    </div>
  )
}
