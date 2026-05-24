import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import {
  formatCoinBalance,
  getSubscriptionRemaining,
} from '../lib/accountSummary'
import type { SubscriptionPlan, UserSubscription } from '../lib/subscriptions'
import './AccountSummaryCards.css'

interface AccountSummaryCardsProps {
  balance: number
  subscription: UserSubscription | null
  plan: SubscriptionPlan | null
  showShopLink?: boolean
  className?: string
}

export function AccountSummaryCards({
  balance,
  subscription,
  plan,
  showShopLink = false,
  className = '',
}: AccountSummaryCardsProps) {
  const coins = formatCoinBalance(balance)
  const remaining = getSubscriptionRemaining(subscription, plan)
  const accent = plan?.accent ?? 'var(--text-muted)'
  const coinTitle = `${coins.value} ${coins.unit} — ${coins.caption}`
  const subTitle = `${plan?.name ?? 'Free'} — ${remaining.primaryLabel}. ${remaining.secondaryLabel}`

  return (
    <div className={`account-summary ${className}`.trim()}>
      <div className="account-summary-row" role="list">
        <Link
          to="/store"
          className="account-chip account-chip--coins"
          role="listitem"
          title={coinTitle}
        >
          <span className="account-chip-icon" aria-hidden>
            <CoinsIcon />
          </span>
          <span className="account-chip-text">
            <strong>{coins.value}</strong>
            <span>{coins.unit}</span>
          </span>
        </Link>

        <Link
          to="/store?tab=subscriptions"
          className={`account-chip account-chip--plan${remaining.expired ? ' account-chip--expired' : ''}`}
          role="listitem"
          title={subTitle}
          style={{ '--plan-accent': accent } as CSSProperties}
        >
          <span className="account-chip-icon" aria-hidden>
            <SubscriptionIcon />
          </span>
          <span className="account-chip-text">
            <strong style={{ color: accent }}>{plan?.name ?? 'Free'}</strong>
            <span className={remaining.expired ? 'account-chip-warn' : undefined}>
              {remaining.primaryLabel}
            </span>
          </span>
        </Link>
      </div>
      {showShopLink && (
        <p className="account-summary-foot">
          <Link to="/store">Shop</Link> for coins & plans
        </p>
      )}
    </div>
  )
}

function CoinsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 0 1 0 4H8" />
      <path d="M12 18V6" />
    </svg>
  )
}

function SubscriptionIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}
