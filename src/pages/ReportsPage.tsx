import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ReportForm } from '../components/ReportForm'
import { getSeriesBySlug } from '../data/catalog'
import { useUserReports } from '../hooks/useReports'
import { useUser } from '../hooks/useUser'
import {
  REPORT_STATUS_LABELS,
  USER_REPORT_REASONS,
  type ModerationReport,
  type ReportStatus,
} from '../lib/adminReports'
import { formatReadingAgo } from '../lib/format'
import './ReportsPage.css'

type StatusFilter = 'all' | 'open' | 'closed'

function statusBucket(status: ReportStatus): 'open' | 'closed' {
  return status === 'open' || status === 'reviewing' ? 'open' : 'closed'
}

export function ReportsPage() {
  const { user, isLoggedIn } = useUser()
  const { reports, refresh } = useUserReports(user?.id)
  const [params, setParams] = useSearchParams()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const showForm = params.get('new') === '1'

  const initialTarget = useMemo(() => {
    const slug = params.get('series')
    if (!slug) return undefined
    const series = getSeriesBySlug(slug)
    if (!series) return undefined
    const ch = params.get('chapter')
    const chapterNumber = ch ? Number(ch) : undefined
    const chapter = chapterNumber
      ? series.chapters.find((c) => c.number === chapterNumber)
      : undefined
    return {
      seriesSlug: series.slug,
      seriesTitle: series.title,
      chapterNumber: chapter?.number,
      chapterTitle: chapter?.title,
    }
  }, [params])

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return reports
    return reports.filter((r) => statusBucket(r.status) === statusFilter)
  }, [reports, statusFilter])

  const openCount = reports.filter((r) => statusBucket(r.status) === 'open').length

  const openForm = () => {
    const next = new URLSearchParams(params)
    next.set('new', '1')
    setParams(next, { replace: true })
  }

  const closeForm = () => {
    const next = new URLSearchParams(params)
    next.delete('new')
    setParams(next, { replace: true })
  }

  if (!isLoggedIn || !user) {
    return (
      <div className="reports-page container--wide">
        <header className="reports-hero">
          <div className="reports-hero-glow" aria-hidden />
          <div className="reports-hero-inner">
            <div className="reports-hero-copy">
              <p className="reports-eyebrow">Rokari · Moderation</p>
              <h1>Reports</h1>
              <p className="reports-lead">Sign in to submit and track content reports.</p>
              <Link to="/login" className="reports-hero-btn reports-hero-btn--primary">
                Sign in
              </Link>
            </div>
          </div>
        </header>
      </div>
    )
  }

  const displayName = user.displayName || user.username

  return (
    <div className="reports-page container--wide">
      <header className="reports-hero">
        <div className="reports-hero-glow" aria-hidden />
        <div className="reports-hero-inner">
          <div className="reports-hero-copy">
            <p className="reports-eyebrow">Rokari · Moderation</p>
            <h1>My Reports</h1>
            <p className="reports-lead">
              Flag a series or chapter that breaks the rules — track what you sent
              and where it stands.
            </p>
            {!showForm && (
              <button type="button" className="reports-hero-btn reports-hero-btn--primary" onClick={openForm}>
                <FlagIcon />
                New report
              </button>
            )}
          </div>

          <div className="reports-stats" aria-label="Report overview">
            <ReportStat label="Total" value={String(reports.length)} hint="submitted" />
            <ReportStat label="Open" value={String(openCount)} hint="awaiting review" accent />
            <ReportStat
              label="Closed"
              value={String(reports.length - openCount)}
              hint="resolved or dismissed"
            />
          </div>
        </div>
      </header>

      {showForm && (
        <section className="reports-panel reports-panel--form" aria-label="New report">
          <div className="reports-panel-head">
            <div>
              <h2>Submit a report</h2>
              <p>Report the whole work or one chapter.</p>
            </div>
            <button type="button" className="reports-panel-close" onClick={closeForm}>
              Cancel
            </button>
          </div>
          <div className="reports-panel-body">
            <ReportForm
              userId={user.id}
              userName={displayName}
              initialTarget={initialTarget}
              onSubmitted={() => {
                refresh()
                closeForm()
              }}
            />
          </div>
        </section>
      )}

      <section className="reports-panel" aria-label="Your reports">
        <div className="reports-panel-head">
          <div>
            <h2>Your queue</h2>
            <p>{filtered.length} report{filtered.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="reports-filter-pills">
            <FilterBtn active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>
              All
            </FilterBtn>
            <FilterBtn active={statusFilter === 'open'} onClick={() => setStatusFilter('open')}>
              Open
            </FilterBtn>
            <FilterBtn active={statusFilter === 'closed'} onClick={() => setStatusFilter('closed')}>
              Closed
            </FilterBtn>
          </div>
        </div>

        <div className="reports-panel-body">
          {filtered.length === 0 ? (
            <div className="reports-empty">
              <div className="reports-empty-icon" aria-hidden>
                <FlagIcon large />
              </div>
              <h3>No reports yet</h3>
              <p>You have not flagged any series or chapters.</p>
              {!showForm && (
                <button type="button" className="reports-empty-cta" onClick={openForm}>
                  Submit a report
                </button>
              )}
            </div>
          ) : (
            <ul className="reports-list">
              {filtered.map((report) => (
                <ReportRow key={report.id} report={report} />
              ))}
            </ul>
          )}
        </div>
      </section>

      <aside className="reports-about" aria-label="About reports">
        <div className="reports-about-icon" aria-hidden>
          <WarnIcon />
        </div>
        <div>
          <h2>About reports</h2>
          <p>
            Use reports when a <strong>series</strong> or <strong>chapter</strong> violates
            Rokari rules — broken uploads, copyright, duplicates, or inappropriate content.
            You can also report from a series page or while reading a chapter.
          </p>
          <p className="reports-about-warn">
            False or repeated bad-faith reports may lead to action on your account.
          </p>
        </div>
      </aside>
    </div>
  )
}

