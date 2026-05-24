import type { CSSProperties } from 'react'
import type { CoinDeal } from '../lib/commerce'
import './CoinPackCard.css'

function money(n: number) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n)
}

function tierFromTitle(title: string): string {
  const word = title.split(/\s+/)[0]?.toLowerCase() ?? 'pack'
  if (word.includes('bronze')) return 'bronze'
  if (word.includes('silver')) return 'silver'
  if (word.includes('gold')) return 'gold'
  if (word.includes('platinum')) return 'platinum'
  if (word.includes('diamond')) return 'diamond'
  if (word.includes('royal')) return 'royal'
  return 'default'
}

function ribbonLabel(deal: CoinDeal): string | null {
  if (deal.mostPopular) return 'Reader favorite'
  if (deal.bestDeal) return 'Max value'
  return null
}

interface CoinPackCardProps {
  deal: CoinDeal
  index: number
  onBuy: () => void
}

export function CoinPackCard({ deal, index, onBuy }: CoinPackCardProps) {
  const tier = tierFromTitle(deal.title)
  const ribbon = ribbonLabel(deal)
  const perUsd =
    deal.priceUsd > 0 ? Math.round(deal.coinAmount / deal.priceUsd) : deal.coinAmount

  return (
    <article
      className={`coin-pack coin-pack--${tier}${deal.mostPopular ? ' coin-pack--popular' : ''}${deal.bestDeal ? ' coin-pack--best' : ''}`}
      style={{ '--pack-i': index } as CSSProperties}
    >
      <div className="coin-pack-glow" aria-hidden />
      {ribbon && <span className="coin-pack-ribbon">{ribbon}</span>}

      <header className="coin-pack-head">
        <span className="coin-pack-tier">{deal.title}</span>
        {deal.description && (
          <p className="coin-pack-tagline">{deal.description}</p>
        )}
      </header>

      <div className="coin-pack-icon-wrap" aria-hidden>
        <span className="coin-pack-icon-ring" />
        <CoinStackIcon />
      </div>

      <div className="coin-pack-amount">
        <span className="coin-pack-coins">{deal.coinAmount.toLocaleString()}</span>
        <span className="coin-pack-coins-label">coins</span>
      </div>

      <p className="coin-pack-rate">{perUsd.toLocaleString()} coins per $1</p>

      <div className="coin-pack-price-row">
        <span className="coin-pack-price">{money(deal.priceUsd)}</span>
        <span className="coin-pack-once">one-time</span>
      </div>

      <button type="button" className="coin-pack-buy" onClick={onBuy}>
        <CartIcon />
        Add to wallet
      </button>
    </article>
  )
}

function CoinStackIcon() {
  return (
    <svg className="coin-pack-icon" viewBox="0 0 48 48" fill="none" aria-hidden>
      <ellipse cx="24" cy="30" rx="14" ry="5" fill="currentColor" opacity="0.25" />
      <ellipse cx="24" cy="24" rx="14" ry="5" fill="currentColor" opacity="0.45" />
      <ellipse cx="24" cy="18" rx="14" ry="5" fill="currentColor" />
      <path
        d="M17 18c0-2.5 3.1-4.5 7-4.5s7 2 7 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.5"
      />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="9" cy="20" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="18" cy="20" r="1.5" fill="currentColor" stroke="none" />
      <path d="M2 3h2l2.4 12.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6L22 8H6" />
    </svg>
  )
}
