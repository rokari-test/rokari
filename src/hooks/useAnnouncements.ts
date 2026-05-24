import { useEffect, useState } from 'react'
import {
  ANNOUNCEMENTS_EVENT,
  getAnnouncementBySlug,
  getPublishedAnnouncements,
  loadAnnouncements,
  type Announcement,
} from '../lib/announcementStore'

function useAnnouncementsSync() {
  const [, tick] = useState(0)
  useEffect(() => {
    const refresh = () => tick((t) => t + 1)
    window.addEventListener(ANNOUNCEMENTS_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(ANNOUNCEMENTS_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])
}

export function usePublishedAnnouncements(): Announcement[] {
  useAnnouncementsSync()
  return getPublishedAnnouncements()
}

export function useAllAnnouncements(): Announcement[] {
  useAnnouncementsSync()
  return loadAnnouncements()
}

export function useAnnouncementBySlug(slug: string | undefined): Announcement | undefined {
  useAnnouncementsSync()
  if (!slug) return undefined
  return getAnnouncementBySlug(slug)
}
