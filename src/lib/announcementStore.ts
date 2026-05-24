import { announcements as SEED, type AnnouncementCategory } from '../data/announcements'

export const ANNOUNCEMENTS_EVENT = 'rokari-announcements'

const STORAGE_KEY = 'rokari-announcements'

export type AnnouncementBlock =
  | { id: string; type: 'heading'; text: string }
  | { id: string; type: 'paragraph'; text: string }
  | { id: string; type: 'image'; src: string; alt?: string; caption?: string }
  | { id: string; type: 'quote'; text: string }

export interface Announcement {
  id: string
  slug: string
  title: string
  preview: string
  body: string
  blocks: AnnouncementBlock[]
  coverImage?: string
  postedAt: string
  updatedAt?: string
  category: AnnouncementCategory
  pinned?: boolean
  published?: boolean
}

export function slugifyAnnouncement(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

export function bodyToBlocks(body: string): AnnouncementBlock[] {
  return body
    .split(/\n\n+/)
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text, index) => ({
      id: `p-${index}`,
      type: 'paragraph' as const,
      text,
    }))
}

function normalizeSeed(item: (typeof SEED)[number]): Announcement {
  const slug = 'slug' in item && item.slug ? String(item.slug) : item.id
  const blocks =
    'blocks' in item && Array.isArray(item.blocks) && item.blocks.length > 0
      ? (item.blocks as AnnouncementBlock[])
      : bodyToBlocks(item.body)
  return {
    id: item.id,
    slug,
    title: item.title,
    preview: item.preview,
    body: item.body,
    blocks,
    coverImage: 'coverImage' in item ? String(item.coverImage ?? '') || undefined : undefined,
    postedAt: item.postedAt,
    category: item.category,
    pinned: item.pinned,
    published: true,
  }
}

function seedDefaults(): Announcement[] {
  return SEED.map(normalizeSeed)
}

function dispatch() {
  window.dispatchEvent(new Event(ANNOUNCEMENTS_EVENT))
}

export function loadAnnouncements(): Announcement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const seeded = seedDefaults()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
      return seeded
    }
    const parsed = JSON.parse(raw) as Announcement[]
    return parsed.map((item) => ({
      ...item,
      blocks: item.blocks?.length ? item.blocks : bodyToBlocks(item.body),
      published: item.published !== false,
    }))
  } catch {
    return seedDefaults()
  }
}

export function saveAnnouncements(items: Announcement[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  dispatch()
}

export function getPublishedAnnouncements(): Announcement[] {
  return loadAnnouncements()
    .filter((a) => a.published !== false)
    .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
}

export function getAnnouncementBySlug(slug: string): Announcement | undefined {
  return loadAnnouncements().find((a) => a.slug === slug && a.published !== false)
}

export function getAnnouncementById(id: string): Announcement | undefined {
  return loadAnnouncements().find((a) => a.id === id)
}

export function upsertAnnouncement(input: Announcement): Announcement {
  const items = loadAnnouncements()
  const idx = items.findIndex((a) => a.id === input.id)
  const next: Announcement = {
    ...input,
    slug: input.slug.trim() || slugifyAnnouncement(input.title),
    blocks: input.blocks.length ? input.blocks : bodyToBlocks(input.body),
    updatedAt: new Date().toISOString(),
    published: input.published !== false,
  }
  if (idx >= 0) items[idx] = next
  else items.unshift(next)
  saveAnnouncements(items)
  return next
}

export function deleteAnnouncement(id: string) {
  saveAnnouncements(loadAnnouncements().filter((a) => a.id !== id))
}

export function newAnnouncementId(): string {
  return crypto.randomUUID()
}

export function newBlockId(): string {
  return crypto.randomUUID().slice(0, 8)
}

export function emptyAnnouncement(): Announcement {
  const now = new Date().toISOString()
  return {
    id: newAnnouncementId(),
    slug: '',
    title: '',
    preview: '',
    body: '',
    blocks: [{ id: newBlockId(), type: 'paragraph', text: '' }],
    postedAt: now,
    category: 'update',
    published: true,
  }
}
