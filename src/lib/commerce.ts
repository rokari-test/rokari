import { addCoins } from './userWallet'
import { listUsersForAdmin, type UserPublic } from './userAuth'

export const COMMERCE_EVENT = 'sakura-commerce'

export interface CoinDeal {
  id: string
  title: string
  description: string
  priceUsd: number
  coinAmount: number
  bestDeal: boolean
  mostPopular: boolean
  active: boolean
  sortOrder: number
}

export interface CoinOrder {
  id: string
  userId: string
  buyerUsername: string
  buyerEmail: string
  dealId: string
  dealTitle: string
  coins: number
  amountUsd: number
  createdAt: string
  status: 'completed' | 'pending' | 'failed'
}

const DEALS_KEY = 'sakura-coin-deals'
const ORDERS_KEY = 'sakura-coin-orders'

/** Default shop catalog — merged into localStorage when titles are missing. */
export const COIN_DEAL_CATALOG: Omit<CoinDeal, 'id' | 'sortOrder'>[] = [
  {
    title: 'Bronze Pack',
    description: 'Light top-up for a few locked chapters',
    priceUsd: 6,
    coinAmount: 500,
    bestDeal: false,
    mostPopular: false,
    active: true,
  },
  {
    title: 'Silver Pack',
    description: 'Sweet spot for weekly binge readers',
    priceUsd: 10,
    coinAmount: 1100,
    bestDeal: false,
    mostPopular: true,
    active: true,
  },
  {
    title: 'Gold Pack',
    description: 'Stock up for long series marathons',
    priceUsd: 20,
    coinAmount: 2400,
    bestDeal: false,
    mostPopular: false,
    active: true,
  },
  {
    title: 'Platinum Pack',
    description: 'Heavy wallet for dedicated collectors',
    priceUsd: 30,
    coinAmount: 3500,
    bestDeal: false,
    mostPopular: false,
    active: true,
  },
  {
    title: 'Diamond Pack',
    description: 'Premium stash with extra headroom',
    priceUsd: 50,
    coinAmount: 6400,
    bestDeal: false,
    mostPopular: false,
    active: true,
  },
  {
    title: 'Royal Pack',
    description: 'Maximum coins — best bonus per dollar',
    priceUsd: 70,
    coinAmount: 9800,
    bestDeal: true,
    mostPopular: false,
    active: true,
  },
]

function dispatch() {
  window.dispatchEvent(new Event(COMMERCE_EVENT))
}

function loadDeals(): CoinDeal[] {
  try {
    const raw = localStorage.getItem(DEALS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as CoinDeal[]
  } catch {
    return []
  }
}

function saveDeals(deals: CoinDeal[]) {
  localStorage.setItem(DEALS_KEY, JSON.stringify(deals))
  dispatch()
}

function loadOrders(): CoinOrder[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as CoinOrder[]
  } catch {
    return []
  }
}

function saveOrders(orders: CoinOrder[]) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
  dispatch()
}

export function listDeals(): CoinDeal[] {
  return loadDeals().sort((a, b) => a.sortOrder - b.sortOrder)
}

export function listActiveDeals(): CoinDeal[] {
  return listDeals().filter((d) => d.active)
}

export function getDealById(id: string): CoinDeal | undefined {
  return listDeals().find((d) => d.id === id)
}

export type PurchaseResult =
  | { ok: true; order: CoinOrder; newBalance: number }
  | { ok: false; error: string }

/** Simulated checkout — credits coins and records order for admin stats. */
export function purchaseDeal(user: UserPublic, dealId: string): PurchaseResult {
  const deal = getDealById(dealId)
  if (!deal || !deal.active) {
    return { ok: false, error: 'This package is not available.' }
  }

  const order: CoinOrder = {
    id: crypto.randomUUID(),
    userId: user.id,
    buyerUsername: user.username,
    buyerEmail: user.email,
    dealId: deal.id,
    dealTitle: deal.title,
    coins: deal.coinAmount,
    amountUsd: deal.priceUsd,
    createdAt: new Date().toISOString(),
    status: 'completed',
  }

  saveOrders([order, ...loadOrders()])
  const newBalance = addCoins(user.id, deal.coinAmount, user.username)
  return { ok: true, order, newBalance }
}

export function addDeal(input: Omit<CoinDeal, 'id' | 'sortOrder'>): CoinDeal {
  const deals = loadDeals()
  const deal: CoinDeal = {
    ...input,
    id: crypto.randomUUID(),
    sortOrder: deals.length,
  }
  saveDeals([...deals, deal])
  return deal
}

export function updateDeal(id: string, patch: Partial<CoinDeal>): CoinDeal | null {
  const deals = loadDeals()
  const idx = deals.findIndex((d) => d.id === id)
  if (idx < 0) return null
  deals[idx] = { ...deals[idx], ...patch }
  saveDeals(deals)
  return deals[idx]
}

export function deleteDeal(id: string) {
  saveDeals(loadDeals().filter((d) => d.id !== id))
}

