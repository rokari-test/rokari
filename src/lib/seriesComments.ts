import { canAccessAdminPanel, type UserPublic } from './userAuth'
import { recordCommentPosted } from './loyalty'

export const SERIES_COMMENTS_EVENT = 'sakura-series-comments'

const KEY = 'sakura-series-comments'
const MAX_BODY = 1200
const MAX_COMMENTS_PER_SERIES = 200

export interface SeriesComment {
  id: string
  seriesSlug: string
  userId: string
  authorName: string
  authorUsername: string
  avatarHue: number
  body: string
  createdAt: string
}

type CommentStore = Record<string, SeriesComment[]>

function dispatch() {
  window.dispatchEvent(new Event(SERIES_COMMENTS_EVENT))
}

function load(): CommentStore {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    return JSON.parse(raw) as CommentStore
  } catch {
    return {}
  }
}

function save(store: CommentStore) {
  localStorage.setItem(KEY, JSON.stringify(store))
  dispatch()
}

export function listSeriesComments(seriesSlug: string): SeriesComment[] {
  const items = load()[seriesSlug] ?? []
  return [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export function getSeriesCommentCount(seriesSlug: string): number {
  return load()[seriesSlug]?.length ?? 0
}

export function addSeriesComment(
  seriesSlug: string,
  user: UserPublic,
  body: string,
): { ok: true; comment: SeriesComment } | { ok: false; error: string } {
  const trimmed = body.trim()
  if (!trimmed) return { ok: false, error: 'Write something before posting.' }
  if (trimmed.length > MAX_BODY) {
    return { ok: false, error: `Comments are limited to ${MAX_BODY} characters.` }
  }

  const store = load()
  const list = store[seriesSlug] ?? []

  const comment: SeriesComment = {
    id: crypto.randomUUID(),
    seriesSlug,
    userId: user.id,
    authorName: user.displayName,
    authorUsername: user.username,
    avatarHue: user.avatarHue,
    body: trimmed,
    createdAt: new Date().toISOString(),
  }

  store[seriesSlug] = [comment, ...list].slice(0, MAX_COMMENTS_PER_SERIES)
  save(store)
  recordCommentPosted(user.id)
  return { ok: true, comment }
}

export function deleteSeriesComment(
  seriesSlug: string,
  commentId: string,
  user: UserPublic,
): boolean {
  const store = load()
  const list = store[seriesSlug]
  if (!list) return false

  const target = list.find((c) => c.id === commentId)
  if (!target) return false

  const canDelete =
    target.userId === user.id || canAccessAdminPanel(user.role)
  if (!canDelete) return false

  store[seriesSlug] = list.filter((c) => c.id !== commentId)
  save(store)
  return true
}

export function canDeleteSeriesComment(
  comment: SeriesComment,
  user: UserPublic | undefined,
): boolean {
  if (!user) return false
  return comment.userId === user.id || canAccessAdminPanel(user.role)
}
