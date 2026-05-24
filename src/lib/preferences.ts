const PREFS_KEY = 'inkscroll-preferences'
export const PREFS_EVENT = 'inkscroll-preferences'

export type ThemeMode = 'light' | 'dark'
export type AccentPreset = 'pink' | 'blossom' | 'rose'
export type ContentRating = 'SF' | 'SG' | 'ER' | 'PR'

export type ThumbnailSize = 'default' | 'compact' | 'large'

export interface UserPreferences {
  dataSaver: boolean
  highlightGenres: string[]
  excludeGenres: string[]
  defaultComicWidth: 'standard' | 'wide'
  hideReaderHint: boolean
  themeMode: ThemeMode
  /** Built-in or custom theme id (see siteThemes.ts) */
  siteThemeId: string
  accentPreset: AccentPreset
  contentRating: ContentRating
  showScanlations: boolean
  /** Empty = Any (no language filter) */
  preferredLanguages: string[]
  thumbnailSize: ThumbnailSize
  browsePageSize: number
}

const defaults: UserPreferences = {
  dataSaver: false,
  highlightGenres: [],
  excludeGenres: [],
  defaultComicWidth: 'standard',
  hideReaderHint: false,
  themeMode: 'dark',
  siteThemeId: 'default',
  accentPreset: 'pink',
  contentRating: 'SG',
  showScanlations: true,
  preferredLanguages: [],
  thumbnailSize: 'default',
  browsePageSize: 24,
}

export function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) return defaults
    const merged = { ...defaults, ...JSON.parse(raw) } as UserPreferences
    if (!merged.siteThemeId) merged.siteThemeId = defaults.siteThemeId
    // Pink is the site default; treat legacy purple default + sakura alias as default
    if (merged.siteThemeId === 'sakura') merged.siteThemeId = 'default'
    if (!Array.isArray(merged.preferredLanguages)) merged.preferredLanguages = []
    if (!merged.thumbnailSize) merged.thumbnailSize = defaults.thumbnailSize
    if (!merged.browsePageSize || merged.browsePageSize < 12) merged.browsePageSize = defaults.browsePageSize
    return merged
  } catch {
    return defaults
  }
}

export function savePreferences(partial: Partial<UserPreferences>) {
  const next = { ...loadPreferences(), ...partial }
  localStorage.setItem(PREFS_KEY, JSON.stringify(next))
  applyDisplayPreferences(next)
  window.dispatchEvent(new Event(PREFS_EVENT))
}

export function applyDisplayPreferences(prefs: UserPreferences = loadPreferences()) {
  const thumb =
    prefs.thumbnailSize === 'compact'
      ? '120px'
      : prefs.thumbnailSize === 'large'
        ? '168px'
        : '148px'
  document.documentElement.style.setProperty('--card-w', thumb)
}

export function exportLibraryBackup(): string {
  const lib = localStorage.getItem('readdex-library')
  const prefs = localStorage.getItem(PREFS_KEY)
  return JSON.stringify({ library: lib ? JSON.parse(lib) : null, preferences: prefs ? JSON.parse(prefs) : null }, null, 2)
}

export function importLibraryBackup(json: string): { ok: boolean; error?: string } {
  try {
    const data = JSON.parse(json) as { library?: unknown; preferences?: unknown }
    if (data.library) localStorage.setItem('readdex-library', JSON.stringify(data.library))
    if (data.preferences) localStorage.setItem(PREFS_KEY, JSON.stringify(data.preferences))
    window.dispatchEvent(new Event('readdex-library'))
    window.dispatchEvent(new Event(PREFS_EVENT))
    return { ok: true }
  } catch {
    return { ok: false, error: 'Invalid backup file' }
  }
}
