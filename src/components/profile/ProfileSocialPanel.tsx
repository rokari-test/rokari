import { Link } from 'react-router-dom'
import { useUser } from '../../hooks/useUser'
import { getUserById } from '../../lib/userAuth'
import { FollowButton } from './FollowButton'
import { UserAvatar } from './UserAvatar'
import './ProfileSocialPanel.css'

interface ProfileSocialPanelProps {
  tab: 'followers' | 'following'
  followerIds: string[]
  followingIds: string[]
  onTabChange: (tab: 'followers' | 'following') => void
}

export function ProfileSocialPanel({
  tab,
  followerIds,
  followingIds,
  onTabChange,
}: ProfileSocialPanelProps) {
  const { user: viewer } = useUser()
  const ids = tab === 'followers' ? followerIds : followingIds

  return (
    <section className="rok-profile-social">
      <div className="rok-profile-social-tabs">
        <button
          type="button"
          className={`rok-profile-social-tab${tab === 'followers' ? ' is-active' : ''}`}
          onClick={() => onTabChange('followers')}
        >
          Followers · {followerIds.length}
        </button>
        <button
          type="button"
          className={`rok-profile-social-tab${tab === 'following' ? ' is-active' : ''}`}
          onClick={() => onTabChange('following')}
        >
          Following · {followingIds.length}
        </button>
      </div>

      {ids.length === 0 ? (
        <p className="rok-profile-social-empty">
          {tab === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'}
        </p>
      ) : (
        <ul className="rok-profile-social-list">
          {ids.map((id) => {
            const person = getUserById(id)
            if (!person) return null
            const showFollow = viewer?.id !== person.id
            return (
              <li key={id}>
                <Link to={`/users/${person.id}`} className="rok-profile-social-row">
                  <UserAvatar user={person} size="md" />
                  <span className="rok-profile-social-meta">
                    <strong>{person.displayName}</strong>
                    <span>@{person.username}</span>
                  </span>
                </Link>
                {showFollow ? (
                  <FollowButton targetUserId={person.id} compact />
                ) : (
                  <span className="rok-profile-social-you">You</span>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
