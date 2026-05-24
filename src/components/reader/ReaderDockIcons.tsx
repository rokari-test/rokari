type IconProps = { size?: number; className?: string }

const defaults = { size: 16, className: 'rok-dock-icon' }

function base(
  size: number,
  className: string,
  children: React.ReactNode,
  opts?: { fill?: string },
) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={opts?.fill ?? 'none'}
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  )
}

export function IconChevUp({ size = defaults.size, className = defaults.className }: IconProps) {
  return base(size, className, (
    <>
      <path d="M12 5v8" />
      <path d="M8.5 9.5 12 6l3.5 3.5" />
    </>
  ))
}

export function IconChevDown({ size = defaults.size, className = defaults.className }: IconProps) {
  return base(size, className, (
    <>
      <path d="M12 19V11" />
      <path d="M8.5 14.5 12 18l3.5-3.5" />
    </>
  ))
}

export function IconChevLeft({ size = defaults.size, className = defaults.className }: IconProps) {
  return base(size, className, (
    <>
      <path d="M5 12h8" />
      <path d="M9.5 8.5 6 12l3.5 3.5" />
    </>
  ))
}

export function IconChevRight({ size = defaults.size, className = defaults.className }: IconProps) {
  return base(size, className, (
    <>
      <path d="M19 12h-8" />
      <path d="M14.5 8.5 18 12l-3.5 3.5" />
    </>
  ))
}

export function IconList({ size = defaults.size, className = defaults.className }: IconProps) {
  return base(size, className, (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2.5" />
      <path d="M8 9h8M8 12h8M8 15h5" />
    </>
  ))
}

export function IconChat({ size = defaults.size, className = defaults.className }: IconProps) {
  return base(size, className, (
    <>
      <path d="M6 8.5A3.5 3.5 0 0 1 9.5 5h9A2.5 2.5 0 0 1 21 7.5v6A2.5 2.5 0 0 1 18.5 16H11l-4.2 3.2a1 1 0 0 1-1.6-.8V8.5Z" />
      <circle cx="10" cy="10.5" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="14" cy="10.5" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="18" cy="10.5" r="0.75" fill="currentColor" stroke="none" />
    </>
  ))
}

export function IconZoomOut({ size = defaults.size, className = defaults.className }: IconProps) {
  return base(size, className, (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4 4" />
      <path d="M8.5 11h5" />
    </>
  ))
}

export function IconZoomIn({ size = defaults.size, className = defaults.className }: IconProps) {
  return base(size, className, (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4 4" />
      <path d="M11 8.5v5M8.5 11h5" />
    </>
  ))
}

export function IconPlay({ size = defaults.size, className = defaults.className }: IconProps) {
  return base(size, className, (
    <path d="M8 6.5v11l10-5.5-10-5.5Z" fill="currentColor" stroke="none" />
  ), { fill: 'currentColor' })
}

export function IconPause({ size = defaults.size, className = defaults.className }: IconProps) {
  return base(size, className, (
    <>
      <rect x="7" y="6" width="3.5" height="12" rx="1" fill="currentColor" stroke="none" />
      <rect x="13.5" y="6" width="3.5" height="12" rx="1" fill="currentColor" stroke="none" />
    </>
  ), { fill: 'currentColor' })
}

export function IconFullscreen({ size = defaults.size, className = defaults.className }: IconProps) {
  return base(size, className, (
    <>
      <path d="M9 4H4v5M20 9V4h-5M4 15v5h5M15 20h5v-5" />
    </>
  ))
}

export function IconSettings({ size = defaults.size, className = defaults.className }: IconProps) {
  return base(size, className, (
    <>
      <circle cx="12" cy="12" r="2.75" />
      <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </>
  ))
}

export function IconBook({ size = defaults.size, className = defaults.className }: IconProps) {
  return base(size, className, (
    <>
      <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v16H7.5A2.5 2.5 0 0 0 5 21.5V5.5Z" />
      <path d="M5 5.5A2.5 2.5 0 0 0 7.5 3v16A2.5 2.5 0 0 1 5 21.5" />
    </>
  ))
}

export function IconHome({ size = defaults.size, className = defaults.className }: IconProps) {
  return base(size, className, (
    <>
      <path d="M4 11.5 12 5l8 6.5V19a2 2 0 0 1-2 2h-4v-6H10v6H6a2 2 0 0 1-2-2v-7.5Z" />
    </>
  ))
}

export function IconLayout({ size = defaults.size, className = defaults.className }: IconProps) {
  return base(size, className, (
    <>
      <path d="M4 7h16M7 4v6M12 4v6M17 4v6" />
      <rect x="4" y="11" width="16" height="9" rx="2" />
    </>
  ))
}

/** Thumbtack — pin dock open */
export function IconPin({ size = defaults.size, className = defaults.className }: IconProps) {
  return base(size, className, (
    <>
      <circle cx="12" cy="9" r="3.25" />
      <path d="M12 12.25V20M9.5 20h5" />
    </>
  ))
}

/** Unpin — dock auto-hides */
export function IconPinOff({ size = defaults.size, className = defaults.className }: IconProps) {
  return base(size, className, (
    <>
      <circle cx="12" cy="9" r="3.25" />
      <path d="M12 12.25V20M9.5 20h5" />
      <path d="M5 5l14 14" />
    </>
  ))
}

export function IconHeart({
  size = defaults.size,
  className = defaults.className,
  filled = false,
}: IconProps & { filled?: boolean }) {
  return base(
    size,
    className,
    <path
      d="M12 20.5s-6.5-4.2-8.5-8.2C2.2 9.2 3.6 5.5 7 5.5c1.9 0 3.6 1 4.5 2.5C12.4 6.5 14.1 5.5 16 5.5c3.4 0 4.8 3.7 3.5 6.8-2 4-8.5 8.2-8.5 8.2Z"
      fill={filled ? 'currentColor' : 'none'}
    />,
  )
}

export function IconEyeOff({ size = defaults.size, className = defaults.className }: IconProps) {
  return base(size, className, (
    <>
      <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M4 4l16 16" />
    </>
  ))
}
