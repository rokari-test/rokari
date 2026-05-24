export function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/** "about 16h ago" for Keep Reading cards */
export function formatReadingAgo(updatedAt: number): string {
  const ms = Date.now() - updatedAt
  if (ms < 0) return 'just now'
  const mins = Math.floor(ms / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `about ${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `about ${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `about ${days}d ago`
  if (days < 30) return `about ${Math.floor(days / 7)}w ago`
  return formatRelativeDate(new Date(updatedAt).toISOString())
}

/** Compact feed timestamps: 1h, 2d, 2mo */
export function formatShortRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  if (ms < 0) return 'now'
  const mins = Math.floor(ms / 60000)
  if (mins < 60) return `${Math.max(1, mins)}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo`
  return `${Math.floor(months / 12)}y`
}

export function formatRating(rating: number, views: number): string {
  const r = Number.isFinite(rating) ? rating : 0
  const v = Number.isFinite(views) ? views : 0
  const count = Math.max(1, Math.floor(v / 2000))
  return `${r.toFixed(1)} (${count})`
}
