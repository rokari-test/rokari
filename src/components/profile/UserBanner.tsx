import { useEffect, useState } from 'react'
import { getProfileMediaImgStyle, getUserMedia, USER_MEDIA_EVENT } from '../../lib/userMedia'
import './UserBanner.css'

interface UserBannerProps {
  bannerImageId: string | null | undefined
  avatarHue: number
  className?: string
}

export function UserBanner({ bannerImageId, avatarHue, className = '' }: UserBannerProps) {
  const [media, setMedia] = useState(() => getUserMedia(bannerImageId))

  useEffect(() => {
    const sync = () => setMedia(getUserMedia(bannerImageId))
    sync()
    window.addEventListener(USER_MEDIA_EVENT, sync)
    window.addEventListener('sakura-user-auth', sync)
    return () => {
      window.removeEventListener(USER_MEDIA_EVENT, sync)
      window.removeEventListener('sakura-user-auth', sync)
    }
  }, [bannerImageId])

  return (
    <div
      className={`user-banner ${className}`.trim()}
      style={
        media
          ? undefined
          : {
              background: `linear-gradient(125deg, hsl(${avatarHue} 55% 38%), hsl(${(avatarHue + 55) % 360} 62% 28%) 48%, color-mix(in srgb, var(--bg) 88%, black) 100%)`,
            }
      }
    >
      {media ? (
        <img src={media.dataUrl} alt="" className="user-banner-img" style={getProfileMediaImgStyle(media)} />
      ) : null}
      <span className="user-banner-shine" aria-hidden />
      <span className="user-banner-grain" aria-hidden />
    </div>
  )
}
