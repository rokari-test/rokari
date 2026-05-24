import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ANNOUNCEMENT_CATEGORY_LABELS,
  formatNewsDate,
  formatTimeAgo,
  type AnnouncementCategory,
} from '../data/announcements'
import { usePublishedAnnouncements } from '../hooks/useAnnouncements'
import './NewsPage.css'

type CategoryFilter = 'all' | AnnouncementCategory

const MS_WEEK = 7 * 86_400_000

function groupByMonth(items: ReturnType<typeof usePublishedAnnouncements>) {
  const map = new Map<string, typeof items>()
  for (const item of items) {
    const d = new Date(item.postedAt)
    const label = d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    const bucket = map.get(label) ?? []
    bucket.push(item)
    map.set(label, bucket)
  }
  return [...map.entries()].map(([label, groupItems]) => ({
    label,
    items: groupItems.sort(
      (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
    ),
  }))
}

export function NewsPage() {
  const sorted = usePublishedAnnouncements()
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')

  const filtered = useMemo(() => {
    if (categoryFilter === 'all') return sorted
    return sorted.filter((a) => a.category === categoryFilter)
  }, [sorted, categoryFilter])

  const featured = sorted.find((a) => a.pinned) ?? sorted[0]
  const feedItems =
    categoryFilter === 'all' && featured
      ? filtered.filter((a) => a.id !== featured.id)
      : filtered
  const groups = useMemo(() => groupByMonth(feedItems), [feedItems])

  const thisWeek = sorted.filter((a) => Date.now() - new Date(a.postedAt).getTime() < MS_WEEK).length
  const categoryCounts = useMemo(() => {
    const counts: Record<AnnouncementCategory, number> = {
      update: 0,
      feature: 0,
      community: 0,
      event: 0,
    }
    for (const a of sorted) counts[a.category] += 1
    return counts
  }, [sorted])

  return (
    <div className="news-page container--wide">
      <header className="news-hero">
        <div className="news-hero-glow" aria-hidden />
        <div className="news-hero-burst" aria-hidden>
          <MegaphoneIcon />
        </div>
        <div className="news-hero-inner">
          <div className="news-hero-copy">
            <p className="news-eyebrow">Rokari · Broadcast</p>
            <h1>News</h1>
            <p className="news-lead">
              Product updates, new features, and community notes — tap any post for
              the full article with images.
            </p>
          </div>
          <div className="news-stats" aria-label="News overview">
            <NewsStat label="Posts" value={String(sorted.length)} hint="all time" />
            <NewsStat label="This week" value={String(thisWeek)} hint="fresh drops" accent />
            <NewsStat
              label="Latest"
              value={featured ? ANNOUNCEMENT_CATEGORY_LABELS[featured.category] : '—'}
              hint={featured ? formatTimeAgo(featured.postedAt) : 'nothing yet'}
            />
          </div>
        </div>
      </header>

      <div className="news-toolbar" role="toolbar" aria-label="Filter news">
        <div className="news-filter-pills">
          <FilterPill active={categoryFilter === 'all'} count={sorted.length} onClick={() => setCategoryFilter('all')}>
            All
          </FilterPill>
          {(Object.keys(ANNOUNCEMENT_CATEGORY_LABELS) as AnnouncementCategory[]).map((cat) => (
            <FilterPill
              key={cat}
              active={categoryFilter === cat}
              count={categoryCounts[cat]}
              onClick={() => setCategoryFilter(cat)}
            >
              {ANNOUNCEMENT_CATEGORY_LABELS[cat]}
            </FilterPill>
          ))}
        </div>
      </div>

      {featured && categoryFilter === 'all' && (
        <section className="news-featured" aria-label="Featured announcement">
          <FeaturedCard item={featured} />
        </section>
      )}

      {filtered.length === 0 ? (
        <div className="news-empty">
          <MegaphoneIcon large />
          <h2>No posts in this category</h2>
          <p>Try another filter or check back later.</p>
        </div>
      ) : feedItems.length === 0 ? null : (
        <div className="news-timeline">
          {groups.map((group) => (
            <section key={group.label} className="news-group" aria-labelledby={`news-${group.label}`}>
              <div className="news-group-head">
                <span className="news-group-dot" aria-hidden />
                <h2 id={`news-${group.label}`}>{group.label}</h2>
                <span className="news-group-count">{group.items.length}</span>
              </div>
              <ul className="news-group-list">
                {group.items.map((item) => (
                  <NewsCard key={item.id} item={item} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

function FilterPill({
  children,
  active,
  count,
  onClick,
}: {
  children: string
  active: boolean
  count: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={`news-filter-pill${active ? ' is-active' : ''}`}
      onClick={onClick}
      aria-pressed={active}
    >
      {children}
      <span>{count}</span>
    </button>
  )
}

function NewsStat({
  label,
  value,
  hint,
  accent,
}: {
  label: string
  value: string
  hint: string
  accent?: boolean
}) {
  return (
    <div className={`news-stat${accent ? ' news-stat--accent' : ''}`}>
      <span className="news-stat-label">{label}</span>
      <strong className="news-stat-value">{value}</strong>
      <span className="news-stat-hint">{hint}</span>
    </div>
  )
}

function FeaturedCard({ item }: { item: ReturnType<typeof usePublishedAnnouncements>[number] }) {
  return (
    <article className="news-featured-card">
      {item.coverImage ? (
        <div className="news-featured-thumb">
          <img src={item.coverImage} alt="" loading="lazy" />
        </div>
      ) : null}
      <div className="news-featured-main">
        <div className="news-featured-badge">Featured</div>
        <span className={`news-cat news-cat--${item.category}`}>
          {ANNOUNCEMENT_CATEGORY_LABELS[item.category]}
        </span>
        <h2>{item.title}</h2>
        <p>{item.preview}</p>
        <div className="news-featured-meta">
          <time dateTime={item.postedAt}>{formatNewsDate(item.postedAt)}</time>
          <span>{formatTimeAgo(item.postedAt)}</span>
        </div>
      </div>
      <Link to={`/news/${item.slug}`} className="news-expand-btn">
        Read full post
      </Link>
    </article>
  )
}

function NewsCard({ item }: { item: ReturnType<typeof usePublishedAnnouncements>[number] }) {
  return (
    <li className="news-card">
      <Link to={`/news/${item.slug}`} className="news-card-link">
        {item.coverImage ? (
          <div className="news-card-thumb">
            <img src={item.coverImage} alt="" loading="lazy" />
          </div>
        ) : null}
        <span className={`news-cat news-cat--${item.category}`}>
          {ANNOUNCEMENT_CATEGORY_LABELS[item.category]}
        </span>
        <div className="news-card-body">
          <h3>{item.title}</h3>
          <p>{item.preview}</p>
          <div className="news-card-meta">
            <time dateTime={item.postedAt}>{formatNewsDate(item.postedAt)}</time>
            <span>{formatTimeAgo(item.postedAt)}</span>
          </div>
        </div>
        <span className="news-card-chevron" aria-hidden>
          →
        </span>
      </Link>
    </li>
  )
}

function MegaphoneIcon({ large }: { large?: boolean }) {
  return (
    <svg width={large ? 36 : 28} height={large ? 36 : 28} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2c0-1.71-1-3.2-2.47-4.04L12 11.5c.83.74 1.35 1.82 1.35 3 0 1.18-.52 2.26-1.35 3l2.03 1.54C17.5 17.2 18.5 15.71 18.5 14z" />
    </svg>
  )
}


