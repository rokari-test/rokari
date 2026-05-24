import { listUsersForAdmin } from './userAuth'

export const WALLET_EVENT = 'sakura-user-wallet'
export const WALLET_STORAGE_KEY = 'sakura-user-wallets'

type WalletMap = Record<string, number>

function dispatch() {
  window.dispatchEvent(new Event(WALLET_EVENT))
}

function load(): WalletMap {
  try {
    const raw = localStorage.getItem(WALLET_STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as WalletMap
  } catch {
    return {}
  }
}

function save(map: WalletMap) {
  localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(map))
  dispatch()
}

function normalizeUsername(username: string | undefined): string | undefined {
  const next = username?.trim().toLowerCase()
  return next || undefined
}

function clearLegacyUsernameKeys(map: WalletMap, username: string) {
  delete map[username]
}

function clearWalletEntriesForUsername(map: WalletMap, username: string, keepUserId?: string) {
  const un = username.toLowerCase()
  clearLegacyUsernameKeys(map, un)
  for (const account of listUsersForAdmin()) {
    if (account.username === un && account.id !== keepUserId) {
      delete map[account.id]
    }
  }
}

function resolveCoinBalance(map: WalletMap, userId: string, username?: string): { balance: number; changed: boolean } {
  const un = normalizeUsername(username)
  let changed = false

  if (map[userId] !== undefined) {
    if (un && map[un] !== undefined) {
      delete map[un]
      changed = true
    }
    return { balance: map[userId] ?? 0, changed }
  }

  if (un) {
    const legacy = map[un]
    if (legacy !== undefined) {
      map[userId] = legacy
      delete map[un]
      return { balance: legacy, changed: true }
    }

    for (const account of listUsersForAdmin()) {
      if (account.username !== un || account.id === userId) continue
      const orphan = map[account.id]
      if (orphan !== undefined && orphan > 0) {
        map[userId] = orphan
        delete map[account.id]
        return { balance: orphan, changed: true }
      }
    }
  }

  return { balance: 0, changed }
}

export function getCoinBalance(userId: string, username?: string): number {
  const map = load()
  const { balance, changed } = resolveCoinBalance(map, userId, username)
  if (changed) save(map)
  return balance
}

export function addCoins(userId: string, amount: number, username?: string): number {
  const map = load()
  const { balance: current } = resolveCoinBalance(map, userId, username)
  const next = Math.max(0, current + amount)
  map[userId] = next
  const un = normalizeUsername(username)
  if (un) clearLegacyUsernameKeys(map, un)
  save(map)
  return next
}

export function setCoinBalance(userId: string, amount: number, username?: string): number {
  const map = load()
  const next = Math.max(0, Math.floor(amount))
  const un = normalizeUsername(username)

  if (un) {
    clearWalletEntriesForUsername(map, un, userId)
  }

  map[userId] = next
  save(map)
  return next
}

export function spendCoins(
  userId: string,
  amount: number,
  username?: string,
): { ok: boolean; balance: number } {
  const map = load()
  const { balance: current, changed } = resolveCoinBalance(map, userId, username)
  if (amount > current) {
    if (changed) save(map)
    return { ok: false, balance: current }
  }
  map[userId] = current - amount
  save(map)
  return { ok: true, balance: map[userId] }
}
