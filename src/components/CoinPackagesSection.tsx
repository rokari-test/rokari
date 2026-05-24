import type { CoinDeal } from '../lib/commerce'
import { CoinPackCard } from './CoinPackCard'
import './CoinPackagesSection.css'

interface CoinPackagesSectionProps {
  deals: CoinDeal[]
  onBuy: (dealId: string) => void
}

export function CoinPackagesSection({ deals, onBuy }: CoinPackagesSectionProps) {
  const sortedDeals = [...deals].sort(
    (a, b) => a.priceUsd - b.priceUsd || a.coinAmount - b.coinAmount,
  )

  if (sortedDeals.length === 0) {
    return (
      <div className="store-empty coin-packages-empty">
        <p>No active coin packages yet.</p>
        <span>Add packages in Admin → Packages</span>
      </div>
    )
  }

  return (
    <div className="coin-packages">
      <div className="coin-packages-grid">
        {sortedDeals.map((deal, index) => (
          <CoinPackCard
            key={deal.id}
            deal={deal}
            index={index}
            onBuy={() => onBuy(deal.id)}
          />
        ))}
      </div>
    </div>
  )
}
