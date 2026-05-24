import type { Series } from '../types'
import { useEarlyAccessTick } from '../hooks/useEarlyAccessTick'
import { SeriesUpdateCard } from './SeriesUpdateCard'
import './SeriesUpdateFeed.css'

interface SeriesUpdateFeedProps {
  series: Series[]
}

export function SeriesUpdateFeed({ series }: SeriesUpdateFeedProps) {
  const tick = useEarlyAccessTick(true)
  const visible = series.filter((s) => s.chapters.length > 0)
  if (visible.length === 0) return null

  return (
    <div className="update-feed-grid">
      {visible.map((s) => (
        <SeriesUpdateCard key={s.id} series={s} tick={tick} />
      ))}
    </div>
  )
}