function FilterBtn({
  children,
  active,
  onClick,
}: {
  children: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={`reports-filter-pill${active ? ' is-active' : ''}`}
      onClick={onClick}
      aria-pressed={active}
    >
      {children}
    </button>
  )
}

function ReportStat({
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
    <div className={`reports-stat${accent ? ' reports-stat--accent' : ''}`}>
      <span className="reports-stat-label">{label}</span>
      <strong className="reports-stat-value">{value}</strong>
      <span className="reports-stat-hint">{hint}</span>
    </div>
  )
}

function ReportRow({ report }: { report: ModerationReport }) {
  const reason = USER_REPORT_REASONS.find((r) => r.id === report.type)?.label ?? report.type
  const ago = formatReadingAgo(new Date(report.createdAt).getTime())
  const subject = report.subject ?? (report.chapterNumber != null ? 'chapter' : 'series')
  const href =
    report.seriesSlug && report.chapterNumber != null
      ? `/read/${report.seriesSlug}/${report.chapterNumber}`
      : report.seriesSlug
        ? `/series/${report.seriesSlug}`
        : undefined

  return (
    <li className={`reports-row reports-row--${report.status}`}>
      <div className="reports-row-top">
        <span className={`reports-row-subject reports-row-subject--${subject}`}>
          {subject === 'chapter' ? 'Chapter' : 'Series'}
        </span>
        <span className={`reports-row-status reports-row-status--${report.status}`}>
          {REPORT_STATUS_LABELS[report.status]}
        </span>
        <span className="reports-row-ago">{ago}</span>
      </div>

      <div className="reports-row-main">
        {href ? (
          <Link to={href} className="reports-row-target">
            {report.target}
          </Link>
        ) : (
          <strong className="reports-row-target">{report.target}</strong>
        )}
        <span className="reports-row-reason">{reason}</span>
      </div>

      <p className="reports-row-note">{report.note}</p>
    </li>
  )
}

function FlagIcon({ large }: { large?: boolean }) {
  return (
    <svg
      width={large ? 28 : 16}
      height={large ? 28 : 16}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M4 2v20M4 4h12l-2-4 2-4H4z" />
    </svg>
  )
}

function WarnIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2L1 21h22L12 2zm0 4.5L19.5 19h-15L12 6.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" />
    </svg>
  )
}
