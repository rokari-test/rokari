import { useCallback, useEffect, useState } from 'react'
import {
  getFollowCounts,
  getFollowerIds,
  getFollowingIds,
  isFollowing,
  toggleFollow,
  USER_FOLLOWS_EVENT,
} from '../lib/userFollows'
import { useUser } from './useUser'

export function useFollows(targetUserId: string | null) {
  const { user } = useUser()
  const [counts, setCounts] = useState({ followers: 0, following: 0 })
  const [following, setFollowing] = useState(false)

  const sync = useCallback(() => {
    if (!targetUserId) {
      setCounts({ followers: 0, following: 0 })
      setFollowing(false)
      return
    }
    setCounts(getFollowCounts(targetUserId))
    setFollowing(isFollowing(user?.id ?? null, targetUserId))
  }, [targetUserId, user?.id])

  useEffect(() => {
    sync()
    window.addEventListener(USER_FOLLOWS_EVENT, sync)
    window.addEventListener('sakura-user-auth', sync)
    return () => {
      window.removeEventListener(USER_FOLLOWS_EVENT, sync)
      window.removeEventListener('sakura-user-auth', sync)
    }
  }, [sync])

  const toggle = useCallback(() => {
    if (!user || !targetUserId || user.id === targetUserId) return false
    toggleFollow(user.id, targetUserId)
    sync()
    return true
  }, [user, targetUserId, sync])

  return {
    counts,
    following,
    toggle,
    followerIds: targetUserId ? getFollowerIds(targetUserId) : [],
    followingIds: targetUserId ? getFollowingIds(targetUserId) : [],
    canFollow: Boolean(user && targetUserId && user.id !== targetUserId),
  }
}
