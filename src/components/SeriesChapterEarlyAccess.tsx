import { Link } from 'react-router-dom'
import { formatCountdownClock } from '../lib/earlyAccess'
import './SeriesChapterEarlyAccess.css'

interface SeriesChapterEarlyAccessProps {
  remainingMs: number
  planLabel: string
  coinPrice: number
  storeHref: string
}

export function SeriesChapterEarlyAccess({
  remainingMs,
  planLabel,
  coinPrice,
  storeHref,
}: SeriesChapterEarlyAccessProps) {
  const clock = formatCountdownClock(remainingMs)

  return (
    <div className="series-early-access" role="group" aria-label="Chapter unlock options">
      <Link
        to="/store?tab=subscriptions"
        className="series-early-pill series-early-pill--wait"
        title={`${planLabel} — free in ${clock}`}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="series-early-pill__icon" aria-hidden>
          <ClockIcon />
        </span>
        <span className="series-early-pill__body">
          <span className="series-early-pill__time">{clock}</span>
          <span className="series-early-pill__meta">{planLabel}</span>
        </span>
      </Link>

      <Link
        to={storeHref}
        className="series-early-pill series-early-pill--coins"
        title={`Unlock now for ${coinPrice} coins`}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="series-early-pill__icon" aria-hidden>
          <CoinIcon />
        </span>
        <span className="series-early-pill__body">
          <strong>{coinPrice}</strong>
          <span className="series-early-pill__meta">coins</span>
        </span>
      </Link>
    </div>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}

function CoinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 0 1 0 4H8" />
      <path d="M12 18V6" />
    </svg>
  )
}
