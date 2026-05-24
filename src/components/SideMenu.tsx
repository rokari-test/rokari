import { useEffect, useLayoutEffect, useMemo, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSiteConfig } from '../hooks/useSiteConfig'
import { usePreferences } from '../hooks/usePreferences'
import { useLibraryCount } from '../hooks/useLibrary'
import { useLibraryCatchUpPercent } from '../hooks/useLibraryStats'
import { isAdminAuthenticated, logoutAdmin } from '../lib/adminAuth'
import { UserAvatar } from './profile/UserAvatar'
import { getRoleLabel, logoutUser, type UserRole } from '../lib/userAuth'
import { useUser } from '../hooks/useUser'
import { useWallet } from '../hooks/useWallet'
import { useUserSubscription } from '../hooks/useUserSubscription'
import {
  formatCoinBalance,
  getSubscriptionRemaining,
} from '../lib/accountSummary'
import { MenuLucideIcon, type MenuLucideName } from './MenuLucideIcon'
import { resolveTheme, resolveSiteThemeId } from '../lib/theme'
import type { ThemeMode } from '../lib/preferences'
import './SideMenu.css'

interface SideMenuProps {
  open: boolean
  onClose: () => void
  onOpenThemes: () => void
}

type NavItem = {
  to: string
  label: string
  icon: MenuLucideName
  tone: string
  roles?: UserRole[]
}

const SHELF_NAV: NavItem[] = [
  { to: '/novels', label: 'Novels', icon: 'book-open', tone: 'violet' },
  { to: '/library', label: 'Library', icon: 'book-open', tone: 'rose' },
  { to: '/history', label: 'History', icon: 'history', tone: 'amber' },
  { to: '/bookmarks', label: 'Bookmarks', icon: 'bookmark', tone: 'gold' },
  { to: '/store', label: 'Shop', icon: 'shopping-cart', tone: 'violet' },
  { to: '/news', label: 'News', icon: 'megaphone', tone: 'amber' },
  { to: '/reports', label: 'Reports', icon: 'flag', tone: 'coral' },
  { to: '/settings', label: 'Settings', icon: 'settings', tone: 'muted' },
]

const STUDIO_NAV: NavItem[] = [
  {
    to: '/admin/login',
    label: 'Upload',
    icon: 'upload',
    tone: 'mint',
    roles: ['uploader', 'admin', 'owner'],
  },
  {
    to: '/admin',
    label: 'Owner panel',
    icon: 'layout-dashboard',
    tone: 'rose',
    roles: ['admin', 'owner'],
  },
]

/** Kept in code; not shown in the menu UI. */
export const INSTALL_NAV_ITEM: NavItem = {
  to: '#install',
  label: 'Install App',
  icon: 'download',
  tone: 'blue',
}

