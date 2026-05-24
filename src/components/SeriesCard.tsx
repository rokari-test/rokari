import { Link } from 'react-router-dom'
import type { Series } from '../types'
import { SeriesInfoButton } from './SeriesInfoButton'
import './SeriesCard.css'

interface SeriesCardProps {
  series: Series
  featured?: boolean
}

export function SeriesCard({ series, featured }: SeriesCardProps) {
  const latest = series.chapters[series.chapters.length - 1]

  return (
    <article className={`series-card${featured ? ' series-card--featured' : ''}`}>
      <Link to={`/series/${series.slug}`} className="series-card-link">
      <div className="series-card-cover">
        <img src={series.coverUrl} alt="" loading="lazy" />
        <span className={`series-card-type series-card-type--${series.type}`}>
          {series.type}
        </span>
        <span className={`series-card-status series-card-status--${series.status}`}>
          {series.status}
        </span>
        <span className="series-card-rating">★ {series.rating}</span>
      </div>
      <div className="series-card-info">
        <h3>{series.title}</h3>
        <p className="series-card-meta">
          {series.genres.join(' · ')}
          {latest && ` · Ch. ${latest.number}`}
        </p>
      </div>
      </Link>
      <SeriesInfoButton slug={series.slug} />
    </article>
  )
}

