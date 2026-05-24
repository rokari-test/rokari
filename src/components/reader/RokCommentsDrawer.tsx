import { ChapterCommentsPanel } from '../ChapterCommentsPanel'
import { useChapterComments } from '../../hooks/useChapterComments'
import type { Chapter, Series } from '../../types'
import './RokReaderOverlays.css'

interface RokCommentsDrawerProps {
  open: boolean
  series: Series
  chapter: Chapter
  onClose: () => void
}

export function RokCommentsDrawer({ open, series, chapter, onClose }: RokCommentsDrawerProps) {
  const { count } = useChapterComments(series.slug, chapter.number)

  if (!open) return null

  return (
    <aside className="rok-comments-rail" aria-label="Chapter comments">
      <header className="rok-comments-rail-head">
        <div>
          <p className="rok-comments-rail-kicker">{series.title}</p>
          <h2>
            Ch. {chapter.number} · {chapter.title}
          </h2>
          <p className="rok-comments-rail-sub">Chapter comments</p>
        </div>
        <div className="rok-comments-rail-head-actions">
          <span className="rok-comments-count rok-comments-count--rail">{count}</span>
          <button type="button" className="rok-comments-rail-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
      </header>
      <div className="rok-comments-rail-body">
        <ChapterCommentsPanel
          key={`${series.slug}-${chapter.number}`}
          series={series}
          chapter={chapter}
          splitLayout
          railLayout
        />
      </div>
    </aside>
  )
}
