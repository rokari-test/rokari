import { buildRatingDistribution, buildTitleEntries, getVoteCount } from '../lib/extraInfo'
import type { Series } from '../types'
import './SeriesExtraInfo.css'

interface SeriesExtraInfoProps {
  series: Series
}

export function SeriesExtraInfo({ series }: SeriesExtraInfoProps) {
  const votes = getVoteCount(series.views)
  const distribution = buildRatingDistribution(series.rating, votes)
  const titles = buildTitleEntries(series)
  const maxCount = Math.max(...distribution.map((d) => d.count), 1)

  return (
    <div className="extra-info">
      <section className="extra-info-block">
        <div className="extra-info-head">
          <h3>Rating Statistics</h3>
          <span className="extra-info-badge">{votes} votes</span>
        </div>
        <p className="extra-info-sub">Score Distribution (★)</p>

        <div className="extra-info-chart" role="img" aria-label="Score distribution chart">
          {distribution.map((row) => (
            <div key={row.stars} className="extra-info-bar-row">
              <span className="extra-info-bar-label">{row.stars}</span>
              <div className="extra-info-bar-track">
                <div
                  className="extra-info-bar-fill"
                  style={{ width: `${(row.count / maxCount) * 100}%` }}
                />
              </div>
              <span className="extra-info-bar-count">{row.count}</span>
            </div>
          ))}
        </div>

        <div className="extra-info-avg">
          <span className="extra-info-avg-star">★</span>
          <strong>{series.rating.toFixed(1)}</strong>
          <span className="extra-info-avg-muted">average</span>
        </div>
      </section>

      <section className="extra-info-block">
        <div className="extra-info-head">
          <h3>Titles</h3>
          <span className="extra-info-badge">{titles.length}</span>
        </div>

        <ul className="extra-info-titles">
          {titles.map((entry, i) => (
            <li key={`${entry.language}-${i}`} className="extra-info-title-row">
              <span className="extra-info-title-lang">{entry.language}</span>
              <div className="extra-info-title-body">
                <span className="extra-info-title-type">{entry.label}</span>
                <p className="extra-info-title-text">{entry.title}</p>
              </div>
              {entry.primary && (
                <span className="extra-info-title-primary">Primary</span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
