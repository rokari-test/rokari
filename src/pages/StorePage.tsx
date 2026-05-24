import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AccountSummaryCards } from '../components/AccountSummaryCards'
import { CoinPackagesSection } from '../components/CoinPackagesSection'
import { SubscriptionsSection } from '../components/SubscriptionsSection'
import { RequireAuth } from '../components/RequireAuth'
import { useUser } from '../hooks/useUser'
import { useWallet } from '../hooks/useWallet'
import { useUserSubscription } from '../hooks/useUserSubscription'
import {
  COMMERCE_EVENT,
  ensureCoinDealCatalog,
  listActiveDeals,
  purchaseDeal,
  type CoinDeal,
} from '../lib/commerce'
import { getSubscriptionRemaining } from '../lib/accountSummary'
import {
  isSubscriptionActive,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTIONS_EVENT,
  subscribeToPlan,
  type PlanId,
} from '../lib/subscriptions'
import './StorePage.css'

type StoreTab = 'packages' | 'subscriptions'

function StoreContent() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useUser()
  const { balance } = useWallet()
  const { subscription, plan } = useUserSubscription()
  const [message, setMessage] = useState<string | null>(null)
  const [deals, setDeals] = useState<CoinDeal[]>(() => listActiveDeals())
  const tab: StoreTab =
    searchParams.get('tab') === 'subscriptions' ? 'subscriptions' : 'packages'

  useEffect(() => {
    ensureCoinDealCatalog()
    setDeals(listActiveDeals())
    const sync = () => {
      setDeals(listActiveDeals())
    }
    window.addEventListener(COMMERCE_EVENT, sync)
    window.addEventListener(SUBSCRIPTIONS_EVENT, sync)
    return () => {
      window.removeEventListener(COMMERCE_EVENT, sync)
      window.removeEventListener(SUBSCRIPTIONS_EVENT, sync)
    }
  }, [])

  const paidPlans = useMemo(
    () => SUBSCRIPTION_PLANS.filter((p) => p.priceMonthly > 0),
    [],
  )

  if (!user) return null

  const setTab = (next: StoreTab) => {
    setSearchParams(next === 'subscriptions' ? { tab: 'subscriptions' } : {})
    setMessage(null)
  }

  const handleBuy = (dealId: string) => {
    const result = purchaseDeal(user, dealId)
    if (!result.ok) {
      setMessage(result.error)
      return
    }
    setMessage(
      `Package purchased! +${result.order.coins.toLocaleString()} coins — balance is now ${result.newBalance.toLocaleString()}.`,
    )
  }

  const handleSubscribe = (planId: PlanId) => {
    const result = subscribeToPlan(user.id, planId)
    if (!result.ok) {
      setMessage(result.error)
      return
    }
    setMessage(`${getPlanName(planId)} subscription activated.`)
  }

  const currentPlanId = plan?.id ?? 'free'
  const subActive = isSubscriptionActive(subscription)
  const subRemaining = getSubscriptionRemaining(subscription, plan)

  return (
    <div className="store-page">
      <div className="store-page-inner container--wide">
        <header className="store-hero">
          <div className="store-hero-main">
            <p className="store-eyebrow">Shop</p>
            <h1>Packages & subscriptions</h1>
          </div>
          <AccountSummaryCards
            className="store-account-summary"
            balance={balance}
            subscription={subscription}
            plan={plan}
          />
        </header>

        {message && (
          <p className="store-toast" role="status">
            {message}
          </p>
        )}

        <div className="store-panel">
          <div className="store-panel-head">
            <nav className="store-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'packages'}
                className={tab === 'packages' ? 'is-active' : ''}
                onClick={() => setTab('packages')}
              >
                Coin packages
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'subscriptions'}
                className={tab === 'subscriptions' ? 'is-active' : ''}
                onClick={() => setTab('subscriptions')}
              >
                Subscriptions
              </button>
            </nav>
            <p className="store-panel-lead">
              {tab === 'packages'
                ? 'Top up your wallet and unlock premium chapters.'
                : 'Skip the wait on new chapters and unlock Rokari perks.'}
            </p>
          </div>

          <div className="store-panel-body">
            {tab === 'packages' && (
              <section className="store-section store-section--packages">
                <CoinPackagesSection deals={deals} onBuy={handleBuy} />
              </section>
            )}

            {tab === 'subscriptions' && (
              <section className="store-section store-section--subs">
                <SubscriptionsSection
                  paidPlans={paidPlans}
                  currentPlan={plan ?? undefined}
                  currentPlanId={currentPlanId}
                  subActive={subActive}
                  subRemaining={subRemaining}
                  onSubscribe={handleSubscribe}
                />
              </section>
            )}
          </div>
        </div>

        <p className="store-foot">
          Checkout is simulated on this device —{' '}
          <Link to="/profile">your profile</Link>
        </p>
      </div>
    </div>
  )
}

function getPlanName(id: PlanId) {
  return SUBSCRIPTION_PLANS.find((p) => p.id === id)?.name ?? id
}

export function StorePage() {
  return (
    <RequireAuth>
      <StoreContent />
    </RequireAuth>
  )
}
