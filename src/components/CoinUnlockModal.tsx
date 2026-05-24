import { useEffect } from 'react'
import { formatCoinBalance } from '../lib/accountSummary'
import './CoinUnlockModal.css'

interface CoinUnlockModalProps {
  open: boolean
  chapterTitle: string
  coinPrice: number
  currentBalance: number
  error?: string | null
  onClose: () => void
  onConfirm: () => void
  onGoToPackages: () => void
  onGoToSubscriptions: () => void
}

export function CoinUnlockModal({
  open,
  chapterTitle,
  coinPrice,
  currentBalance,
  error,
  onClose,
  onConfirm,
  onGoToPackages,
  onGoToSubscriptions,
}: CoinUnlockModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const canAfford = currentBalance >= coinPrice
  const shortfall = Math.max(0, coinPrice - currentBalance)
  const afterBalance = Math.max(0, currentBalance - coinPrice)
  const balanceFmt = formatCoinBalance(currentBalance)
  const priceFmt = formatCoinBalance(coinPrice)
  const afterFmt = formatCoinBalance(afterBalance)
  const shortFmt = formatCoinBalance(shortfall)

  return (
    <div className="coin-unlock-backdrop" onClick={onClose} role="presentation">
      <div
        className="coin-unlock-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="coin-unlock-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="coin-unlock-head">
          <div>
            <p className="coin-unlock-eyebrow">Rokari · Wallet</p>
            <h2 id="coin-unlock-title">Unlock chapter</h2>
            <p className="coin-unlock-sub">{chapterTitle}</p>
          </div>
          <button type="button" className="coin-unlock-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <div className="coin-unlock-ledger" aria-label="Coin balance summary">
          <div className="coin-unlock-row">
            <span>Your balance</span>
            <strong>
              {balanceFmt.value} {balanceFmt.unit}
            </strong>
          </div>
          <div className="coin-unlock-row coin-unlock-row--deduct">
            <span>Chapter price</span>
            <strong>
              −{priceFmt.value} {priceFmt.unit}
            </strong>
          </div>
          <div className="coin-unlock-row coin-unlock-row--after">
            <span>Balance after</span>
            <strong>
              {afterFmt.value} {afterFmt.unit}
            </strong>
          </div>
        </div>

        {!canAfford ? (
          <div className="coin-unlock-shortfall">
            <span>You need</span>
            <strong>
              {shortFmt.value} more {shortFmt.unit}
            </strong>
          </div>
        ) : null}

        {error ? <p className="coin-unlock-error">{error}</p> : null}

        <div className="coin-unlock-actions">
          <button type="button" className="coin-unlock-btn coin-unlock-btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="coin-unlock-btn coin-unlock-btn--primary"
            onClick={onConfirm}
            disabled={!canAfford}
          >
            Unlock for {priceFmt.value} {priceFmt.unit}
          </button>
        </div>

        {!canAfford ? (
          <div className="coin-unlock-upsell">
            <p className="coin-unlock-upsell-lead">
              Top up your wallet or subscribe for faster access on new chapters.
            </p>
            <div className="coin-unlock-actions coin-unlock-actions--stack coin-unlock-actions--upsell">
              <button
                type="button"
                className="coin-unlock-btn coin-unlock-btn--secondary"
                onClick={onGoToPackages}
              >
                Buy coin packages
              </button>
              <button
                type="button"
                className="coin-unlock-btn coin-unlock-btn--secondary"
                onClick={onGoToSubscriptions}
              >
                View subscriptions
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
