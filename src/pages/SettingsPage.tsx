import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ThemesPanel } from '../components/ThemesPanel'
import { usePreferences } from '../hooks/usePreferences'
import { useSiteConfig } from '../hooks/useSiteConfig'
import { useUser } from '../hooks/useUser'
import {
  CACHE_ENTRIES,
  CACHE_EVENT,
  clearAllCaches,
  clearCacheEntry,
  refreshAllCaches,
} from '../lib/appCache'
import { getAllGenres } from '../data/catalog'
import {
  KEYBIND_ACTIONS,
  KEYBINDS_EVENT,
  loadKeybinds,
  resetKeybinds,
  setKeybind,
  type KeybindAction,
} from '../lib/keybinds'
import {
  DEFAULT_READER_TAB_TITLE,
  formatReaderTabTitle,
  loadReaderPreferences,
  READER_PREFS_EVENT,
  READER_TAB_PREVIEW_VARS,
  saveReaderPreferences,
  type ReaderPreferences,
  type ReadingDirection,
  type ReadingMode,
} from '../lib/readerPreferences'
import { resolveSiteThemeId, resolveTheme } from '../lib/theme'
import {
  changeUserPassword,
  deleteUserAccount,
  formatRelativeActive,
} from '../lib/userAuth'
import {
  getUserSessions,
  refreshSessionActivity,
  revokeSession,
} from '../lib/userSessions'
import './SettingsPage.css'

const TABS = [
  'interface',
  'reader',
  'controls',
  'display',
  'genres',
  'cache',
  'security',
  'backup',
] as const

type SettingsTab = (typeof TABS)[number]

const TAB_LABELS: Record<SettingsTab, string> = {
  interface: 'Appearance',
  reader: 'Reader',
  controls: 'Shortcuts',
  display: 'Browse',
  genres: 'Genres',
  cache: 'Storage',
  security: 'Account',
  backup: 'Backup',
}

const PANEL_TITLES: Record<SettingsTab, string> = {
  interface: 'Appearance',
  reader: 'Reader',
  controls: 'Keyboard shortcuts',
  display: 'Browse & cards',
  genres: 'Genre filters',
  cache: 'Local storage',
  security: 'Account & security',
  backup: 'Progress backup',
}

function isSettingsTab(v: string | null): v is SettingsTab {
  return TABS.includes(v as SettingsTab)
}

export function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { siteName } = useSiteConfig()
  const tabParam = searchParams.get('tab')
  const tab: SettingsTab = isSettingsTab(tabParam) ? tabParam : 'interface'
  const [themesOpen, setThemesOpen] = useState(false)

  const setTab = (next: SettingsTab) => {
    setSearchParams(next === 'interface' ? {} : { tab: next })
  }

  return (
    <div className="settings-page container--wide">
      <header className="settings-hero">
        <h1>Settings</h1>
        <p>Customize how {siteName} looks, reads, and behaves on this device.</p>
      </header>

      <div className="settings-shell">
      <nav className="settings-nav" aria-label="Settings sections">
        <NavButton active={tab === 'interface'} onClick={() => setTab('interface')} icon={<IconPalette />}>
          {TAB_LABELS.interface}
        </NavButton>
        <NavButton active={tab === 'reader'} onClick={() => setTab('reader')} icon={<IconBook />}>
          {TAB_LABELS.reader}
        </NavButton>
        <NavButton active={tab === 'controls'} onClick={() => setTab('controls')} icon={<IconKeyboard />}>
          {TAB_LABELS.controls}
        </NavButton>
        <NavButton active={tab === 'display'} onClick={() => setTab('display')} icon={<IconMonitor />}>
          {TAB_LABELS.display}
        </NavButton>
        <NavButton active={tab === 'genres'} onClick={() => setTab('genres')} icon={<IconTags />}>
          {TAB_LABELS.genres}
        </NavButton>
        <NavButton active={tab === 'cache'} onClick={() => setTab('cache')} icon={<IconDatabase />}>
          {TAB_LABELS.cache}
        </NavButton>
        <NavButton active={tab === 'security'} onClick={() => setTab('security')} icon={<IconShield />}>
          {TAB_LABELS.security}
        </NavButton>
        <NavButton active={tab === 'backup'} onClick={() => setTab('backup')} icon={<IconArchive />}>
          {TAB_LABELS.backup}
        </NavButton>
      </nav>

      <div className="settings-panel">
        <h2 className="settings-panel-title">{PANEL_TITLES[tab]}</h2>
        {tab === 'interface' && <InterfacePanel onOpenThemes={() => setThemesOpen(true)} />}
        {tab === 'reader' && <ReaderPanel />}
        {tab === 'controls' && <ControlsPanel />}
        {tab === 'display' && <DisplayPanel />}
        {tab === 'genres' && <GenresPanel />}
        {tab === 'cache' && <CachePanel />}
        {tab === 'security' && <SecurityPanel />}
        {tab === 'backup' && <BackupPanel />}
      </div>
      </div>

      <ThemesPanel open={themesOpen} onClose={() => setThemesOpen(false)} />
    </div>
  )
}

function NavButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: ReactNode
  children: string
}) {
  return (
    <button
      type="button"
      className={`settings-nav-item${active ? ' is-active' : ''}`}
      onClick={onClick}
    >
      {icon}
      {children}
    </button>
  )
}

function InterfacePanel({ onOpenThemes }: { onOpenThemes: () => void }) {
  const { prefs, update } = usePreferences()
  const theme = resolveTheme(resolveSiteThemeId(prefs))

  return (
    <>
      <p className="settings-panel-intro">Theme and performance options for your reading experience.</p>
      <Row
        title="Theme"
        desc="Switch between light and dark mode across the site."
        control={
          <div className="settings-segment">
            <button
              type="button"
              className={prefs.themeMode === 'light' ? 'is-active' : ''}
              onClick={() => update({ themeMode: 'light' })}
            >
              Light
            </button>
            <button
              type="button"
              className={prefs.themeMode === 'dark' ? 'is-active' : ''}
              onClick={() => update({ themeMode: 'dark' })}
            >
              Dark
            </button>
          </div>
        }
      />
      <Row
        title="Theme colors"
        desc="Pick an accent palette that matches your style."
        control={
          <>
            <span className="settings-theme-label">{theme?.name ?? 'Rokari Pink'}</span>
            <button type="button" className="settings-btn settings-btn--primary" onClick={onOpenThemes}>
              Customize
            </button>
          </>
        }
      />
      <Row
        title="Data saver"
        desc="Use lighter images where possible to save bandwidth."
        control={
          <ToggleSwitch checked={prefs.dataSaver} onChange={(v) => update({ dataSaver: v })} />
        }
      />
    </>
  )
}