function usePopoverPosition(open: boolean): CSSProperties {
  const [style, setStyle] = useState<CSSProperties>({})

  useLayoutEffect(() => {
    if (!open) return

    const update = () => {
      const anchor = document.querySelector('.header-menu-anchor')
      if (!anchor) return
      const rect = anchor.getBoundingClientRect()
      setStyle({
        top: rect.bottom + 10,
        right: Math.max(12, window.innerWidth - rect.right),
      })
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open])

  return style
}

function navItemVisible(item: NavItem, role: UserRole | undefined): boolean {
  if (!item.roles?.length) return true
  return role !== undefined && item.roles.includes(role)
}

export function SideMenu({ open, onClose, onOpenThemes }: SideMenuProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { siteName } = useSiteConfig()
  const { prefs, update } = usePreferences()
  const { reading } = useLibraryCount()
  const catchUpPercent = useLibraryCatchUpPercent()
  const { user } = useUser()
  const { balance } = useWallet()
  const { subscription, plan } = useUserSubscription()

  const studioItems = useMemo(() => {
    return STUDIO_NAV.filter((item) => navItemVisible(item, user?.role))
  }, [user?.role])

  const onNovelsHub =
    location.pathname === '/novels' || location.pathname.startsWith('/novels/')

  const shelfNav = useMemo(() => {
    const formatLink: NavItem = onNovelsHub
      ? { to: '/', label: 'Comics', icon: 'list', tone: 'violet' }
      : { to: '/novels', label: 'Novels', icon: 'book-open', tone: 'violet' }
    return [formatLink, ...SHELF_NAV.slice(1)]
  }, [onNovelsHub])

  const activeTheme = resolveTheme(resolveSiteThemeId(prefs))
  const activePalette =
    prefs.themeMode === 'light' ? activeTheme?.light : activeTheme?.dark
  const popoverStyle = usePopoverPosition(open)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return

      const popover = document.getElementById('user-menu-popover')
      if (popover?.contains(target)) return

      if (target instanceof Element && target.closest('.header-user-pill, .header-login')) {
        return
      }

      onClose()
    }

    document.addEventListener('pointerdown', onPointerDown, true)
    return () => document.removeEventListener('pointerdown', onPointerDown, true)
  }, [open, onClose])

  if (!open) return null

  const handleNav = (to: string) => {
    if (to.startsWith('/admin') && !isAdminAuthenticated() && to === '/admin') {
      navigate('/admin/login')
      onClose()
      return
    }
    onClose()
    if (to.includes('#')) {
      const [path, hash] = to.split('#')
      navigate(path || '/')
      window.setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
      }, 120)
      return
    }
    navigate(to)
  }

  const handleLogout = () => {
    logoutUser()
    logoutAdmin()
    onClose()
    navigate('/')
  }

  const openProfile = () => {
    onClose()
    navigate(user ? '/profile' : '/login')
  }

  const coins = formatCoinBalance(balance)
  const remaining = getSubscriptionRemaining(subscription, plan)
  const planAccent = plan?.accent ?? 'var(--text-muted)'

  const toggleTheme = () => {
    update({ themeMode: (prefs.themeMode === 'light' ? 'dark' : 'light') as ThemeMode })
  }

  return createPortal(
    <>
      <button
        type="button"
        className="side-menu-backdrop"
        aria-label="Close menu"
        onClick={onClose}
      />
      <aside
        id="user-menu-popover"
        className="side-menu side-menu--popover side-menu--deck"
        style={popoverStyle}
        role="dialog"
        aria-modal="false"
        aria-label="Reader deck"
      >
        <div className="deck-hero">
          <div className="deck-hero-glow" aria-hidden />
          <div className="deck-hero-grid" aria-hidden />

          <button type="button" className="deck-identity" onClick={openProfile}>
            <div className="deck-avatar-wrap">
              {user ? (
                <UserAvatar user={user} size="deck" shape="rounded" className="deck-avatar" />
              ) : (
                <span className="deck-avatar">{siteName.charAt(0)}</span>
              )}
              {user && reading > 0 ? (
                <span
                  className="deck-avatar-ring"
                  style={{ '--deck-progress': `${Math.max(8, catchUpPercent)}%` } as CSSProperties}
                  aria-hidden
                />
              ) : null}
            </div>

            <span className="deck-identity-copy">
              <span className="deck-eyebrow">{user ? 'Reader pass' : 'Browsing as guest'}</span>
              <strong>{user ? user.displayName : siteName}</strong>
              {user ? (
                <span className="deck-meta-row">
                  <span className="deck-handle">@{user.username}</span>
                  {user.role !== 'user' ? (
                    <span className="deck-role">{getRoleLabel(user.role)}</span>
                  ) : null}
                </span>
              ) : (
                <span className="deck-guest-hint">Sign in to sync your shelf</span>
              )}
            </span>

            <MenuLucideIcon name="chevron-right" className="deck-identity-arrow" />
          </button>

          {user ? (
            <div className="deck-stats" role="group" aria-label="Account balance">
              <button
                type="button"
                className="deck-stat deck-stat--coins"
                onClick={() => handleNav('/store')}
                title={`${coins.value} ${coins.unit}`}
              >
                <span className="deck-stat-gem" aria-hidden>
                  <MenuLucideIcon name="coins" />
                </span>
                <span className="deck-stat-main">
                  <strong>{coins.value}</strong>
                  <span className="deck-stat-tag">Coins</span>
                </span>
              </button>
              <button
                type="button"
                className={`deck-stat deck-stat--plan${remaining.expired ? ' is-expired' : ''}`}
                onClick={() => handleNav('/store?tab=subscriptions')}
                style={{ '--plan-accent': planAccent } as CSSProperties}
                title={`${plan?.name ?? 'Free'} — ${remaining.primaryLabel}`}
              >
                <span className="deck-stat-gem" aria-hidden>
                  <MenuLucideIcon name="sparkles" />
                </span>
                <span className="deck-stat-main">
                  <strong>{plan?.name ?? 'Free'}</strong>
                  <span className="deck-stat-tag">{remaining.primaryLabel}</span>
                </span>
              </button>
            </div>
          ) : null}
        </div>

        <nav className="deck-shelf" aria-label="Your shelf">
          <p className="deck-shelf-label">Your shelf</p>
          <ul className="deck-spine-list">
            {shelfNav.map((item) => (
              <li key={item.to}>
                <button
                  type="button"
                  role="menuitem"
                  className={`deck-spine deck-spine--${item.tone}`}
                  onClick={() => handleNav(item.to)}
                >
                  <span className="deck-spine-icon">
                    <MenuLucideIcon name={item.icon} />
                  </span>
                  <span className="deck-spine-copy">
                    <span className="deck-spine-title">{item.label}</span>
                  </span>
                  {item.label === 'Library' && reading > 0 ? (
                    <span className="deck-spine-badge">{reading}</span>
                  ) : (
                    <MenuLucideIcon name="chevron-right" className="deck-spine-chevron" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {studioItems.length > 0 ? (
          <nav className="deck-shelf deck-shelf--studio" aria-label="Studio tools">
            <p className="deck-shelf-label">Studio</p>
            <ul className="deck-spine-list">
              {studioItems.map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    role="menuitem"
                    className={`deck-spine deck-spine--${item.tone} deck-spine--studio`}
                    onClick={() => handleNav(item.to)}
                  >
                    <span className="deck-spine-icon">
                      <MenuLucideIcon name={item.icon} />
                    </span>
                    <span className="deck-spine-copy">
                      <span className="deck-spine-title">{item.label}</span>
                    </span>
                    <MenuLucideIcon name="chevron-right" className="deck-spine-chevron" />
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        <div className="deck-dock" aria-label="Appearance">
          <button type="button" className="deck-dock-btn" onClick={toggleTheme}>
            <MenuLucideIcon name={prefs.themeMode === 'light' ? 'sun' : 'moon'} />
            <span>{prefs.themeMode === 'light' ? 'Light' : 'Dark'}</span>
          </button>

          <button
            type="button"
            className="deck-dock-btn deck-dock-btn--palette"
            onClick={() => {
              onClose()
              onOpenThemes()
            }}
          >
            <span className="deck-palette-preview" aria-hidden>
              <span style={{ background: activePalette?.background ?? 'var(--bg)' }} />
              <span style={{ background: activePalette?.primary ?? 'var(--accent)' }} />
            </span>
            <span>Palette</span>
          </button>

          <label className="deck-saver">
            <MenuLucideIcon name="wifi" className="deck-saver-icon" />
            <span>Saver</span>
            <ToggleSwitch
              checked={prefs.dataSaver}
              onChange={(v) => update({ dataSaver: v })}
            />
          </label>
        </div>

        <footer className="deck-foot">
          {user ? (
            <button type="button" role="menuitem" className="deck-signout" onClick={handleLogout}>
              <MenuLucideIcon name="log-out" />
              Sign out
            </button>
          ) : (
            <button
              type="button"
              role="menuitem"
              className="deck-signin"
              onClick={() => {
                onClose()
                navigate('/login')
              }}
            >
              Sign in to Rokari
            </button>
          )}
        </footer>
      </aside>
    </>,
    document.body,
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
      className={`deck-switch${checked ? ' is-on' : ''}`}
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <span className="deck-switch-thumb" />
    </button>
  )
}
