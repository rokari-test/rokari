import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ProgressRing } from '../components/ProgressRing'
import { getSeriesBySlug } from '../data/catalog'
import { formatReadingAgo } from '../lib/format'
import type { ReadingProgress } from '../lib/storage'
import { useContinueReading } from '../hooks/useLibrary'
import type { Series } from '../types'
import './HistoryPage.css'

interface HistoryEntry {
  series: Series
  progress: ReadingProgress
}

interface HistoryGroup {
  id: string
  label: string
  items: HistoryEntry[]
}

const MS_DAY = 86_400_000

function groupHistory(entries: HistoryEntry[]): HistoryGroup[] {
  const now = Date.now()
  const buckets = {
    today: [] as HistoryEntry[],
    yesterday: [] as HistoryEntry[],
    week: [] as HistoryEntry[],
    earlier: [] as HistoryEntry[],
  }

  for (const entry of entries) {
    const age = now - entry.progress.updatedAt
    if (age < MS_DAY) buckets.today.push(entry)
    else if (age < MS_DAY * 2) buckets.yesterday.push(entry)
    else if (age < MS_DAY * 7) buckets.week.push(entry)
    else buckets.earlier.push(entry)
  }

  return [
    { id: 'today', label: 'Today', items: buckets.today },
    { id: 'yesterday', label: 'Yesterday', items: buckets.yesterday },
    { id: 'week', label: 'This week', items: buckets.week },
    { id: 'earlier', label: 'Earlier', items: buckets.earlier },
  ].filter((g) => g.items.length > 0)
}

function chapterProgress(series: Series, progress: ReadingProgress): number {
  const total = Math.max(series.chapters.length, 1)
  const idx = series.chapters.findIndex((c) => c.number === progress.chapterNumber)
  const chapterIndex = idx >= 0 ? idx : Math.max(0, progress.chapterNumber - 1)
  return Math.min(
    100,
    Math.round(((chapterIndex + progress.scrollPercent / 100) / total) * 100),
  )
}

export function HistoryPage() {
  const continueItems = useContinueReading()

  const entries = useMemo(
    () =>
      continueItems
        .map((progress) => {
          const series = getSeriesBySlug(progress.slug)
          return series ? { series, progress } : null
        })
        .filter((e): e is HistoryEntry => Boolean(e)),
    [continueItems],
  )

  const groups = useMemo(() => groupHistory(entries), [entries])

  const readToday = entries.filter(
    (e) => Date.now() - e.progress.updatedAt < MS_DAY,
  ).length
  const finishedChapters = entries.filter(
    (e) => e.progress.scrollPercent >= 98,
  ).length
  const avgSeriesPct =
    entries.length === 0
      ? 0
      : Math.round(
          entries.reduce((sum, e) => sum + chapterProgress(e.series, e.progress), 0) /
            entries.length,
        )

  return (
    <div className="history-page container--wide">
      <header className="history-hero">
        <div className="history-hero-glow" aria-hidden />
        <div className="history-hero-inner">
          <div className="history-hero-copy">
            <p className="history-eyebrow">Rokari · Reading trail</p>
            <h1>History</h1>
            <p className="history-lead">
              Every chapter you touched on this device — grouped by when you
              last opened it.
            </p>
            <div className="history-hero-actions">
              <Link to="/library" className="history-hero-btn history-hero-btn--primary">
                Your library
              </Link>
              <Link to="/browse" className="history-hero-btn history-hero-btn--ghost">
                Browse more
              </Link>
            </div>
          </div>

          <div className="history-stats" aria-label="Reading stats">
            <HistoryStat label="Titles" value={String(entries.length)} hint="in your trail" />
            <HistoryStat
              label="Today"
              value={String(readToday)}
              hint={readToday === 1 ? 'session active' : 'sessions active'}
            />
            <HistoryStat
              label="Avg progress"
              value={entries.length === 0 ? '—' : `${avgSeriesPct}%`}
              hint={
                finishedChapters > 0
                  ? `${finishedChapters} chapter${finishedChapters === 1 ? '' : 's'} finished`
                  : 'across saved reads'
              }
              ring={entries.length > 0 ? avgSeriesPct : undefined}
            />
          </div>
        </div>
      </header>

      {entries.length === 0 ? (
        <div className="history-empty-panel">
          <div className="history-empty-icon" aria-hidden>
            <TrailIcon />
          </div>
          <h2>No chapters yet</h2>
          <p>Start reading and your trail will appear here, newest first.</p>
          <Link to="/browse" className="history-empty-cta">
            Explore Rokari
          </Link>
        </div>
      ) : (
        <div className="history-timeline">
          {groups.map((group, groupIndex) => (
            <section
              key={group.id}
              className="history-group"
              aria-labelledby={`history-group-${group.id}`}
            >
              <div className="history-group-head">
                <span className="history-group-dot" aria-hidden />
                <h2 id={`history-group-${group.id}`}>{group.label}</h2>
                <span className="history-group-count">{group.items.length}</span>
              </div>

              <ul className="history-group-list">
                {group.items.map((entry, index) => (
                  <HistoryRow
                    key={entry.series.id}
                    entry={entry}
                    isFirst={groupIndex === 0 && index === 0}
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

function HistoryStat({
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
    <div className="history-stat">
      <span className="history-stat-label">{label}</span>
      <div className="history-stat-main">
        <strong className="history-stat-value">{value}</strong>
        {ring !== undefined && <ProgressRing pct={ring} />}
      </div>
      <span className="history-stat-hint">{hint}</span>
    </div>
  )
}

function HistoryRow({
  entry,
  isFirst,
}: {
  entry: HistoryEntry
  isFirst: boolean
}) {
  const { series, progress } = entry
  const pct = chapterProgress(series, progress)
  const chapterPct = Math.round(progress.scrollPercent)
  const ago = formatReadingAgo(progress.updatedAt)
  const chapterLabel = progress.chapterTitle || `Chapter ${progress.chapterNumber}`

  return (
    <li className={`history-row${isFirst ? ' history-row--latest' : ''}`}>
      <Link
        to={`/read/${series.slug}/${progress.chapterNumber}`}
        className="history-row-link"
        aria-label={`Continue ${series.title}, chapter ${progress.chapterNumber}`}
      >
        <div className="history-row-cover">
          <img src={series.coverUrl} alt="" loading="lazy" />
          <span className="history-row-ch">Ch. {progress.chapterNumber}</span>
        </div>

        <div className="history-row-body">
          <div className="history-row-top">
            <h3>{series.title}</h3>
            <span className="history-row-ago">{ago}</span>
          </div>
          <p className="history-row-chapter">{chapterLabel}</p>
          <div className="history-row-bars">
            <div className="history-row-bar">
              <span
                className="history-row-bar-fill history-row-bar-fill--series"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="history-row-bar-labels">
              <span className="history-row-ch-pct">{chapterPct}% of chapter</span>
              <span className="history-row-series-pct">{pct}% of series</span>
            </div>
          </div>
        </div>

        <span className="history-row-resume" aria-hidden>
          Resume
          <ResumeIcon />
        </span>
      </Link>
    </li>
  )
}

function ResumeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function TrailIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M10 38V14c0-2 2-4 4-4h20c2 0 4 2 4 4v24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M16 18h16M16 26h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="34" cy="34" r="6" fill="currentColor" opacity="0.35" />
    </svg>
  )
}
