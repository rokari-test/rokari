import { useRef, useState, type ChangeEvent } from 'react'
import { processProfileImageFile } from '../../lib/profileImageUpload'
import { updateUserProfile, type UserPublic } from '../../lib/userAuth'
import { deleteUserMedia, saveUserMedia } from '../../lib/userMedia'
import { ProfileMediaFrame } from './ProfileMediaFrame'
import { UserAvatar } from './UserAvatar'
import './ProfileMediaModal.css'

interface ProfileMediaModalProps {
  user: UserPublic
  open: boolean
  onClose: () => void
  onSaved: () => void
}

export function ProfileMediaModal({ user, open, onClose, onSaved }: ProfileMediaModalProps) {
  const avatarRef = useRef<HTMLInputElement>(null)
  const bannerRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<'avatar' | 'banner' | null>(null)

  if (!open) return null

  const upload = async (kind: 'avatar' | 'banner', file: File) => {
    setBusy(kind)
    setError(null)
    try {
      const processed = await processProfileImageFile(file, kind)
      const mediaId = saveUserMedia({
        userId: user.id,
        kind,
        dataUrl: processed.dataUrl,
        mimeType: processed.mimeType,
        animated: processed.animated,
        focalX: 50,
        focalY: 50,
        zoom: 100,
      })
      const oldId = kind === 'avatar' ? user.avatarImageId : user.bannerImageId
      const patch = kind === 'avatar' ? { avatarImageId: mediaId } : { bannerImageId: mediaId }
      const result = await updateUserProfile(patch)
      if (!result.ok) throw new Error(result.error)
      if (oldId && oldId !== mediaId) deleteUserMedia(oldId)
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setBusy(null)
    }
  }

  const onPick = (kind: 'avatar' | 'banner') => (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) void upload(kind, file)
  }

  const clearMedia = async (kind: 'avatar' | 'banner') => {
    setBusy(kind)
    setError(null)
    const oldId = kind === 'avatar' ? user.avatarImageId : user.bannerImageId
    const patch = kind === 'avatar' ? { avatarImageId: null } : { bannerImageId: null }
    const result = await updateUserProfile(patch)
    if (result.ok) {
      deleteUserMedia(oldId)
      onSaved()
    } else {
      setError(result.error)
    }
    setBusy(null)
  }

  return (
    <div className="rok-media-modal" role="dialog" aria-modal="true" aria-label="Profile media">
      <button type="button" className="rok-media-modal-backdrop" aria-label="Close" onClick={onClose} />
      <div className="rok-media-modal-card">
        <header className="rok-media-modal-head">
          <div>
            <p className="rok-media-modal-eyebrow">Profile studio</p>
            <h2>Avatar & banner</h2>
            <p className="rok-media-modal-tip">Drag the preview to reposition · scroll to zoom</p>
          </div>
          <button type="button" className="rok-media-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        {error ? <p className="rok-media-modal-error">{error}</p> : null}

        <div className="rok-media-modal-grid">
          <section className="rok-media-panel">
            <div className="rok-media-preview rok-media-preview--avatar">
              {user.avatarImageId ? (
                <ProfileMediaFrame mediaId={user.avatarImageId} variant="avatar" editable />
              ) : (
                <UserAvatar user={user} size="xl" ring />
              )}
            </div>
            <h3>Avatar</h3>
            <p>JPG, PNG, WebP, or animated GIF · max 8 MB</p>
            <div className="rok-media-actions">
              <button type="button" disabled={busy !== null} onClick={() => avatarRef.current?.click()}>
                {busy === 'avatar' ? 'Uploading…' : 'Upload'}
              </button>
              {user.avatarImageId ? (
                <button type="button" className="rok-media-clear" disabled={busy !== null} onClick={() => void clearMedia('avatar')}>
                  Remove
                </button>
              ) : null}
            </div>
            <input ref={avatarRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={onPick('avatar')} />
          </section>

          <section className="rok-media-panel">
            <div className="rok-media-preview rok-media-preview--banner">
              {user.bannerImageId ? (
                <ProfileMediaFrame mediaId={user.bannerImageId} variant="banner" editable />
              ) : (
                <div className="rok-media-banner-empty">No banner yet</div>
              )}
            </div>
            <h3>Banner</h3>
            <p>Wide image or GIF for your profile header</p>
            <div className="rok-media-actions">
              <button type="button" disabled={busy !== null} onClick={() => bannerRef.current?.click()}>
                {busy === 'banner' ? 'Uploading…' : 'Upload'}
              </button>
              {user.bannerImageId ? (
                <button type="button" className="rok-media-clear" disabled={busy !== null} onClick={() => void clearMedia('banner')}>
                  Remove
                </button>
              ) : null}
            </div>
            <input ref={bannerRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={onPick('banner')} />
          </section>
        </div>
      </div>
    </div>
  )
}
