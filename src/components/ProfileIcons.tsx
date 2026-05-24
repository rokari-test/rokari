import type { ProfilePermIcon } from '../lib/profilePermissions'

type IconName =
  | ProfilePermIcon
  | 'edit'
  | 'external'
  | 'logout'
  | 'library-link'
  | 'lists'
  | 'chevron'
  | 'monitor'
  | 'eye'
  | 'check'
  | 'x'
  | 'calendar'
  | 'coins'
  | 'sparkles'
  | 'shop'

const COLORS: Partial<Record<IconName, string>> = {
  'library-link': '#a78bfa',
  lists: '#c084fc',
  coins: '#ff4d8d',
  sparkles: '#fbbf24',
  shop: '#ff4d8d',
  login: '#4ade80',
  comment: '#38bdf8',
  supporter: '#f472b6',
  upload: '#38bdf8',
  edit: '#fb923c',
  moderate: '#fbbf24',
  administer: '#f87171',
  monitor: '#94a3b8',
  eye: '#4ade80',
  external: 'currentColor',
  logout: '#f87171',
  check: '#4ade80',
  x: '#9ca3af',
  calendar: '#94a3b8',
}

export function ProfileIcon({
  name,
  size = 18,
  className = '',
}: {
  name: IconName
  size?: number
  className?: string
}) {
  const color = COLORS[name] ?? 'currentColor'
  const cls = `profile-ui-icon ${className}`.trim()

  const svgProps = {
    width: size,
    height: size,
    className: cls,
    style: { color },
    'aria-hidden': true as const,
  }

  switch (name) {
    case 'library-link':
      return (
        <svg viewBox="0 0 24 24" {...svgProps}>
          <path fill="currentColor" d="M6 4h12v2H6V4zm0 5h12v11H6V9zm2 2v7h8v-7H8z" />
        </svg>
      )
    case 'lists':
      return (
        <svg viewBox="0 0 24 24" {...svgProps}>
          <path fill="currentColor" d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
        </svg>
      )
    case 'login':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...svgProps}>
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
        </svg>
      )
    case 'comment':
      return (
        <svg viewBox="0 0 24 24" {...svgProps}>
          <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
        </svg>
      )
    case 'supporter':
      return (
        <svg viewBox="0 0 24 24" {...svgProps}>
          <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      )
    case 'upload':
      return (
        <svg viewBox="0 0 24 24" {...svgProps}>
          <path fill="currentColor" d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z" />
        </svg>
      )
    case 'edit':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...svgProps}>
          <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
        </svg>
      )
    case 'moderate':
      return (
        <svg viewBox="0 0 24 24" {...svgProps}>
          <path fill="currentColor" d="M14 3H6v18h12V9h-4V3zm2 2.5L18.5 9H16V5.5z" />
        </svg>
      )
    case 'administer':
      return (
        <svg viewBox="0 0 24 24" {...svgProps}>
          <path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
        </svg>
      )
    case 'monitor':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...svgProps}>
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <path d="M8 20h8M12 16v4" />
        </svg>
      )
    case 'eye':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...svgProps}>
          <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
    case 'external':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...svgProps}>
          <path d="M7 17L17 7M7 7h10v10" />
        </svg>
      )
    case 'logout':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...svgProps}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
        </svg>
      )
    case 'chevron':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...svgProps}>
          <path d="M9 18l6-6-6-6" />
        </svg>
      )
    case 'check':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" {...svgProps}>
          <path d="M20 6L9 17l-5-5" />
        </svg>
      )
    case 'x':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...svgProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="M15 9l-6 6M9 9l6 6" />
        </svg>
      )
    case 'calendar':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...svgProps}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      )
    case 'coins':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...svgProps}>
          <circle cx="12" cy="12" r="10" />
          <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 0 1 0 4H8" />
          <path d="M12 18V6" />
        </svg>
      )
    case 'sparkles':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...svgProps}>
          <path d="M9.94 2 11 6.94 16 8l-5 1.06L9.94 14 8 9.06 3 8l5-1.06L9.94 2z" />
          <path d="M18.5 14l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" />
        </svg>
      )
    case 'shop':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...svgProps}>
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      )
    default:
      return null
  }
}
