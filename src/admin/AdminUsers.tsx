import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { logActivity } from '../lib/adminActivity'
import { USER_MEDIA_EVENT } from '../lib/userMedia'
import type { PlanId } from '../lib/planId'
import {
  adminResetUserPassword,
  deleteUserAccount,
  getRoleLabel,
  listUsersForAdmin,
  setUserRole,
  setUserSuspended,
  USER_AUTH_EVENT,
  type UserPublic,
  type UserRole,
} from '../lib/userAuth'
import {
  formatSubscriptionLabel,
  getSubscriptionForUser,
  grantSubscriptionMonths,
  SUBSCRIPTIONS_EVENT,
} from '../lib/subscriptions'
import { getCoinBalance, setCoinBalance, WALLET_EVENT } from '../lib/userWallet'
import './AdminUsers.css'

const ROLES: UserRole[] = ['user', 'uploader', 'moderator', 'admin', 'owner']
const GRANT_PLANS: PlanId[] = ['supporter', 'premium', 'studio']

function roleBadgeClass(role: UserRole): string {
  if (role === 'admin' || role === 'owner') return 'admin-accounts-role admin-accounts-role--admin'
  if (role === 'moderator') return 'admin-accounts-role admin-accounts-role--mod'
  if (role === 'uploader') return 'admin-accounts-role admin-accounts-role--uploader'
  return 'admin-accounts-role admin-accounts-role--user'
}

function roleBadgeLabel(role: UserRole): string {
  if (role === 'admin' || role === 'owner') return 'administrator'
  if (role === 'uploader') return 'uploader'
  if (role === 'moderator') return 'moderator'
  return 'user'
}

