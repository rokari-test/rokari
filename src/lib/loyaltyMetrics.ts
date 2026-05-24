import { getLevelFromXp, listAllLoyaltyStates } from './loyalty'
import { BADGES } from './loyaltyCatalog'
import { listUsersForAdmin } from './userAuth'

export interface LoyaltyLeaderboardEntry {
  userId: string
  username: string
  displayName: string
  xp: number
  level: number
  currentStreak: number
  badges: number
}

export interface LoyaltyAdminMetrics {
  usersWithProgress: number
  totalXp: number
  avgXp: number
  activeStreaks: number
  badgesEarned: number
  achievementsUnlocked: number
  chaptersReadTotal: number
  topReaders: LoyaltyLeaderboardEntry[]
  badgeDistribution: { id: string; name: string; count: number }[]
  streakBuckets: { label: string; count: number }[]
}

export function getLoyaltyAdminMetrics(): LoyaltyAdminMetrics {
  const users = listUsersForAdmin()
  const userMap = new Map(users.map((u) => [u.id, u]))
  const entries = listAllLoyaltyStates()

  let totalXp = 0
  let badgesEarned = 0
  let achievementsUnlocked = 0
  let chaptersReadTotal = 0
  let activeStreaks = 0

  const badgeCounts = new Map<string, number>()
  for (const badge of BADGES) badgeCounts.set(badge.id, 0)

  const streakBuckets = [
    { label: 'No streak', count: 0 },
    { label: '1–3 days', count: 0 },
    { label: '4–7 days', count: 0 },
    { label: '8–14 days', count: 0 },
    { label: '15+ days', count: 0 },
  ]

  const topReaders: LoyaltyLeaderboardEntry[] = []

  for (const { userId, state } of entries) {
    const user = userMap.get(userId)
    if (!user) continue

    totalXp += state.xp
    badgesEarned += state.badges.length
    achievementsUnlocked += Object.keys(state.achievements).length
    chaptersReadTotal += state.chaptersRead

    if (state.currentStreak > 0) activeStreaks += 1

    for (const badgeId of state.badges) {
      badgeCounts.set(badgeId, (badgeCounts.get(badgeId) ?? 0) + 1)
    }

    const streak = state.currentStreak
    if (streak <= 0) streakBuckets[0].count += 1
    else if (streak <= 3) streakBuckets[1].count += 1
    else if (streak <= 7) streakBuckets[2].count += 1
    else if (streak <= 14) streakBuckets[3].count += 1
    else streakBuckets[4].count += 1

    topReaders.push({
      userId,
      username: user.username,
      displayName: user.displayName,
      xp: state.xp,
      level: getLevelFromXp(state.xp).level,
      currentStreak: state.currentStreak,
      badges: state.badges.length,
    })
  }

  topReaders.sort((a, b) => b.xp - a.xp)

  const usersWithProgress = entries.filter(
    ({ state }) => state.chaptersRead > 0 || state.xp > 0,
  ).length

  return {
    usersWithProgress,
    totalXp,
    avgXp: usersWithProgress > 0 ? Math.round(totalXp / usersWithProgress) : 0,
    activeStreaks,
    badgesEarned,
    achievementsUnlocked,
    chaptersReadTotal,
    topReaders: topReaders.slice(0, 10),
    badgeDistribution: BADGES.map((b) => ({
      id: b.id,
      name: b.name,
      count: badgeCounts.get(b.id) ?? 0,
    })),
    streakBuckets,
  }
}