function ReaderPanel() {
  const [reader, setReader] = useState(loadReaderPreferences)
  const { update: updatePrefs } = usePreferences()

  useEffect(() => {
    const sync = () => setReader(loadReaderPreferences())
    window.addEventListener(READER_PREFS_EVENT, sync)
    return () => window.removeEventListener(READER_PREFS_EVENT, sync)
  }, [])

  const patch = (p: Partial<ReaderPreferences>) => {
    saveReaderPreferences(p)
    if (p.hideReaderHint !== undefined) updatePrefs({ hideReaderHint: p.hideReaderHint })
    if (p.defaultComicWidth !== undefined) updatePrefs({ defaultComicWidth: p.defaultComicWidth })
  }

  const preview = formatReaderTabTitle(reader.readerTabTitle, READER_TAB_PREVIEW_VARS)

  return (
    <>
      <p className="settings-panel-intro">Default layout and controls when you open chapters.</p>
      <Row
        title="Default reading mode"
        desc="Layout applied when opening chapters."
        control={
          <div className="settings-segment">
            {(['single', 'double', 'scroll'] as ReadingMode[]).map((m) => (
              <button
                key={m}
                type="button"
                className={reader.defaultReadingMode === m ? 'is-active' : ''}
                onClick={() => patch({ defaultReadingMode: m })}
              >
                {m}
              </button>
            ))}
          </div>
        }
      />
      <Row
        title="Default Reading Direction"
        desc="Page order direction. Auto detects from series format (Manga = RTL)."
        control={
          <select
            className="settings-select"
            value={reader.defaultReadingDirection}
            onChange={(e) =>
              patch({ defaultReadingDirection: e.target.value as ReadingDirection })
            }
          >
            <option value="auto">Auto (detect from format)</option>
            <option value="ltr">Left to Right</option>
            <option value="rtl">Right to Left</option>
          </select>
        }
      />
      <Row
        title="Reader Tab Title"
        desc="Custom format for browser tab title."
        control={
          <input
            className="settings-input settings-input--wide"
            value={reader.readerTabTitle}
            onChange={(e) => patch({ readerTabTitle: e.target.value })}
            placeholder={DEFAULT_READER_TAB_TITLE}
          />
        }
      />
      <p className="settings-panel-intro" style={{ marginTop: '-0.5rem' }}>
        Preview: {preview || 'One Piece - Vol. 1 Ch. 1'}
      </p>
      <SliderRow
        label="Default Zoom (Scroll Mode)"
        desc="Initial zoom percentage for scroll mode."
        value={reader.zoomScroll}
        onChange={(v) => patch({ zoomScroll: v })}
      />
      <SliderRow
        label="Default Zoom (Single Page)"
        desc="Initial zoom percentage for single page mode."
        value={reader.zoomSingle}
        onChange={(v) => patch({ zoomSingle: v })}
      />
      <SliderRow
        label="Default Zoom (Double Page)"
        desc="Initial zoom percentage for double page mode."
        value={reader.zoomDouble}
        onChange={(v) => patch({ zoomDouble: v })}
      />
      <Row
        title="Preload Pages"
        desc="Global preload setting for all chapters."
        control={
          <ToggleSwitch checked={reader.preloadPages} onChange={(v) => patch({ preloadPages: v })} />
        }
      />
      <Row
        title="Page Gaps (Scroll Mode)"
        desc="Insert spacing between images for improved readability."
        control={<ToggleSwitch checked={reader.pageGaps} onChange={(v) => patch({ pageGaps: v })} />}
      />
      <Row
        title="Tap Zones Enabled"
        desc="Screen is divided into zones for different actions."
        control={
          <ToggleSwitch
            checked={reader.tapZonesEnabled}
            onChange={(v) => patch({ tapZonesEnabled: v })}
          />
        }
      />
      <Row
        title="Hide reader hints"
        desc="Do not show onboarding hints in the reader."
        control={
          <ToggleSwitch
            checked={reader.hideReaderHint}
            onChange={(v) => patch({ hideReaderHint: v })}
          />
        }
      />
    </>
  )
}

