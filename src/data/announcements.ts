export type AnnouncementCategory = 'update' | 'feature' | 'community' | 'event'

export type AnnouncementBlockSeed =
  | { id: string; type: 'heading'; text: string }
  | { id: string; type: 'paragraph'; text: string }
  | { id: string; type: 'image'; src: string; alt?: string; caption?: string }
  | { id: string; type: 'quote'; text: string }

export interface Announcement {
  id: string
  slug?: string
  title: string
  preview: string
  body: string
  blocks?: AnnouncementBlockSeed[]
  coverImage?: string
  postedAt: string
  category: AnnouncementCategory
  pinned?: boolean
}

export const ANNOUNCEMENT_CATEGORY_LABELS: Record<AnnouncementCategory, string> = {
  update: 'Update',
  feature: 'New feature',
  community: 'Community',
  event: 'Event',
}

export const announcements: Announcement[] = [
  {
    id: 'rokari-launch',
    slug: 'welcome-to-rokari',
    title: 'Welcome to Rokari',
    preview: 'Your new home for SFW manhwa & novels — library, bookmarks, and a cleaner reader.',
    body:
      'Rokari is live with a rebuilt catalog, chapter bookmarks, reading status in your library, and a moderation-friendly report flow. Browse with rich filters, track history on this device, and pick up where you left off from any series page.',
    blocks: [
      {
        id: 'h1',
        type: 'heading',
        text: 'A fresh start for readers',
      },
      {
        id: 'p1',
        type: 'paragraph',
        text:
          'Rokari is live with a rebuilt catalog, chapter bookmarks, reading status in your library, and a moderation-friendly report flow.',
      },
      {
        id: 'q1',
        type: 'quote',
        text: 'Pick up where you left off — on any series page, any chapter.',
      },
      {
        id: 'p2',
        type: 'paragraph',
        text:
          'Browse with rich filters, track history on this device, and bookmark individual chapters from the reader. More updates land here first.',
      },
    ],
    postedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    category: 'feature',
    pinned: true,
  },
  {
    id: 'chapter-bookmarks',
    title: 'Chapter bookmarks are here',
    preview: 'Pin individual chapters from the reader or chapter list — find them on your Bookmarks shelf.',
    body:
      'Tap Bookmark while reading or use the pin on any chapter row. Saved chapters group by series on the Bookmarks page so you can jump back fast. Works locally on your device for now.',
    postedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    category: 'feature',
  },
  {
    id: 'sfw-catalog',
    title: 'SFW catalog policy',
    preview: 'Browse and admin uploads now filter mature genres — Rokari stays safe-for-work.',
    body:
      'We expanded the SFW genre catalog for filters and the admin add-work picker. Blocked tags no longer appear in browse results. If you spot something that slipped through, use Reports on the series or chapter.',
    postedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    category: 'update',
  },
  {
    id: 'reports-flow',
    title: 'Member reports',
    preview: 'Flag a series or chapter from the app — track status under Reports in the menu.',
    body:
      'Signed-in members can submit reports for broken chapters, copyright concerns, duplicates, or rule violations. Open Reports to see your queue; moderators review everything from the admin panel.',
    postedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    category: 'community',
  },
  {
    id: 'admin-panel',
    title: 'Uploader tools',
    preview: 'Series, chapters, packages, and site settings — managed from the admin area.',
    body:
      'Uploaders and admins can sign in at /admin/login to manage the catalog, early-access chapters, coin packages, and subscriptions. Demo credentials are in the project README for local testing.',
    postedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    category: 'update',
  },
  {
    id: 'discord-soon',
    title: 'Community hub coming soon',
    preview: 'We are preparing a Rokari Discord for release alerts and reading clubs.',
    body:
      'Stay tuned for invites — we will post the link here first. Until then, check News for product updates and use Reports if you need to reach the team about content on the site.',
    postedAt: new Date(Date.now() - 18 * 86400000).toISOString(),
    category: 'event',
  },
]

export function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1) return 'Today'
  if (days === 1) return '1d ago'
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

export function formatNewsDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
