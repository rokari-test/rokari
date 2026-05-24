import { useEffect, useMemo, useState } from 'react'
import { LOYALTY_EVENT } from '../lib/loyalty'
import { getLoyaltyAdminMetrics } from '../lib/loyaltyMetrics'
import { AdminStatList, type AdminStatGroup } from './AdminStatList'

export function AdminLoyalty() {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const bump = () => setTick((t) => t + 1)
    window.addEventListener(LOYALTY_EVENT, bump)
    window.addEventListener('sakura-user-auth', bump)
    return () => {
      window.removeEventListener(LOYALTY_EVENT, bump)
      window.removeEventListener('sakura-user-auth', bump)
    }
  }, [])

  const m = useMemo(() => getLoyaltyAdminMetrics(), [tick])

  const groups: AdminStatGroup[] = [
    {
      title: 'Engagement overview',
      items: [
        { label: 'Readers with progress', value: String(m.usersWithProgress), highlight: true },
        { label: 'Total XP earned', value: m.totalXp.toLocaleString() },
        { label: 'Average XP', value: m.avgXp.toLocaleString(), hint: 'Per active reader' },
        { label: 'Active streaks', value: String(m.activeStreaks), hint: 'Readers on a streak' },
        { label: 'Chapters completed', value: m.chaptersReadTotal.toLocaleString() },
        { label: 'Badges earned', value: String(m.badgesEarned) },
        { label: 'Achievements unlocked', value: String(m.achievementsUnlocked) },
      ],
    },
    {
      title: 'Streak distribution',
      items: m.streakBuckets.map((b) => ({
        label: b.label,
        value: String(b.count),
      })),
    },
    {
      title: 'Badge unlocks',
      items: m.badgeDistribution.map((b) => ({
        label: b.name,
        value: String(b.count),
      })),
    },
  ]

  return (
    <div className="admin-dash">
      <header className="admin-dash-hero">
        <div>
          <p className="admin-dash-eyebrow">Rokari loyalty</p>
          <h1 className="admin-page-title">Loyalty analytics</h1>
          <p className="admin-page-sub">
            Reader streaks, XP, badges, and achievements across all accounts.
          </p>
        </div>
      </header>

      <AdminStatList groups={groups.slice(0, 1)} />

      <div className="admin-card admin-card--wide" style={{ marginTop: '1rem' }}>
        <div className="admin-card-head">
          <h2>Top readers</h2>
          <span className="admin-card-meta">By total XP</span>
        </div>
        {m.topReaders.length === 0 ? (
          <p className="admin-empty">No loyalty data yet — readers earn XP by finishing chapters.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Reader</th>
                  <th>Level</th>
                  <th>XP</th>
                  <th>Streak</th>
                  <th>Badges</th>
                </tr>
              </thead>
              <tbody>
                {m.topReaders.map((row) => (
                  <tr key={row.userId}>
                    <td>
                      <strong>{row.displayName}</strong>
                      <span className="admin-table-sub">@{row.username}</span>
                    </td>
                    <td>Lv {row.level}</td>
                    <td>{row.xp.toLocaleString()}</td>
                    <td>{row.currentStreak}d</td>
                    <td>{row.badges}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminStatList title="Distribution" groups={groups.slice(1)} />
    </div>
  )
}
