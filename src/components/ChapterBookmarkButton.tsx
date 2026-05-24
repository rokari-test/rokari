import type { MouseEvent } from 'react'
import { useChapterBookmarks } from '../hooks/useLibrary'
import { useUser } from '../hooks/useUser'
import { useAuthPrompt } from '../context/AuthPromptContext'
import './ChapterBookmarkButton.css'

interface ChapterBookmarkButtonProps {
  slug: string
  chapterNumber: number
  chapterTitle: string
  variant?: 'reader' | 'chapter-row' | 'icon'
  className?: string
}

export function ChapterBookmarkButton({
  slug,
  chapterNumber,
  chapterTitle,
  variant = 'icon',
  className = '',
}: ChapterBookmarkButtonProps) {
  const { user } = useUser()
  const { promptAuth } = useAuthPrompt()
  const { isBookmarked, toggle } = useChapterBookmarks()
  const saved = isBookmarked(slug, chapterNumber)

  const label = saved ? 'Remove chapter bookmark' : 'Bookmark this chapter'

  const handleClick = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      promptAuth('bookmark')
      return
    }
    toggle(slug, chapterNumber, chapterTitle)
  }

  if (variant === 'reader') {
    return (
      <button
        type="button"
        className={`chapter-bookmark-btn chapter-bookmark-btn--reader${saved ? ' is-saved' : ''} ${className}`.trim()}
        onClick={handleClick}
        aria-pressed={saved}
        aria-label={label}
        title={label}
      >
        <BookmarkIcon filled={saved} />
        <span>{saved ? 'Saved' : 'Bookmark'}</span>
      </button>
    )
  }

  if (variant === 'chapter-row') {
    return (
      <button
        type="button"
        className={`chapter-bookmark-btn chapter-bookmark-btn--row${saved ? ' is-saved' : ''} ${className}`.trim()}
        onClick={handleClick}
        aria-pressed={saved}
        aria-label={label}
        title={label}
      >
        <BookmarkIcon filled={saved} />
      </button>
    )
  }

  return (
    <button
      type="button"
      className={`chapter-bookmark-btn chapter-bookmark-btn--icon${saved ? ' is-saved' : ''} ${className}`.trim()}
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={label}
      title={label}
    >
      <BookmarkIcon filled={saved} />
    </button>
  )
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  )
}
