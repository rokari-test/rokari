export const USER_MEDIA_EVENT = 'sakura-user-media'

const KEY = 'sakura-user-media'

export interface UserMediaItem {
  id: string
  userId: string
  kind: 'avatar' | 'banner'
  dataUrl: string
  mimeType: string
  animated: boolean
  focalX: number
  focalY: number
  zoom: number
  createdAt: string
}

type MediaStore = Record<string, UserMediaItem>

function dispatch() {
  window.dispatchEvent(new Event(USER_MEDIA_EVENT))
}

function clampPercent(n: number): number {
  if (!Number.isFinite(n)) return 50
  return Math.min(100, Math.max(0, n))
}

function clampZoom(n: number): number {
  if (!Number.isFinite(n)) return 100
  return Math.min(220, Math.max(100, n))
}

function normalizeItem(raw: Partial<UserMediaItem> & Pick<UserMediaItem, 'id' | 'userId' | 'kind' | 'dataUrl' | 'mimeType' | 'animated' | 'createdAt'>): UserMediaItem {
  return {
    ...raw,
    focalX: clampPercent(raw.focalX ?? 50),
    focalY: clampPercent(raw.focalY ?? 50),
    zoom: clampZoom(raw.zoom ?? 100),
  }
}

function load(): MediaStore {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, Partial<UserMediaItem>>
    const store: MediaStore = {}
    for (const [id, item] of Object.entries(parsed)) {
      if (!item?.dataUrl) continue
      store[id] = normalizeItem({
        id,
        userId: item.userId ?? '',
        kind: item.kind ?? 'avatar',
        dataUrl: item.dataUrl,
        mimeType: item.mimeType ?? 'image/jpeg',
        animated: item.animated ?? false,
        focalX: item.focalX,
        focalY: item.focalY,
        zoom: item.zoom,
        createdAt: item.createdAt ?? new Date().toISOString(),
      })
    }
    return store
  } catch {
    return {}
  }
}

function save(store: MediaStore) {
  localStorage.setItem(KEY, JSON.stringify(store))
  dispatch()
}

export function getUserMedia(id: string | null | undefined): UserMediaItem | null {
  if (!id) return null
  return load()[id] ?? null
}

export function getUserMediaUrl(id: string | null | undefined): string | null {
  return getUserMedia(id)?.dataUrl ?? null
}

export function getProfileMediaImgStyle(item: Pick<UserMediaItem, 'focalX' | 'focalY' | 'zoom'> | null | undefined) {
  if (!item) return undefined
  const scale = clampZoom(item.zoom) / 100
  const x = clampPercent(item.focalX)
  const y = clampPercent(item.focalY)
  return {
    objectPosition: `${x}% ${y}%`,
    transform: scale > 1 ? `scale(${scale})` : undefined,
    transformOrigin: `${x}% ${y}%`,
  } as const
}

export function saveUserMedia(input: {
  userId: string
  kind: 'avatar' | 'banner'
  dataUrl: string
  mimeType: string
  animated: boolean
  focalX?: number
  focalY?: number
  zoom?: number
}): string {
  const id = crypto.randomUUID()
  const item = normalizeItem({
    id,
    userId: input.userId,
    kind: input.kind,
    dataUrl: input.dataUrl,
    mimeType: input.mimeType,
    animated: input.animated,
    focalX: input.focalX ?? 50,
    focalY: input.focalY ?? 50,
    zoom: input.zoom ?? 100,
    createdAt: new Date().toISOString(),
  })
  const store = load()
  store[id] = item
  save(store)
  return id
}

export function updateUserMediaTransform(
  id: string,
  patch: Partial<Pick<UserMediaItem, 'focalX' | 'focalY' | 'zoom'>>,
): UserMediaItem | null {
  const store = load()
  const item = store[id]
  if (!item) return null
  const next = normalizeItem({
    ...item,
    focalX: patch.focalX ?? item.focalX,
    focalY: patch.focalY ?? item.focalY,
    zoom: patch.zoom ?? item.zoom,
  })
  store[id] = next
  save(store)
  return next
}

export function deleteUserMedia(id: string | null | undefined) {
  if (!id) return
  const store = load()
  if (!store[id]) return
  delete store[id]
  save(store)
}

export function pruneUserMedia(userId: string, keepIds: string[]) {
  const keep = new Set(keepIds.filter(Boolean))
  const store = load()
  let changed = false
  for (const [id, item] of Object.entries(store)) {
    if (item.userId === userId && !keep.has(id)) {
      delete store[id]
      changed = true
    }
  }
  if (changed) save(store)
}
