import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSeriesBySlug } from '../data/catalog'
import { useChapterBookmarks } from '../hooks/useLibrary'
import { formatReadingAgo } from '../lib/format'
import type { ChapterBookmark } from '../lib/storage'
import type { Series } from '../types'
import './BookmarksPage.css'

type FormatFilter = 'all' | 'manhwa' | 'novel'

interface BookmarkEntry {
  bookmark: ChapterBookmark
  series: Series
}

interface SeriesGroup {
  series: Series
  items: BookmarkEntry[]
  latestAt: number
}

const MS_DAY = 86_400_000

function groupBySeries(entries: BookmarkEntry[]): SeriesGroup[] {
  const map = new Map<string, SeriesGroup>()
  for (const entry of entries) {
    const slug = entry.series.slug
    const existing = map.get(slug)
    if (existing) {
      existing.items.push(entry)
      existing.latestAt = Math.max(existing.latestAt, entry.bookmark.addedAt)
    } else {
      map.set(slug, {
        series: entry.series,
        items: [entry],
        latestAt: entry.bookmark.addedAt,
      })
    }
  }
  return [...map.values()].sort((a, b) => b.latestAt - a.latestAt)
}

export function BookmarksPage() {
  const { items, remove } = useChapterBookmarks()
  const [formatFilter, setFormatFilter] = useState<FormatFilter>('all')

  const entries = useMemo(
    () =>
      items
        .map((bookmark) => {
          const series = getSeriesBySlug(bookmark.slug)
          return series ? { bookmark, series } : null
        })
        .filter((e): e is BookmarkEntry => Boolean(e)),
    [items],
  )

  const filtered = useMemo(() => {
    if (formatFilter === 'all') return entries
    return entries.filter((e) => e.series.type === formatFilter)
  }, [entries, formatFilter])

  const groups = useMemo(() => groupBySeries(filtered), [filtered])

  const seriesCount = new Set(filtered.map((e) => e.series.slug)).size
  const savedToday = filtered.filter(
    (e) => Date.now() - e.bookmark.addedAt < MS_DAY,
  ).length
  const manhwaCount = entries.filter((e) => e.series.type === 'manhwa').length
  const novelCount = entries.filter((e) => e.series.type === 'novel').length

  return (
    <div className="bookmarks-page container--wide">
      <header className="bookmarks-hero">
        <div className="bookmarks-hero-glow" aria-hidden />
        <div className="bookmarks-hero-ribbon" aria-hidden>
          <RibbonIcon />
        </div>
        <div className="bookmarks-hero-inner">
          <div className="bookmarks-hero-copy">
            <p className="bookmarks-eyebrow">Rokari · Saved chapters</p>
            <h1>Bookmarks</h1>
            <p className="bookmarks-lead">
              Pin chapters while you read — they land here as a personal shelf
              you can jump back to anytime.
            </p>
            <div className="bookmarks-hero-actions">
              <Link to="/library" className="bookmarks-hero-btn bookmarks-hero-btn--primary">
                Your library
              </Link>
              <Link to="/browse" className="bookmarks-hero-btn bookmarks-hero-btn--ghost">
                Find more
              </Link>
            </div>
          </div>

          <div className="bookmarks-stats" aria-label="Bookmark overview">
            <BookmarkStat
              label="Saved"
              value={String(filtered.length)}
              hint={filtered.length === 1 ? 'chapter pinned' : 'chapters pinned'}
            />
            <BookmarkStat
              label="Series"
              value={String(seriesCount)}
              hint={seriesCount === 1 ? 'title' : 'titles'}
            />
            <BookmarkStat
              label="Today"
              value={String(savedToday)}
              hint={savedToday === 1 ? 'new save' : 'new saves'}
              accent
            />
          </div>
        </div>
      </header>

      {entries.length > 0 && (
        <div className="bookmarks-toolbar" role="toolbar" aria-label="Filter bookmarks">
          <div className="bookmarks-filter-pills">
            <FilterPill
              active={formatFilter === 'all'}
              count={entries.length}
              onClick={() => setFormatFilter('all')}
            >
              All
            </FilterPill>
            <FilterPill
              active={formatFilter === 'manhwa'}
              count={manhwaCount}
              onClick={() => setFormatFilter('manhwa')}
            >
              Manhwa
            </FilterPill>
            <FilterPill
              active={formatFilter === 'novel'}
              count={novelCount}
              onClick={() => setFormatFilter('novel')}
            >
              Novels
            </FilterPill>
          </div>
          <p className="bookmarks-toolbar-hint">
            Tap the bookmark icon in the reader or chapter list to save.
          </p>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bookmarks-empty-panel">
          <div className="bookmarks-empty-icon" aria-hidden>
            <MarkIcon />
          </div>
          <h2>No chapter bookmarks yet</h2>
          <p>
            Open any chapter and hit <strong>Bookmark</strong> in the reader bar,
            or use the pin on the series chapter list.
          </p>
          <Link to="/browse" className="bookmarks-empty-cta">
            Start reading
          </Link>
        </div>
      ) : (
        <div className="bookmarks-shelves">
          {groups.map((group, index) => (
            <section
              key={group.series.id}
              className={`bookmarks-shelf${index === 0 ? ' bookmarks-shelf--featured' : ''}`}
              aria-labelledby={`bookmarks-shelf-${group.series.slug}`}
            >
              <div className="bookmarks-shelf-head">
                <Link
                  to={`/series/${group.series.slug}`}
                  className="bookmarks-shelf-series"
                  id={`bookmarks-shelf-${group.series.slug}`}
                >
                  <img src={group.series.coverUrl} alt="" loading="lazy" />
                  <div>
                    <span className="bookmarks-shelf-type">{group.series.type}</span>
                    <h2>{group.series.title}</h2>
                    <p>
                      {group.items.length} saved chapter
                      {group.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </Link>
              </div>

              <ul className="bookmarks-card-grid">
                {group.items
                  .sort((a, b) => b.bookmark.addedAt - a.bookmark.addedAt)
                  .map((entry, cardIndex) => (
                    <BookmarkCard
                      key={`${entry.series.slug}-${entry.bookmark.chapterNumber}`}
                      entry={entry}
                      featured={index === 0 && cardIndex === 0}
                      onRemove={() =>
                        remove(entry.series.slug, entry.bookmark.chapterNumber)
                      }
                    />
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
      className={`bookmarks-filter-pill${active ? ' is-active' : ''}`}
      onClick={onClick}
      aria-pressed={active}
    >
      {children}
      <span>{count}</span>
    </button>
  )
}

function BookmarkStat({
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
    <div className={`bookmarks-stat${accent ? ' bookmarks-stat--accent' : ''}`}>
      <span className="bookmarks-stat-label">{label}</span>
      <strong className="bookmarks-stat-value">{value}</strong>
      <span className="bookmarks-stat-hint">{hint}</span>
    </div>
  )
}

function BookmarkCard({
  entry,
  featured,
  onRemove,
}: {
  entry: BookmarkEntry
  featured?: boolean
  onRemove: () => void
}) {
  const { series, bookmark } = entry
  const ago = formatReadingAgo(bookmark.addedAt)
  const chapterLabel =
    bookmark.chapterTitle || `Chapter ${bookmark.chapterNumber}`

  return (
    <li className={`bookmarks-card${featured ? ' bookmarks-card--featured' : ''}`}>
      <Link
        to={`/read/${series.slug}/${bookmark.chapterNumber}`}
        className="bookmarks-card-link"
      >
        <div className="bookmarks-card-cover" aria-hidden>
          <img src={series.coverUrl} alt="" loading="lazy" />
          <span className="bookmarks-card-ch">Ch. {bookmark.chapterNumber}</span>
        </div>

        <div className="bookmarks-card-body">
          <h3>{chapterLabel}</h3>
          <span className="bookmarks-card-ago">Saved {ago}</span>
        </div>

        <span className="bookmarks-card-open" aria-hidden>
          Read
          <ArrowIcon />
        </span>
      </Link>

      <button
        type="button"
        className="bookmarks-card-remove"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onRemove()
        }}
        aria-label={`Remove bookmark for chapter ${bookmark.chapterNumber}`}
      >
        ×
      </button>
    </li>
  )
}

function MarkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function RibbonIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden>
      <path
        d="M32 8l8 14h16l-13 10 5 16-16-10-16 10 5-16L8 22h16L32 8z"
        fill="currentColor"
        opacity="0.2"
      />
      <path d="M32 14l5 9h10l-8 6 3 10-10-6-10 6 3-10-8-6h10l5-9z" fill="currentColor" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}
