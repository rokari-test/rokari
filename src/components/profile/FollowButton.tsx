import { Link } from 'react-router-dom'
import { useFollows } from '../../hooks/useFollows'
import { useUser } from '../../hooks/useUser'
import './FollowButton.css'

interface FollowButtonProps {
  targetUserId: string
  compact?: boolean
}

export function FollowButton({ targetUserId, compact = false }: FollowButtonProps) {
  const { user } = useUser()
  const { following, toggle } = useFollows(targetUserId)

  const className = `rok-follow-btn${following ? ' is-following' : ''}${compact ? ' rok-follow-btn--compact' : ''}`

  if (user?.id === targetUserId) return null

  if (!user) {
    return (
      <Link to="/login" state={{ from: `/users/${targetUserId}` }} className={className}>
        Follow
      </Link>
    )
  }

  return (
    <button type="button" className={className} onClick={() => toggle()}>
      {following ? 'Following' : 'Follow'}
    </button>
  )
}
