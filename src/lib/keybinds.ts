export const KEYBINDS_EVENT = 'inkscroll-keybinds'

export type KeybindAction =
  | 'nextPage'
  | 'prevPage'
  | 'nextChapter'
  | 'prevChapter'
  | 'zoomIn'
  | 'zoomOut'
  | 'resetZoom'
  | 'toggleMenu'
  | 'fullscreen'

export interface KeybindActionMeta {
  id: KeybindAction
  label: string
  group: 'Navigation' | 'Zoom & Display' | 'Controls'
  defaultKeys: string[]
}

export const KEYBIND_ACTIONS: KeybindActionMeta[] = [
  { id: 'nextPage', label: 'Next page', group: 'Navigation', defaultKeys: ['ArrowRight', 'd'] },
  { id: 'prevPage', label: 'Previous page', group: 'Navigation', defaultKeys: ['ArrowLeft', 'a'] },
  { id: 'nextChapter', label: 'Next chapter', group: 'Navigation', defaultKeys: ['ArrowDown'] },
  { id: 'prevChapter', label: 'Previous chapter', group: 'Navigation', defaultKeys: ['ArrowUp'] },
  { id: 'zoomIn', label: 'Zoom in', group: 'Zoom & Display', defaultKeys: ['+', '='] },
  { id: 'zoomOut', label: 'Zoom out', group: 'Zoom & Display', defaultKeys: ['-'] },
  { id: 'resetZoom', label: 'Reset zoom', group: 'Zoom & Display', defaultKeys: ['0'] },
  { id: 'toggleMenu', label: 'Toggle menu', group: 'Controls', defaultKeys: ['m'] },
  { id: 'fullscreen', label: 'Fullscreen', group: 'Controls', defaultKeys: ['f'] },
]

const KEY = 'inkscroll-keybinds'

type KeybindMap = Partial<Record<KeybindAction, string[]>>

function dispatch() {
  window.dispatchEvent(new Event(KEYBINDS_EVENT))
}

function defaultMap(): KeybindMap {
  const map: KeybindMap = {}
  for (const a of KEYBIND_ACTIONS) {
    map[a.id] = [...a.defaultKeys]
  }
  return map
}

export function loadKeybinds(): KeybindMap {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultMap()
    return { ...defaultMap(), ...(JSON.parse(raw) as KeybindMap) }
  } catch {
    return defaultMap()
  }
}

export function saveKeybinds(map: KeybindMap) {
  localStorage.setItem(KEY, JSON.stringify(map))
  dispatch()
}

export function setKeybind(action: KeybindAction, keys: string[]) {
  const map = loadKeybinds()
  map[action] = keys
  saveKeybinds(map)
}

export function resetKeybinds() {
  localStorage.removeItem(KEY)
  dispatch()
}
