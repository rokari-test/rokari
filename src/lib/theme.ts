import { loadCustomThemes } from './customThemes'
import { getSiteTheme, type SiteTheme } from './siteThemes'
import { applyPaletteToDocument } from './themePalette'
import type { UserPreferences } from './preferences'

export function resolveTheme(id: string): SiteTheme | undefined {
  const builtin = getSiteTheme(id)
  if (builtin) return builtin
  return loadCustomThemes().find((t) => t.id === id)
}

const LEGACY_ACCENT_MAP: Record<string, string> = {
  pink: 'default',
  blossom: 'midnight-blue',
  rose: 'mono',
}

export const DEFAULT_SITE_THEME_ID = 'midnight-blue'

export function resolveSiteThemeId(prefs: UserPreferences): string {
  if (prefs.siteThemeId) return prefs.siteThemeId
  if (prefs.accentPreset && LEGACY_ACCENT_MAP[prefs.accentPreset]) {
    return LEGACY_ACCENT_MAP[prefs.accentPreset]
  }
  return DEFAULT_SITE_THEME_ID
}

export function applySiteTheme(theme: SiteTheme, themeMode: UserPreferences['themeMode']) {
  const root = document.documentElement
  root.dataset.theme = themeMode
  root.dataset.siteTheme = theme.id

  const palette = themeMode === 'light' ? theme.light : theme.dark
  applyPaletteToDocument(palette)
}

export function applyThemeFromPreferences(prefs: UserPreferences) {
  const id = resolveSiteThemeId(prefs)
  const theme = resolveTheme(id) ?? getSiteTheme(DEFAULT_SITE_THEME_ID)
  if (theme) applySiteTheme(theme, prefs.themeMode)
}
