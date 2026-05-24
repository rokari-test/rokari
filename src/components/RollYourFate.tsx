import { Link } from 'react-router-dom'
import type { Series } from '../types'
import { SeriesCard } from './SeriesCard'
import './RollYourFate.css'

interface RollYourFateProps {
  open: boolean
  picks: Series[]
  onClose: () => void
  onReroll: () => void
}

export function RollYourFate({ open, picks, onClose, onReroll }: RollYourFateProps) {
  if (!open) return null

  return (
    <div className="fate-overlay" role="dialog" aria-modal="true" aria-labelledby="fate-title">
      <button type="button" className="fate-backdrop" aria-label="Close" onClick={onClose} />
      <div className="fate-modal">
        <header className="fate-header">
          <div>
            <h2 id="fate-title">Roll Your Fate</h2>
            <p>Four series the universe chose for you</p>
          </div>
          <button type="button" className="fate-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <div className="fate-grid">
          {picks.map((s) => (
            <SeriesCard key={s.id} series={s} />
          ))}
        </div>
        <footer className="fate-footer">
          <button type="button" className="promo-btn promo-btn--glow" onClick={onReroll}>
            Roll again
          </button>
          <Link to="/browse" className="fate-browse" onClick={onClose}>
            Browse full library →
          </Link>
        </footer>
      </div>
    </div>
  )
}

