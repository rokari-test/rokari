import {
  DEFAULT_DARK_PALETTE,
  DEFAULT_LIGHT_PALETTE,
  deriveDarkPalette,
  normalizeHex,
  type ThemePalette,
} from './themePalette'
import { enrichCustomTheme, type SiteTheme } from './siteThemes'

const CUSTOM_KEY = 'sakura-custom-themes'
export const CUSTOM_THEMES_EVENT = 'sakura-custom-themes'

export interface CustomTheme extends SiteTheme {
  custom: true
}

function dispatch() {
  window.dispatchEvent(new Event(CUSTOM_THEMES_EVENT))
}

export function loadCustomThemes(): CustomTheme[] {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Partial<CustomTheme>[]
    if (!Array.isArray(parsed)) return []
    return parsed.map((t) => {
      const accent = normalizeHex(t.accent ?? DEFAULT_LIGHT_PALETTE.primary)
      const previewBg = t.previewBg ?? deriveDarkPalette(accent, '#13111c').background
      const enriched = enrichCustomTheme({
        id: t.id ?? `custom-${Date.now()}`,
        name: t.name ?? 'Custom',
        category: 'special',
        accent,
        accentHover: t.accentHover ?? accent,
        accentSoft: t.accentSoft ?? accent,
        previewBar: t.previewBar ?? accent,
        previewBg,
        light: t.light,
        dark: t.dark,
      })
      return { ...enriched, custom: true as const }
    })
  } catch {
    return []
  }
}

export function saveCustomThemes(themes: CustomTheme[]) {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(themes))
  dispatch()
}

export function addCustomTheme(input: {
  name: string
  light: ThemePalette
  dark: ThemePalette
}): CustomTheme {
  const primary = normalizeHex(input.light.primary)
  const id = `custom-${Date.now()}`
  const theme: CustomTheme = {
    ...enrichCustomTheme({
      id,
      name: input.name.trim() || 'My Theme',
      category: 'special',
      accent: primary,
      accentHover: input.dark.primary,
      accentSoft: input.light.accent,
      previewBar: input.dark.primary,
      previewBg: input.dark.background,
      light: input.light,
      dark: input.dark,
    }),
    custom: true,
  }
  saveCustomThemes([...loadCustomThemes(), theme])
  return theme
}

export function getDefaultCreatePalettes(): {
  light: ThemePalette
  dark: ThemePalette
} {
  return {
    light: { ...DEFAULT_LIGHT_PALETTE },
    dark: { ...DEFAULT_DARK_PALETTE },
  }
}

export function deleteCustomTheme(id: string) {
  saveCustomThemes(loadCustomThemes().filter((t) => t.id !== id))
}
