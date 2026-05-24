import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useSeriesComments } from '../hooks/useSeriesComments'
import { useUser } from '../hooks/useUser'
import {
  addSeriesComment,
  canDeleteSeriesComment,
  deleteSeriesComment,
} from '../lib/seriesComments'
import { formatRelativeActive } from '../lib/userAuth'
import { UserLoyaltyTags } from './UserLoyaltyTags'
import { LiveUserAvatar } from './profile/LiveUserAvatar'
import { UserAvatar } from './profile/UserAvatar'
import type { Series } from '../types'
import './SeriesCommentsPanel.css'

interface SeriesCommentsPanelProps {
  series: Series
}

export function SeriesCommentsPanel({ series }: SeriesCommentsPanelProps) {
  const { user, isLoggedIn } = useUser()
  const { comments, refresh } = useSeriesComments(series.slug)
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    setError(null)
    setPosting(true)
    const result = addSeriesComment(series.slug, user, body)
    setPosting(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setBody('')
    refresh()
  }

  const handleDelete = (commentId: string) => {
    if (!user) return
    if (deleteSeriesComment(series.slug, commentId, user)) {
      refresh()
    }
  }

  return (
    <div className="rok-comments">
      <div className="rok-comments-head">
        <div>
          <p className="rok-comments-eyebrow">Rokari lounge</p>
          <h3 className="rok-comments-title">Comments</h3>
        </div>
        <span className="rok-comments-count">{comments.length}</span>
      </div>

      {isLoggedIn && user ? (
        <form className="rok-comments-compose" onSubmit={handleSubmit}>
          <div className="rok-comments-compose-user">
            <UserAvatar user={user} size="sm" className="rok-comments-avatar" />
            <span className="rok-comments-compose-name">{user.displayName}</span>
            <UserLoyaltyTags userId={user.id} />
          </div>
          <textarea
            className="rok-comments-input"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share your thoughts on this series…"
            rows={3}
            maxLength={1200}
            required
          />
          {error ? <p className="rok-comments-error">{error}</p> : null}
          <div className="rok-comments-compose-actions">
            <span className="rok-comments-limit">{body.length}/1200</span>
            <button type="submit" className="rok-comments-post" disabled={posting || !body.trim()}>
              {posting ? 'Posting…' : 'Post comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="rok-comments-signin">
          <p>Sign in to join the discussion.</p>
          <Link to="/login" className="rok-comments-signin-link">
            Log in
          </Link>
        </div>
      )}

      {comments.length === 0 ? (
        <p className="rok-comments-empty">No comments yet. Be the first to start the thread.</p>
      ) : (
        <ul className="rok-comments-list">
          {comments.map((comment) => (
            <li key={comment.id} className="rok-comments-item">
              <LiveUserAvatar
                userId={comment.userId}
                size="sm"
                className="rok-comments-avatar"
                fallbackHue={comment.avatarHue}
                fallbackName={comment.authorName}
              />
              <div className="rok-comments-body">
                <div className="rok-comments-meta">
                  <Link to={`/users/${comment.userId}`} className="rok-comments-author">
                    {comment.authorName}
                  </Link>
                  <UserLoyaltyTags userId={comment.userId} />
                  <span className="rok-comments-time">{formatRelativeActive(comment.createdAt)}</span>
                </div>
                <p className="rok-comments-text">{comment.body}</p>
              </div>
              {canDeleteSeriesComment(comment, user ?? undefined) ? (
                <button
                  type="button"
                  className="rok-comments-delete"
                  onClick={() => handleDelete(comment.id)}
                  aria-label="Delete comment"
                >
                  ×
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
