import { Link } from 'react-router-dom'
import { formatCountdownClock } from '../lib/earlyAccess'
import './ChapterDeadline.css'

interface ChapterDeadlineProps {
  remainingMs: number
  planName?: string
}

export function ChapterDeadline({
  remainingMs,
  planName = 'Free',
}: ChapterDeadlineProps) {
  const clock = formatCountdownClock(remainingMs)

  return (
    <Link
      to="/store?tab=subscriptions"
      className="chapter-deadline"
      title={`${planName} — unlocks in ${clock}`}
      onClick={(e) => e.stopPropagation()}
    >
      <span className="chapter-deadline-icon" aria-hidden>
        <ClockIcon />
      </span>
      <span className="chapter-deadline-time">{clock}</span>
      <span className="chapter-deadline-plan">{planName}</span>
    </Link>
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
