import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { KeepReadingCard } from '../components/KeepReadingCard'
import { LibraryStatusCard } from '../components/LibraryStatusCard'
import { ManhwaCard } from '../components/ManhwaCard'
import { ProgressRing } from '../components/ProgressRing'
import { getSeriesBySlug } from '../data/catalog'
import { useSeriesTrackingSync } from '../hooks/useSeriesTracking'
import { useBookmarks, useContinueReading } from '../hooks/useLibrary'
import {
  getLibraryCatchUpPercent,
  getLibraryCatchUpLabel,
} from '../lib/libraryStats'
import {
  countByStatus,
  getTrackedLibraryEntries,
  STATUS_GRID,
  type ReadingStatus,
} from '../lib/seriesStatus'
import { getReadingProgress } from '../lib/storage'
import './LibraryPage.css'

type StatusFilter = 'all' | ReadingStatus

export function LibraryPage() {
  const trackingVersion = useSeriesTrackingSync()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const continueItems = useContinueReading()
  const { slugs: bookmarkSlugs } = useBookmarks()

  const trackedEntries = useMemo(() => {
    return getTrackedLibraryEntries()
      .map(({ slug, tracking }) => {
        const series = getSeriesBySlug(slug)
        if (!series) return null
        return {
          series,
          tracking,
          progress: getReadingProgress(slug),
        }
      })
      .filter((e): e is NonNullable<typeof e> => Boolean(e))
  }, [continueItems, bookmarkSlugs, trackingVersion])

  const filteredTracked = useMemo(() => {
    if (statusFilter === 'all') return trackedEntries
    return trackedEntries.filter((e) => e.tracking.status === statusFilter)
  }, [trackedEntries, statusFilter])

  const statusCounts = useMemo(() => countByStatus(), [trackedEntries, trackingVersion])

  const readingEntries = continueItems
    .map((progress) => {
      const series = getSeriesBySlug(progress.slug)
      return series ? { series, progress } : null
    })
    .filter((e): e is NonNullable<typeof e> => Boolean(e))

  const trackedSlugs = new Set(trackedEntries.map((e) => e.series.slug))
  const pinnedOnly = bookmarkSlugs
    .filter((slug) => !trackedSlugs.has(slug))
    .map((slug) => getSeriesBySlug(slug))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))

  const catchUpPct = getLibraryCatchUpPercent()
  const catchUpLabel = getLibraryCatchUpLabel()
  const totalTracked = trackedEntries.length

  return (
    <div className="library-page container--wide">
      <header className="library-hero">
        <div className="library-hero-glow" aria-hidden />
        <div className="library-hero-inner">
          <div className="library-hero-copy">
            <p className="library-eyebrow">Rokari · Your shelf</p>
            <h1>Library</h1>
            <p className="library-lead">
              Set a reading status on any series — it lands here with score,
              progress, and re-read counts.
            </p>
            <div className="library-hero-actions">
              <Link to="/browse" className="library-hero-btn library-hero-btn--primary">
                Discover more
              </Link>
              {readingEntries.length > 0 && (
                <Link to="/history" className="library-hero-btn library-hero-btn--ghost">
                  Full history
                </Link>
              )}
            </div>
          </div>

          <div className="library-stats" aria-label="Library overview">
            <StatTile
              label="Tracked"
              value={String(totalTracked)}
              hint={totalTracked === 1 ? 'title on shelf' : 'titles on shelf'}
            />
            <StatTile
              label="Reading"
              value={String(statusCounts.reading + statusCounts.rereading)}
              hint="active right now"
            />
            <StatTile
              label="Catch-up"
              value={totalTracked === 0 ? '—' : `${catchUpPct}%`}
              hint={totalTracked === 0 ? 'Pick a status' : catchUpLabel}
              ring={totalTracked > 0 ? catchUpPct : undefined}
            />
          </div>
        </div>
      </header>

      <section
        className="library-panel library-panel--collection"
        aria-labelledby="library-collection-heading"
      >
        <div className="library-panel-head">
          <div>
            <h2 id="library-collection-heading">Your collection</h2>
            <p>Organized by the status you pick on each series page.</p>
          </div>
          {totalTracked > 0 && (
            <span className="library-panel-badge">{totalTracked}</span>
          )}
        </div>

        <div className="library-status-tabs" role="tablist" aria-label="Filter by status">
          <StatusTab
            active={statusFilter === 'all'}
            count={totalTracked}
            onClick={() => setStatusFilter('all')}
          >
            All
          </StatusTab>
          {STATUS_GRID.map((item) => (
            <StatusTab
              key={item.id}
              active={statusFilter === item.id}
              count={statusCounts[item.id]}
              status={item.id}
              onClick={() => setStatusFilter(item.id)}
            >
              {item.label}
            </StatusTab>
          ))}
        </div>

        <div className="library-panel-body">
          {filteredTracked.length === 0 ? (
            <EmptyShelf
              title={
                statusFilter === 'all'
                  ? 'No titles tracked yet'
                  : `Nothing marked as ${STATUS_GRID.find((s) => s.id === statusFilter)?.label ?? statusFilter}`
              }
              body='Open a series and tap "Change Status" to add Reading, Planned, Completed, and more.'
              cta={{ to: '/browse', label: 'Browse Rokari' }}
            />
          ) : (
            <div className="library-collection-grid">
              {filteredTracked.map(({ series, tracking, progress }) => (
                <LibraryStatusCard
                  key={series.id}
                  series={series}
                  tracking={tracking}
                  progress={progress}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {readingEntries.length > 0 && (
        <section className="library-panel" aria-labelledby="library-reading-heading">
          <div className="library-panel-head">
            <div>
              <h2 id="library-reading-heading">Continue reading</h2>
              <p>Jump back into your latest chapters.</p>
            </div>
            <span className="library-panel-badge">{readingEntries.length}</span>
          </div>
          <div className="library-panel-body">
            <div className="library-continue-grid">
              {readingEntries.map(({ series, progress }) => (
                <KeepReadingCard key={series.id} series={series} progress={progress} />
              ))}
            </div>
          </div>
        </section>
      )}

      {pinnedOnly.length > 0 && (
        <section
          id="bookmarks"
          className="library-panel library-panel--saved"
          aria-labelledby="library-saved-heading"
        >
          <div className="library-panel-head">
            <div>
              <h2 id="library-saved-heading">Pinned only</h2>
              <p>Bookmarked without a reading status yet.</p>
            </div>
            <span className="library-panel-badge">{pinnedOnly.length}</span>
          </div>
          <div className="library-panel-body">
            <div className="library-shelf-grid">
              {pinnedOnly.map((s) => (
                <ManhwaCard key={s.id} series={s} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

function StatusTab({
  children,
  active,
  count,
  status,
  onClick,
}: {
  children: string
  active: boolean
  count: number
  status?: ReadingStatus
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={`library-status-tab${active ? ' is-active' : ''}${status ? ` library-status-tab--${status}` : ''}`}
      onClick={onClick}
    >
      {children}
      <span className="library-status-tab-count">{count}</span>
    </button>
  )
}

function StatTile({
  label,
  value,
  hint,
  ring,
}: {
  label: string
  value: string
  hint: string
  ring?: number
}) {
  return (
    <div className="library-stat">
      <span className="library-stat-label">{label}</span>
      <div className="library-stat-main">
        <strong className="library-stat-value">{value}</strong>
        {ring !== undefined && <ProgressRing pct={ring} />}
      </div>
      <span className="library-stat-hint">{hint}</span>
    </div>
  )
}

function EmptyShelf({
  title,
  body,
  cta,
}: {
  title: string
  body: string
  cta: { to: string; label: string }
}) {
  return (
    <div className="library-empty">
      <div className="library-empty-icon" aria-hidden>
        <ShelfIcon />
      </div>
      <h3>{title}</h3>
      <p>{body}</p>
      <Link to={cta.to} className="library-empty-cta">
        {cta.label}
      </Link>
    </div>
  )
}

function ShelfIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden>
      <path d="M8 14h32M8 24h32M8 34h32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="12" y="10" width="8" height="12" rx="2" fill="currentColor" opacity="0.35" />
      <rect x="22" y="20" width="8" height="12" rx="2" fill="currentColor" opacity="0.55" />
      <rect x="32" y="30" width="8" height="12" rx="2" fill="currentColor" opacity="0.75" />
    </svg>
  )
}
