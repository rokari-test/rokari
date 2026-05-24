import { NavLink } from 'react-router-dom'
import './AppBottomNav.css'

const NAV = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/search', label: 'Search', icon: 'search' },
  { to: '/history', label: 'History', icon: 'history' },
  { to: '/library', label: 'Library', icon: 'library' },
  { to: '/profile', label: 'Account', icon: 'account' },
] as const

export function AppBottomNav() {
  return (
    <nav className="app-bottom-nav" aria-label="Main">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `app-bottom-nav-item${isActive ? ' app-bottom-nav-item--active' : ''}`
          }
        >
          <NavIcon name={item.icon} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

function NavIcon({ name }: { name: (typeof NAV)[number]['icon'] }) {
  switch (name) {
    case 'home':
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path fill="currentColor" d="M12 3l9 8h-3v9h-5v-6H11v6H6v-9H3l9-8z" />
        </svg>
      )
    case 'search':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20L17 17" />
        </svg>
      )
    case 'history':
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path fill="currentColor" d="M12 3a9 9 0 1 0 9 9h-2a7 7 0 1 1-2.05-4.95L14 9H7V2l2.8 2.8A8.96 8.96 0 0 1 12 3zm-1 5v5l4.25 2.45.75-1.3-3.5-2.02V8H11z" />
        </svg>
      )
    case 'library':
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path fill="currentColor" d="M6 4h12v2H6V4zm0 5h12v11H6V9zm2 2v7h8v-7H8z" />
        </svg>
      )
    case 'account':
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path fill="currentColor" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
        </svg>
      )
    default:
      return null
  }
}
