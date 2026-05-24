import { Link } from 'react-router-dom'
import { ProfileIcon } from '../ProfileIcons'
import { useFollows } from '../../hooks/useFollows'
import { useUser } from '../../hooks/useUser'
import { getLoyaltyView } from '../../lib/loyalty'
import { formatJoinedDate, getRoleLabel, type UserPublic } from '../../lib/userAuth'
import { UserLoyaltyTags } from '../UserLoyaltyTags'
import { UserAvatar } from './UserAvatar'
import { UserBanner } from './UserBanner'
import { FollowButton } from './FollowButton'
import './ProfileHero.css'

interface ProfileHeroProps {
  user: UserPublic
  mode?: 'studio' | 'public'
  viewerId?: string | null
  onEditMedia?: () => void
  onShowSocial?: (tab: 'followers' | 'following') => void
}

export function ProfileHero({
  user,
  mode = 'public',
  viewerId,
  onEditMedia,
  onShowSocial,
}: ProfileHeroProps) {
  const { user: viewer } = useUser()
  const loyalty = getLoyaltyView(user.id)
  const { counts } = useFollows(user.id)
  const isOwner = (viewerId ?? viewer?.id ?? null) === user.id
  const showFollow = mode === 'public' && !isOwner

  return (
    <section className="rok-profile-hero">
      <div className="rok-profile-hero-banner">
        <UserBanner bannerImageId={user.bannerImageId} avatarHue={user.avatarHue} />
        <span className="rok-profile-hero-banner-fade" aria-hidden />
        {mode === 'studio' && onEditMedia ? (
          <button type="button" className="rok-profile-hero-edit-banner" onClick={onEditMedia}>
            <ProfileIcon name="edit" size={14} />
            Change banner
          </button>
        ) : null}
      </div>

      <div className="rok-profile-hero-sheet">
        <div className="rok-profile-hero-identity">
          <div className="rok-profile-hero-avatar-wrap">
            <UserAvatar user={user} size="xl" ring className="rok-profile-hero-avatar" />
            {mode === 'studio' && onEditMedia ? (
              <button
                type="button"
                className="rok-profile-hero-edit-avatar"
                onClick={onEditMedia}
                aria-label="Change avatar"
              >
                <ProfileIcon name="edit" size={14} />
              </button>
            ) : null}
          </div>

          <div className="rok-profile-hero-copy">
            <div className="rok-profile-hero-head">
              <h1 className="rok-profile-hero-name">{user.displayName}</h1>
              <div className="rok-profile-hero-actions">
                {showFollow ? <FollowButton targetUserId={user.id} /> : null}
                {mode === 'public' && isOwner ? (
                  <Link to="/profile" className="rok-profile-btn rok-profile-btn--ghost">
                    Open studio
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="rok-profile-hero-subline">
              <span className="rok-profile-hero-handle">@{user.username}</span>
              <span className="rok-profile-hero-subline-sep" aria-hidden />
              <span className="rok-profile-role-pill">{getRoleLabel(user.role)}</span>
              <UserLoyaltyTags userId={user.id} variant="hero" />
            </div>

            {user.bio ? (
              <blockquote className="rok-profile-hero-bio">{user.bio}</blockquote>
            ) : null}

            <div className="rok-profile-hero-meta">
              <div className="rok-profile-meta-card">
                <span className="rok-profile-meta-label">Level</span>
                <strong className="rok-profile-meta-value">{loyalty.level.level}</strong>
                <span className="rok-profile-meta-sub">{loyalty.level.title}</span>
              </div>
              <div className="rok-profile-meta-card">
                <span className="rok-profile-meta-label">XP</span>
                <strong className="rok-profile-meta-value">{loyalty.state.xp.toLocaleString()}</strong>
                <span className="rok-profile-meta-sub">Total earned</span>
              </div>
              <div className="rok-profile-meta-card rok-profile-meta-card--streak">
                <span className="rok-profile-meta-label">Streak</span>
                <strong className="rok-profile-meta-value">
                  {loyalty.state.currentStreak > 0 ? `${loyalty.state.currentStreak}d` : '—'}
                </strong>
                <span className="rok-profile-meta-sub">
                  {loyalty.state.currentStreak > 0 ? 'Keep it going' : 'Start today'}
                </span>
              </div>
            </div>

            <p className="rok-profile-hero-joined">
              <ProfileIcon name="calendar" size={14} />
              Member since {formatJoinedDate(user.createdAt)}
            </p>
          </div>
        </div>

        <div className="rok-profile-hero-stats">
          <StatButton label="Followers" value={String(counts.followers)} onClick={() => onShowSocial?.('followers')} />
          <StatButton label="Following" value={String(counts.following)} onClick={() => onShowSocial?.('following')} />
        </div>
      </div>
    </section>
  )
}

function StatButton({ label, value, onClick }: { label: string; value: string; onClick?: () => void }) {
  return (
    <button type="button" className="rok-profile-stat" onClick={onClick} disabled={!onClick}>
      <strong className="rok-profile-stat-value">{value}</strong>
      <span className="rok-profile-stat-label">{label}</span>
    </button>
  )
}
