import { canAccessAdminPanel, type UserPublic } from './userAuth'
import { recordCommentPosted } from './loyalty'

export const CHAPTER_COMMENTS_EVENT = 'sakura-chapter-comments'

const KEY = 'sakura-chapter-comments'
const MAX_BODY = 1200
const MAX_REPLY_BODY = 1600
const MAX_COMMENTS_PER_CHAPTER = 200
const MAX_REPLIES_PER_COMMENT = 80

export interface ChapterCommentReply {
  id: string
  userId: string
  authorName: string
  authorUsername: string
  avatarHue: number
  body: string
  createdAt: string
  likes: string[]
  dislikes: string[]
}

export interface ChapterComment {
  id: string
  seriesSlug: string
  chapterNumber: number
  userId: string
  authorName: string
  authorUsername: string
  avatarHue: number
  body: string
  createdAt: string
  likes: string[]
  dislikes: string[]
  replies: ChapterCommentReply[]
}

type CommentStore = Record<string, ChapterComment[]>

export type CommentVote = 'like' | 'dislike' | null

export function chapterCommentKey(seriesSlug: string, chapterNumber: number): string {
  return `${seriesSlug}::${chapterNumber}`
}

function dispatch() {
  window.dispatchEvent(new Event(CHAPTER_COMMENTS_EVENT))
}

function normalizeReply(r: ChapterCommentReply): ChapterCommentReply {
  return {
    ...r,
    likes: r.likes ?? [],
    dislikes: r.dislikes ?? [],
  }
}

function normalizeComment(c: ChapterComment): ChapterComment {
  return {
    ...c,
    likes: c.likes ?? [],
    dislikes: c.dislikes ?? [],
    replies: (c.replies ?? []).map(normalizeReply),
  }
}

function load(): CommentStore {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as CommentStore
    const out: CommentStore = {}
    for (const [k, list] of Object.entries(parsed)) {
      out[k] = list.map(normalizeComment)
    }
    return out
  } catch {
    return {}
  }
}

function save(store: CommentStore) {
  localStorage.setItem(KEY, JSON.stringify(store))
  dispatch()
}

function findComment(store: CommentStore, key: string, commentId: string) {
  const list = store[key]
  if (!list) return null
  const comment = list.find((c) => c.id === commentId)
  return comment ?? null
}

