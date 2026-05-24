import { useBookmarks } from '../hooks/useLibrary'
import { useUser } from '../hooks/useUser'
import { recordLibraryAdd } from '../lib/loyalty'
import './BookmarkButton.css'

interface BookmarkButtonProps {
  slug: string
  className?: string
  variant?: 'default' | 'kagane' | 'sqv' | 'rokari'
}

export function BookmarkButton({
  slug,
  className = '',
  variant = 'default',
}: BookmarkButtonProps) {
  const { toggle, isBookmarked } = useBookmarks()
  const { user } = useUser()
  const saved = isBookmarked(slug)

  const handleToggle = () => {
    if (!saved && user) recordLibraryAdd(user.id, slug)
    toggle(slug)
  }

  if (variant === 'rokari') {
    return (
      <button
        type="button"
        className={`bookmark-btn bookmark-btn--rokari${saved ? ' bookmark-btn--rokari-active' : ''} ${className}`.trim()}
        onClick={handleToggle}
        aria-pressed={saved}
        aria-label={saved ? 'Remove from library' : 'Add to library'}
      >
        <BookmarkIcon filled={saved} />
        {saved ? 'In library' : 'Library'}
      </button>
    )
  }

  if (variant === 'kagane' || variant === 'sqv') {
    const mod = variant === 'sqv' ? 'sqv' : 'kagane'
    return (
      <button
        type="button"
        className={`bookmark-btn bookmark-btn--${mod}${saved ? ` bookmark-btn--${mod}-active` : ''} ${className}`.trim()}
        onClick={handleToggle}
        aria-pressed={saved}
        aria-label={saved ? 'Remove from library' : 'Add to library'}
      >
        <BookmarkIcon filled={saved} />
        {saved ? 'In Library' : 'Add to Library'}
      </button>
    )
  }

  return (
    <button
      type="button"
      className={`bookmark-btn${saved ? ' bookmark-btn--active' : ''} ${className}`.trim()}
      onClick={handleToggle}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from library' : 'Add to library'}
    >
      {saved ? '★ In library' : '☆ Save to library'}
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