export function AdminUsers() {
  const [users, setUsers] = useState<UserPublic[]>(() => listUsersForAdmin())
  const [query, setQuery] = useState('')
  const [, bump] = useState(0)

  const refresh = () => {
    setUsers(listUsersForAdmin())
    bump((n) => n + 1)
  }

  useEffect(() => {
    const onRefresh = () => refresh()
    window.addEventListener(USER_AUTH_EVENT, onRefresh)
    window.addEventListener(USER_MEDIA_EVENT, onRefresh)
    window.addEventListener(SUBSCRIPTIONS_EVENT, onRefresh)
    window.addEventListener(WALLET_EVENT, onRefresh)
    return () => {
      window.removeEventListener(USER_AUTH_EVENT, onRefresh)
      window.removeEventListener(USER_MEDIA_EVENT, onRefresh)
      window.removeEventListener(SUBSCRIPTIONS_EVENT, onRefresh)
      window.removeEventListener(WALLET_EVENT, onRefresh)
    }
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) => u.username.includes(q) || u.email.includes(q))
  }, [users, query])

  const handleRole = (id: string, role: UserRole) => {
    const u = setUserRole(id, role)
    if (u) {
      logActivity('role', `Role set to ${role}`, `@${u.username}`)
      refresh()
    }
  }

  const handleSuspend = (id: string, suspended: boolean) => {
    const u = setUserSuspended(id, suspended)
    if (u) {
      logActivity('role', suspended ? 'Account banned' : 'Account reinstated', `@${u.username}`)
      refresh()
    }
  }

  const handleDelete = (user: UserPublic) => {
    if (!confirm(`Delete @${user.username}? This cannot be undone.`)) return
    if (deleteUserAccount(user.id)) {
      logActivity('role', 'Account deleted', `@${user.username}`)
      refresh()
    }
  }

  return (
    <>
      <header className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Accounts</h1>
          <p className="admin-page-sub">Manage users, balances, subscriptions, and access.</p>
        </div>
        <Link to="/admin" className="admin-btn admin-btn--ghost">
          ← Dashboard
        </Link>
      </header>

      <p className="admin-accounts-total">
        Total Users: <strong>{users.length}</strong>
      </p>

      <input
        type="search"
        className="admin-accounts-search"
        placeholder="Search by username or email..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="admin-accounts-wrap">
        <table className="admin-accounts-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Coins</th>
              <th>Subscription</th>
              <th>Account</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="admin-accounts-empty">
                  No users match your search.
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onRole={handleRole}
                  onSuspend={handleSuspend}
                  onDelete={handleDelete}
                  onRefresh={refresh}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

function UserRow({
  user,
  onRole,
  onSuspend,
  onDelete,
  onRefresh,
}: {
  user: UserPublic
  onRole: (id: string, role: UserRole) => void
  onSuspend: (id: string, suspended: boolean) => void
  onDelete: (user: UserPublic) => void
  onRefresh: () => void
}) {
  const sub = getSubscriptionForUser(user.id)
  const coins = getCoinBalance(user.id, user.username)
  const [coinInput, setCoinInput] = useState('')
  const [monthsInput, setMonthsInput] = useState('1')
  const [planId, setPlanId] = useState<PlanId>('premium')

  const handleSetCoins = () => {
    const amount = Number(coinInput)
    if (!Number.isFinite(amount) || amount < 0) return
    setCoinBalance(user.id, amount, user.username)
    logActivity('settings', `Coins set to ${Math.floor(amount)}`, `@${user.username}`)
    setCoinInput('')
    onRefresh()
  }

  const handleGrant = () => {
    const months = Number(monthsInput)
    if (!Number.isFinite(months) || months < 1) return
    grantSubscriptionMonths(user.id, months, planId)
    logActivity('subscription', `${months} mo ${planId} granted`, `@${user.username}`)
    onRefresh()
  }

  const handleResetPassword = async () => {
    const next = window.prompt(`New password for @${user.username} (min 6 characters):`)
    if (!next) return
    const result = await adminResetUserPassword(user.id, next)
    if (result.ok) {
      logActivity('role', 'Password reset by admin', `@${user.username}`)
      alert(`Password updated for @${user.username}.`)
    } else {
      alert(result.error ?? 'Could not reset password.')
    }
  }

  return (
    <tr className={user.suspended ? 'admin-accounts-row--muted' : undefined}>
      <td className="admin-accounts-user">@{user.username}</td>
      <td className="admin-accounts-email">{user.email}</td>
      <td>
        <span className={roleBadgeClass(user.role)}>{roleBadgeLabel(user.role)}</span>
      </td>
      <td>
        <div className="admin-accounts-stack">
          <span className="admin-accounts-coins">{coins.toLocaleString()} coins</span>
          <div className="admin-accounts-inline">
            <input
              type="number"
              min={0}
              className="admin-accounts-field"
              placeholder="Set amount"
              value={coinInput}
              onChange={(e) => setCoinInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSetCoins()}
            />
            <button type="button" className="admin-accounts-btn admin-accounts-btn--set" onClick={handleSetCoins}>
              Set
            </button>
          </div>
        </div>
      </td>
      <td>
        <div className="admin-accounts-stack">
          <span className="admin-accounts-sub-label">{formatSubscriptionLabel(sub)}</span>
          <div className="admin-accounts-inline admin-accounts-inline--sub">
            <select
              className="admin-accounts-select"
              value={planId}
              onChange={(e) => setPlanId(e.target.value as PlanId)}
              aria-label="Subscription plan"
            >
              {GRANT_PLANS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              max={36}
              className="admin-accounts-field admin-accounts-field--months"
              placeholder="Months"
              value={monthsInput}
              onChange={(e) => setMonthsInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGrant()}
            />
            <button type="button" className="admin-accounts-btn admin-accounts-btn--grant" onClick={handleGrant}>
              Grant
            </button>
          </div>
        </div>
      </td>
      <td>
        <div className="admin-accounts-stack">
          {user.suspended ? (
            <span className="admin-accounts-status admin-accounts-status--banned">Banned</span>
          ) : (
            <span className="admin-accounts-status admin-accounts-status--active">Active</span>
          )}
          {!user.suspended ? (
            <button
              type="button"
              className="admin-accounts-btn admin-accounts-btn--ban"
              onClick={() => onSuspend(user.id, true)}
            >
              Ban user
            </button>
          ) : (
            <button
              type="button"
              className="admin-accounts-btn admin-accounts-btn--restore"
              onClick={() => onSuspend(user.id, false)}
            >
              Restore
            </button>
          )}
        </div>
      </td>
      <td>
        <div className="admin-accounts-actions">
          <select
            className="admin-accounts-select admin-accounts-select--role"
            value={user.role}
            onChange={(e) => onRole(user.id, e.target.value as UserRole)}
            aria-label="Change role"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {getRoleLabel(r)}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="admin-accounts-icon-btn"
            title="Reset password"
            aria-label="Reset password"
            onClick={() => void handleResetPassword()}
          >
            <KeyIcon />
          </button>
          <button
            type="button"
            className="admin-accounts-icon-btn admin-accounts-icon-btn--danger"
            title="Delete user"
            aria-label="Delete user"
            onClick={() => onDelete(user)}
          >
            <TrashIcon />
          </button>
        </div>
      </td>
    </tr>
  )
}

function KeyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15.5 7.5a4.5 4.5 0 1 0-6.4 6.4L4 19v3h3l1.1-1.1M13.5 10.5l-6 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V7h10Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