export function moveDeal(id: string, dir: 'up' | 'down') {
  const deals = listDeals()
  const idx = deals.findIndex((d) => d.id === id)
  if (idx < 0) return
  const swap = dir === 'up' ? idx - 1 : idx + 1
  if (swap < 0 || swap >= deals.length) return
  const a = deals[idx].sortOrder
  deals[idx].sortOrder = deals[swap].sortOrder
  deals[swap].sortOrder = a
  saveDeals(deals)
}

export function listOrders(limit?: number): CoinOrder[] {
  const orders = loadOrders().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
  return limit ? orders.slice(0, limit) : orders
}

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function sumOrders(orders: CoinOrder[]) {
  return orders
    .filter((o) => o.status === 'completed')
    .reduce((s, o) => s + o.amountUsd, 0)
}

export interface SalesMetrics {
  totalEarnings: number
  currentMonthEarnings: number
  previousMonthEarnings: number
  todayEarnings: number
  yesterdayEarnings: number
  sameDayPrevMonthEarnings: number
  totalOrders: number
  currentMonthOrders: number
  previousMonthOrders: number
}

export function getSalesMetrics(): SalesMetrics {
  const orders = loadOrders().filter((o) => o.status === 'completed')
  const now = new Date()
  const today = startOfDay(now)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const thisMonth = startOfMonth(now)
  const prevMonth = new Date(thisMonth)
  prevMonth.setMonth(prevMonth.getMonth() - 1)
  const sameDayPrev = new Date(prevMonth)
  sameDayPrev.setDate(now.getDate())

  const inRange = (o: CoinOrder, from: Date, to: Date) => {
    const t = new Date(o.createdAt).getTime()
    return t >= from.getTime() && t < to.getTime()
  }

  const monthOrders = orders.filter((o) => inRange(o, thisMonth, now))
  const prevMonthOrders = orders.filter((o) =>
    inRange(o, prevMonth, thisMonth),
  )
  const todayOrders = orders.filter((o) => inRange(o, today, now))
  const yesterdayOrders = orders.filter((o) =>
    inRange(o, yesterday, today),
  )
  const sameDayPrevOrders = orders.filter((o) => {
    const t = new Date(o.createdAt)
    return (
      t.getFullYear() === sameDayPrev.getFullYear() &&
      t.getMonth() === sameDayPrev.getMonth() &&
      t.getDate() === sameDayPrev.getDate()
    )
  })

  return {
    totalEarnings: sumOrders(orders),
    currentMonthEarnings: sumOrders(monthOrders),
    previousMonthEarnings: sumOrders(prevMonthOrders),
    todayEarnings: sumOrders(todayOrders),
    yesterdayEarnings: sumOrders(yesterdayOrders),
    sameDayPrevMonthEarnings: sumOrders(sameDayPrevOrders),
    totalOrders: orders.length,
    currentMonthOrders: monthOrders.length,
    previousMonthOrders: prevMonthOrders.length,
  }
}

export function ensureCoinDealCatalog(): CoinDeal[] {
  const catalogByTitle = new Map(
    COIN_DEAL_CATALOG.map((d) => [d.title.trim().toLowerCase(), d]),
  )
  const catalogTitles = new Set(catalogByTitle.keys())

  const existing = loadDeals().filter((deal) =>
    catalogTitles.has(deal.title.trim().toLowerCase()),
  )
  const known = new Set(existing.map((d) => d.title.trim().toLowerCase()))
  const missing = COIN_DEAL_CATALOG.filter(
    (d) => !known.has(d.title.trim().toLowerCase()),
  )

  let merged = existing
  if (missing.length > 0) {
    const appended = missing.map((d) => ({
      ...d,
      id: crypto.randomUUID(),
      sortOrder: 0,
    }))
    merged = [...existing, ...appended]
  }

  merged = merged.map((deal) => {
    const defaults = catalogByTitle.get(deal.title.trim().toLowerCase())
    if (!defaults) return deal
    return {
      ...deal,
      description: defaults.description,
      priceUsd: defaults.priceUsd,
      coinAmount: defaults.coinAmount,
      bestDeal: defaults.bestDeal,
      mostPopular: defaults.mostPopular,
      active: defaults.active,
    }
  })

  const sorted = [...merged].sort((a, b) => a.priceUsd - b.priceUsd || a.coinAmount - b.coinAmount)
  const reordered = sorted.map((deal, index) => ({ ...deal, sortOrder: index }))
  saveDeals(reordered)
  return reordered
}

export function seedCommerceIfEmpty() {
  ensureCoinDealCatalog()
  if (loadDeals().length === 0) return

  const deals = listDeals()
  const users = listUsersForAdmin()
  if (loadOrders().length > 0 || users.length === 0) return

  const orders: CoinOrder[] = []
  const now = Date.now()
  for (let i = 0; i < 50; i++) {
    const deal = deals[i % deals.length]
    const user = users[i % users.length]
    const createdAt = new Date(now - i * 47 * 60_000).toISOString()
    orders.push({
      id: crypto.randomUUID(),
      userId: user.id,
      buyerUsername: user.username,
      buyerEmail: user.email,
      dealId: deal.id,
      dealTitle: deal.title,
      coins: deal.coinAmount,
      amountUsd: deal.priceUsd,
      createdAt,
      status: i % 17 === 0 ? 'pending' : 'completed',
    })
  }
  saveOrders(orders)
}
