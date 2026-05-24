import type { CSSProperties } from 'react'
import { getPlanPerks, type PlanId, type SubscriptionPlan } from '../lib/subscriptions'
import './SubscriptionPlanCard.css'

function money(n: number) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n)
}

function planRibbon(plan: SubscriptionPlan): string | null {
  if (plan.id === 'premium') return 'Best for dailies'
  if (plan.id === 'studio') return 'Instant drops'
  if (plan.id === 'supporter') return 'Support Rokari'
  return null
}

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan
  isCurrent: boolean
  onSubscribe: () => void
}

export function SubscriptionPlanCard({
  plan,
  isCurrent,
  onSubscribe,
}: SubscriptionPlanCardProps) {
  const ribbon = planRibbon(plan)
  const perks = getPlanPerks(plan.id)

  return (
    <article
      className={`sub-plan sub-plan--${plan.id}${isCurrent ? ' sub-plan--current' : ''}${plan.id === 'premium' ? ' sub-plan--featured' : ''}`}
      style={{ '--plan-accent': plan.accent } as CSSProperties}
    >
      <div className="sub-plan-glow" aria-hidden />
      {ribbon && <span className="sub-plan-ribbon">{ribbon}</span>}
      {isCurrent && <span className="sub-plan-active-pill">Active</span>}

      <header className="sub-plan-head">
        <div className="sub-plan-icon-wrap" aria-hidden>
          <PlanIcon planId={plan.id} />
        </div>
        <h3>{plan.name}</h3>
        <p className="sub-plan-desc">{plan.description}</p>
      </header>

      <p className="sub-plan-price">
        {money(plan.priceMonthly)}
        <span>/month</span>
      </p>

      <ul className="sub-plan-perks">
        {perks.map((perk) => (
          <li key={perk}>
            <CheckIcon />
            {perk}
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="sub-plan-cta"
        disabled={isCurrent}
        onClick={onSubscribe}
      >
        {isCurrent ? 'Current plan' : 'Subscribe'}
      </button>
    </article>
  )
}

function PlanIcon({ planId }: { planId: PlanId }) {
  if (planId === 'studio') {
    return (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden>
        <path d="M24 8l4 8 9 1.5-6.5 6.5 1.5 9L24 28l-8 5 1.5-9L11 17.5 20 16l4-8z" stroke="currentColor" strokeWidth="2" />
      </svg>
    )
  }
  if (planId === 'premium') {
    return (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden>
        <path d="M24 10l5.5 11 12 1.8-8.7 8.5 2 12L24 36l-10.8 7.3 2-12L6.5 22.8l12-1.8L24 10z" fill="currentColor" opacity="0.25" />
        <path d="M24 14l4 8.5 9.5 1.4-6.9 6.7 1.6 9.4L24 33l-7.2 4.9 1.6-9.4-6.9-6.7 9.5-1.4L24 14z" stroke="currentColor" strokeWidth="1.75" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden>
      <path d="M24 34s-12-7.5-12-16a6 6 0 0 1 12-2 6 6 0 0 1 12 2c0 8.5-12 16-12 16z" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}
