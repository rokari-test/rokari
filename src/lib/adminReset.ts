import { ADMIN_ACTIVITY_EVENT } from './adminActivity'
import { ADMIN_REPORTS_EVENT } from './adminReports'
import { COMMERCE_EVENT } from './commerce'
import { SUBSCRIPTIONS_EVENT } from './subscriptions'

const MANAGED_PLANS_EVENT = 'sakura-managed-plans'

const STAT_KEYS = [
  'sakura-coin-deals',
  'sakura-coin-orders',
  'sakura-user-subscriptions',
  'sakura-admin-activity',
  'sakura-moderation-reports',
  'sakura-managed-sub-plans',
] as const

/** Clears demo commerce, subscriptions, activity, and moderation stats. */
export function resetAllAdminStats() {
  for (const key of STAT_KEYS) {
    localStorage.removeItem(key)
  }
  window.dispatchEvent(new Event(SUBSCRIPTIONS_EVENT))
  window.dispatchEvent(new Event(ADMIN_ACTIVITY_EVENT))
  window.dispatchEvent(new Event(ADMIN_REPORTS_EVENT))
  window.dispatchEvent(new Event(COMMERCE_EVENT))
  window.dispatchEvent(new Event(MANAGED_PLANS_EVENT))
}
