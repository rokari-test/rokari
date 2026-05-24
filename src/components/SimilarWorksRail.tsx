import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../hooks/useCatalog'
import { getSimilarSeries, similarWorksBrowseHref } from '../lib/similarSeries'
import type { Series } from '../types'
import { SeriesCarousel } from './SeriesCarousel'
import './SimilarWorksRail.css'

interface SimilarWorksRailProps {
  series: Series
}

export function SimilarWorksRail({ series }: SimilarWorksRailProps) {
  const catalog = useCatalog()

  const items = useMemo(
    () => getSimilarSeries(series, catalog),
    [series, catalog],
  )

  if (items.length === 0) return null

  const browseHref = similarWorksBrowseHref(series)
  const genreHint =
    series.genres.length > 0
      ? `Based on ${series.genres.slice(0, 3).join(', ')}`
      : undefined

  return (
    <section
      className="similar-works-rail"
      aria-labelledby="similar-works-heading"
    >
      <div className="similar-works-head">
        <div className="similar-works-head-text">
          <h2 id="similar-works-heading">Similar Works</h2>
          {genreHint && <p className="similar-works-sub">{genreHint}</p>}
        </div>
        <Link to={browseHref} className="similar-works-view-all">
          View all
        </Link>
      </div>

      <SeriesCarousel series={items} />
    </section>
  )
}
