export const CACHE_EVENT = 'inkscroll-cache'

export interface CacheEntry {
  id: string
  title: string
  description: string
  storageKey: string
  ttlLabel: string
}

export const CACHE_ENTRIES: CacheEntry[] = [
  {
    id: 'catalog',
    title: 'Catalog',
    description: 'Series and chapter metadata for browse and home.',
    storageKey: 'inkscroll-catalog',
    ttlLabel: 'Until cleared',
  },
  {
    id: 'library',
    title: 'Library & progress',
    description: 'Bookmarks, continue reading, and recent titles.',
    storageKey: 'readdex-library',
    ttlLabel: 'Persistent',
  },
  {
    id: 'prefs',
    title: 'Preferences',
    description: 'Theme, filters, and display settings.',
    storageKey: 'inkscroll-preferences',
    ttlLabel: 'Persistent',
  },
  {
    id: 'users',
    title: 'Accounts',
    description: 'Local user accounts and sessions (demo).',
    storageKey: 'sakura-users',
    ttlLabel: 'Persistent',
  },
  {
    id: 'user-media',
    title: 'Profile media',
    description: 'Avatar and banner uploads for user profiles.',
    storageKey: 'sakura-user-media',
    ttlLabel: 'Persistent',
  },
  {
    id: 'user-follows',
    title: 'Follows',
    description: 'Follower and following relationships.',
    storageKey: 'sakura-user-follows',
    ttlLabel: 'Persistent',
  },
  {
    id: 'genres',
    title: 'Genre preferences',
    description: 'Highlight and exclude lists from settings.',
    storageKey: 'inkscroll-preferences',
    ttlLabel: 'With preferences',
  },
]

function dispatch() {
  window.dispatchEvent(new Event(CACHE_EVENT))
}

export function clearCacheEntry(id: string) {
  const entry = CACHE_ENTRIES.find((e) => e.id === id)
  if (!entry) return
  localStorage.removeItem(entry.storageKey)
  dispatch()
}

export function clearAllCaches() {
  const keys = new Set(CACHE_ENTRIES.map((e) => e.storageKey))
  keys.forEach((k) => localStorage.removeItem(k))
  dispatch()
}

export function refreshAllCaches() {
  dispatch()
}
