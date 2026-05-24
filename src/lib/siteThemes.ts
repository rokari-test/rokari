import {
  deriveDarkPalette,
  deriveLightPalette,
  type ThemePalette,
} from './themePalette'

export type ThemeCategory = 'neutral' | 'warm' | 'cool' | 'vibrant' | 'special'

export interface SiteTheme {
  id: string
  name: string
  category: ThemeCategory
  accent: string
  accentHover: string
  accentSoft: string
  previewBar: string
  previewBg: string
  light: ThemePalette
  dark: ThemePalette
}

type ThemeSeed = Omit<SiteTheme, 'light' | 'dark'>

function buildTheme(seed: ThemeSeed): SiteTheme {
  return {
    ...seed,
    light: deriveLightPalette(seed.accent),
    dark: deriveDarkPalette(seed.accent, seed.previewBg),
  }
}

const THEME_SEEDS: ThemeSeed[] = [
  { id: 'default', name: 'Default', category: 'neutral', accent: '#ff4d8d', accentHover: '#ff6ba3', accentSoft: '#ff9ec4', previewBar: '#ec4899', previewBg: '#0a0e23' },
  { id: 'mono', name: 'Mono', category: 'neutral', accent: '#a1a1aa', accentHover: '#d4d4d8', accentSoft: '#e4e4e7', previewBar: '#52525b', previewBg: '#18181b' },
  { id: 'clean-slate', name: 'Clean Slate', category: 'neutral', accent: '#3b82f6', accentHover: '#60a5fa', accentSoft: '#93c5fd', previewBar: '#2563eb', previewBg: '#0f172a' },
  { id: 'graphite', name: 'Graphite', category: 'neutral', accent: '#71717a', accentHover: '#a1a1aa', accentSoft: '#d4d4d8', previewBar: '#3f3f46', previewBg: '#141416' },
  { id: 'slate-blue', name: 'Slate Blue', category: 'neutral', accent: '#0d9488', accentHover: '#14b8a6', accentSoft: '#5eead4', previewBar: '#115e59', previewBg: '#0c1917' },
  { id: 'amber-minimal', name: 'Amber Minimal', category: 'warm', accent: '#f59e0b', accentHover: '#fbbf24', accentSoft: '#fcd34d', previewBar: '#d97706', previewBg: '#1c1408' },
  { id: 'caffeine', name: 'Caffeine', category: 'warm', accent: '#e7d5c4', accentHover: '#f5ebe0', accentSoft: '#faf6f1', previewBar: '#c4a882', previewBg: '#1a1510' },
  { id: 'coral', name: 'Coral', category: 'warm', accent: '#f97066', accentHover: '#fb923c', accentSoft: '#fda4af', previewBar: '#e11d48', previewBg: '#1f1215' },
  { id: 'crimson', name: 'Crimson', category: 'warm', accent: '#ef4444', accentHover: '#f87171', accentSoft: '#fca5a5', previewBar: '#dc2626', previewBg: '#1a0a0c' },
  { id: 'gold-rush', name: 'Gold Rush', category: 'warm', accent: '#eab308', accentHover: '#facc15', accentSoft: '#fde047', previewBar: '#ca8a04', previewBg: '#1a1608' },
  { id: 'rose-gold', name: 'Rose Gold', category: 'warm', accent: '#e8b4b8', accentHover: '#f0d0d3', accentSoft: '#f8e8ea', previewBar: '#be8f93', previewBg: '#1c1416' },
  { id: 'rokari', name: 'Rokari', category: 'warm', accent: '#ff4d8d', accentHover: '#ff6ba3', accentSoft: '#ff9ec4', previewBar: '#ec4899', previewBg: '#0a0e23' },
  { id: 'sunset', name: 'Sunset', category: 'warm', accent: '#ea580c', accentHover: '#f97316', accentSoft: '#fdba74', previewBar: '#c2410c', previewBg: '#1c1008' },
  { id: 'vintage-paper', name: 'Vintage Paper', category: 'warm', accent: '#a68a64', accentHover: '#c4a882', accentSoft: '#e8dcc8', previewBar: '#8b7355', previewBg: '#1a1814' },
  { id: 'arctic', name: 'Arctic', category: 'cool', accent: '#38bdf8', accentHover: '#7dd3fc', accentSoft: '#bae6fd', previewBar: '#0ea5e9', previewBg: '#0c1929' },
  { id: 'emerald', name: 'Emerald', category: 'cool', accent: '#22c55e', accentHover: '#4ade80', accentSoft: '#86efac', previewBar: '#16a34a', previewBg: '#0a1a10' },
  { id: 'forest', name: 'Forest', category: 'cool', accent: '#15803d', accentHover: '#22c55e', accentSoft: '#4ade80', previewBar: '#14532d', previewBg: '#0a140e' },
  { id: 'lavender', name: 'Lavender', category: 'cool', accent: '#c4b5fd', accentHover: '#ddd6fe', accentSoft: '#ede9fe', previewBar: '#8b5cf6', previewBg: '#16141f' },
  { id: 'midnight-blue', name: 'Midnight Blue', category: 'cool', accent: '#6366f1', accentHover: '#818cf8', accentSoft: '#a5b4fc', previewBar: '#4f46e5', previewBg: '#0f1029' },
  { id: 'mint', name: 'Mint', category: 'cool', accent: '#2dd4bf', accentHover: '#5eead4', accentSoft: '#99f6e4', previewBar: '#14b8a6', previewBg: '#0a1a18' },
  { id: 'ocean', name: 'Ocean', category: 'cool', accent: '#0ea5e9', accentHover: '#38bdf8', accentSoft: '#7dd3fc', previewBar: '#0284c7', previewBg: '#081a24' },
  { id: 'teal', name: 'Teal', category: 'cool', accent: '#0d9488', accentHover: '#14b8a6', accentSoft: '#5eead4', previewBar: '#0f766e', previewBg: '#0a1818' },
  { id: 'amethyst-haze', name: 'Amethyst Haze', category: 'vibrant', accent: '#a78bfa', accentHover: '#c4b5fd', accentSoft: '#ddd6fe', previewBar: '#7c3aed', previewBg: '#1a1428' },
  { id: 'bold-tech', name: 'Bold Tech', category: 'vibrant', accent: '#3b82f6', accentHover: '#60a5fa', accentSoft: '#93c5fd', previewBar: '#2563eb', previewBg: '#0a1428' },
  { id: 'bubblegum', name: 'Bubblegum', category: 'vibrant', accent: '#f9a8d4', accentHover: '#fbcfe8', accentSoft: '#fce7f3', previewBar: '#ec4899', previewBg: '#1f1018' },
  { id: 'candyland', name: 'Candyland', category: 'vibrant', accent: '#f472b6', accentHover: '#f9a8d4', accentSoft: '#fbcfe8', previewBar: '#38bdf8', previewBg: '#101828' },
  { id: 'cherry-blossom', name: 'Cherry Blossom', category: 'vibrant', accent: '#fb7185', accentHover: '#fda4af', accentSoft: '#fecdd3', previewBar: '#be123c', previewBg: '#1a0c12' },
  { id: 'cyberpunk', name: 'Cyberpunk', category: 'vibrant', accent: '#22d3ee', accentHover: '#67e8f9', accentSoft: '#a5f3fc', previewBar: '#06b6d4', previewBg: '#0a1020' },
  { id: 'ice-cream', name: 'Ice Cream', category: 'vibrant', accent: '#fde047', accentHover: '#fef08a', accentSoft: '#fef9c3', previewBar: '#fef08a', previewBg: '#1a1810' },
  { id: 'northern-lights', name: 'Northern Lights', category: 'vibrant', accent: '#4ade80', accentHover: '#86efac', accentSoft: '#bbf7d0', previewBar: '#3b82f6', previewBg: '#0a1420' },
  { id: 'violet-bloom', name: 'Violet Bloom', category: 'vibrant', accent: '#8b5cf6', accentHover: '#a78bfa', accentSoft: '#c4b5fd', previewBar: '#6d28d9', previewBg: '#14101f' },
  { id: 'catppuccin', name: 'Catppuccin', category: 'special', accent: '#cba6f7', accentHover: '#ddb6fe', accentSoft: '#f5e0fe', previewBar: '#89b4fa', previewBg: '#1e1e2e' },
  { id: 'claude', name: 'Claude', category: 'special', accent: '#d97757', accentHover: '#e8956f', accentSoft: '#f5c4a8', previewBar: '#8b5e3c', previewBg: '#1a1410' },
  { id: 'claymorphism', name: 'Claymorphism', category: 'special', accent: '#60a5fa', accentHover: '#93c5fd', accentSoft: '#bfdbfe', previewBar: '#e2e8f0', previewBg: '#1e2433' },
  { id: 'doom-64', name: 'Doom 64', category: 'special', accent: '#ef4444', accentHover: '#f87171', accentSoft: '#fca5a5', previewBar: '#3b82f6', previewBg: '#140a0a' },
  { id: 'dracula', name: 'Dracula', category: 'special', accent: '#50fa7b', accentHover: '#69ff94', accentSoft: '#a8ffb8', previewBar: '#bd93f9', previewBg: '#282a36' },
  { id: 'neo-brutalism', name: 'Neo Brutalism', category: 'special', accent: '#f43f5e', accentHover: '#fb7185', accentSoft: '#fda4af', previewBar: '#3b82f6', previewBg: '#0f1018' },
  { id: 'notebook', name: 'Notebook', category: 'special', accent: '#64748b', accentHover: '#94a3b8', accentSoft: '#cbd5e1', previewBar: '#e2e8f0', previewBg: '#e8ecf2' },
  { id: 'perpetuity', name: 'Perpetuity', category: 'special', accent: '#14b8a6', accentHover: '#2dd4bf', accentSoft: '#5eead4', previewBar: '#0d9488', previewBg: '#0a1818' },
]

