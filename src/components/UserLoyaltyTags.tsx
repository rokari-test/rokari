import { getLoyaltyView } from '../lib/loyalty'
import { pickFeaturedBadges } from '../lib/loyaltyCatalog'
import { getRoleLabel, getUserById } from '../lib/userAuth'
import './UserLoyaltyTags.css'

interface UserLoyaltyTagsProps {
  userId: string
  /** Hero: badges only — level/streak live in the rank line */
  variant?: 'default' | 'hero'
}

export function UserLoyaltyTags({ userId, variant = 'default' }: UserLoyaltyTagsProps) {
  const loyalty = getLoyaltyView(userId)
  const account = getUserById(userId)
  const featured = pickFeaturedBadges(loyalty.state.badges, 3)
  const showRole = account && account.role !== 'user'

  const showRankChips = variant !== 'hero'

  return (
    <span className="user-loyalty-tags">
      {showRankChips ? (
        <span className="user-loyalty-tag user-loyalty-tag--level" title={loyalty.level.title}>
          Lv {loyalty.level.level}
        </span>
      ) : null}
      {showRankChips && loyalty.state.currentStreak > 0 ? (
        <span className="user-loyalty-tag user-loyalty-tag--streak" title={`${loyalty.state.currentStreak}-day streak`}>
          🔥 {loyalty.state.currentStreak}d
        </span>
      ) : null}
      {featured.map((badge) => (
        <span
          key={badge.id}
          className="user-loyalty-tag user-loyalty-tag--badge"
          title={`${badge.name} — ${badge.description}`}
        >
          {badge.icon}
        </span>
      ))}
      {showRole ? (
        <span className="user-loyalty-tag user-loyalty-tag--role" title={getRoleLabel(account.role)}>
          {getRoleLabel(account.role)}
        </span>
      ) : null}
    </span>
  )
}
