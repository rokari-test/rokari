import type { CSSProperties } from 'react'
import type { SubscriptionRemaining } from '../lib/accountSummary'
import {
  getPlanPerks,
  type PlanId,
  type SubscriptionPlan,
} from '../lib/subscriptions'
import { SubscriptionPlanCard } from './SubscriptionPlanCard'
import './SubscriptionsSection.css'

interface SubscriptionsSectionProps {
  paidPlans: SubscriptionPlan[]
  currentPlan: SubscriptionPlan | undefined
  currentPlanId: PlanId
  subActive: boolean
  subRemaining: SubscriptionRemaining
  onSubscribe: (planId: PlanId) => void
}

export function SubscriptionsSection({
  paidPlans,
  currentPlan,
  currentPlanId,
  subActive,
  subRemaining,
  onSubscribe,
}: SubscriptionsSectionProps) {
  return (
    <div className="subs-section">
      <div
        className="subs-current"
        style={{ '--plan-accent': currentPlan?.accent ?? '#8b8ba0' } as CSSProperties}
      >
        <div className="subs-current-main">
          <span className="subs-current-label">Current plan</span>
          <strong>{currentPlan?.name ?? 'Free'}</strong>
          {currentPlan && <p>{currentPlan.description}</p>}
        </div>
        <div className="subs-current-side">
          <p className="subs-current-time">{subRemaining.primaryLabel}</p>
          <p className="subs-current-detail">{subRemaining.secondaryLabel}</p>
          {subRemaining.active && subRemaining.periodPercentLeft > 0 && (
            <div
              className="subs-current-progress"
              role="progressbar"
              aria-valuenow={Math.round(subRemaining.periodPercentLeft)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span style={{ width: `${subRemaining.periodPercentLeft}%` }} />
            </div>
          )}
        </div>
      </div>

      <div className="subs-grid">
        {paidPlans.map((p) => (
          <SubscriptionPlanCard
            key={p.id}
            plan={p}
            isCurrent={currentPlanId === p.id && subActive}
            onSubscribe={() => onSubscribe(p.id)}
          />
        ))}
      </div>

      <article className="subs-free">
        <div className="subs-free-text">
          <h3>Free</h3>
          <p>{getPlanPerks('free')[0]} · Full catalog with standard new-chapter queue.</p>
        </div>
        <button
          type="button"
          className="subs-free-btn"
          disabled={currentPlanId === 'free'}
          onClick={() => onSubscribe('free')}
        >
          {currentPlanId === 'free' ? 'Current plan' : 'Switch to Free'}
        </button>
      </article>
    </div>
  )
}
