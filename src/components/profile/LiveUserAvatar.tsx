import { useEffect, useState } from 'react'
import { getUserById } from '../../lib/userAuth'
import { USER_MEDIA_EVENT } from '../../lib/userMedia'
import { UserAvatar } from './UserAvatar'

interface LiveUserAvatarProps {
  userId: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'deck'
  shape?: 'circle' | 'rounded'
  className?: string
  ring?: boolean
  fallbackHue?: number
  fallbackName?: string
}

export function LiveUserAvatar({
  userId,
  size = 'sm',
  shape = 'circle',
  className = '',
  ring = false,
  fallbackHue = 320,
  fallbackName = '?',
}: LiveUserAvatarProps) {
  const [user, setUser] = useState(() => getUserById(userId))

  useEffect(() => {
    const sync = () => setUser(getUserById(userId))
    sync()
    window.addEventListener('sakura-user-auth', sync)
    window.addEventListener(USER_MEDIA_EVENT, sync)
    return () => {
      window.removeEventListener('sakura-user-auth', sync)
      window.removeEventListener(USER_MEDIA_EVENT, sync)
    }
  }, [userId])

  if (user) {
    return <UserAvatar user={user} size={size} shape={shape} className={className} ring={ring} />
  }

  return (
    <span
      className={['user-avatar', `user-avatar--${size}`, shape === 'rounded' ? 'user-avatar--rounded' : '', className]
        .filter(Boolean)
        .join(' ')}
      style={{
        background: `linear-gradient(135deg, hsl(${fallbackHue} 70% 55%), hsl(${(fallbackHue + 40) % 360} 65% 45%))`,
      }}
      aria-hidden
    >
      {fallbackName.charAt(0).toUpperCase()}
    </span>
  )
}
