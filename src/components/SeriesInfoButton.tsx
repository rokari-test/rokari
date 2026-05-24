import { useSeriesQuickViewOptional } from '../context/SeriesQuickViewContext'
import './SeriesInfoButton.css'

interface SeriesInfoButtonProps {
  slug: string
  className?: string
  label?: string
}

export function SeriesInfoButton({
  slug,
  className = '',
  label = 'Quick info',
}: SeriesInfoButtonProps) {
  const quickView = useSeriesQuickViewOptional()

  if (!quickView) return null

  return (
    <button
      type="button"
      className={`series-info-btn ${className}`.trim()}
      aria-label={label}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        quickView.openQuickView(slug)
      }}
    >
      <InfoIcon />
    </button>
  )
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 11v5M12 8h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