export function listChapterComments(
  seriesSlug: string,
  chapterNumber: number,
): ChapterComment[] {
  const items = load()[chapterCommentKey(seriesSlug, chapterNumber)] ?? []
  return [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export function getChapterCommentCount(seriesSlug: string, chapterNumber: number): number {
  return load()[chapterCommentKey(seriesSlug, chapterNumber)]?.length ?? 0
}

export function getUserCommentVote(comment: ChapterComment, userId: string): CommentVote {
  if (comment.likes.includes(userId)) return 'like'
  if (comment.dislikes.includes(userId)) return 'dislike'
  return null
}

export function getUserReplyVote(reply: ChapterCommentReply, userId: string): CommentVote {
  if (reply.likes.includes(userId)) return 'like'
  if (reply.dislikes.includes(userId)) return 'dislike'
  return null
}

function toggleVote(likes: string[], dislikes: string[], userId: string, vote: 'like' | 'dislike') {
  const hasLike = likes.includes(userId)
  const hasDislike = dislikes.includes(userId)
  if (vote === 'like') {
    if (hasLike) return { likes: likes.filter((id) => id !== userId), dislikes }
    return { likes: [...likes, userId], dislikes: dislikes.filter((id) => id !== userId) }
  }
  if (hasDislike) return { likes, dislikes: dislikes.filter((id) => id !== userId) }
  return { likes: likes.filter((id) => id !== userId), dislikes: [...dislikes, userId] }
}

export function toggleChapterCommentLike(
  seriesSlug: string,
  chapterNumber: number,
  commentId: string,
  userId: string,
): boolean {
  const store = load()
  const key = chapterCommentKey(seriesSlug, chapterNumber)
  const comment = findComment(store, key, commentId)
  if (!comment) return false
  const next = toggleVote(comment.likes, comment.dislikes, userId, 'like')
  comment.likes = next.likes
  comment.dislikes = next.dislikes
  save(store)
  return true
}

export function toggleChapterCommentDislike(
  seriesSlug: string,
  chapterNumber: number,
  commentId: string,
  userId: string,
): boolean {
  const store = load()
  const key = chapterCommentKey(seriesSlug, chapterNumber)
  const comment = findComment(store, key, commentId)
  if (!comment) return false
  const next = toggleVote(comment.likes, comment.dislikes, userId, 'dislike')
  comment.likes = next.likes
  comment.dislikes = next.dislikes
  save(store)
  return true
}

export function toggleChapterReplyLike(
  seriesSlug: string,
  chapterNumber: number,
  commentId: string,
  replyId: string,
  userId: string,
): boolean {
  const store = load()
  const key = chapterCommentKey(seriesSlug, chapterNumber)
  const comment = findComment(store, key, commentId)
  if (!comment) return false
  const reply = comment.replies.find((r) => r.id === replyId)
  if (!reply) return false
  const next = toggleVote(reply.likes, reply.dislikes, userId, 'like')
  reply.likes = next.likes
  reply.dislikes = next.dislikes
  save(store)
  return true
}

export function toggleChapterReplyDislike(
  seriesSlug: string,
  chapterNumber: number,
  commentId: string,
  replyId: string,
  userId: string,
): boolean {
  const store = load()
  const key = chapterCommentKey(seriesSlug, chapterNumber)
  const comment = findComment(store, key, commentId)
  if (!comment) return false
  const reply = comment.replies.find((r) => r.id === replyId)
  if (!reply) return false
  const next = toggleVote(reply.likes, reply.dislikes, userId, 'dislike')
  reply.likes = next.likes
  reply.dislikes = next.dislikes
  save(store)
  return true
}

export function addChapterComment(
  seriesSlug: string,
  chapterNumber: number,
  user: UserPublic,
  body: string,
): { ok: true; comment: ChapterComment } | { ok: false; error: string } {
  const trimmed = body.trim()
  if (!trimmed) return { ok: false, error: 'Write something before posting.' }
  if (trimmed.length > MAX_BODY) {
    return { ok: false, error: `Comments are limited to ${MAX_BODY} characters.` }
  }

  const store = load()
  const key = chapterCommentKey(seriesSlug, chapterNumber)
  const list = store[key] ?? []

  const comment: ChapterComment = {
    id: crypto.randomUUID(),
    seriesSlug,
    chapterNumber,
    userId: user.id,
    authorName: user.displayName,
    authorUsername: user.username,
    avatarHue: user.avatarHue,
    body: trimmed,
    createdAt: new Date().toISOString(),
    likes: [],
    dislikes: [],
    replies: [],
  }

  store[key] = [comment, ...list].slice(0, MAX_COMMENTS_PER_CHAPTER)
  save(store)
  recordCommentPosted(user.id)
  return { ok: true, comment }
}

export function addChapterCommentReply(
  seriesSlug: string,
  chapterNumber: number,
  commentId: string,
  user: UserPublic,
  body: string,
): { ok: true; reply: ChapterCommentReply } | { ok: false; error: string } {
  const trimmed = body.trim()
  if (!trimmed) return { ok: false, error: 'Write a reply before posting.' }
  if (trimmed.length > MAX_REPLY_BODY) {
    return { ok: false, error: `Replies are limited to ${MAX_REPLY_BODY} characters.` }
  }

  const store = load()
  const key = chapterCommentKey(seriesSlug, chapterNumber)
  const comment = findComment(store, key, commentId)
  if (!comment) return { ok: false, error: 'Comment not found.' }

  const reply: ChapterCommentReply = {
    id: crypto.randomUUID(),
    userId: user.id,
    authorName: user.displayName,
    authorUsername: user.username,
    avatarHue: user.avatarHue,
    body: trimmed,
    createdAt: new Date().toISOString(),
    likes: [],
    dislikes: [],
  }

  comment.replies = [...comment.replies, reply].slice(-MAX_REPLIES_PER_COMMENT)
  save(store)
  recordCommentPosted(user.id)
  return { ok: true, reply }
}

export function deleteChapterComment(
  seriesSlug: string,
  chapterNumber: number,
  commentId: string,
  user: UserPublic,
): boolean {
  const store = load()
  const key = chapterCommentKey(seriesSlug, chapterNumber)
  const list = store[key]
  if (!list) return false

  const target = list.find((c) => c.id === commentId)
  if (!target) return false

  const canDelete = target.userId === user.id || canAccessAdminPanel(user.role)
  if (!canDelete) return false

  store[key] = list.filter((c) => c.id !== commentId)
  save(store)
  return true
}

export function canDeleteChapterComment(
  comment: ChapterComment,
  user: UserPublic | undefined,
): boolean {
  if (!user) return false
  return comment.userId === user.id || canAccessAdminPanel(user.role)
}
