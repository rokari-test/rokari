import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useChapterComments } from '../hooks/useChapterComments'
import { useUser } from '../hooks/useUser'
import {
  addChapterComment,
  addChapterCommentReply,
  canDeleteChapterComment,
  deleteChapterComment,
  getUserCommentVote,
  getUserReplyVote,
  toggleChapterCommentDislike,
  toggleChapterCommentLike,
  toggleChapterReplyDislike,
  toggleChapterReplyLike,
  type ChapterComment,
  type ChapterCommentReply,
} from '../lib/chapterComments'
import { formatRelativeActive, type UserPublic } from '../lib/userAuth'
import { UserLoyaltyTags } from './UserLoyaltyTags'
import { LiveUserAvatar } from './profile/LiveUserAvatar'
import { UserAvatar } from './profile/UserAvatar'
import type { Chapter, Series } from '../types'
import './SeriesCommentsPanel.css'

interface ChapterCommentsPanelProps {
  series: Series
  chapter: Chapter
  splitLayout?: boolean
  railLayout?: boolean
}

function ThumbUpIcon({ filled }: { filled?: boolean }) {
  return (
    <svg className="rok-comment-vote-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 10v12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 5.88 14 10h5.81a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ThumbDownIcon({ filled }: { filled?: boolean }) {
  return (
    <span className="rok-comment-vote-icon-flip" aria-hidden>
      <ThumbUpIcon filled={filled} />
    </span>
  )
}

function VoteBtn({
  label,
  count,
  active,
  onClick,
  variant,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
  variant: 'like' | 'dislike'
}) {
  return (
    <button
      type="button"
      className={`rok-comment-vote rok-comment-vote--${variant}${active ? ' is-active' : ''}`}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
    >
      {variant === 'like' ? <ThumbUpIcon filled={active} /> : <ThumbDownIcon filled={active} />}
      <span className="rok-comment-vote-count">{count}</span>
    </button>
  )
}

function ReplyBlock({
  seriesSlug,
  chapterNumber,
  commentId,
  reply,
  user,
  onChange,
}: {
  seriesSlug: string
  chapterNumber: number
  commentId: string
  reply: ChapterCommentReply
  user: UserPublic | null
  onChange: () => void
}) {
  const vote = user ? getUserReplyVote(reply, user.id) : null

  const voteClick = (kind: 'like' | 'dislike') => {
    if (!user) return
    if (kind === 'like') toggleChapterReplyLike(seriesSlug, chapterNumber, commentId, reply.id, user.id)
    else toggleChapterReplyDislike(seriesSlug, chapterNumber, commentId, reply.id, user.id)
    onChange()
  }

  return (
    <li className="rok-comment-reply">
      <LiveUserAvatar
        userId={reply.userId}
        size="sm"
        className="rok-comments-avatar rok-comments-avatar--sm"
        fallbackHue={reply.avatarHue}
        fallbackName={reply.authorName}
      />
      <div className="rok-comment-reply-body">
        <div className="rok-comments-meta">
          <Link to={`/users/${reply.userId}`} className="rok-comments-author">
            {reply.authorName}
          </Link>
          <span className="rok-comments-time">{formatRelativeActive(reply.createdAt)}</span>
        </div>
        <p className="rok-comments-text">{reply.body}</p>
        <div className="rok-comment-actions">
          <VoteBtn
            label="Like reply"
            count={reply.likes.length}
            active={vote === 'like'}
            variant="like"
            onClick={() => voteClick('like')}
          />
          <VoteBtn
            label="Dislike reply"
            count={reply.dislikes.length}
            active={vote === 'dislike'}
            variant="dislike"
            onClick={() => voteClick('dislike')}
          />
        </div>
      </div>
    </li>
  )
}

function CommentItem({
  comment,
  seriesSlug,
  chapterNumber,
  user,
  onDelete,
  onChange,
}: {
  comment: ChapterComment
  seriesSlug: string
  chapterNumber: number
  user: UserPublic | null
  onDelete: () => void
  onChange: () => void
}) {
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyBody, setReplyBody] = useState('')
  const [replyError, setReplyError] = useState<string | null>(null)
  const vote = user ? getUserCommentVote(comment, user.id) : null
  const canDelete = canDeleteChapterComment(comment, user ?? undefined)

  const voteClick = (kind: 'like' | 'dislike') => {
    if (!user) return
    if (kind === 'like') toggleChapterCommentLike(seriesSlug, chapterNumber, comment.id, user.id)
    else toggleChapterCommentDislike(seriesSlug, chapterNumber, comment.id, user.id)
    onChange()
  }

  const submitReply = (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    setReplyError(null)
    const result = addChapterCommentReply(seriesSlug, chapterNumber, comment.id, user, replyBody)
    if (!result.ok) {
      setReplyError(result.error)
      return
    }
    setReplyBody('')
    setReplyOpen(false)
    onChange()
  }

  return (
    <li className="rok-comments-item">
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
        <div className="rok-comment-actions">
          <VoteBtn
            label="Like"
            count={comment.likes.length}
            active={vote === 'like'}
            variant="like"
            onClick={() => voteClick('like')}
          />
          <VoteBtn
            label="Dislike"
            count={comment.dislikes.length}
            active={vote === 'dislike'}
            variant="dislike"
            onClick={() => voteClick('dislike')}
          />
          <button
            type="button"
            className="rok-comment-reply-btn"
            onClick={() => setReplyOpen((o) => !o)}
          >
            Reply{comment.replies.length > 0 ? ` · ${comment.replies.length}` : ''}
          </button>
        </div>
        {replyOpen ? (
          user ? (
            <form className="rok-comment-reply-form" onSubmit={submitReply}>
              <textarea
                className="rok-comments-input rok-comments-input--reply"
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="Write a reply…"
                rows={2}
                maxLength={1600}
              />
              {replyError ? <p className="rok-comments-error">{replyError}</p> : null}
              <div className="rok-comment-reply-form-actions">
                <button type="button" className="rok-comment-reply-cancel" onClick={() => setReplyOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="rok-comments-post" disabled={!replyBody.trim()}>
                  Reply
                </button>
              </div>
            </form>
          ) : (
            <p className="rok-comment-login-hint">
              <Link to="/login">Log in</Link> to reply.
            </p>
          )
        ) : null}
        {comment.replies.length > 0 ? (
          <ul
            className={`rok-comment-replies${comment.replies.length > 3 ? ' rok-comment-replies--scroll' : ''}`}
          >
            {comment.replies.map((reply) => (
              <ReplyBlock
                key={reply.id}
                seriesSlug={seriesSlug}
                chapterNumber={chapterNumber}
                commentId={comment.id}
                reply={reply}
                user={user}
                onChange={onChange}
              />
            ))}
          </ul>
        ) : null}
      </div>
      {canDelete ? (
        <button type="button" className="rok-comments-delete" onClick={onDelete} aria-label="Delete comment">
          ×
        </button>
      ) : null}
    </li>
  )
}

export function ChapterCommentsPanel({
  series,
  chapter,
  splitLayout = false,
  railLayout = false,
}: ChapterCommentsPanelProps) {
  const { user, isLoggedIn } = useUser()
  const { comments, refresh } = useChapterComments(series.slug, chapter.number)
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    setBody('')
    setError(null)
  }, [series.slug, chapter.number])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!user || !body.trim()) return
    setError(null)
    setPosting(true)
    const result = addChapterComment(series.slug, chapter.number, user, body)
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
    if (deleteChapterComment(series.slug, chapter.number, commentId, user)) {
      refresh()
    }
  }

  const compose = isLoggedIn && user ? (
    <form className="rok-comments-compose" onSubmit={handleSubmit}>
      <div className="rok-comments-compose-user">
        <UserAvatar user={user} size="sm" className="rok-comments-avatar" />
        <div className="rok-comments-compose-meta">
          <span className="rok-comments-compose-name">{user.displayName}</span>
          <UserLoyaltyTags userId={user.id} />
        </div>
      </div>
      <textarea
        className="rok-comments-input"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => e.stopPropagation()}
        placeholder={`Comment on chapter ${chapter.number}…`}
        rows={railLayout ? 4 : splitLayout ? 2 : 3}
        maxLength={1200}
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
      <p>Sign in to comment on this chapter.</p>
      <Link to="/login" className="rok-comments-signin-link">
        Log in
      </Link>
    </div>
  )

  const feed =
    comments.length === 0 ? (
      <p className="rok-comments-empty">No comments on this chapter yet. Start the thread.</p>
    ) : (
      <ul className="rok-comments-list">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            seriesSlug={series.slug}
            chapterNumber={chapter.number}
            user={user}
            onDelete={() => handleDelete(comment.id)}
            onChange={refresh}
          />
        ))}
      </ul>
    )

  if (splitLayout) {
    return (
      <div className={`rok-comments rok-comments--split${railLayout ? ' rok-comments--rail' : ''}`}>
        <div className="rok-comments-compose-wrap">{compose}</div>
        <div className="rok-comments-feed">{feed}</div>
      </div>
    )
  }

  return (
    <div className="rok-comments">
      <div className="rok-comments-head">
        <div>
          <p className="rok-comments-eyebrow">Chapter thread</p>
          <h3 className="rok-comments-title">
            Ch. {chapter.number} · {chapter.title}
          </h3>
        </div>
        <span className="rok-comments-count">{comments.length}</span>
      </div>
      {compose}
      {feed}
    </div>
  )
}
