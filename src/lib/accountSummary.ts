import {
  isSubscriptionActive,
  type SubscriptionPlan,
  type UserSubscription,
} from './subscriptions'

export interface CoinBalanceDisplay {
  value: string
  unit: string
  caption: string
}

export function formatCoinBalance(balance: number): CoinBalanceDisplay {
  const unit = balance === 1 ? 'coin' : 'coins'
  return {
    value: balance.toLocaleString(),
    unit,
    caption:
      balance === 0
        ? 'No coins yet — get a package in Shop'
        : 'Remaining balance',
  }
}

export interface SubscriptionRemaining {
  active: boolean
  paid: boolean
  expired: boolean
  daysLeft: number
  hoursLeft: number
  minutesLeft: number
  periodPercentLeft: number
  renewsAt: Date | null
  primaryLabel: string
  secondaryLabel: string
}

export function getSubscriptionRemaining(
  sub: UserSubscription | null,
  plan: SubscriptionPlan | null,
): SubscriptionRemaining {
  const paid = (plan?.priceMonthly ?? 0) > 0

  if (!sub || !paid) {
    return {
      active: false,
      paid: false,
      expired: false,
      daysLeft: 0,
      hoursLeft: 0,
      minutesLeft: 0,
      periodPercentLeft: 0,
      renewsAt: null,
      primaryLabel: 'Free plan',
      secondaryLabel: 'No paid subscription period',
    }
  }

  const renewsAt = new Date(sub.renewsAt)
  const startedAt = new Date(sub.startedAt)
  const totalMs = renewsAt.getTime() - Date.now()
  const periodMs = renewsAt.getTime() - startedAt.getTime()
  const periodPercentLeft =
    periodMs > 0
      ? Math.min(100, Math.max(0, (totalMs / periodMs) * 100))
      : 0

  if (!isSubscriptionActive(sub) || totalMs <= 0) {
    return {
      active: false,
      paid: true,
      expired: true,
      daysLeft: 0,
      hoursLeft: 0,
      minutesLeft: 0,
      periodPercentLeft: 0,
      renewsAt,
      primaryLabel: 'Subscription ended',
      secondaryLabel: sub.canceledAt
        ? `Canceled ${renewsAt.toLocaleDateString(undefined, { dateStyle: 'medium' })}`
        : 'Renew in Shop to restore perks',
    }
  }

  const daysLeft = Math.floor(totalMs / 86_400_000)
  const hoursLeft = Math.floor((totalMs % 86_400_000) / 3_600_000)
  const minutesLeft = Math.floor((totalMs % 3_600_000) / 60_000)

  let primaryLabel: string
  if (daysLeft >= 1) {
    primaryLabel = `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`
  } else if (hoursLeft >= 1) {
    primaryLabel = `${hoursLeft} hour${hoursLeft === 1 ? '' : 's'} left`
  } else {
    primaryLabel = `${Math.max(1, minutesLeft)} minute${minutesLeft === 1 ? '' : 's'} left`
  }

  const renewDate = renewsAt.toLocaleDateString(undefined, { dateStyle: 'medium' })
  const timeDetail =
    daysLeft >= 1
      ? `${daysLeft}d ${hoursLeft}h left in this period`
      : `${hoursLeft}h ${minutesLeft}m left in this period`
  const secondaryLabel = `Renews ${renewDate} · ${timeDetail}`

  return {
    active: true,
    paid: true,
    expired: false,
    daysLeft,
    hoursLeft,
    minutesLeft,
    periodPercentLeft,
    renewsAt,
    primaryLabel,
    secondaryLabel,
  }
}
