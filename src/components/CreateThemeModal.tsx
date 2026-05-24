import { useEffect, useMemo, useState } from 'react'
import { addCustomTheme, getDefaultCreatePalettes } from '../lib/customThemes'
import { loadPreferences } from '../lib/preferences'
import { applyThemeFromPreferences } from '../lib/theme'
import {
  applyPaletteToDocument,
  normalizeHex,
  THEME_COLOR_FIELDS,
  type ThemePalette,
} from '../lib/themePalette'
import type { ThemeMode } from '../lib/preferences'
import './CreateThemeModal.css'

interface CreateThemeModalProps {
  open: boolean
  onClose: () => void
  onCreated: (themeId: string) => void
}

export function CreateThemeModal({ open, onClose, onCreated }: CreateThemeModalProps) {
  const defaults = getDefaultCreatePalettes()
  const [name, setName] = useState('My Theme')
  const [mode, setMode] = useState<ThemeMode>('light')
  const [light, setLight] = useState<ThemePalette>(() => ({ ...defaults.light }))
  const [dark, setDark] = useState<ThemePalette>(() => ({ ...defaults.dark }))

  useEffect(() => {
    if (!open) return
    const d = getDefaultCreatePalettes()
    setName('My Theme')
    setMode('light')
    setLight({ ...d.light })
    setDark({ ...d.dark })
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const active = useMemo(
    () => (mode === 'light' ? light : dark),
    [mode, light, dark],
  )

  useEffect(() => {
    if (!open) return
    applyPaletteToDocument(active)
    return () => {
      applyThemeFromPreferences(loadPreferences())
    }
  }, [open, active])

  if (!open) return null
  const setActive = (patch: Partial<ThemePalette>) => {
    if (mode === 'light') setLight((p) => ({ ...p, ...patch }))
    else setDark((p) => ({ ...p, ...patch }))
  }

  const setField = (key: keyof ThemePalette, value: string) => {
    const hex = normalizeHex(value)
    setActive({ [key]: hex })
    if (key === 'primary') {
      if (mode === 'light') setDark((d) => ({ ...d, primary: hex }))
      else setLight((l) => ({ ...l, primary: hex }))
    }
    if (key === 'background' && mode === 'dark') {
      setDark((d) => ({ ...d, background: hex }))
    }
  }

  const handleCreate = () => {
    const created = addCustomTheme({
      name: name.trim() || 'My Theme',
      light: { ...light, primary: normalizeHex(light.primary) },
      dark: { ...dark, primary: normalizeHex(dark.primary) },
    })
    onCreated(created.id)
    onClose()
  }

  return (
    <>
      <button
        type="button"
        className="create-theme-backdrop"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="create-theme-modal" role="dialog" aria-modal="true" aria-label="Create Theme">
        <header className="create-theme-head">
          <h2>Create Theme</h2>
          <button type="button" className="create-theme-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <div className="create-theme-body">
          <label className="create-theme-field">
            <span>Theme Name</span>
            <input
              type="text"
              value={name}
              placeholder="My Theme"
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <div className="create-theme-previews">
            <button
              type="button"
              className={`create-theme-preview-card${mode === 'light' ? ' is-active' : ''}`}
              onClick={() => setMode('light')}
            >
              <MiniPreview palette={light} />
              <span>Light</span>
            </button>
            <button
              type="button"
              className={`create-theme-preview-card${mode === 'dark' ? ' is-active' : ''}`}
              onClick={() => setMode('dark')}
            >
              <MiniPreview palette={dark} />
              <span>Dark</span>
            </button>
          </div>

          <div className="create-theme-mode-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'light'}
              className={mode === 'light' ? 'is-active' : ''}
              onClick={() => setMode('light')}
            >
              Light Mode
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'dark'}
              className={mode === 'dark' ? 'is-active' : ''}
              onClick={() => setMode('dark')}
            >
              Dark Mode
            </button>
          </div>

          <ul className="create-theme-colors">
            {THEME_COLOR_FIELDS.map(({ key, label }) => (
              <li key={key}>
                <span className="create-theme-color-label">{label}</span>
                <label className="create-theme-swatch-btn">
                  <input
                    type="color"
                    value={normalizeHex(active[key])}
                    onChange={(e) => setField(key, e.target.value)}
                  />
                  <span
                    className="create-theme-swatch"
                    style={{ background: active[key] }}
                  />
                </label>
                <input
                  type="text"
                  className="create-theme-hex"
                  value={active[key]}
                  onChange={(e) => setField(key, e.target.value)}
                  spellCheck={false}
                />
              </li>
            ))}
          </ul>
        </div>

        <footer className="create-theme-foot">
          <button type="button" className="create-theme-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="create-theme-submit" onClick={handleCreate}>
            Create Theme
          </button>
        </footer>
      </div>
    </>
  )
}

function MiniPreview({ palette }: { palette: ThemePalette }) {
  return (
    <div className="create-theme-mini" style={{ background: palette.background }}>
      <div className="create-theme-mini-bar" style={{ background: palette.primary }}>
        <span style={{ background: palette.accent }} />
      </div>
      <div className="create-theme-mini-body">
        <span style={{ background: palette.muted }} />
        <span style={{ background: palette.border }} />
        <span style={{ background: palette.primary }} />
      </div>
    </div>
  )
}
