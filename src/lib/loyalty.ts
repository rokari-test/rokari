import {
  ACHIEVEMENTS,
  BADGES,
  BADGE_THRESHOLDS,
  LEVEL_XP_THRESHOLDS,
  getLevelTitle,
  type AchievementDefinition,
  type BadgeDefinition,
} from './loyaltyCatalog'

export const LOYALTY_EVENT = 'sakura-user-loyalty'

const KEY = 'sakura-user-loyalty'

export interface LoyaltyUnlock {
  unlockedAt: string
}

export interface LoyaltyState {
  xp: number
  totalXpEarned: number
  currentStreak: number
  longestStreak: number
  lastReadDate: string | null
  chaptersRead: number
  seriesStarted: string[]
  seriesCompleted: string[]
  libraryAdds: number
  badges: string[]
  achievements: Record<string, LoyaltyUnlock>
  readChapters: Record<string, true>
  chaptersReadToday: number
  todayKey: string
}

export interface LoyaltyLevel {
  level: number
  title: string
  xpInLevel: number
  xpToNext: number
  progressPct: number
}

export interface AchievementProgress {
  def: AchievementDefinition
  current: number
  target: number
  unlocked: boolean
  unlockedAt?: string
  progressPct: number
}

export interface LoyaltyView {
  state: LoyaltyState
  level: LoyaltyLevel
  badges: { def: BadgeDefinition; unlocked: boolean }[]
  achievements: AchievementProgress[]
}

type LoyaltyMap = Record<string, LoyaltyState>

function dispatch() {
  window.dispatchEvent(new Event(LOYALTY_EVENT))
}

function load(): LoyaltyMap {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    return JSON.parse(raw) as LoyaltyMap
  } catch {
    return {}
  }
}

function save(map: LoyaltyMap) {
  localStorage.setItem(KEY, JSON.stringify(map))
  dispatch()
}

export function localDateKey(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function yesterdayKey(d = new Date()): string {
  const prev = new Date(d)
  prev.setDate(prev.getDate() - 1)
  return localDateKey(prev)
}

export function emptyLoyaltyState(): LoyaltyState {
  return {
    xp: 0,
    totalXpEarned: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastReadDate: null,
    chaptersRead: 0,
    seriesStarted: [],
    seriesCompleted: [],
    libraryAdds: 0,
    badges: [],
    achievements: {},
    readChapters: {},
    chaptersReadToday: 0,
    todayKey: localDateKey(),
  }
}

export function ensureLoyalty(userId: string): LoyaltyState {
  const map = load()
  if (!map[userId]) {
    map[userId] = emptyLoyaltyState()
    save(map)
  }
  return map[userId]
}

export function getLoyaltyState(userId: string): LoyaltyState {
  return load()[userId] ?? emptyLoyaltyState()
}

export function listAllLoyaltyStates(): { userId: string; state: LoyaltyState }[] {
  const map = load()
  return Object.entries(map).map(([userId, state]) => ({ userId, state }))
}

export function getLevelFromXp(xp: number): LoyaltyLevel {
  let level = 1
  for (let i = LEVEL_XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_XP_THRESHOLDS[i]) {
      level = i + 1
      break
    }
  }

  const floor = LEVEL_XP_THRESHOLDS[level - 1] ?? 0
  const nextThreshold = LEVEL_XP_THRESHOLDS[level]
  const ceiling =
    nextThreshold ?? floor + Math.floor(600 + level * 180 + level * level * 20)

  const xpInLevel = xp - floor
  const xpToNext = ceiling - floor
  const progressPct = xpToNext > 0 ? Math.min(100, Math.round((xpInLevel / xpToNext) * 100)) : 100

  return {
    level,
    title: getLevelTitle(level),
    xpInLevel,
    xpToNext,
    progressPct,
  }
}

function metricValue(state: LoyaltyState, metric: AchievementDefinition['metric']): number {
  switch (metric) {
    case 'chaptersRead':
      return state.chaptersRead
    case 'currentStreak':
      return state.currentStreak
    case 'longestStreak':
      return state.longestStreak
    case 'seriesCompleted':
      return state.seriesCompleted.length
    case 'libraryAdds':
      return state.libraryAdds
    case 'chaptersReadToday':
      return state.chaptersReadToday
    case 'totalXpEarned':
      return state.totalXpEarned
    case 'level':
      return getLevelFromXp(state.xp).level
    default:
      return 0
  }
}

function addXp(state: LoyaltyState, amount: number): LoyaltyState {
  if (amount <= 0) return state
  return {
    ...state,
    xp: state.xp + amount,
    totalXpEarned: state.totalXpEarned + amount,
  }
}

function unlockBadge(state: LoyaltyState, badgeId: string): LoyaltyState {
  if (state.badges.includes(badgeId)) return state
  return { ...state, badges: [...state.badges, badgeId] }
}

function unlockAchievement(state: LoyaltyState, achievementId: string): LoyaltyState {
  if (state.achievements[achievementId]) return state
  return {
    ...state,
    achievements: {
      ...state.achievements,
      [achievementId]: { unlockedAt: new Date().toISOString() },
    },
  }
}

function syncDailyCounter(state: LoyaltyState): LoyaltyState {
  const today = localDateKey()
  if (state.todayKey === today) return state
  return { ...state, todayKey: today, chaptersReadToday: 0 }
}

