export const READER_TOOLBAR_EVENT = 'sakura-reader-toolbar'

export type ToolbarActionId =
  | 'home'
  | 'series'
  | 'jumpTop'
  | 'jumpBottom'
  | 'chapters'
  | 'comments'
  | 'fullscreen'
  | 'autoScroll'
  | 'bookmark'
  | 'settings'
  | 'zoomOut'
  | 'zoomIn'

export const TOOLBAR_ACTIONS: {
  id: ToolbarActionId
  label: string
  hint: string
}[] = [
  { id: 'home', label: 'Home', hint: 'Back to homepage' },
  { id: 'series', label: 'Series page', hint: 'Open series reel' },
  { id: 'jumpTop', label: 'Jump top', hint: 'Scroll to top' },
  { id: 'jumpBottom', label: 'Jump bottom', hint: 'Scroll to bottom' },
  { id: 'chapters', label: 'Chapter list', hint: 'Browse all chapters' },
  { id: 'comments', label: 'Comments', hint: 'Rokari lounge' },
  { id: 'fullscreen', label: 'Fullscreen', hint: 'Toggle fullscreen' },
  { id: 'autoScroll', label: 'Auto-scroll', hint: 'Hands-free reading' },
  { id: 'bookmark', label: 'Bookmark', hint: 'Save this chapter' },
  { id: 'settings', label: 'Settings', hint: 'Reader control panel' },
  { id: 'zoomOut', label: 'Zoom out', hint: 'Decrease zoom' },
  { id: 'zoomIn', label: 'Zoom in', hint: 'Increase zoom' },
]

const DEFAULT_VISIBLE: ToolbarActionId[] = [
  'chapters',
  'comments',
  'autoScroll',
  'bookmark',
  'settings',
]

const KEY = 'sakura-reader-toolbar'

function dispatch() {
  window.dispatchEvent(new Event(READER_TOOLBAR_EVENT))
}

export function loadToolbarPrefs(): ToolbarActionId[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return [...DEFAULT_VISIBLE]
    const parsed = JSON.parse(raw) as ToolbarActionId[]
    return TOOLBAR_ACTIONS.map((a) => a.id).filter((id) => parsed.includes(id))
  } catch {
    return [...DEFAULT_VISIBLE]
  }
}

export function saveToolbarPrefs(visible: ToolbarActionId[]) {
  const allowed = new Set(TOOLBAR_ACTIONS.map((a) => a.id))
  const next = visible.filter((id) => allowed.has(id))
  localStorage.setItem(KEY, JSON.stringify(next))
  dispatch()
}

export function isToolbarActionVisible(
  visible: ToolbarActionId[],
  id: ToolbarActionId,
): boolean {
  return visible.includes(id)
}
