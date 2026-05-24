import { useEffect, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BookmarkButton } from '../components/BookmarkButton'
import { ReportModal } from '../components/ReportModal'
import { useUser } from '../hooks/useUser'
import { ReadingStatusPanel } from '../components/ReadingStatusPanel'
import { SeriesCoverRating } from '../components/SeriesCoverRating'
import { ScrollTagRail } from '../components/ScrollTagRail'
import { SeriesChapterPanel } from '../components/SeriesChapterPanel'
import { SimilarWorksRail } from '../components/SimilarWorksRail'
import { useCatalog } from '../hooks/useCatalog'
import { formatViews } from '../data/catalog'
import { formatRating } from '../lib/format'
import { getSourceColor } from '../lib/sources'
import { getSeriesStatus, getStatusLabel } from '../lib/seriesStatus'
import { useSeriesProgress } from '../hooks/useLibrary'
import type { SeriesStatus } from '../types'
import './SeriesPage.css'

const STATUS_LABEL: Record<SeriesStatus, string> = {
  ongoing: 'Ongoing',
  completed: 'Completed',
  hiatus: 'Hiatus',
}

export function SeriesPage() {
  const { slug } = useParams<{ slug: string }>()
  const catalog = useCatalog()
  const series = slug ? catalog.find((s) => s.slug === slug) : undefined
  const [altOpen, setAltOpen] = useState(false)
  const [descExpanded, setDescExpanded] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [statusLabel, setStatusLabel] = useState<string | undefined>()
  const [reportOpen, setReportOpen] = useState(false)
  const { user, isLoggedIn } = useUser()

  useEffect(() => {
    if (!slug) return
    const sync = () => {
      const s = getSeriesStatus(slug)
      setStatusLabel(s ? getStatusLabel(s) : undefined)
    }
    sync()
    window.addEventListener('sakura-series-status', sync)
    return () => window.removeEventListener('sakura-series-status', sync)
  }, [slug])

  if (!series) {
    return (
      <div className="series-not-found container">
        <p>Series not found.</p>
        <Link to="/browse">Back to browse</Link>
      </div>
    )
  }

  const progress = useSeriesProgress(series.slug)
  const related = series.relatedSlug
    ? catalog.find((s) => s.slug === series.relatedSlug)
    : undefined
  const firstChapter = series.chapters[0]
  const readChapter = progress?.chapterNumber ?? firstChapter?.number
  const readTarget = readChapter
    ? series.chapters.find((c) => c.number === readChapter) ?? firstChapter
    : firstChapter

  const source = series.source
  const bannerUrl = series.bannerUrl || series.coverUrl
  const progressPct =
    progress?.chapterNumber && series.chapters.length
      ? Math.min(100, Math.round((progress.chapterNumber / series.chapters.length) * 100))
      : 0

  const shortDesc =
    series.description.length > 340 && !descExpanded
      ? `${series.description.slice(0, 340).trim()}…`
      : series.description

  const genreItems = series.genres.map((g) => ({
    key: g,
    label: g,
    href: `/browse?genre=${encodeURIComponent(g)}`,
    variant: 'genre' as const,
  }))

  const tagItems = (series.tags ?? []).map((t) => ({
    key: t,
    label: t,
    href: `/browse?q=${encodeURIComponent(t)}&sort=relevance`,
    variant: 'tag' as const,
  }))

  return (
    <div className="series-page">
      <section className="series-cinema" aria-label={`${series.title} overview`}>
        <div
          className="series-cinema-banner"
          style={{ backgroundImage: `url(${bannerUrl})` }}
          aria-hidden
        />
        <div className="series-cinema-scrim" aria-hidden />
        <div className="series-cinema-glow" aria-hidden />
        <div className="series-cinema-noise" aria-hidden />

        <div className="series-cinema-inner container--series">
          <div className="series-cinema-grid">
            <div className="series-cover-stack">
              <div className="series-cover-frame">
                <img src={series.coverUrl} alt="" />
                <span className="series-cover-lang">{series.language ?? 'EN'}</span>
              </div>
              <span className={`series-cover-status series-cover-status--${series.status}`}>
                {STATUS_LABEL[series.status]}
              </span>
              <SeriesCoverRating
                slug={series.slug}
                averageRating={series.rating}
                views={series.views}
              />
            </div>

            <div className="series-cinema-body">
              <div className="series-cinema-head">
                <p className="series-eyebrow">
                  <span>Rokari edition</span>
                  {source ? (
                    <>
                      <span className="series-eyebrow-dot" aria-hidden />
                      <Link
                        to={`/browse?q=${encodeURIComponent(source)}&sort=relevance`}
                        style={{ color: getSourceColor(source) }}
                      >
                        {source}
                      </Link>
                    </>
                  ) : null}
                </p>
                <h1>{series.title}</h1>

                {series.altTitles.length > 0 && (
                  <button
                    type="button"
                    className="series-alt-toggle"
                    aria-expanded={altOpen}
                    onClick={() => setAltOpen((o) => !o)}
                  >
                    <TranslateIcon />
                    <span className={altOpen ? '' : 'series-alt-clamp'}>
                      {series.altTitles.join(' · ')}
                    </span>
                    <ChevronIcon />
                  </button>
                )}

                <div className="series-chip-row">
                  <span className="series-chip series-chip--type">
                    {series.type === 'manhwa' ? 'Manhwa' : 'Novel'}
                  </span>
                  <span className="series-chip series-chip--safe">SFW</span>
                  <span className="series-chip series-chip--muted">{series.language ?? 'EN'}</span>
                </div>
              </div>

              <div className="series-credits-line">
                <UserIcon />
                <Link to={`/browse?q=${encodeURIComponent(series.author)}&sort=relevance`}>{series.author}</Link>
                {series.artist !== '—' && series.artist !== series.author && (
                  <>
                    <span className="series-credits-sep" aria-hidden>·</span>
                    <span className="series-credits-role">Art</span>
                    <Link to={`/browse?q=${encodeURIComponent(series.artist)}&sort=relevance`}>{series.artist}</Link>
                  </>
                )}
              </div>

              <div className="series-stat-grid">
                <StatTile icon={<CalendarIcon />} label="Year" value={String(series.year ?? '—')} />
                <StatTile
                  icon={<BookIcon />}
                  label="Chapters"
                  value={String(series.chapters.length)}
                />
                <StatTile icon={<EyeIcon />} label="Views" value={formatViews(series.views)} />
                <StatTile
                  icon={<StarIcon />}
                  label="Rating"
                  value={formatRating(series.rating, series.views)}
                  accent
                />
              </div>

              {progress?.chapterNumber ? (
                <div className="series-progress">
                  <div className="series-progress-track">
                    <span className="series-progress-fill" style={{ width: `${progressPct}%` }} />
                  </div>
                  <span className="series-progress-label">
                    Chapter {progress.chapterNumber} of {series.chapters.length}
                  </span>
                </div>
              ) : null}

              <div className="series-status-wrap">
                <div className="series-action-dock">
                {readTarget ? (
                  <Link
                    to={`/read/${series.slug}/${readTarget.number}`}
                    className="series-action series-action--primary"
                  >
                    <PlayIcon />
                    {progress ? 'Continue' : 'Start reading'}
                  </Link>
                ) : null}
                <BookmarkButton slug={series.slug} variant="rokari" />
                <div className="series-status-anchor">
                  <button
                    type="button"
                    className="series-action series-action--ghost"
                    aria-expanded={statusOpen}
                    onClick={() => setStatusOpen((o) => !o)}
                  >
                    <ListIcon />
                    {statusLabel ?? 'Status'}
                  </button>
                  <ReadingStatusPanel
                    slug={series.slug}
                    open={statusOpen}
                    onClose={() => setStatusOpen(false)}
                    chapterProgress={{
                      current: progress?.chapterNumber ?? 0,
                      total: series.chapters.length,
                    }}
                  />
                </div>
                <button
                  type="button"
                  className="series-action series-action--ghost series-action--report"
                  onClick={() => {
                    if (!isLoggedIn || !user) {
                      window.location.href = '/login'
                      return
                    }
                    setReportOpen(true)
                  }}
                >
                  <FlagIcon />
                  Report
                </button>
              </div>
              </div>

              <article className="series-story-card">
                <h2 className="series-story-title">Story</h2>
                <p>{shortDesc}</p>
                {series.description.length > 340 && (
                  <button
                    type="button"
                    className="series-read-more"
                    onClick={() => setDescExpanded((e) => !e)}
                  >
                    {descExpanded ? 'Show less' : 'Read more'}
                    <ChevronIcon />
                  </button>
                )}
              </article>

              <ScrollTagRail label="Genres" items={genreItems} />
              {tagItems.length > 0 && <ScrollTagRail label="Tags" items={tagItems} />}
            </div>
          </div>
        </div>
      </section>

      <div className="series-body container--series">
        <SeriesChapterPanel
          series={series}
          related={related}
          currentChapterNumber={progress?.chapterNumber}
        />
        <SimilarWorksRail series={series} />
      </div>

      {user && (
        <ReportModal
          open={reportOpen}
          onClose={() => setReportOpen(false)}
          userId={user.id}
          userName={user.displayName || user.username}
          target={{ seriesSlug: series.slug, seriesTitle: series.title }}
          lockSubject="series"
        />
      )}
    </div>
  )
}

function StatTile({
  icon,
  label,
  value,
  accent,
}: {
  icon: ReactNode
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className={`series-stat-tile${accent ? ' series-stat-tile--accent' : ''}`}>
      <span className="series-stat-tile-icon">{icon}</span>
      <span className="series-stat-tile-value">{value}</span>
      <span className="series-stat-tile-label">{label}</span>
    </div>
  )
}

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function FlagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4 2v20M4 4h12l-2-4 2-4H4z" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

function TranslateIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M5 8h6M8 5v6M6 15h6M9 12v6M16 8l2 6 2-6M17 14h-2" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}
