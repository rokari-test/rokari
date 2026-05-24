import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  addDeal,
  COMMERCE_EVENT,
  deleteDeal,
  ensureCoinDealCatalog,
  getSalesMetrics,
  listDeals,
  listOrders,
  moveDeal,
  updateDeal,
  type CoinDeal,
} from '../lib/commerce'
import { AdminStatList } from './AdminStatList'

function money(n: number) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n)
}

export function AdminPackages() {
  const [deals, setDeals] = useState<CoinDeal[]>(() => listDeals())
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priceUsd, setPriceUsd] = useState('')
  const [coinAmount, setCoinAmount] = useState('')
  const [bestDeal, setBestDeal] = useState(false)
  const [mostPopular, setMostPopular] = useState(false)

  const [metrics, setMetrics] = useState(() => getSalesMetrics())

  const refresh = () => {
    setDeals(listDeals())
    setMetrics(getSalesMetrics())
  }

  useEffect(() => {
    ensureCoinDealCatalog()
    refresh()
    window.addEventListener(COMMERCE_EVENT, refresh)
    return () => window.removeEventListener(COMMERCE_EVENT, refresh)
  }, [])

  const activePackages = deals.filter((d) => d.active).length
  const pendingOrders = listOrders().filter((o) => o.status === 'pending').length

  const packageStatGroups = [
    {
      title: 'Overview',
      items: [
        {
          label: 'Total earnings',
          value: money(metrics.totalEarnings),
          highlight: true,
        },
        { label: 'Active packages', value: String(activePackages) },
        { label: 'Pending orders', value: String(pendingOrders) },
      ],
    },
    {
      title: 'Revenue',
      items: [
        { label: 'Current month', value: money(metrics.currentMonthEarnings) },
        { label: 'Previous month', value: money(metrics.previousMonthEarnings) },
        { label: 'Today', value: money(metrics.todayEarnings) },
        { label: 'Yesterday', value: money(metrics.yesterdayEarnings) },
        {
          label: 'Same day prev. month',
          value: money(metrics.sameDayPrevMonthEarnings),
        },
      ],
    },
    {
      title: 'Orders',
      items: [
        { label: 'Total orders', value: String(metrics.totalOrders) },
        { label: 'This month', value: String(metrics.currentMonthOrders) },
        { label: 'Previous month', value: String(metrics.previousMonthOrders) },
      ],
    },
  ]

  const handleAdd = () => {
    if (!title.trim()) return
    addDeal({
      title: title.trim(),
      description: description.trim(),
      priceUsd: Number(priceUsd) || 0,
      coinAmount: Number(coinAmount) || 0,
      bestDeal,
      mostPopular,
      active: true,
    })
    setTitle('')
    setDescription('')
    setPriceUsd('')
    setCoinAmount('')
    setBestDeal(false)
    setMostPopular(false)
    refresh()
  }

  return (
    <>
      <header className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Coin packages</h1>
          <p className="admin-page-sub">
            Manage coin packages — stats, create, and edit packages shown in the Shop.
          </p>
        </div>
        <Link to="/admin" className="admin-btn admin-btn--ghost">
          ← Dashboard
        </Link>
      </header>

      <AdminStatList title="Package statistics" groups={packageStatGroups} />

      <section className="admin-card admin-packages-create">
        <h2 className="admin-packages-section-title">Create package</h2>
        <div className="admin-form admin-form--packages">
          <div className="admin-form-row admin-form-row--2 admin-form-row--4">
            <div className="admin-form-row">
              <label htmlFor="pkg-title">Title</label>
              <input
                id="pkg-title"
                className="admin-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Bronze Pack"
              />
            </div>
            <div className="admin-form-row">
              <label htmlFor="pkg-desc">Description</label>
              <input
                id="pkg-desc"
                className="admin-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description"
              />
            </div>
            <div className="admin-form-row">
              <label htmlFor="pkg-price">Price (USD)</label>
              <input
                id="pkg-price"
                className="admin-input"
                type="number"
                min={0}
                step="0.01"
                value={priceUsd}
                onChange={(e) => setPriceUsd(e.target.value)}
              />
            </div>
            <div className="admin-form-row">
              <label htmlFor="pkg-coins">Coin amount</label>
              <input
                id="pkg-coins"
                className="admin-input"
                type="number"
                min={0}
                value={coinAmount}
                onChange={(e) => setCoinAmount(e.target.value)}
              />
            </div>
          </div>
          <div className="admin-packages-checks">
            <label className="admin-packages-check">
              <input
                type="checkbox"
                checked={bestDeal}
                onChange={(e) => setBestDeal(e.target.checked)}
              />
              Best deal badge
            </label>
            <label className="admin-packages-check">
              <input
                type="checkbox"
                checked={mostPopular}
                onChange={(e) => setMostPopular(e.target.checked)}
              />
              Most popular badge
            </label>
          </div>
          <div className="admin-form-actions">
            <button type="button" className="admin-btn" onClick={handleAdd}>
              Add package
            </button>
          </div>
        </div>
      </section>

      <section className="admin-card">
        <header className="admin-card-head">
          <h2 className="admin-packages-section-title">Existing packages</h2>
          <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={refresh}>
            Refresh
          </button>
        </header>

        {deals.length === 0 ? (
          <p className="admin-packages-empty">No packages yet. Create one above.</p>
        ) : (
          <ul className="admin-packages-list">
            {deals.map((deal) => (
              <PackageCard
                key={deal.id}
                deal={deal}
                onRefresh={refresh}
                onMove={(dir) => {
                  moveDeal(deal.id, dir)
                  refresh()
                }}
              />
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

function PackageCard({
  deal,
  onRefresh,
  onMove,
}: {
  deal: CoinDeal
  onRefresh: () => void
  onMove: (dir: 'up' | 'down') => void
}) {
  const [title, setTitle] = useState(deal.title)
  const [description, setDescription] = useState(deal.description)
  const [priceUsd, setPriceUsd] = useState(String(deal.priceUsd))
  const [coinAmount, setCoinAmount] = useState(String(deal.coinAmount))

  useEffect(() => {
    setTitle(deal.title)
    setDescription(deal.description)
    setPriceUsd(String(deal.priceUsd))
    setCoinAmount(String(deal.coinAmount))
  }, [deal])

  return (
    <li className="admin-package-card">
      <header className="admin-package-card-head">
        <div>
          <strong>{deal.title}</strong>
          <span>
            {money(deal.priceUsd)} · {deal.coinAmount.toLocaleString()} coins
          </span>
          <div className="admin-package-badges">
            {deal.mostPopular && (
              <span className="admin-package-badge admin-package-badge--popular">Most popular</span>
            )}
            {deal.bestDeal && (
              <span className="admin-package-badge admin-package-badge--best">Best deal</span>
            )}
            {!deal.active && (
              <span className="admin-package-badge admin-package-badge--off">Inactive</span>
            )}
          </div>
        </div>
        <div className="admin-package-sort">
          <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => onMove('up')} aria-label="Move up">
            ↑
          </button>
          <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => onMove('down')} aria-label="Move down">
            ↓
          </button>
        </div>
      </header>

      <div className="admin-form-row admin-form-row--2 admin-form-row--4 admin-form-row--dense">
        <div className="admin-form-row">
          <label>Title</label>
          <input className="admin-input" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="admin-form-row">
          <label>Description</label>
          <input
            className="admin-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="admin-form-row">
          <label>Price (USD)</label>
          <input
            className="admin-input"
            type="number"
            min={0}
            step="0.01"
            value={priceUsd}
            onChange={(e) => setPriceUsd(e.target.value)}
          />
        </div>
        <div className="admin-form-row">
          <label>Coins</label>
          <input
            className="admin-input"
            type="number"
            min={0}
            value={coinAmount}
            onChange={(e) => setCoinAmount(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-package-actions">
        <button
          type="button"
          className="admin-btn admin-btn--outline-success"
          onClick={() => {
            updateDeal(deal.id, {
              title: title.trim(),
              description: description.trim(),
              priceUsd: Number(priceUsd) || 0,
              coinAmount: Number(coinAmount) || 0,
            })
            onRefresh()
          }}
        >
          Save changes
        </button>
        <button
          type="button"
          className="admin-btn admin-btn--ghost admin-btn--sm"
          onClick={() => {
            updateDeal(deal.id, { active: !deal.active })
            onRefresh()
          }}
        >
          {deal.active ? 'Active' : 'Inactive'}
        </button>
        <button
          type="button"
          className="admin-btn admin-btn--ghost admin-btn--sm"
          onClick={() => {
            updateDeal(deal.id, { bestDeal: true, mostPopular: false })
            onRefresh()
          }}
        >
          Mark best
        </button>
        <button
          type="button"
          className="admin-btn admin-btn--ghost admin-btn--sm"
          onClick={() => {
            updateDeal(deal.id, { mostPopular: true, bestDeal: false })
            onRefresh()
          }}
        >
          Mark popular
        </button>
        <button
          type="button"
          className="admin-btn admin-btn--danger admin-btn--sm"
          onClick={() => {
            if (confirm(`Delete "${deal.title}"?`)) {
              deleteDeal(deal.id)
              onRefresh()
            }
          }}
        >
          Delete
        </button>
      </div>
    </li>
  )
}
