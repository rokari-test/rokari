import { describePlanEarlyAccess } from './earlyAccess'
import type { PlanId } from './planId'

export type { PlanId } from './planId'

export const SUBSCRIPTIONS_EVENT = 'sakura-subscriptions'

export type SubscriptionStatus = 'active' | 'trialing' | 'canceled' | 'past_due'

export interface SubscriptionPlan {
  id: PlanId
  name: string
  priceMonthly: number
  description: string
  perks: string[]
  accent: string
}

export interface UserSubscription {
  id: string
  userId: string
  planId: PlanId
  status: SubscriptionStatus
  startedAt: string
  renewsAt: string
  canceledAt?: string
}

const SUBS_KEY = 'sakura-user-subscriptions'

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    description: 'Full catalog with standard new-chapter queue',
    perks: ['Full catalog', 'Bookmarks', 'Reading history'],
    accent: '#8b8ba0',
  },
  {
    id: 'supporter',
    name: 'Supporter',
    priceMonthly: 4.99,
    description: 'Support the team & read new chapters sooner',
    perks: ['Supporter badge', 'No promo strips', 'Bookmarks & history'],
    accent: '#f472b6',
  },
  {
    id: 'premium',
    name: 'Premium',
    priceMonthly: 9.99,
    description: 'Best value for daily readers',
    perks: ['HD panels', 'Offline packs', 'Custom themes', 'Priority support'],
    accent: '#ff4d8d',
  },
  {
    id: 'studio',
    name: 'Studio',
    priceMonthly: 19.99,
    description: 'Instant new chapters for power users & teams',
    perks: ['Bulk upload', 'Analytics', 'API access', 'Dedicated manager'],
    accent: '#c084fc',
  },
]

/** Perks shown in Shop — includes live early-access rule from settings. */
export function getPlanPerks(planId: PlanId): string[] {
  const plan = getPlan(planId)
  return [describePlanEarlyAccess(planId), ...plan.perks]
}

function dispatch() {
  window.dispatchEvent(new Event(SUBSCRIPTIONS_EVENT))
}

