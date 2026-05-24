import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSiteConfig } from '../hooks/useSiteConfig'
import { useUser } from '../hooks/useUser'
import { UserAvatar } from './profile/UserAvatar'
import { SeriesSearchField } from './SeriesSearchField'
import { SideMenu } from './SideMenu'
import { ThemesPanel } from './ThemesPanel'
import './Header.css'

interface HeaderProps {
  searchQuery?: string
  onSearchChange?: (query: string) => void
  onSearchSubmit?: (query: string) => void
}

export function Header({
  searchQuery = '',
  onSearchChange,
  onSearchSubmit,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [themesOpen, setThemesOpen] = useState(false)
  const { siteName } = useSiteConfig()
  const { user } = useUser()
  const location = useLocation()
  const onNovelsHub = location.pathname === '/novels' || location.pathname.startsWith('/novels/')
  const [modKeyLabel, setModKeyLabel] = useState('Ctrl K')
  const closeMenu = () => setMenuOpen(false)

  useEffect(() => {
    setModKeyLabel(/Mac|iPhone|iPad/i.test(navigator.userAgent) ? '⌘ K' : 'Ctrl K')
  }, [])

  const submitSearch = (query: string) => {
    onSearchSubmit?.(query)
    setSearchOpen(false)
    setMenuOpen(false)
  }

  useEffect(() => {
    if (!searchOpen) return
    const t = window.setTimeout(() => {
      document.getElementById('header-search-mobile')?.focus()
    }, 50)
    return () => window.clearTimeout(t)
  }, [searchOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setMenuOpen(false)
        setThemesOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <header className="header">
        <div className="header-inner container--wide">
          <Link to="/" className="header-brand" onClick={closeMenu}>
            <span className="header-brand-name">{siteName}</span>
            <span className="header-beta">Beta</span>
          </Link>

          <div className="header-search">
            <SeriesSearchField
              value={searchQuery}
              onChange={(v) => onSearchChange?.(v)}
              onSubmit={submitSearch}
              variant="header"
              inputId="global-search"
              showButton={false}
              placeholder="Search series..."
            />
            <kbd className="header-search-kbd" aria-hidden>
              {modKeyLabel}
            </kbd>
          </div>

          <div className="header-actions">
            {onNovelsHub ? (
              <Link to="/" className="header-nav-link header-nav-link--active" onClick={closeMenu}>
                Comics
              </Link>
            ) : (
              <Link to="/novels" className="header-nav-link" onClick={closeMenu}>
                Novels
              </Link>
            )}
            <Link to="/store" className="header-icon-btn header-shop" title="Shop">
              <ShoppingCartIcon />
              <span className="header-shop-label">Shop</span>
            </Link>
            <button
              type="button"
              className="header-icon-btn header-search-mobile"
              aria-label="Open search"
              onClick={() => setSearchOpen(true)}
            >
              <SearchIcon />
            </button>
            <a
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
              className="header-icon-btn"
              aria-label="Discord server"
              title="Join our Discord"
            >
              <DiscordIcon />
            </a>
            <div className="header-menu-anchor">
              {user ? (
                <button
                  type="button"
                  className={`header-user-pill${menuOpen ? ' is-open' : ''}`}
                  aria-expanded={menuOpen}
                  aria-controls="user-menu-popover"
                  aria-haspopup="true"
                  aria-label="User menu"
                  title="Open menu"
                  onClick={() => setMenuOpen((o) => !o)}
                >
                  <UserAvatar user={user} size="xs" className="header-user-avatar" />
                  <span className="header-user-name">{user.displayName}</span>
                </button>
              ) : (
                <button
                  type="button"
                  className={`header-login${menuOpen ? ' is-open' : ''}`}
                  aria-expanded={menuOpen}
                  aria-controls="user-menu-popover"
                  aria-haspopup="true"
                  aria-label="User menu"
                  onClick={() => setMenuOpen((o) => !o)}
                >
                  Login
                  <ChevronDownIcon />
                </button>
              )}
              <SideMenu
                open={menuOpen}
                onClose={closeMenu}
                onOpenThemes={() => setThemesOpen(true)}
              />
            </div>
          </div>
        </div>
      </header>

      {searchOpen && (
        <div className="header-overlay-panel" role="dialog" aria-label="Search">
          <button
            type="button"
            className="header-overlay-backdrop"
            aria-label="Close search"
            onClick={() => setSearchOpen(false)}
          />
          <div className="header-search-panel-wrap">
            <SeriesSearchField
              value={searchQuery}
              onChange={(v) => onSearchChange?.(v)}
              onSubmit={submitSearch}
              variant="mobile"
              inputId="header-search-mobile"
              buttonLabel="Go"
              placeholder="Search series..."
            />
          </div>
        </div>
      )}

      <ThemesPanel open={themesOpen} onClose={() => setThemesOpen(false)} />
    </>
  )
}

function ShoppingCartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20L17 17" />
    </svg>
  )
}

function DiscordIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}
