import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ADMIN_ACTIVITY_EVENT } from '../lib/adminActivity'
import { LOYALTY_EVENT } from '../lib/loyalty'
import { getAdminDashboardMetrics } from '../lib/adminMetrics'
import { getLoyaltyAdminMetrics } from '../lib/loyaltyMetrics'
import { resetAllAdminStats } from '../lib/adminReset'
import { ADMIN_REPORTS_EVENT } from '../lib/adminReports'
import { getLatestUpdates } from '../data/catalog'
import { SUBSCRIPTION_PLANS, SUBSCRIPTIONS_EVENT } from '../lib/subscriptions'
import { USER_AUTH_EVENT } from '../lib/userAuth'
import { CATALOG_EVENT } from '../lib/catalogStore'

function formatMoney(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

function formatViews(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

export function AdminDashboard() {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const flag = 'sakura-admin-stats-zeroed-v2'
    if (localStorage.getItem(flag)) return
    resetAllAdminStats()
    localStorage.setItem(flag, '1')
  }, [])

  useEffect(() => {
    const bump = () => setTick((t) => t + 1)
    window.addEventListener(USER_AUTH_EVENT, bump)
    window.addEventListener(SUBSCRIPTIONS_EVENT, bump)
    window.addEventListener(ADMIN_ACTIVITY_EVENT, bump)
    window.addEventListener(ADMIN_REPORTS_EVENT, bump)
    window.addEventListener(CATALOG_EVENT, bump)
    window.addEventListener(LOYALTY_EVENT, bump)
    return () => {
      window.removeEventListener(USER_AUTH_EVENT, bump)
      window.removeEventListener(SUBSCRIPTIONS_EVENT, bump)
      window.removeEventListener(ADMIN_ACTIVITY_EVENT, bump)
      window.removeEventListener(ADMIN_REPORTS_EVENT, bump)
      window.removeEventListener(CATALOG_EVENT, bump)
      window.removeEventListener(LOYALTY_EVENT, bump)
    }
  }, [])

  const m = useMemo(() => getAdminDashboardMetrics(), [tick])
  const loyalty = useMemo(() => getLoyaltyAdminMetrics(), [tick])
  const latest = getLatestUpdates(6)
  const maxSignup = Math.max(1, ...m.signupTrend.map((d) => d.value))

  return (
    <div className="admin-dash">
      <header className="admin-dash-hero">
        <div>
          <p className="admin-dash-eyebrow">Rokari admin</p>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-sub">
            Site overview — accounts, subscriptions, catalog, and moderation. Demo stats start at zero.
          </p>
        </div>
        <div className="admin-dash-hero-actions">
          <Link to="/admin/users" className="admin-btn">
            Manage users
          </Link>
          <Link to="/admin/packages" className="admin-btn admin-btn--ghost">
            Packages
          </Link>
          <Link to="/admin/loyalty" className="admin-btn admin-btn--ghost">
            Loyalty
          </Link>
        </div>
      </header>

      <section className="admin-kpi-grid">
        <KpiCard label="Monthly revenue" value={formatMoney(m.revenue.mrr)} hint={`ARR ${formatMoney(m.revenue.arr)}`} accent />
        <KpiCard label="Total users" value={String(m.users.total)} hint={`+${m.users.newThisWeek} this week`} />
        <KpiCard label="Active today" value={String(m.users.activeToday)} hint="Logged in last 24h" />
        <KpiCard label="Paid subscribers" value={String(m.subscriptions.active)} hint={`${m.subscriptions.trialing} trialing`} />
        <KpiCard label="Catalog views" value={formatViews(m.catalog.views)} hint={`${m.catalog.series} series`} />
        <KpiCard label="Open reports" value={String(m.moderation.openReports)} hint={`${m.moderation.totalReports} total`} warn={m.moderation.openReports > 0} />
        <KpiCard label="Active streaks" value={String(loyalty.activeStreaks)} hint={`${loyalty.usersWithProgress} readers`} accent />
        <KpiCard label="Total reader XP" value={loyalty.totalXp.toLocaleString()} hint={`${loyalty.badgesEarned} badges earned`} />
      </section>

      <div className="admin-dash-grid">
        <div className="admin-card admin-card--wide">
          <div className="admin-card-head">
            <h2>Signups (7 days)</h2>
            <span className="admin-card-meta">{m.users.newThisWeek} new accounts</span>
          </div>
          <div className="admin-chart-bars" role="img" aria-label="Signup trend">
            {m.signupTrend.map((d) => (
              <div key={d.label} className="admin-chart-bar-col">
                <div
                  className="admin-chart-bar"
                  style={{ height: `${Math.max(8, (d.value / maxSignup) * 100)}%` }}
                  title={`${d.value} signups`}
                />
                <span>{d.label}</span>
                <em>{d.value}</em>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-head">
            <h2>Plans breakdown</h2>
          </div>
          <ul className="admin-plan-stats">
            {m.subscriptions.byPlan.map(({ plan, count }) => (
              <li key={plan.id}>
                <span className="admin-plan-dot" style={{ background: plan.accent }} />
                <span className="admin-plan-name">{plan.name}</span>
                <strong>{count}</strong>
                <span className="admin-plan-price">
                  {plan.priceMonthly === 0 ? 'Free' : `${formatMoney(plan.priceMonthly)}/mo`}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="admin-card">
          <div className="admin-card-head">
            <h2>Team roles</h2>
          </div>
          <ul className="admin-role-list">
            {Object.entries(m.users.byRole).map(([role, count]) => (
              <li key={role}>
                <span>{role}</span>
                <strong>{count}</strong>
              </li>
            ))}
          </ul>
          {m.users.suspended > 0 && (
            <p className="admin-card-foot warn">{m.users.suspended} suspended account(s)</p>
          )}
        </div>

        <div className="admin-card admin-card--wide">
          <div className="admin-card-head">
            <h2>Recent activity</h2>
            <Link to="/admin/reports">Reports</Link>
          </div>
          <ul className="admin-activity-feed">
            {m.activity.length === 0 ? (
              <li className="admin-activity-empty">No activity yet.</li>
            ) : (
              m.activity.map((a) => (
                <li key={a.id}>
                  <span className={`admin-activity-icon admin-activity-icon--${a.kind}`} />
                  <div>
                    <strong>{a.title}</strong>
                    {a.detail && <span>{a.detail}</span>}
                  </div>
                  <time>{new Date(a.at).toLocaleString()}</time>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="admin-card admin-card--wide">
          <div className="admin-card-head">
            <h2>Latest chapter updates</h2>
            <Link to="/admin/series">All series</Link>
          </div>
          {latest.length === 0 ? (
            <p className="admin-muted-inline">No chapters yet.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Series</th>
                    <th>Chapter</th>
                    <th>Updated</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {latest.map(({ series, chapter }) => (
                    <tr key={`${series.id}-${chapter.id}`}>
                      <td>{series.title}</td>
                      <td>{chapter.title}</td>
                      <td>{chapter.updatedAt}</td>
                      <td>
                        <Link to={`/admin/series/${series.id}/chapters`}>Edit</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="admin-card">
          <div className="admin-card-head">
            <h2>Quick actions</h2>
          </div>
          <div className="admin-quick-grid">
            <Link to="/admin/series/new" className="admin-quick-tile">
              <span>+</span>
              <strong>New series</strong>
            </Link>
            <Link to="/admin/packages" className="admin-quick-tile">
              <span>🪙</span>
              <strong>Coin packages</strong>
            </Link>
            <Link to="/admin/users" className="admin-quick-tile">
              <span>👤</span>
              <strong>Accounts</strong>
            </Link>
            <Link to="/admin/subscriptions" className="admin-quick-tile">
              <span>★</span>
              <strong>Plans & billing</strong>
            </Link>
            <Link to="/admin/settings" className="admin-quick-tile">
              <span>⚙</span>
              <strong>Site settings</strong>
            </Link>
          </div>
          <p className="admin-card-foot">
            Plans: {SUBSCRIPTION_PLANS.filter((p) => p.priceMonthly > 0).map((p) => p.name).join(', ')}
          </p>
        </div>
      </div>
    </div>
  )
}

function KpiCard({
  label,
  value,
  hint,
  accent,
  warn,
}: {
  label: string
  value: string
  hint: string
  accent?: boolean
  warn?: boolean
}) {
  return (
    <div className={`admin-kpi${accent ? ' admin-kpi--accent' : ''}${warn ? ' admin-kpi--warn' : ''}`}>
      <span className="admin-kpi-label">{label}</span>
      <strong className="admin-kpi-value">{value}</strong>
      <span className="admin-kpi-hint">{hint}</span>
    </div>
  )
}