function loadSubs(): UserSubscription[] {
  try {
    const raw = localStorage.getItem(SUBS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as UserSubscription[]
  } catch {
    return []
  }
}

function saveSubs(subs: UserSubscription[]) {
  localStorage.setItem(SUBS_KEY, JSON.stringify(subs))
  dispatch()
}

export function getPlan(planId: PlanId): SubscriptionPlan {
  return SUBSCRIPTION_PLANS.find((p) => p.id === planId) ?? SUBSCRIPTION_PLANS[0]
}

export function listSubscriptions(): UserSubscription[] {
  return loadSubs()
}

export function getSubscriptionForUser(userId: string): UserSubscription | null {
  return (
    loadSubs().find((s) => s.userId === userId && s.status !== 'canceled') ??
    loadSubs().find((s) => s.userId === userId) ??
    null
  )
}

export function assignSubscription(input: {
  userId: string
  planId: PlanId
  status?: SubscriptionStatus
}): UserSubscription {
  const subs = loadSubs().filter((s) => s.userId !== input.userId)
  const now = new Date()
  const renews = new Date(now)
  renews.setMonth(renews.getMonth() + 1)
  const sub: UserSubscription = {
    id: crypto.randomUUID(),
    userId: input.userId,
    planId: input.planId,
    status: input.status ?? (input.planId === 'free' ? 'active' : 'active'),
    startedAt: now.toISOString(),
    renewsAt: renews.toISOString(),
  }
  saveSubs([...subs, sub])
  return sub
}

export function grantSubscriptionMonths(
  userId: string,
  months: number,
  planId: PlanId = 'premium',
): UserSubscription {
  const monthsSafe = Math.max(1, Math.min(36, Math.floor(months)))
  const existing = getSubscriptionForUser(userId)
  const now = new Date()
  let renews = new Date(now)
  if (existing && (existing.status === 'active' || existing.status === 'trialing')) {
    renews = new Date(existing.renewsAt)
    if (renews.getTime() < now.getTime()) renews = new Date(now)
  }
  renews.setMonth(renews.getMonth() + monthsSafe)

  if (existing) {
    const updated = updateSubscription(existing.id, {
      planId,
      status: 'active',
      renewsAt: renews.toISOString(),
    })
    if (updated) return updated
  }

  const subs = loadSubs().filter((s) => s.userId !== userId)
  const sub: UserSubscription = {
    id: crypto.randomUUID(),
    userId,
    planId,
    status: 'active',
    startedAt: now.toISOString(),
    renewsAt: renews.toISOString(),
  }
  saveSubs([...subs, sub])
  return sub
}

export function formatSubscriptionLabel(sub: UserSubscription | null): string {
  if (!sub || sub.planId === 'free') return 'No subscription'
  if (sub.status === 'canceled') return 'Canceled'
  const plan = getPlan(sub.planId)
  const renews = new Date(sub.renewsAt)
  const now = new Date()
  if (renews.getTime() <= now.getTime()) return `${plan.name} · expired`
  const days = Math.ceil((renews.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
  if (days >= 30) {
    const mo = Math.round(days / 30)
    return `${plan.name} · ${mo} mo left`
  }
  return `${plan.name} · ${days}d left`
}

export function updateSubscription(
  id: string,
  patch: Partial<Pick<UserSubscription, 'planId' | 'status' | 'renewsAt'>>,
): UserSubscription | null {
  const subs = loadSubs()
  const idx = subs.findIndex((s) => s.id === id)
  if (idx < 0) return null
  const next = { ...subs[idx], ...patch }
  if (patch.status === 'canceled') {
    next.canceledAt = new Date().toISOString()
  }
  subs[idx] = next
  saveSubs(subs)
  return next
}

export function cancelSubscription(id: string) {
  updateSubscription(id, { status: 'canceled' })
}

export function isSubscriptionActive(sub: UserSubscription | null): boolean {
  if (!sub) return false
  return sub.status === 'active' || sub.status === 'trialing'
}

export function getUserPlan(userId: string): SubscriptionPlan {
  const sub = getSubscriptionForUser(userId)
  if (!sub || !isSubscriptionActive(sub)) return getPlan('free')
  return getPlan(sub.planId)
}

export type SubscribeResult =
  | { ok: true; subscription: UserSubscription }
  | { ok: false; error: string }

/** User-facing checkout (same storage as admin assign). */
export function subscribeToPlan(userId: string, planId: PlanId): SubscribeResult {
  if (planId === 'free') {
    assignSubscription({ userId, planId: 'free', status: 'active' })
    const sub = getSubscriptionForUser(userId)
    return sub ? { ok: true, subscription: sub } : { ok: false, error: 'Could not update plan.' }
  }
  const sub = assignSubscription({ userId, planId, status: 'active' })
  return { ok: true, subscription: sub }
}

export function seedSubscriptionsFromUsers(userIds: string[]) {
  if (loadSubs().length > 0) return
  const paid: PlanId[] = ['supporter', 'premium', 'studio']
  const subs: UserSubscription[] = []
  userIds.forEach((userId, i) => {
    const planId: PlanId =
      i % 4 === 0 ? paid[i % paid.length] : i % 7 === 0 ? 'premium' : 'free'
    if (planId === 'free') return
    const now = new Date()
    now.setDate(now.getDate() - (i % 28))
    const renews = new Date(now)
    renews.setMonth(renews.getMonth() + 1)
    subs.push({
      id: crypto.randomUUID(),
      userId,
      planId,
      status: i % 11 === 0 ? 'past_due' : i % 13 === 0 ? 'trialing' : 'active',
      startedAt: now.toISOString(),
      renewsAt: renews.toISOString(),
    })
  })
  saveSubs(subs)
}

export function getSubscriptionMetrics() {
  const subs = loadSubs()
  const active = subs.filter((s) => s.status === 'active' || s.status === 'trialing')
  const mrr = active.reduce((sum, s) => sum + getPlan(s.planId).priceMonthly, 0)
  const byPlan = SUBSCRIPTION_PLANS.map((plan) => ({
    plan,
    count: subs.filter((s) => s.planId === plan.id && s.status !== 'canceled').length,
  }))
  return {
    total: subs.length,
    active: active.length,
    trialing: subs.filter((s) => s.status === 'trialing').length,
    pastDue: subs.filter((s) => s.status === 'past_due').length,
    canceled: subs.filter((s) => s.status === 'canceled').length,
    mrr,
    byPlan,
  }
}
