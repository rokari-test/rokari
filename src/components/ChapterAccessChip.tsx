import { Link } from 'react-router-dom'
import type { MouseEvent } from 'react'
import { formatCountdownClock } from '../lib/earlyAccess'
import './ChapterAccessChip.css'

interface ChapterAccessChipProps {
  mode: 'coins' | 'timer' | 'read'
  coinPrice?: number
  remainingMs?: number
  planName?: string
  readHref?: string
  onUnlock?: (e: MouseEvent<HTMLButtonElement>) => void
  onSubscribePrompt?: (e: MouseEvent<HTMLButtonElement>) => void
  compact?: boolean
  className?: string
}

export function ChapterAccessChip({
  mode,
  coinPrice = 0,
  remainingMs = 0,
  planName,
  readHref = '#',
  onUnlock,
  onSubscribePrompt,
  compact = false,
  className = '',
}: ChapterAccessChipProps) {
  const sizeClass = compact ? ' access-chip--compact' : ''

  if (mode === 'coins') {
    return (
      <button
        type="button"
        className={`access-chip access-chip--coins${sizeClass}${className ? ` ${className}` : ''}`}
        title={`Unlock for ${coinPrice} coins`}
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onUnlock?.(e)
        }}
      >
        <span className="access-chip-icon" aria-hidden>
          <CoinIcon />
        </span>
        <span className="access-chip-text">
          <strong>{coinPrice}</strong>
          <span>coins</span>
        </span>
      </button>
    )
  }

  if (mode === 'timer') {
    const clock = formatCountdownClock(remainingMs)
    return (
      <button
        type="button"
        className={`access-chip access-chip--timer${sizeClass}${className ? ` ${className}` : ''}`}
        title={planName ? `${planName} — ${clock}` : clock}
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onSubscribePrompt?.(e)
        }}
      >
        <span className="access-chip-icon" aria-hidden>
          <ClockIcon />
        </span>
        <span className="access-chip-text access-chip-text--clock">
          <strong>{clock}</strong>
        </span>
      </button>
    )
  }

  return (
    <Link
      to={readHref}
      className={`access-chip access-chip--read${sizeClass}${className ? ` ${className}` : ''}`}
      aria-label="Read chapter"
      onClick={(e) => e.stopPropagation()}
    >
      <span className="access-chip-icon" aria-hidden>
        <BookIcon />
      </span>
    </Link>
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

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}
