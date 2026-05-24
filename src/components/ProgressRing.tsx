import type { CSSProperties } from 'react'
import './ProgressRing.css'

interface ProgressRingProps {
  pct: number
  className?: string
  size?: 'sm' | 'md'
}

const R = 15.5
const C = 2 * Math.PI * R

export function ProgressRing({ pct, className = '', size = 'md' }: ProgressRingProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(pct)))
  const offset = C - (C * clamped) / 100

  return (
    <div
      className={`progress-ring progress-ring--${size}${className ? ` ${className}` : ''}`}
      role="img"
      aria-label={`${clamped} percent`}
    >
      <svg viewBox="0 0 36 36" aria-hidden>
        <circle className="progress-ring-track" cx="18" cy="18" r={R} />
        <circle
          className="progress-ring-fill"
          cx="18"
          cy="18"
          r={R}
          style={
            {
              strokeDasharray: C,
              strokeDashoffset: offset,
            } as CSSProperties
          }
        />
      </svg>
    </div>
  )
}
