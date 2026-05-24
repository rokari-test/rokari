import { useEffect, useMemo, useState } from 'react'
import { CreateThemeModal } from './CreateThemeModal'
import {
  CUSTOM_THEMES_EVENT,
  loadCustomThemes,
  type CustomTheme,
} from '../lib/customThemes'
import { usePreferences } from '../hooks/usePreferences'
import {
  BUILTIN_SITE_THEMES,
  getBuiltinThemeCount,
  getThemesByCategory,
  THEME_CATEGORY_LABELS,
  type SiteTheme,
  type ThemeCategory,
} from '../lib/siteThemes'
import { resolveSiteThemeId } from '../lib/theme'
import './ThemesPanel.css'

const CATEGORY_ORDER: ThemeCategory[] = [
  'neutral',
  'warm',
  'cool',
  'vibrant',
  'special',
]

interface ThemesPanelProps {
  open: boolean
  onClose: () => void
}

export function ThemesPanel({ open, onClose }: ThemesPanelProps) {
  const { prefs, update } = usePreferences()
  const [query, setQuery] = useState('')
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>(() =>
    loadCustomThemes(),
  )
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [createOpen, setCreateOpen] = useState(false)

  const activeId = resolveSiteThemeId(prefs)

  useEffect(() => {
    if (!open) return
    const sync = () => setCustomThemes(loadCustomThemes())
    sync()
    window.addEventListener(CUSTOM_THEMES_EVENT, sync)
    return () => window.removeEventListener(CUSTOM_THEMES_EVENT, sync)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const filteredCustom = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return customThemes
    return customThemes.filter((t) => t.name.toLowerCase().includes(q))
  }, [customThemes, query])

  const filteredBuiltin = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return BUILTIN_SITE_THEMES
    return BUILTIN_SITE_THEMES.filter((t) => t.name.toLowerCase().includes(q))
  }, [query])

  const grouped = useMemo(
    () => getThemesByCategory(filteredBuiltin),
    [filteredBuiltin],
  )

  const totalCount = getBuiltinThemeCount() + customThemes.length

  if (!open) return null

  const selectTheme = (id: string) => {
    update({ siteThemeId: id })
  }

  return (
    <>
      <button
        type="button"
        className="themes-panel-backdrop"
        aria-label="Close themes"
        onClick={onClose}
      />
      <div className="themes-panel" role="dialog" aria-modal="true" aria-label="Themes">
        <header className="themes-panel-head">
          <div className="themes-panel-title">
            <PaletteIcon />
            <h2>Themes</h2>
            <span className="themes-panel-count">{totalCount}</span>
          </div>
          <button
            type="button"
            className="themes-panel-close"
            aria-label="Close"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </header>

        <div className="themes-panel-search">
          <SearchIcon />
          <input
            type="search"
            placeholder="Search themes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="themes-panel-body">
          <section className="themes-panel-section">
            <div className="themes-panel-section-head">
              <span>MY THEMES</span>
              <button type="button" className="themes-panel-new" onClick={() => setCreateOpen(true)}>
                + New
              </button>
            </div>
            {filteredCustom.length === 0 && customThemes.length === 0 ? (
              <button
                type="button"
                className="themes-panel-empty"
                onClick={() => setCreateOpen(true)}
              >
                <span className="themes-panel-empty-plus">+</span>
                <span>Create your first custom theme</span>
              </button>
            ) : filteredCustom.length > 0 ? (
              <div className="themes-panel-grid">
                {filteredCustom.map((theme) => (
                  <ThemeCard
                    key={theme.id}
                    theme={theme}
                    active={activeId === theme.id}
                    onSelect={() => selectTheme(theme.id)}
                  />
                ))}
              </div>
            ) : null}
          </section>

          {CATEGORY_ORDER.map((cat) => {
            const items = grouped[cat]
            if (!items.length) return null
            const isCollapsed = collapsed[cat]
            return (
              <section key={cat} className="themes-panel-section">
                <button
                  type="button"
                  className="themes-panel-category"
                  onClick={() =>
                    setCollapsed((c) => ({ ...c, [cat]: !c[cat] }))
                  }
                  aria-expanded={!isCollapsed}
                >
                  <ChevronIcon collapsed={isCollapsed} />
                  <span>{THEME_CATEGORY_LABELS[cat]}</span>
                  <span className="themes-panel-category-count">({items.length})</span>
                </button>
                {!isCollapsed && (
                  <div className="themes-panel-grid">
                    {items.map((theme) => (
                      <ThemeCard
                        key={theme.id}
                        theme={theme}
                        active={activeId === theme.id}
                        onSelect={() => selectTheme(theme.id)}
                      />
                    ))}
                  </div>
                )}
              </section>
            )
          })}
        </div>
      </div>

      <CreateThemeModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(id) => {
          setCustomThemes(loadCustomThemes())
          selectTheme(id)
        }}
      />
    </>
  )
}

function ThemeCard({
  theme,
  active,
  onSelect,
}: {
  theme: SiteTheme
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      className={`themes-card${active ? ' themes-card--active' : ''}`}
      onClick={onSelect}
      aria-pressed={active}
    >
      <div
        className="themes-card-preview"
        style={{ background: theme.dark.background }}
      >
        <div
          className="themes-card-bar"
          style={{ background: theme.dark.primary }}
        >
          <span className="themes-card-dot" style={{ background: theme.dark.accent }} />
          <span className="themes-card-line" />
        </div>
        <div className="themes-card-body">
          <span className="themes-card-line themes-card-line--short" />
          <span className="themes-card-line" />
          <span
            className="themes-card-btn"
            style={{ background: theme.dark.primary }}
          />
        </div>
        {active && <span className="themes-card-check" aria-hidden />}
      </div>
      <span className="themes-card-name">{theme.name}</span>
    </button>
  )
}

function PaletteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="13.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="10.5" r="2.5" />
      <circle cx="8.5" cy="7.5" r="2.5" />
      <circle cx="6.5" cy="12.5" r="2.5" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.75-.15 2.5-.42" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20 17 17" />
    </svg>
  )
}

function ChevronIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={collapsed ? 'themes-chevron--collapsed' : ''}
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}
