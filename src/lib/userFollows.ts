export const USER_FOLLOWS_EVENT = 'sakura-user-follows'

const KEY = 'sakura-user-follows'

interface FollowStore {
  /** userId -> list of userIds they follow */
  following: Record<string, string[]>
}

function emptyStore(): FollowStore {
  return { following: {} }
}

function dispatch() {
  window.dispatchEvent(new Event(USER_FOLLOWS_EVENT))
}

function load(): FollowStore {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyStore()
    const parsed = JSON.parse(raw) as FollowStore
    return { following: parsed.following ?? {} }
  } catch {
    return emptyStore()
  }
}

function save(store: FollowStore) {
  localStorage.setItem(KEY, JSON.stringify(store))
  dispatch()
}

function unique(ids: string[]) {
  return [...new Set(ids)]
}

export function getFollowingIds(userId: string): string[] {
  return load().following[userId] ?? []
}

export function getFollowerIds(userId: string): string[] {
  const store = load()
  return Object.entries(store.following)
    .filter(([, list]) => list.includes(userId))
    .map(([followerId]) => followerId)
}

export function getFollowCounts(userId: string) {
  return {
    followers: getFollowerIds(userId).length,
    following: getFollowingIds(userId).length,
  }
}

export function isFollowing(viewerId: string | null, targetId: string): boolean {
  if (!viewerId || viewerId === targetId) return false
  return getFollowingIds(viewerId).includes(targetId)
}

export function followUser(viewerId: string, targetId: string): boolean {
  if (!viewerId || viewerId === targetId) return false
  const store = load()
  const list = store.following[viewerId] ?? []
  if (list.includes(targetId)) return false
  store.following[viewerId] = unique([...list, targetId])
  save(store)
  return true
}

export function unfollowUser(viewerId: string, targetId: string): boolean {
  if (!viewerId) return false
  const store = load()
  const list = store.following[viewerId] ?? []
  if (!list.includes(targetId)) return false
  store.following[viewerId] = list.filter((id) => id !== targetId)
  save(store)
  return true
}

export function toggleFollow(viewerId: string, targetId: string): boolean {
  if (isFollowing(viewerId, targetId)) {
    unfollowUser(viewerId, targetId)
    return false
  }
  followUser(viewerId, targetId)
  return true
}
