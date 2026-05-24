import { useEffect, useState } from 'react'
import {
  fullInfoDraftFromSeries,
  linkHostname,
  resolveFullInfo,
  saveSeriesFullInfo,
} from '../lib/seriesFullInfo'
import type { Series, SeriesFullInfo } from '../types'
import { SeriesFullInfoFields } from './SeriesFullInfoFields'
import './SeriesFullInfo.css'

interface SeriesFullInfoPanelProps {
  series: Series
  canEdit?: boolean
}

export function SeriesFullInfoPanel({ series, canEdit = false }: SeriesFullInfoPanelProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<SeriesFullInfo>(() => fullInfoDraftFromSeries(series))
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    setDraft(fullInfoDraftFromSeries(series))
    setEditing(false)
  }, [series.id, series.fullInfo])

  const info = resolveFullInfo(series)
  const maxCount = Math.max(...info.distribution.map((d) => d.count), 1)

  const handleSave = () => {
    saveSeriesFullInfo(series.id, draft)
    setEditing(false)
    setSavedFlash(true)
    window.setTimeout(() => setSavedFlash(false), 2000)
  }

  return (
    <div className="rok-full">
      <div className="rok-full-head">
        <div>
          <p className="rok-full-eyebrow">Rokari archive</p>
          <h3 className="rok-full-title">Full info</h3>
        </div>
        {canEdit ? (
          <div className="rok-full-actions">
            {savedFlash ? <span className="rok-full-saved">Saved</span> : null}
            {editing ? (
              <>
                <button type="button" className="rok-full-btn" onClick={() => setEditing(false)}>
                  Cancel
                </button>
                <button type="button" className="rok-full-btn rok-full-btn--primary" onClick={handleSave}>
                  Save
                </button>
              </>
            ) : (
              <button
                type="button"
                className="rok-full-btn rok-full-btn--primary"
                onClick={() => {
                  setDraft(fullInfoDraftFromSeries(series))
                  setEditing(true)
                }}
              >
                Edit
              </button>
            )}
          </div>
        ) : null}
      </div>

      {editing ? (
        <SeriesFullInfoFields value={draft} onChange={setDraft} />
      ) : (
        <>
          <section className="rok-full-section">
            <div className="rok-full-section-head">
              <h4>Rating statistics</h4>
              <span className="rok-full-badge">{info.voteCount} votes</span>
            </div>

            <div className="rok-full-rating-cards">
              <div className="rok-full-rating-card">
                <span className="rok-full-rating-label">Bayesian rating</span>
                <strong>{info.bayesianRating.toFixed(1)}</strong>
                <span className="rok-full-rating-scale">/ 10</span>
              </div>
              <div className="rok-full-rating-card">
                <span className="rok-full-rating-label">Average rating</span>
                <strong>{info.averageRating.toFixed(1)}</strong>
                <span className="rok-full-rating-scale">/ 10</span>
              </div>
            </div>

            <p className="rok-full-sub">Score distribution (★)</p>
            <div className="rok-full-chart" role="img" aria-label="Score distribution chart">
              {info.distribution.map((row) => (
                <div key={row.stars} className="rok-full-bar-row">
                  <span className="rok-full-bar-label">{row.stars}</span>
                  <div className="rok-full-bar-track">
                    <div
                      className="rok-full-bar-fill"
                      style={{ width: `${(row.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="rok-full-bar-count">{row.count}</span>
                </div>
              ))}
            </div>
          </section>

          {info.externalLinks.length > 0 ? (
            <section className="rok-full-section">
              <div className="rok-full-section-head">
                <h4>External links</h4>
                <span className="rok-full-badge">{info.externalLinks.length}</span>
              </div>
              <ul className="rok-full-links">
                {info.externalLinks.map((link) => (
                  <li key={`${link.label}-${link.href}`}>
                    <a
                      href={link.href}
                      className="rok-full-link-card"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="rok-full-link-icon" aria-hidden>
                        {link.label.charAt(0).toUpperCase()}
                      </span>
                      <span className="rok-full-link-body">
                        <strong>{link.label}</strong>
                        <span>{linkHostname(link.href)}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="rok-full-section">
            <div className="rok-full-section-head">
              <h4>Titles</h4>
              <span className="rok-full-badge">{info.titles.length}</span>
            </div>
            <ul className="rok-full-titles">
              {info.titles.map((entry, i) => (
                <li key={`${entry.language}-${i}`} className="rok-full-title-row">
                  <span className="rok-full-title-lang">{entry.language}</span>
                  <div className="rok-full-title-body">
                    <span className="rok-full-title-type">{entry.label ?? entry.language}</span>
                    <p className="rok-full-title-text">{entry.title}</p>
                  </div>
                  {entry.primary ? <span className="rok-full-title-primary">Primary</span> : null}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  )
}
