import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppBottomNav } from '../components/AppBottomNav'
import { AccountSummaryCards } from '../components/AccountSummaryCards'
import { LoyaltyPanel } from '../components/LoyaltyPanel'
import { ProfileHero } from '../components/profile/ProfileHero'
import { ProfileMediaModal } from '../components/profile/ProfileMediaModal'
import { ProfileSocialPanel } from '../components/profile/ProfileSocialPanel'
import { ProfileIcon } from '../components/ProfileIcons'
import { RequireAuth } from '../components/RequireAuth'
import { useFollows } from '../hooks/useFollows'
import { useUser } from '../hooks/useUser'
import { useUserSubscription } from '../hooks/useUserSubscription'
import { useWallet } from '../hooks/useWallet'
import {
  formatRelativeActive,
  logoutUser,
  updateUserProfile,
} from '../lib/userAuth'
import {
  getUserSessions,
  refreshSessionActivity,
  revokeSession,
} from '../lib/userSessions'
import './ProfilePage.css'

type StudioSection = 'profile' | 'rank' | 'social' | 'devices'

const SECTIONS: { id: StudioSection; label: string }[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'rank', label: 'Rank' },
  { id: 'social', label: 'Community' },
  { id: 'devices', label: 'Devices' },
]

function ProfileContent() {
  const navigate = useNavigate()
  const { user, refresh } = useUser()
  const { balance } = useWallet()
  const { subscription, plan } = useUserSubscription()
  const { followerIds, followingIds } = useFollows(user?.id ?? null)

  const [section, setSection] = useState<StudioSection>('profile')
  const [socialTab, setSocialTab] = useState<'followers' | 'following'>('followers')
  const [mediaOpen, setMediaOpen] = useState(false)
  const [sessions, setSessions] = useState(() => (user ? getUserSessions(user.id) : []))

  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [email, setEmail] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    refreshSessionActivity(user.id)
    setSessions(getUserSessions(user.id))
    setDisplayName(user.displayName)
    setBio(user.bio)
    setEmail(user.email)
  }, [user])

  if (!user) return null

  const refreshSessions = () => {
    refreshSessionActivity(user.id)
    setSessions(getUserSessions(user.id))
    refresh()
  }

  const handleSignOut = () => {
    logoutUser()
    navigate('/')
  }

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaveError(null)
    const result = await updateUserProfile({ displayName, bio, email })
    setSaving(false)
    if (!result.ok) {
      setSaveError(result.error)
      return
    }
    refresh()
  }

  const handlePrivacyToggle = async (key: 'profilePublic' | 'libraryPublic', value: boolean) => {
    await updateUserProfile({ [key]: value })
    refresh()
  }

  const openSocial = (tab: 'followers' | 'following') => {
    setSocialTab(tab)
    setSection('social')
  }

  return (
    <div className="profile-page profile-page--studio">
      <div className="profile-page-inner container--wide">
        <ProfileHero
          user={user}
          mode="studio"
          viewerId={user.id}
          onEditMedia={() => setMediaOpen(true)}
          onShowSocial={openSocial}
        />

        <div className="profile-studio-bar">
          <AccountSummaryCards className="profile-top-summary" balance={balance} subscription={subscription} plan={plan} />
          <div className="profile-studio-actions">
            <Link to={`/users/${user.id}`} className="profile-studio-link">
              <ProfileIcon name="external" size={16} /> Public page
            </Link>
            <Link to="/library" className="profile-studio-link">
              <ProfileIcon name="library-link" size={16} /> Library
            </Link>
            <button type="button" className="profile-studio-link profile-studio-link--danger" onClick={handleSignOut}>
              <ProfileIcon name="logout" size={16} /> Sign out
            </button>
          </div>
        </div>

        <div className="profile-layout">
          <div className="profile-layout-main profile-workspace">
            <nav className="profile-section-nav" role="tablist" aria-label="Profile sections">
              {SECTIONS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={section === id}
                  className={`profile-section-tab${section === id ? ' is-active' : ''}`}
                  onClick={() => setSection(id)}
                >
                  {label}
                </button>
              ))}
            </nav>

            <section className="profile-card profile-card--workspace">
              <div className="profile-panel-body">
                {section === 'profile' && (
                  <form className="profile-studio-form" onSubmit={handleSaveProfile}>
                    <div className="profile-studio-form-head">
                      <div>
                        <h2>Edit profile</h2>
                        <p>Name, bio, and email on Rokari.</p>
                      </div>
                      <button type="button" className="profile-studio-media-btn" onClick={() => setMediaOpen(true)}>
                        Avatar & banner
                      </button>
                    </div>
                    <label className="profile-studio-field">
                      <span>Display name</span>
                      <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={48} />
                    </label>
                    <label className="profile-studio-field">
                      <span>Email</span>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </label>
                    <label className="profile-studio-field">
                      <span>Bio</span>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        maxLength={280}
                        placeholder="Tell the community about your reading vibe…"
                      />
                      <em>{bio.length}/280</em>
                    </label>
                    <p className="profile-studio-note">
                      Username <strong>@{user.username}</strong> cannot be changed.
                    </p>
                    {saveError ? <p className="profile-studio-error">{saveError}</p> : null}
                    <button type="submit" className="profile-studio-save" disabled={saving}>
                      {saving ? 'Saving…' : 'Save changes'}
                    </button>
                  </form>
                )}

                {section === 'rank' && <LoyaltyPanel />}

                {section === 'social' && (
                  <ProfileSocialPanel
                    tab={socialTab}
                    followerIds={followerIds}
                    followingIds={followingIds}
                    onTabChange={setSocialTab}
                  />
                )}

                {section === 'devices' && (
                  <div className="profile-devices-panel">
                    <header className="profile-card-head profile-card-head--row profile-card-head--flush">
                      <div>
                        <h2>Active devices</h2>
                        <p>
                          {sessions.length} signed-in device{sessions.length === 1 ? '' : 's'}
                        </p>
                      </div>
                      <button type="button" className="profile-refresh-btn" onClick={refreshSessions}>
                        Refresh
                      </button>
                    </header>
                    <ul className="profile-sessions-list">
                      {sessions.map((s) => (
                        <li key={s.id} className="profile-session-card">
                          <span className="profile-session-icon">
                            <ProfileIcon name="monitor" size={20} />
                          </span>
                          <div className="profile-session-meta">
                            <strong>
                              {s.isCurrent ? 'Current session' : s.label}
                              {s.isCurrent ? <span className="profile-session-active">Active</span> : null}
                            </strong>
                            <span>Last active: {formatRelativeActive(s.lastActiveAt)}</span>
                          </div>
                          {!s.isCurrent ? (
                            <button
                              type="button"
                              className="profile-session-revoke"
                              aria-label="Revoke session"
                              onClick={() => {
                                revokeSession(user.id, s.id)
                                setSessions(getUserSessions(user.id))
                              }}
                            >
                              <ProfileIcon name="logout" size={16} />
                            </button>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="profile-layout-aside">
            <nav className="profile-side-menu" aria-label="Profile visibility">
              <h3 className="profile-side-menu-title">Visibility</h3>
              <p className="profile-side-menu-desc">Control what others see on your public page.</p>
              <PrivacyRow
                title="Profile visible"
                subtitle={user.profilePublic ? 'Anyone can open your public page' : 'Profile hidden from others'}
                checked={user.profilePublic}
                onChange={(v) => handlePrivacyToggle('profilePublic', v)}
              />
              <PrivacyRow
                title="Library visible"
                subtitle={user.libraryPublic ? 'Show library on your public profile' : 'Library stays private'}
                checked={user.libraryPublic}
                onChange={(v) => handlePrivacyToggle('libraryPublic', v)}
              />
            </nav>

            <div className="profile-side-menu profile-side-menu--links">
              <h3 className="profile-side-menu-title">Quick links</h3>
              <Link to="/settings" className="profile-side-link">
                <ProfileIcon name="edit" size={16} />
                Site settings
              </Link>
              <Link to="/bookmarks" className="profile-side-link">
                <ProfileIcon name="lists" size={16} />
                Bookmarks
              </Link>
              <Link to="/store" className="profile-side-link">
                <ProfileIcon name="shop" size={16} />
                Shop
              </Link>
            </div>
          </aside>
        </div>
      </div>

      <AppBottomNav />
      <ProfileMediaModal user={user} open={mediaOpen} onClose={() => setMediaOpen(false)} onSaved={refresh} />
    </div>
  )
}

function PrivacyRow({
  title,
  subtitle,
  checked,
  onChange,
}: {
  title: string
  subtitle: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="profile-privacy-row">
      <span className="profile-privacy-text">
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </span>
      <button
        type="button"
        role="switch"
        className={`profile-switch${checked ? ' is-on' : ''}`}
        aria-checked={checked}
        onClick={() => onChange(!checked)}
      >
        <span className="profile-switch-thumb" />
      </button>
    </label>
  )
}

export function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  )
}
