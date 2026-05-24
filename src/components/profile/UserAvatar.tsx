import { useEffect, useState } from 'react'
import { getUserInitial, type UserPublic } from '../../lib/userAuth'
import { getProfileMediaImgStyle, getUserMedia, USER_MEDIA_EVENT } from '../../lib/userMedia'
import './UserAvatar.css'

interface UserAvatarProps {
  user: Pick<UserPublic, 'displayName' | 'username' | 'avatarHue' | 'avatarImageId'>
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'deck'
  shape?: 'circle' | 'rounded'
  className?: string
  ring?: boolean
}

export function UserAvatar({
  user,
  size = 'md',
  shape = 'circle',
  className = '',
  ring = false,
}: UserAvatarProps) {
  const [media, setMedia] = useState(() => getUserMedia(user.avatarImageId))

  useEffect(() => {
    const sync = () => setMedia(getUserMedia(user.avatarImageId))
    sync()
    window.addEventListener(USER_MEDIA_EVENT, sync)
    window.addEventListener('sakura-user-auth', sync)
    return () => {
      window.removeEventListener(USER_MEDIA_EVENT, sync)
      window.removeEventListener('sakura-user-auth', sync)
    }
  }, [user.avatarImageId])

  const classes = [
    'user-avatar',
    `user-avatar--${size}`,
    shape === 'rounded' ? 'user-avatar--rounded' : '',
    ring ? 'user-avatar--ring' : '',
    media ? 'user-avatar--image' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (media) {
    return (
      <span className={classes} aria-hidden>
        <img src={media.dataUrl} alt="" className="user-avatar-img" style={getProfileMediaImgStyle(media)} />
      </span>
    )
  }

  return (
    <span
      className={classes}
      style={{
        background: `linear-gradient(135deg, hsl(${user.avatarHue} 70% 55%), hsl(${(user.avatarHue + 40) % 360} 65% 45%))`,
      }}
      aria-hidden
    >
      {getUserInitial(user as UserPublic)}
    </span>
  )
}
