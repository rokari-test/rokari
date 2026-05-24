import { useEffect, type CSSProperties } from 'react'
import { formatCountdownClock } from '../lib/earlyAccess'
import { describePlanEarlyAccess } from '../lib/earlyAccess'
import { SUBSCRIPTION_PLANS } from '../lib/subscriptions'
import type { PlanId } from '../lib/planId'
import './CoinUnlockModal.css'

interface SubscriptionUpsellModalProps {
  open: boolean
  chapterTitle: string
  remainingMs: number
  planName: string
  planId: PlanId | null
  onClose: () => void
  onGoToSubscriptions: () => void
  onGoToPackages: () => void
}

const UPSELL_PLANS: PlanId[] = ['premium', 'studio']

export function SubscriptionUpsellModal({
  open,
  chapterTitle,
  remainingMs,
  planName,
  planId,
  onClose,
  onGoToSubscriptions,
  onGoToPackages,
}: SubscriptionUpsellModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const clock = formatCountdownClock(remainingMs)
  const paidPlans = SUBSCRIPTION_PLANS.filter((p) => UPSELL_PLANS.includes(p.id))

  return (
    <div className="coin-unlock-backdrop" onClick={onClose} role="presentation">
      <div
        className="coin-unlock-modal coin-unlock-modal--subscribe"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sub-upsell-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="coin-unlock-head">
          <div>
            <p className="coin-unlock-eyebrow">Rokari · Premium</p>
            <h2 id="sub-upsell-title">Skip the wait</h2>
            <p className="coin-unlock-sub">{chapterTitle}</p>
          </div>
          <button type="button" className="coin-unlock-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <div className="coin-unlock-timer-box" aria-live="polite">
          <span className="coin-unlock-timer-label">Free on your plan in</span>
          <strong>{clock}</strong>
          <span className="coin-unlock-timer-plan">Current plan · {planName}</span>
        </div>

        <p className="coin-unlock-upsell-lead">
          Upgrade your subscription to read new chapters sooner — or unlock now with coins.
        </p>

        <ul className="coin-unlock-plan-list">
          {paidPlans.map((plan) => {
            const isCurrent = plan.id === planId
            return (
              <li
                key={plan.id}
                className={`coin-unlock-plan-card${isCurrent ? ' is-current' : ''}`}
                style={{ '--plan-accent': plan.accent } as CSSProperties}
              >
                <div className="coin-unlock-plan-card-head">
                  <strong>{plan.name}</strong>
                  <span>${plan.priceMonthly.toFixed(2)}/mo</span>
                </div>
                <p>{describePlanEarlyAccess(plan.id)}</p>
              </li>
            )
          })}
        </ul>

        <div className="coin-unlock-actions coin-unlock-actions--stack">
          <button
            type="button"
            className="coin-unlock-btn coin-unlock-btn--primary"
            onClick={onGoToSubscriptions}
          >
            View subscriptions
          </button>
          <button
            type="button"
            className="coin-unlock-btn coin-unlock-btn--secondary"
            onClick={onGoToPackages}
          >
            Buy coin packages
          </button>
          <button type="button" className="coin-unlock-btn coin-unlock-btn--ghost" onClick={onClose}>
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}
