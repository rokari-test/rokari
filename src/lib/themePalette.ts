/** Full UI palette (Kagane Create Theme fields) */
export interface ThemePalette {
  background: string
  text: string
  primary: string
  primaryText: string
  secondary: string
  accent: string
  muted: string
  card: string
  border: string
  destructive: string
}

export const THEME_COLOR_FIELDS: { key: keyof ThemePalette; label: string }[] = [
  { key: 'background', label: 'Background' },
  { key: 'text', label: 'Text' },
  { key: 'primary', label: 'Primary' },
  { key: 'primaryText', label: 'Primary Text' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'accent', label: 'Accent' },
  { key: 'muted', label: 'Muted' },
  { key: 'card', label: 'Card' },
  { key: 'border', label: 'Border' },
  { key: 'destructive', label: 'Destructive' },
]

export const DEFAULT_LIGHT_PALETTE: ThemePalette = {
  background: '#f6e6f6',
  text: '#772573',
  primary: '#ff4d8d',
  primaryText: '#ffffff',
  secondary: '#e6c8e8',
  accent: '#f0d2ed',
  muted: '#f2e6f4',
  card: '#ffffff',
  border: '#e7dbe3',
  destructive: '#ef4444',
}

export const DEFAULT_DARK_PALETTE: ThemePalette = {
  background: '#1a1018',
  text: '#edeced',
  primary: '#ff4d8d',
  primaryText: '#ffffff',
  secondary: '#4c1d32',
  accent: '#3a1928',
  muted: '#2c232a',
  card: '#281e26',
  border: '#433b42',
  destructive: '#ef4444',
}

type RGB = { r: number; g: number; b: number }

export function normalizeHex(color: string): string {
  const c = color.trim()
  if (c.startsWith('#')) {
    const h = c.slice(1)
    if (h.length === 3) {
      return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`.toLowerCase()
    }
    return `#${h.slice(0, 6).toLowerCase()}`
  }
  const rgb = c.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i)
  if (rgb) {
    const r = Number(rgb[1]).toString(16).padStart(2, '0')
    const g = Number(rgb[2]).toString(16).padStart(2, '0')
    const b = Number(rgb[3]).toString(16).padStart(2, '0')
    return `#${r}${g}${b}`
  }
  return '#ff4d8d'
}

function hexToRgb(hex: string): RGB {
  const h = normalizeHex(hex).slice(1)
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

function rgbToHex({ r, g, b }: RGB): string {
  const c = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

export function mixHex(a: string, b: string, weight: number): string {
  const A = hexToRgb(a)
  const B = hexToRgb(b)
  const w = Math.max(0, Math.min(1, weight))
  return rgbToHex({
    r: A.r * (1 - w) + B.r * w,
    g: A.g * (1 - w) + B.g * w,
    b: A.b * (1 - w) + B.b * w,
  })
}

export function lighten(hex: string, amount: number): string {
  return mixHex(hex, '#ffffff', amount)
}

export function darken(hex: string, amount: number): string {
  return mixHex(hex, '#000000', amount)
}

export function deriveDarkPalette(accent: string, previewBg: string): ThemePalette {
  const primary = normalizeHex(accent)
  const bg = normalizeHex(previewBg)
  return {
    background: bg,
    text: lighten(bg, 0.92),
    primary,
    primaryText: '#ffffff',
    secondary: mixHex(bg, primary, 0.22),
    accent: mixHex(bg, primary, 0.14),
    muted: lighten(bg, 0.08),
    card: lighten(bg, 0.06),
    border: lighten(bg, 0.18),
    destructive: '#ef4444',
  }
}

export function deriveLightPalette(accent: string): ThemePalette {
  const primary = normalizeHex(accent)
  const base = DEFAULT_LIGHT_PALETTE
  return {
    background: mixHex(base.background, primary, 0.08),
    text: mixHex(base.text, primary, 0.35),
    primary,
    primaryText: '#ffffff',
    secondary: mixHex(base.secondary, primary, 0.2),
    accent: mixHex(base.accent, primary, 0.15),
    muted: mixHex(base.muted, primary, 0.06),
    card: '#ffffff',
    border: mixHex(base.border, primary, 0.08),
    destructive: '#ef4444',
  }
}

export function paletteToCssVars(p: ThemePalette) {
  const primary = normalizeHex(p.primary)
  const { r, g, b } = hexToRgb(primary)
  const elevated = lighten(p.background, 0.06)
  const hover = lighten(p.background, 0.12)
  return {
    '--bg': p.background,
    '--bg-elevated': elevated,
    '--bg-card': p.card,
    '--bg-hover': hover,
    '--border': p.border,
    '--border-subtle': mixHex(p.border, p.background, 0.45),
    '--text': p.text,
    '--text-muted': mixHex(p.text, p.background, 0.55),
    '--accent': primary,
    '--accent-hover': lighten(primary, 0.12),
    '--accent-soft': lighten(primary, 0.45),
    '--accent-dim': `rgba(${r}, ${g}, ${b}, 0.14)`,
    '--accent-glow': `rgba(${r}, ${g}, ${b}, 0.28)`,
    '--color-primary': primary,
    '--color-primary-text': p.primaryText,
    '--color-secondary': p.secondary,
    '--color-accent-surface': p.accent,
    '--color-muted': p.muted,
    '--color-destructive': p.destructive,
    '--shadow':
      p.background.startsWith('#f') || p.background.startsWith('#e')
        ? '0 12px 40px rgba(0, 0, 0, 0.08)'
        : '0 12px 40px rgba(0, 0, 0, 0.45)',
    '--shadow-card':
      p.background.startsWith('#f') || p.background.startsWith('#e')
        ? '0 8px 24px rgba(0, 0, 0, 0.06)'
        : '0 8px 24px rgba(0, 0, 0, 0.35)',
  } as Record<string, string>
}

export function applyPaletteToDocument(palette: ThemePalette) {
  const root = document.documentElement
  const vars = paletteToCssVars(palette)
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value)
  }
}
