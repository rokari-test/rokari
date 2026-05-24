import './StarRating.css'

interface StarRatingProps {
  value: number | null | undefined
  onChange?: (value: number | null) => void
  max?: number
  size?: 'sm' | 'md'
  label?: string
  readOnly?: boolean
}

function StarGlyph({ filled, size }: { filled: boolean; size: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 16 : 20
  return (
    <svg width={dim} height={dim} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  )
}

export function StarRating({
  value,
  onChange,
  max = 5,
  size = 'md',
  label,
  readOnly = false,
}: StarRatingProps) {
  const current =
    value != null && value > 0
      ? value > 5
        ? Math.min(max, Math.round(value / 2))
        : Math.min(max, Math.round(value))
      : 0

  return (
    <div
      className={`star-rating star-rating--${size}${readOnly ? ' star-rating--readonly' : ''}`}
      role="group"
      aria-label={label ?? (readOnly ? 'Rating' : 'Your rating')}
    >
      {label ? <span className="star-rating-label">{label}</span> : null}
      <div className="star-rating-stars">
        {Array.from({ length: max }, (_, index) => {
          const star = index + 1
          const filled = star <= current

          if (readOnly) {
            return (
              <span
                key={star}
                className={`star-rating-star${filled ? ' is-filled' : ''}`}
                aria-hidden={!filled}
              >
                <StarGlyph filled={filled} size={size} />
              </span>
            )
          }

          return (
            <button
              key={star}
              type="button"
              className={`star-rating-star${filled ? ' is-filled' : ''}`}
              aria-label={`Rate ${star} out of ${max}`}
              aria-pressed={filled}
              onClick={() => onChange?.(current === star ? null : star)}
            >
              <StarGlyph filled={filled} size={size} />
            </button>
          )
        })}
      </div>
      {current > 0 ? <span className="star-rating-value">{current}/{max}</span> : null}
    </div>
  )
}