function applyStreak(state: LoyaltyState): { state: LoyaltyState; streakBonus: number } {
  const today = localDateKey()
  const yesterday = yesterdayKey()

  if (state.lastReadDate === today) {
    return { state, streakBonus: 0 }
  }

  let next = { ...state }
  let streakBonus = 4

  if (!state.lastReadDate) {
    next.currentStreak = 1
  } else if (state.lastReadDate === yesterday) {
    next.currentStreak = state.currentStreak + 1
    streakBonus += Math.min(18, next.currentStreak * 2)
  } else {
    next.currentStreak = 1
  }

  next.lastReadDate = today
  next.longestStreak = Math.max(next.longestStreak, next.currentStreak)
  return { state: next, streakBonus }
}

function evaluateRewards(state: LoyaltyState): LoyaltyState {
  let next = state
  const level = getLevelFromXp(next.xp).level

  if (next.currentStreak >= BADGE_THRESHOLDS.streak_3) next = unlockBadge(next, 'streak_3')
  if (next.currentStreak >= BADGE_THRESHOLDS.streak_7) next = unlockBadge(next, 'streak_7')
  if (next.currentStreak >= BADGE_THRESHOLDS.streak_30) next = unlockBadge(next, 'streak_30')
  if (next.chaptersRead >= BADGE_THRESHOLDS.chapters_10) next = unlockBadge(next, 'chapters_10')
  if (next.chaptersRead >= BADGE_THRESHOLDS.chapters_50) next = unlockBadge(next, 'chapters_50')
  if (next.chaptersRead >= BADGE_THRESHOLDS.chapters_100) next = unlockBadge(next, 'chapters_100')
  if (next.seriesStarted.length >= BADGE_THRESHOLDS.explorer) next = unlockBadge(next, 'explorer')
  if (next.seriesCompleted.length >= BADGE_THRESHOLDS.completionist) next = unlockBadge(next, 'completionist')
  if (next.libraryAdds >= BADGE_THRESHOLDS.library) next = unlockBadge(next, 'library')
  if (level >= BADGE_THRESHOLDS.level_5) next = unlockBadge(next, 'level_5')
  if (level >= BADGE_THRESHOLDS.level_10) next = unlockBadge(next, 'level_10')

  for (const def of ACHIEVEMENTS) {
    const current = metricValue(next, def.metric)
    if (current >= def.target) {
      next = unlockAchievement(next, def.id)
    }
  }

  return next
}

function persist(userId: string, state: LoyaltyState) {
  const map = load()
  map[userId] = state
  save(map)
}

export function getLoyaltyView(userId: string): LoyaltyView {
  const state = getLoyaltyState(userId)
  const level = getLevelFromXp(state.xp)

  return {
    state,
    level,
    badges: BADGES.map((def) => ({
      def,
      unlocked: state.badges.includes(def.id),
    })),
    achievements: ACHIEVEMENTS.map((def) => {
      const current = metricValue(state, def.metric)
      const unlocked = Boolean(state.achievements[def.id])
      const progressPct = Math.min(100, Math.round((current / def.target) * 100))
      return {
        def,
        current,
        target: def.target,
        unlocked,
        unlockedAt: state.achievements[def.id]?.unlockedAt,
        progressPct,
      }
    }),
  }
}

export function recordChapterRead(
  userId: string,
  slug: string,
  chapterNumber: number,
): LoyaltyView | null {
  ensureLoyalty(userId)
  let state = syncDailyCounter(getLoyaltyState(userId))
  const chapterKey = `${slug}::${chapterNumber}`

  if (state.readChapters[chapterKey]) {
    persist(userId, state)
    return getLoyaltyView(userId)
  }

  const streakResult = applyStreak(state)
  state = streakResult.state
  state = addXp(state, 10 + streakResult.streakBonus)
  state = {
    ...state,
    readChapters: { ...state.readChapters, [chapterKey]: true },
    chaptersRead: state.chaptersRead + 1,
    chaptersReadToday: state.chaptersReadToday + 1,
    seriesStarted: state.seriesStarted.includes(slug)
      ? state.seriesStarted
      : [...state.seriesStarted, slug],
  }

  state = evaluateRewards(state)
  persist(userId, state)
  return getLoyaltyView(userId)
}

export function recordLibraryAdd(userId: string, slug: string): LoyaltyView | null {
  ensureLoyalty(userId)
  let state = getLoyaltyState(userId)
  state = { ...state, libraryAdds: state.libraryAdds + 1 }
  if (!state.seriesStarted.includes(slug)) {
    state = { ...state, seriesStarted: [...state.seriesStarted, slug] }
  }
  state = addXp(state, 3)
  state = evaluateRewards(state)
  persist(userId, state)
  return getLoyaltyView(userId)
}

export function recordSeriesCompleted(userId: string, slug: string): LoyaltyView | null {
  ensureLoyalty(userId)
  let state = getLoyaltyState(userId)
  if (state.seriesCompleted.includes(slug)) {
    return getLoyaltyView(userId)
  }
  state = {
    ...state,
    seriesCompleted: [...state.seriesCompleted, slug],
  }
  state = addXp(state, 60)
  state = evaluateRewards(state)
  persist(userId, state)
  return getLoyaltyView(userId)
}

export function recordLogin(userId: string): LoyaltyView | null {
  ensureLoyalty(userId)
  let state = getLoyaltyState(userId)
  state = addXp(state, 2)
  state = evaluateRewards(state)
  persist(userId, state)
  return getLoyaltyView(userId)
}

export function recordCommentPosted(userId: string): void {
  ensureLoyalty(userId)
  let state = getLoyaltyState(userId)
  state = addXp(state, 5)
  state = evaluateRewards(state)
  persist(userId, state)
}