export const BUILTIN_SITE_THEMES: SiteTheme[] = THEME_SEEDS.map(buildTheme)

const THEME_BY_ID = new Map(BUILTIN_SITE_THEMES.map((t) => [t.id, t]))

export const THEME_CATEGORY_LABELS: Record<ThemeCategory, string> = {
  neutral: 'NEUTRAL',
  warm: 'WARM',
  cool: 'COOL',
  vibrant: 'VIBRANT',
  special: 'SPECIAL',
}

export function getBuiltinThemeCount(): number {
  return BUILTIN_SITE_THEMES.length
}

export function getSiteTheme(id: string): SiteTheme | undefined {
  return THEME_BY_ID.get(id)
}

export function getAllBuiltinThemes(): SiteTheme[] {
  return BUILTIN_SITE_THEMES
}

export function getThemesByCategory(
  themes: SiteTheme[],
): Record<ThemeCategory, SiteTheme[]> {
  const groups: Record<ThemeCategory, SiteTheme[]> = {
    neutral: [],
    warm: [],
    cool: [],
    vibrant: [],
    special: [],
  }
  for (const t of themes) groups[t.category].push(t)
  return groups
}

export function enrichCustomTheme(
  partial: Omit<SiteTheme, 'light' | 'dark'> & {
    light?: ThemePalette
    dark?: ThemePalette
  },
): SiteTheme {
  const accent = partial.accent
  const previewBg = partial.previewBg
  return {
    ...partial,
    light: partial.light ?? deriveLightPalette(accent),
    dark: partial.dark ?? deriveDarkPalette(accent, previewBg),
  }
}
