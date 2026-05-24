import { useEffect, useState } from 'react'
import {
  getSeriesTracking,
  setSeriesStatus,
  STATUS_GRID,
  type ReadingStatus,
} from '../lib/seriesStatus'
import './ReadingStatusPanel.css'

interface ReadingStatusPanelProps {
  slug: string
  open: boolean
  onClose: () => void
  chapterProgress?: { current: number; total: number }
}

export function ReadingStatusPanel({
  slug,
  open,
  onClose,
  chapterProgress,
}: ReadingStatusPanelProps) {
  const [tracking, setTracking] = useState(() => getSeriesTracking(slug))

  useEffect(() => {
    const sync = () => setTracking(getSeriesTracking(slug))
    sync()
    window.addEventListener('sakura-series-status', sync)
    return () => window.removeEventListener('sakura-series-status', sync)
  }, [slug])

  if (!open) return null

  const progressLabel =
    chapterProgress && chapterProgress.current > 0
      ? `${chapterProgress.current}/${chapterProgress.total}`
      : null

  const pickStatus = (status: ReadingStatus) => {
    setSeriesStatus(slug, status)
  }

  return (
    <div className="rsp">
      <div className="rsp-head">
        <h4>Reading status</h4>
        <button type="button" className="rsp-close" aria-label="Close" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="rsp-grid">
        {STATUS_GRID.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`rsp-cell${tracking.status === item.id ? ' rsp-cell--active' : ''}`}
            onClick={() => pickStatus(item.id)}
          >
            <span className="rsp-icon">
              <StatusIcon status={item.id} />
            </span>
            <span className="rsp-label">{item.label}</span>
          </button>
        ))}
      </div>

      {progressLabel ? (
        <p className="rsp-progress">
          Progress · <strong>{progressLabel}</strong>
        </p>
      ) : null}
    </div>
  )
}

function StatusIcon({ status }: { status: ReadingStatus }) {
  switch (status) {
    case 'reading':
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      )
    case 'planned':
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      )
    case 'completed':
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M20 6L9 17l-5-5" />
        </svg>
      )
    case 'hold':
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      )
    case 'dropped':
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      )
    case 'rereading':
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
          <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
        </svg>
      )
  }
}
