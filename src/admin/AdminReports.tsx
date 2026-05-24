import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { logActivity } from '../lib/adminActivity'
import {
  ADMIN_REPORTS_EVENT,
  listReports,
  updateReportStatus,
  type ModerationReport,
  type ReportStatus,
} from '../lib/adminReports'

const STATUS_OPTIONS: ReportStatus[] = ['open', 'reviewing', 'resolved', 'dismissed']

export function AdminReports() {
  const [reports, setReports] = useState<ModerationReport[]>(() => listReports())

  const refresh = () => setReports(listReports())

  useEffect(() => {
    refresh()
    window.addEventListener(ADMIN_REPORTS_EVENT, refresh)
    return () => window.removeEventListener(ADMIN_REPORTS_EVENT, refresh)
  }, [])

  const open = reports.filter((r) => r.status === 'open' || r.status === 'reviewing')

  return (
    <>
      <header className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Moderation</h1>
          <p className="admin-page-sub">
            {open.length} open · {reports.length} total reports
          </p>
        </div>
        <Link to="/admin" className="admin-btn admin-btn--ghost">
          ← Dashboard
        </Link>
      </header>

      <div className="admin-card">
        {reports.length === 0 ? (
          <p className="admin-muted-inline">No reports in the queue.</p>
        ) : (
          <ul className="admin-report-list">
            {reports.map((report) => (
              <li key={report.id} className={`admin-report admin-report--${report.status}`}>
                <div className="admin-report-top">
                  {report.subject && (
                    <span className={`admin-pill admin-pill--subject-${report.subject}`}>
                      {report.subject}
                    </span>
                  )}
                  <span className={`admin-pill admin-pill--type-${report.type}`}>
                    {report.type}
                  </span>
                  <span className={`admin-pill admin-pill--status-${report.status}`}>
                    {report.status}
                  </span>
                  <time>{new Date(report.createdAt).toLocaleString()}</time>
                </div>
                <strong>{report.target}</strong>
                <p>{report.note}</p>
                <span className="admin-report-meta">Reporter: {report.reporter}</span>
                <div className="admin-report-actions">
                  {STATUS_OPTIONS.map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={`admin-btn admin-btn--ghost admin-btn--sm${report.status === status ? ' is-active' : ''}`}
                      onClick={() => {
                        updateReportStatus(report.id, status)
                        logActivity('report', `Report ${status}`, report.target)
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
