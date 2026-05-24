export interface BadgeDefinition {
  id: string
  name: string
  description: string
  icon: string
}

export interface AchievementDefinition {
  id: string
  name: string
  description: string
  icon: string
  target: number
  metric: AchievementMetric
}

export type AchievementMetric =
  | 'chaptersRead'
  | 'currentStreak'
  | 'longestStreak'
  | 'seriesCompleted'
  | 'libraryAdds'
  | 'chaptersReadToday'
  | 'totalXpEarned'
  | 'level'

/** Total XP required to reach each level (index 0 = level 1). */
export const LEVEL_XP_THRESHOLDS = [
  0, 180, 300, 1000, 2200, 3800, 5800, 8200, 11000, 14200, 17800, 21800, 26200, 31000, 36200, 41800,
  47800, 54200, 61000, 68200, 75800,
]

export const BADGE_THRESHOLDS = {
  streak_3: 7,
  streak_7: 14,
  streak_30: 45,
  chapters_10: 30,
  chapters_50: 120,
  chapters_100: 300,
  explorer: 12,
  completionist: 3,
  library: 20,
  level_5: 8,
  level_10: 15,
} as const

export const BADGES: BadgeDefinition[] = [
  { id: 'streak_3', name: 'Week Flame', description: '7-day reading streak', icon: '🔥' },
  { id: 'streak_7', name: 'Fortnight', description: '14 days in a row', icon: '⚡' },
  { id: 'streak_30', name: 'Iron Streak', description: '45-day reading streak', icon: '👑' },
  { id: 'chapters_10', name: 'Getting Started', description: 'Finish 30 chapters', icon: '📖' },
  { id: 'chapters_50', name: 'Dedicated Reader', description: 'Finish 120 chapters', icon: '📚' },
  { id: 'chapters_100', name: 'Century Club', description: 'Finish 300 chapters', icon: '💯' },
  { id: 'explorer', name: 'Explorer', description: 'Start 12 different series', icon: '🧭' },
  { id: 'completionist', name: 'Finisher', description: 'Complete 3 series', icon: '✅' },
  { id: 'library', name: 'Collector', description: 'Add 20 series to your library', icon: '🔖' },
  { id: 'level_5', name: 'Rokari Regular', description: 'Reach reader level 8', icon: '💜' },
  { id: 'level_10', name: 'Rokari Legend', description: 'Reach reader level 15', icon: '🌟' },
]

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'first_read',
    name: 'First Page',
    description: 'Complete your first chapter',
    icon: '🎬',
    target: 1,
    metric: 'chaptersRead',
  },
  {
    id: 'double_streak',
    name: 'Consistency',
    description: 'Build a 5-day reading streak',
    icon: '🔗',
    target: 5,
    metric: 'currentStreak',
  },
  {
    id: 'week_streak',
    name: 'Weekly Rhythm',
    description: 'Reach a 14-day longest streak',
    icon: '📅',
    target: 14,
    metric: 'longestStreak',
  },
  {
    id: 'marathon',
    name: 'Marathon',
    description: 'Read 10 chapters in one day',
    icon: '🏃',
    target: 10,
    metric: 'chaptersReadToday',
  },
  {
    id: 'library_10',
    name: 'Shelf Builder',
    description: 'Add 25 series to your library',
    icon: '🗂️',
    target: 25,
    metric: 'libraryAdds',
  },
  {
    id: 'complete_3',
    name: 'Trilogy',
    description: 'Complete 8 series',
    icon: '🏆',
    target: 8,
    metric: 'seriesCompleted',
  },
  {
    id: 'xp_1000',
    name: 'XP Hunter',
    description: 'Earn 5,000 total XP',
    icon: '✨',
    target: 5000,
    metric: 'totalXpEarned',
  },
  {
    id: 'level_15',
    name: 'Veteran',
    description: 'Reach reader level 20',
    icon: '🛡️',
    target: 20,
    metric: 'level',
  },
]

export const LEVEL_TITLES: Record<number, string> = {
  1: 'New Reader',
  2: 'Page Turner',
  3: 'Series Scout',
  4: 'Night Reader',
  5: 'Rokari Regular',
  6: 'Chapter Hunter',
  7: 'Archive Keeper',
  8: 'Loyal Fan',
  9: 'Elite Reader',
  10: 'Rokari Legend',
  15: 'Veteran',
  20: 'Mythic Reader',
}

export function getLevelTitle(level: number): string {
  if (LEVEL_TITLES[level]) return LEVEL_TITLES[level]
  const keys = Object.keys(LEVEL_TITLES)
    .map(Number)
    .sort((a, b) => b - a)
  for (const k of keys) {
    if (level >= k) return LEVEL_TITLES[k]
  }
  return 'New Reader'
}

export function getBadge(id: string): BadgeDefinition | undefined {
  return BADGES.find((b) => b.id === id)
}

export function getAchievement(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id)
}

/** Order used when picking badges to show beside usernames. */
export const BADGE_DISPLAY_PRIORITY: string[] = [
  'level_10',
  'level_5',
  'streak_30',
  'streak_7',
  'streak_3',
  'chapters_100',
  'chapters_50',
  'chapters_10',
  'completionist',
  'explorer',
  'library',
]

export function pickFeaturedBadges(badgeIds: string[], limit = 3): BadgeDefinition[] {
  const set = new Set(badgeIds)
  const picked: BadgeDefinition[] = []
  for (const id of BADGE_DISPLAY_PRIORITY) {
    if (!set.has(id)) continue
    const def = getBadge(id)
    if (def) picked.push(def)
    if (picked.length >= limit) break
  }
  return picked
}
