import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { logActivity } from '../lib/adminActivity'
import { listUsersForAdmin } from '../lib/userAuth'
import {
  assignSubscription,
  cancelSubscription,
  getPlan,
  getSubscriptionMetrics,
  listSubscriptions,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTIONS_EVENT,
  updateSubscription,
  type PlanId,
  type SubscriptionStatus,
} from '../lib/subscriptions'
import { AdminEarlyAccess } from './AdminEarlyAccess'
import { AdminStatList } from './AdminStatList'

function formatMoney(n: number) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n)
}

const PAID_PLANS = SUBSCRIPTION_PLANS.filter((p) => p.id !== 'free')

export function AdminSubscriptions() {
  const [tick, setTick] = useState(0)
  const [addUserId, setAddUserId] = useState('')
  const [addPlanId, setAddPlanId] = useState<PlanId>('premium')
  const [addStatus, setAddStatus] = useState<SubscriptionStatus>('active')

  const users = useMemo(() => listUsersForAdmin(), [tick])

  useEffect(() => {
    const bump = () => setTick((t) => t + 1)
    window.addEventListener(SUBSCRIPTIONS_EVENT, bump)
    return () => window.removeEventListener(SUBSCRIPTIONS_EVENT, bump)
  }, [])

  const metrics = useMemo(() => getSubscriptionMetrics(), [tick])
  const subs = listSubscriptions()

  const rows = subs.map((sub) => {
    const user = users.find((u) => u.id === sub.userId)
    const plan = getPlan(sub.planId)
    return { sub, user, plan }
  })

  const allTimeRevenue = subs
    .filter((s) => s.status === 'active' || s.status === 'trialing')
    .reduce((sum, s) => sum + getPlan(s.planId).priceMonthly, 0)

  const subscriptionStatGroups = [
    {
      title: 'Overview',
      items: [
        {
          label: 'Active subscribers',
          value: String(metrics.active),
          highlight: true,
        },
        { label: 'This month (MRR)', value: formatMoney(metrics.mrr) },
        { label: 'All-time revenue', value: formatMoney(allTimeRevenue) },
      ],
    },
    {
      title: 'Status',
      items: [
        { label: 'Trialing', value: String(metrics.trialing) },
        { label: 'Past due', value: String(metrics.pastDue) },
        { label: 'Canceled', value: String(metrics.canceled) },
        { label: 'Total records', value: String(metrics.total) },
      ],
    },
    {
      title: 'By plan',
      variant: 'plans' as const,
      items: SUBSCRIPTION_PLANS.map((plan) => ({
        label: plan.name,
        value: String(metrics.byPlan.find((b) => b.plan.id === plan.id)?.count ?? 0),
        hint: plan.priceMonthly === 0 ? 'Free' : `${formatMoney(plan.priceMonthly)}/mo`,
      })),
    },
  ]

  const handleAddSub = () => {
    if (!addUserId) return
    const user = users.find((u) => u.id === addUserId)
    assignSubscription({
      userId: addUserId,
      planId: addPlanId,
      status: addStatus,
    })
    logActivity(
      'subscription',
      'Subscription added',
      user ? `@${user.username} · ${getPlan(addPlanId).name}` : addUserId,
    )
    setAddUserId('')
    setAddPlanId('premium')
    setAddStatus('active')
    setTick((t) => t + 1)
  }

  return (
    <>
      <header className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Subscriptions</h1>
          <p className="admin-page-sub">
            Subscription stats, add subscribers, and manage plans shown in the Shop.
          </p>
        </div>
        <Link to="/admin" className="admin-btn admin-btn--ghost">
          ← Dashboard
        </Link>
      </header>

      <AdminStatList title="Subscription statistics" groups={subscriptionStatGroups} />

      <AdminEarlyAccess />

      <section className="admin-card admin-add-subs">
        <h2 className="admin-packages-section-title">Add sub</h2>
        <div className="admin-form-row admin-form-row--3">
          <div className="admin-form-row">
            <label htmlFor="add-sub-user">User</label>
            <select
              id="add-sub-user"
              className="admin-select"
              value={addUserId}
              onChange={(e) => setAddUserId(e.target.value)}
            >
              <option value="">Select user…</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  @{u.username} — {u.email}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-form-row">
            <label htmlFor="add-sub-plan">Plan</label>
            <select
              id="add-sub-plan"
              className="admin-select"
              value={addPlanId}
              onChange={(e) => setAddPlanId(e.target.value as PlanId)}
            >
              {SUBSCRIPTION_PLANS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.priceMonthly > 0 ? ` (${formatMoney(p.priceMonthly)}/mo)` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-form-row">
            <label htmlFor="add-sub-status">Status</label>
            <select
              id="add-sub-status"
              className="admin-select"
              value={addStatus}
              onChange={(e) => setAddStatus(e.target.value as SubscriptionStatus)}
            >
              <option value="active">Active</option>
              <option value="trialing">Trialing</option>
              <option value="past_due">Past due</option>
            </select>
          </div>
          <button
            type="button"
            className="admin-btn"
            disabled={!addUserId}
            onClick={handleAddSub}
          >
            Add sub
          </button>
        </div>
      </section>

      <div className="admin-card">
        <div className="admin-card-head">
          <h2>All subscriptions</h2>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Renews</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ color: 'var(--admin-muted)' }}>
                    No subscriptions yet. Use Add sub above.
                  </td>
                </tr>
              ) : (
                rows.map(({ sub, user, plan }) => (
                  <tr key={sub.id}>
                    <td>
                      {user ? (
                        <>
                          <strong>@{user.username}</strong>
                          <br />
                          <span style={{ fontSize: '0.78rem', color: 'var(--admin-muted)' }}>
                            {user.email}
                          </span>
                        </>
                      ) : (
                        sub.userId.slice(0, 8)
                      )}
                    </td>
                    <td>
                      <select
                        className="admin-select admin-select--compact"
                        value={sub.planId}
                        onChange={(e) => {
                          updateSubscription(sub.id, { planId: e.target.value as PlanId })
                          logActivity('subscription', 'Plan changed', plan.name)
                          setTick((t) => t + 1)
                        }}
                      >
                        {PAID_PLANS.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                        <option value="free">Free</option>
                      </select>
                    </td>
                    <td>
                      <select
                        className="admin-select admin-select--compact"
                        value={sub.status}
                        onChange={(e) => {
                          updateSubscription(sub.id, {
                            status: e.target.value as SubscriptionStatus,
                          })
                          setTick((t) => t + 1)
                        }}
                      >
                        <option value="active">Active</option>
                        <option value="trialing">Trialing</option>
                        <option value="past_due">Past due</option>
                        <option value="canceled">Canceled</option>
                      </select>
                    </td>
                    <td>{new Date(sub.renewsAt).toLocaleDateString()}</td>
                    <td>
                      {sub.status !== 'canceled' && (
                        <button
                          type="button"
                          className="admin-btn admin-btn--danger admin-btn--sm"
                          onClick={() => {
                            cancelSubscription(sub.id)
                            setTick((t) => t + 1)
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
