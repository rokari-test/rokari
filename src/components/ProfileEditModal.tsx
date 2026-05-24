import { useEffect, useState, type FormEvent } from 'react'
import type { UserPublic } from '../lib/userAuth'
import { updateUserProfile } from '../lib/userAuth'
import './ProfileEditModal.css'

interface ProfileEditModalProps {
  user: UserPublic
  open: boolean
  onClose: () => void
  onSaved: () => void
}

export function ProfileEditModal({
  user,
  open,
  onClose,
  onSaved,
}: ProfileEditModalProps) {
  const [displayName, setDisplayName] = useState(user.displayName)
  const [bio, setBio] = useState(user.bio)
  const [email, setEmail] = useState(user.email)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setDisplayName(user.displayName)
    setBio(user.bio)
    setEmail(user.email)
    setError(null)
  }, [open, user])

  if (!open) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const result = await updateUserProfile({ displayName, bio, email })
    setSaving(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    onSaved()
    onClose()
  }

  return (
    <div className="profile-edit-overlay" role="dialog" aria-modal="true" aria-label="Edit profile">
      <button type="button" className="profile-edit-backdrop" aria-label="Close" onClick={onClose} />
      <div className="profile-edit-card">
        <header className="profile-edit-head">
          <h2>Edit Profile</h2>
          <button type="button" className="profile-edit-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        {error && <p className="profile-edit-error">{error}</p>}
        <form className="profile-edit-form" onSubmit={handleSubmit}>
          <label>
            Display name
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={48}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Bio
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={280}
            />
          </label>
          <p className="profile-edit-note">
            Username <strong>@{user.username}</strong> cannot be changed.
          </p>
          <button type="submit" className="profile-edit-save" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  )
}