function ControlsPanel() {
  const [binds, setBinds] = useState(loadKeybinds)

  useEffect(() => {
    const sync = () => setBinds(loadKeybinds())
    window.addEventListener(KEYBINDS_EVENT, sync)
    return () => window.removeEventListener(KEYBINDS_EVENT, sync)
  }, [])

  const groups = useMemo(() => {
    const map = new Map<string, typeof KEYBIND_ACTIONS>()
    for (const a of KEYBIND_ACTIONS) {
      const list = map.get(a.group) ?? []
      list.push(a)
      map.set(a.group, list)
    }
    return [...map.entries()]
  }, [])

  const captureKey = (action: KeybindAction) => {
    const handler = (e: KeyboardEvent) => {
      e.preventDefault()
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      const current = binds[action] ?? []
      if (!current.includes(key)) {
        setKeybind(action, [...current, key])
      }
      window.removeEventListener('keydown', handler, true)
    }
    window.addEventListener('keydown', handler, true)
  }

  return (
    <>
      <p className="settings-panel-intro">
        Click to add a key, then press any key to bind it. Custom keybinds are stored locally.
      </p>
      {groups.map(([group, actions]) => (
        <div key={group} className="settings-keybind-group">
          <h4>{group}</h4>
          {actions.map((action) => (
            <div key={action.id} className="settings-keybind-row">
              <span>{action.label}</span>
              <div className="settings-keybind-keys">
                {(binds[action.id] ?? []).map((k) => (
                  <kbd key={k} className="settings-kbd">
                    {k}
                  </kbd>
                ))}
                <button
                  type="button"
                  className="settings-btn"
                  onClick={() => captureKey(action.id)}
                >
                  Add keybind
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}
      <button type="button" className="settings-btn settings-btn--ghost" onClick={resetKeybinds}>
        Reset to defaults
      </button>
    </>
  )
}

function DisplayPanel() {
  const { prefs, update } = usePreferences()

  return (
    <>
      <p className="settings-panel-intro">How series cards and browse pages are laid out.</p>
      <Row
        title="Thumbnail size"
        desc="Choose your preferred thumbnail size for series cards."
        control={
          <select
            className="settings-select"
            value={prefs.thumbnailSize}
            onChange={(e) =>
              update({ thumbnailSize: e.target.value as typeof prefs.thumbnailSize })
            }
          >
            <option value="default">Default</option>
            <option value="compact">Compact</option>
            <option value="large">Large</option>
          </select>
        }
      />
      <SliderRow
        label="Page Size"
        desc="Number of items per page on browse pages."
        value={prefs.browsePageSize}
        min={12}
        max={48}
        step={6}
        onChange={(v) => update({ browsePageSize: v })}
      />
    </>
  )
}

function GenresPanel() {
  const genres = getAllGenres()
  const { prefs, update } = usePreferences()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return genres
    return genres.filter((g) => g.toLowerCase().includes(q))
  }, [genres, query])

  const toggleHighlight = (g: string) => {
    const has = prefs.highlightGenres.includes(g)
    update({
      highlightGenres: has
        ? prefs.highlightGenres.filter((x) => x !== g)
        : [...prefs.highlightGenres, g],
    })
  }

  const toggleExclude = (g: string) => {
    const has = prefs.excludeGenres.includes(g)
    update({
      excludeGenres: has ? prefs.excludeGenres.filter((x) => x !== g) : [...prefs.excludeGenres, g],
    })
  }

  return (
    <>
      <p className="settings-panel-intro">
        Highlight genres with colors and set priorities. Exclude genres to hide them from homepage
        feeds.
      </p>
      <input
        type="search"
        className="settings-input settings-genre-search"
        placeholder="Search genres…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="settings-genre-list">
        {filtered.map((g) => (
          <div key={g} className="settings-genre-row">
            <span>{g}</span>
            <button
              type="button"
              className={prefs.highlightGenres.includes(g) ? 'is-on' : ''}
              onClick={() => toggleHighlight(g)}
              title="Highlight"
            >
              ☆
            </button>
            <button
              type="button"
              className={prefs.excludeGenres.includes(g) ? 'is-on' : ''}
              onClick={() => toggleExclude(g)}
            >
              Hide
            </button>
          </div>
        ))}
      </div>
    </>
  )
}

function CachePanel() {
  const [, setTick] = useState(0)

  useEffect(() => {
    const bump = () => setTick((t) => t + 1)
    window.addEventListener(CACHE_EVENT, bump)
    return () => window.removeEventListener(CACHE_EVENT, bump)
  }, [])

  return (
    <>
      <p className="settings-panel-intro">
        Manage cached data to improve performance. Caches are stored in your browser on this device.
      </p>
      <div className="settings-cache-actions">
        <button type="button" className="settings-btn" onClick={refreshAllCaches}>
          Refresh All Caches
        </button>
        <button type="button" className="settings-btn settings-btn--danger" onClick={clearAllCaches}>
          Clear All Caches
        </button>
      </div>
      {CACHE_ENTRIES.map((entry) => (
        <Row
          key={entry.id}
          title={entry.title}
          desc={`${entry.description} Cached for ${entry.ttlLabel}.`}
          control={
            <button type="button" className="settings-btn" onClick={() => clearCacheEntry(entry.id)}>
              Clear
            </button>
          }
        />
      ))}
    </>
  )
}

function SecurityPanel() {
  const { user } = useUser()
  const [sessions, setSessions] = useState(() => (user ? getUserSessions(user.id) : []))
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwMsg, setPwMsg] = useState<string | null>(null)
  const [purge, setPurge] = useState('')

  useEffect(() => {
    if (!user) return
    refreshSessionActivity(user.id)
    setSessions(getUserSessions(user.id))
  }, [user])

  const handlePassword = async () => {
    if (newPw !== confirmPw) {
      setPwMsg('Passwords do not match.')
      return
    }
    const result = await changeUserPassword({
      currentPassword: currentPw,
      newPassword: newPw,
    })
    if (result.ok) {
      setPwMsg('Password updated.')
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
    } else {
      setPwMsg(result.error)
    }
  }

  const handleDelete = () => {
    if (!user || purge !== 'PURGE') return
    deleteUserAccount(user.id)
  }

  if (!user) {
    return (
      <div className="settings-account-guest">
        <p>
          <Link to="/login">Sign in</Link> to manage sessions, password, and account security.
        </p>
      </div>
    )
  }

  return (
    <>
      <p className="settings-panel-intro">
        Manage your active sessions, backup recovery codes, and account security.
      </p>
      <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem' }}>Active Sessions</h3>
        <ul className="settings-session-list">
          {sessions.map((s) => (
            <li key={s.id}>
              <strong>{s.isCurrent ? 'Current session' : s.label}</strong>
              <br />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                Last active: {formatRelativeActive(s.lastActiveAt)}
              </span>
              {!s.isCurrent && (
                <button
                  type="button"
                  className="settings-btn"
                  style={{ marginTop: '0.35rem' }}
                  onClick={() => {
                    revokeSession(user.id, s.id)
                    setSessions(getUserSessions(user.id))
                  }}
                >
                  Revoke
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
      <Row
        title="Change Password"
        desc="Update your account password. You'll need to enter your current password first."
        control={
          <div className="settings-form-stack">
            <label>
              Current Password
              <input
                type="password"
                className="settings-input"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
              />
            </label>
            <label>
              New Password
              <input
                type="password"
                className="settings-input"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
              />
            </label>
            <label>
              Confirm New Password
              <input
                type="password"
                className="settings-input"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
              />
            </label>
            <button
              type="button"
              className="settings-btn settings-btn--primary"
              disabled={!currentPw || !newPw || !confirmPw}
              onClick={handlePassword}
            >
              Change Password
            </button>
            {pwMsg && <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{pwMsg}</span>}
          </div>
        }
      />
      <Row
        title="Backup Codes"
        desc="Backup codes let you reset your password if you lose access. Regenerating will invalidate all existing codes."
        control={
          <button type="button" className="settings-btn" disabled>
            Regenerate Backup Codes
          </button>
        }
      />
      <div className="settings-row">
        <div className="settings-row-text">
          <h3>Delete your account</h3>
          <p>
            This action is permanent and irreversible. All your data on this device will be removed.
            To confirm, type PURGE below.
          </p>
          <input
            className="settings-input"
            style={{ marginTop: '0.65rem' }}
            placeholder="Type PURGE to confirm"
            value={purge}
            onChange={(e) => setPurge(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="settings-btn settings-btn--danger"
          disabled={purge !== 'PURGE'}
          onClick={handleDelete}
        >
          Permanently Delete My Account
        </button>
      </div>
    </>
  )
}

function BackupPanel() {
  return (
    <>
      <p className="settings-panel-intro">
        Export or import your reading progress to transfer between devices or create backups.
      </p>
      <div className="settings-notice">
        <strong>Backup &amp; Restore is currently disabled</strong>
        <p>
          This feature is being reworked and will be available again in a future update. We
          appreciate your patience!
        </p>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="button" className="settings-btn" disabled>
          Export Progress
        </button>
        <button type="button" className="settings-btn" disabled>
          Import Progress
        </button>
      </div>
    </>
  )
}

function Row({
  title,
  desc,
  control,
}: {
  title: string
  desc: string
  control: ReactNode
}) {
  return (
    <div className="settings-row">
      <div className="settings-row-text">
        <h3>{title}</h3>
        <p>{desc}</p>
      </div>
      <div className="settings-row-control">{control}</div>
    </div>
  )
}

function SliderRow({
  label,
  desc,
  value,
  min = 50,
  max = 150,
  step = 5,
  onChange,
}: {
  label: string
  desc: string
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (v: number) => void
}) {
  return (
    <Row
      title={label}
      desc={desc}
      control={
        <div className="settings-slider-row">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
          />
          <span className="settings-slider-val">{value}%</span>
        </div>
      }
    />
  )
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      className={`settings-switch${checked ? ' is-on' : ''}`}
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <span className="settings-switch-thumb" />
    </button>
  )
}

function IconPalette() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="13.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="10.5" r="2.5" />
      <circle cx="8.5" cy="7.5" r="2.5" />
      <circle cx="6.5" cy="12.5" r="2.5" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.8-.1 2.6-.3" />
    </svg>
  )
}

function IconBook() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  )
}

function IconKeyboard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8" />
    </svg>
  )
}

function IconMonitor() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  )
}

function IconTags() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0L22 12V2z" />
      <path d="M7 7h.01" />
    </svg>
  )
}

function IconDatabase() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14a9 3 0 0 0 18 0V5M3 12a9 3 0 0 0 18 0" />
    </svg>
  )
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function IconArchive() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="2" y="3" width="20" height="5" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8M10 12h4" />
    </svg>
  )
}
