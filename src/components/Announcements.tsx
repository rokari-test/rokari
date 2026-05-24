import { Link } from 'react-router-dom'
import { useState } from 'react'
import { formatTimeAgo } from '../data/announcements'
import { usePublishedAnnouncements } from '../hooks/useAnnouncements'
import type { Announcement } from '../lib/announcementStore'
import './Announcements.css'

const DISMISS_KEY = 'sakura-dismissed-announcements'

function loadDismissed(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISS_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function saveDismissed(ids: Set<string>) {
  localStorage.setItem(DISMISS_KEY, JSON.stringify([...ids]))
}

export function Announcements() {
  const [dismissed, setDismissed] = useState(loadDismissed)
  const items = usePublishedAnnouncements()
  const visible = items.filter((a) => !dismissed.has(a.id)).slice(0, 2)

  if (visible.length === 0) return null

  const dismiss = (id: string) => {
    const next = new Set(dismissed)
    next.add(id)
    setDismissed(next)
    saveDismissed(next)
  }

  return (
    <div id="announcements" className="announcements container--wide">
      <div className="announcements-head">
        <h2 className="announcements-title">Latest from Rokari</h2>
        <Link to="/news" className="announcements-all">
          All news →
        </Link>
      </div>
      {visible.map((item) => (
        <AnnouncementRow key={item.id} item={item} onDismiss={() => dismiss(item.id)} />
      ))}
    </div>
  )
}

function AnnouncementRow({ item, onDismiss }: { item: Announcement; onDismiss: () => void }) {
  return (
    <article className="announcement">
      <span className="announcement-dot" aria-hidden />
      <div className="announcement-content">
        <div className="announcement-top">
          <Link to={`/news/${item.slug}`} className="announcement-title">
            {item.title}
          </Link>
          <span className="announcement-time">{formatTimeAgo(item.postedAt)}</span>
        </div>
        <p className="announcement-preview">{item.preview}</p>
        <Link to={`/news/${item.slug}`} className="announcements-all announcement-read-more">
          Read full post →
        </Link>
      </div>
      <div className="announcement-actions">
        <button type="button" className="announcement-action" aria-label="Dismiss" onClick={onDismiss}>
          ×
        </button>
      </div>
    </article>
  )
}
