import { loadCatalog } from './catalogStore'
import { listActivity } from './adminActivity'
import { listReports } from './adminReports'
import { getSubscriptionMetrics, listSubscriptions } from './subscriptions'
import { listUsersForAdmin } from './userAuth'

export interface AdminDashboardMetrics {
  users: {
    total: number
    newThisWeek: number
    activeToday: number
    byRole: Record<string, number>
    suspended: number
  }
  catalog: {
    series: number
    chapters: number
    views: number
    manhwa: number
  }
  subscriptions: ReturnType<typeof getSubscriptionMetrics>
  moderation: {
    openReports: number
    totalReports: number
  }
  revenue: {
    mrr: number
    arr: number
    arpu: number
  }
  signupTrend: { label: string; value: number }[]
  activity: ReturnType<typeof listActivity>
}

function weekAgo() {
  return Date.now() - 7 * 24 * 60 * 60 * 1000
}

function dayAgo() {
  return Date.now() - 24 * 60 * 60 * 1000
}

export function getAdminDashboardMetrics(): AdminDashboardMetrics {
  const users = listUsersForAdmin()
  const catalog = loadCatalog()
  const subs = getSubscriptionMetrics()
  const reports = listReports()
  const week = weekAgo()
  const day = dayAgo()

  const byRole: Record<string, number> = {}
  for (const u of users) {
    byRole[u.role] = (byRole[u.role] ?? 0) + 1
  }

  const signupTrend = buildSignupTrend(users)

  const activeToday = users.filter((u) => new Date(u.lastLoginAt).getTime() >= day).length
  const newThisWeek = users.filter((u) => new Date(u.createdAt).getTime() >= week).length
  const suspended = users.filter((u) => u.suspended).length
  const paidUsers = listSubscriptions().filter(
    (s) => s.status === 'active' || s.status === 'trialing',
  ).length

  return {
    users: {
      total: users.length,
      newThisWeek,
      activeToday,
      byRole,
      suspended,
    },
    catalog: {
      series: catalog.length,
      chapters: catalog.reduce((n, s) => n + s.chapters.length, 0),
      views: catalog.reduce((n, s) => n + s.views, 0),
      manhwa: catalog.filter((s) => s.type === 'manhwa').length,
    },
    subscriptions: subs,
    moderation: {
      openReports: reports.filter((r) => r.status === 'open' || r.status === 'reviewing').length,
      totalReports: reports.length,
    },
    revenue: {
      mrr: subs.mrr,
      arr: subs.mrr * 12,
      arpu: paidUsers > 0 ? subs.mrr / paidUsers : 0,
    },
    signupTrend,
    activity: listActivity(12),
  }
}

function buildSignupTrend(users: { createdAt: string }[]) {
  const days = 7
  const buckets: { label: string; value: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - i)
    const next = new Date(d)
    next.setDate(next.getDate() + 1)
    const label = d.toLocaleDateString(undefined, { weekday: 'short' })
    const value = users.filter((u) => {
      const t = new Date(u.createdAt).getTime()
      return t >= d.getTime() && t < next.getTime()
    }).length
    buckets.push({ label, value })
  }
  return buckets
}
