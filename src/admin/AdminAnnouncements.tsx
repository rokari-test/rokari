import { Link } from 'react-router-dom'
import { ANNOUNCEMENT_CATEGORY_LABELS, formatNewsDate } from '../data/announcements'
import { useAllAnnouncements } from '../hooks/useAnnouncements'
import { deleteAnnouncement } from '../lib/announcementStore'

export function AdminAnnouncements() {
  const items = useAllAnnouncements()

  return (
    <>
      <header className="admin-page-head">
        <div>
          <h1 className="admin-page-title">News & announcements</h1>
          <p className="admin-page-sub">
            Create posts with cover images and rich blocks — each gets a full page at{' '}
            <code>/news/your-slug</code>.
          </p>
        </div>
        <Link to="/admin/announcements/new" className="admin-btn">
          + New announcement
        </Link>
      </header>

      <div className="admin-card">
        {items.length === 0 ? (
          <p className="admin-muted-inline">No announcements yet.</p>
        ) : (
          <ul className="admin-announce-list">
            {items.map((item) => (
              <li key={item.id} className="admin-announce-row">
                {item.coverImage ? (
                  <img src={item.coverImage} alt="" className="admin-announce-thumb" />
                ) : (
                  <div className="admin-announce-thumb admin-announce-thumb--empty" />
                )}
                <div className="admin-announce-main">
                  <div className="admin-announce-top">
                    <span className={`admin-pill admin-pill--type-${item.category}`}>
                      {ANNOUNCEMENT_CATEGORY_LABELS[item.category]}
                    </span>
                    {item.pinned ? <span className="admin-pill">pinned</span> : null}
                    {item.published === false ? (
                      <span className="admin-pill admin-pill--status-dismissed">draft</span>
                    ) : null}
                  </div>
                  <strong>{item.title}</strong>
                  <span className="admin-announce-meta">
                    /news/{item.slug} · {formatNewsDate(item.postedAt)}
                  </span>
                </div>
                <div className="admin-announce-actions">
                  <Link
                    to={`/news/${item.slug}`}
                    className="admin-btn admin-btn--ghost admin-btn--sm"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View
                  </Link>
                  <Link
                    to={`/admin/announcements/${item.id}/edit`}
                    className="admin-btn admin-btn--ghost admin-btn--sm"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost admin-btn--sm"
                    onClick={() => {
                      if (window.confirm(`Delete "${item.title}"?`)) deleteAnnouncement(item.id)
                    }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
