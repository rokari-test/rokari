import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ProfileHero } from '../components/profile/ProfileHero'
import { ProfileSocialPanel } from '../components/profile/ProfileSocialPanel'
import { UserLoyaltyTags } from '../components/UserLoyaltyTags'
import { useFollows } from '../hooks/useFollows'
import { useUser } from '../hooks/useUser'
import { getLoyaltyView } from '../lib/loyalty'
import { pickFeaturedBadges } from '../lib/loyaltyCatalog'
import { getUserByIdOrUsername } from '../lib/userAuth'
import './PublicUserPage.css'

export function PublicUserPage() {
  const { id } = useParams<{ id: string }>()
  const { user: viewer } = useUser()
  const user = id ? getUserByIdOrUsername(id) : undefined
  const { followerIds, followingIds } = useFollows(id ?? null)
  const [socialTab, setSocialTab] = useState<'followers' | 'following'>('followers')

  if (!user) {
    return (
      <div className="public-user public-user--empty container">
        <h1>Profile not found</h1>
        <p>This reader does not exist.</p>
        <Link to="/">Go home</Link>
      </div>
    )
  }

  if (!user.profilePublic && viewer?.id !== user.id) {
    return (
      <div className="public-user public-user--empty container">
        <h1>Private profile</h1>
        <p>@{user.username} keeps their profile hidden.</p>
        <Link to="/">Go home</Link>
      </div>
    )
  }

  const loyalty = getLoyaltyView(user.id)
  const featuredBadges = pickFeaturedBadges(loyalty.state.badges, 6)

  return (
    <div className="public-user container--wide">
      <ProfileHero
        user={user}
        mode="public"
        viewerId={viewer?.id ?? null}
        onShowSocial={setSocialTab}
      />

      <div className="public-user-grid">
        <section className="public-user-card">
          <h2>Reader rank</h2>
          <div className="public-user-rank">
            <div className="public-user-rank-level">
              <span>Lv</span>
              <strong>{loyalty.level.level}</strong>
            </div>
            <div>
              <p className="public-user-rank-title">{loyalty.level.title}</p>
              <div className="public-user-xp-bar" aria-hidden>
                <span style={{ width: `${loyalty.level.progressPct}%` }} />
              </div>
              <p className="public-user-xp-label">{loyalty.state.xp.toLocaleString()} XP · {loyalty.state.chaptersRead} chapters</p>
            </div>
          </div>
          <UserLoyaltyTags userId={user.id} />
          {featuredBadges.length > 0 ? (
            <ul className="public-user-badges">
              {featuredBadges.map((badge) => (
                <li key={badge.id} title={badge.description}>
                  <span>{badge.icon}</span>
                  <strong>{badge.name}</strong>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <section className="public-user-card">
          <ProfileSocialPanel
            tab={socialTab}
            followerIds={followerIds}
            followingIds={followingIds}
            onTabChange={setSocialTab}
          />
        </section>
      </div>

      {user.libraryPublic ? (
        <Link to="/library" className="public-user-library-link">
          Browse @{user.username}&apos;s public library activity
        </Link>
      ) : null}
    </div>
  )
}
