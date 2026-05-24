import { SERIES_SOURCE_OPTIONS } from '../lib/sources'
import type { SeriesSource } from '../types'

interface SeriesSourceSelectProps {
  value?: SeriesSource
  onChange: (value: SeriesSource | undefined) => void
  id?: string
  className?: string
}

export function SeriesSourceSelect({
  value,
  onChange,
  id,
  className,
}: SeriesSourceSelectProps) {
  return (
    <select
      id={id}
      className={className}
      value={value ?? ''}
      onChange={(e) => {
        const next = e.target.value
        onChange(next ? (next as SeriesSource) : undefined)
      }}
    >
      <option value="">None (optional)</option>
      {SERIES_SOURCE_OPTIONS.map((source) => (
        <option key={source} value={source}>
          {source}
        </option>
      ))}
    </select>
  )
}
