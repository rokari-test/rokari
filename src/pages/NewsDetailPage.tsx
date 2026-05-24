import { Link, useParams } from 'react-router-dom'
import { AnnouncementBlocks } from '../components/AnnouncementBlocks'
import {
  ANNOUNCEMENT_CATEGORY_LABELS,
  formatNewsDate,
  formatTimeAgo,
} from '../data/announcements'
import { useAnnouncementBySlug, usePublishedAnnouncements } from '../hooks/useAnnouncements'
import './NewsDetailPage.css'

export function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const item = useAnnouncementBySlug(slug)
  const all = usePublishedAnnouncements()
  const more = all.filter((a) => a.slug !== slug).slice(0, 4)

  if (!item) {
    return (
      <div className="news-detail-page container--wide">
        <div className="news-detail-empty">
          <h1>Post not found</h1>
          <p>This announcement may have been removed or is not published yet.</p>
          <Link to="/news" className="news-detail-back-link">
            ← Back to News
          </Link>
        </div>
      </div>
    )
  }

  return (
    <article className="news-detail-page container--wide">
      <Link to="/news" className="news-detail-back">
        ← All news
      </Link>

      <header className="news-detail-hero">
        {item.coverImage ? (
          <div className="news-detail-cover">
            <img src={item.coverImage} alt="" />
            <div className="news-detail-cover-shade" aria-hidden />
          </div>
        ) : (
          <div className="news-detail-cover news-detail-cover--placeholder" aria-hidden />
        )}

        <div className="news-detail-hero-body">
          <span className={`news-detail-cat news-detail-cat--${item.category}`}>
            {ANNOUNCEMENT_CATEGORY_LABELS[item.category]}
          </span>
          <h1>{item.title}</h1>
          <p className="news-detail-preview">{item.preview}</p>
          <div className="news-detail-meta">
            <time dateTime={item.postedAt}>{formatNewsDate(item.postedAt)}</time>
            <span>{formatTimeAgo(item.postedAt)}</span>
            {item.pinned ? <span className="news-detail-pin">Pinned</span> : null}
          </div>
        </div>
      </header>

      <div className="news-detail-layout">
        <div className="news-detail-content">
          <AnnouncementBlocks blocks={item.blocks} />
        </div>

        {more.length > 0 && (
          <aside className="news-detail-aside" aria-label="More news">
            <h2>More from Rokari</h2>
            <ul className="news-detail-more">
              {more.map((post) => (
                <li key={post.id}>
                  <Link to={`/news/${post.slug}`} className="news-detail-more-link">
                    <span className={`news-detail-cat news-detail-cat--${post.category}`}>
                      {ANNOUNCEMENT_CATEGORY_LABELS[post.category]}
                    </span>
                    <strong>{post.title}</strong>
                    <span>{formatTimeAgo(post.postedAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </article>
  )
}

