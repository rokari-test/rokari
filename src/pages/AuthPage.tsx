import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useSiteConfig } from '../hooks/useSiteConfig'
import { useUser } from '../hooks/useUser'
import { loginUser, registerUser } from '../lib/userAuth'
import './AuthPage.css'

type AuthMode = 'signin' | 'register'

const PERKS = [
  'Bookmark series & sync reading history',
  'Unlock chapters with coins or subscription',
  'Earn XP, badges, and reader ranks',
] as const

export function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { siteName } = useSiteConfig()
  const { user } = useUser()

  const mode: AuthMode = location.pathname.includes('register') ? 'register' : 'signin'

  const [login, setLogin] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/profile'
  const tabState = location.state

  if (user) {
    return <Navigate to={redirectTo} replace />
  }

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await loginUser({ login, password })
    setLoading(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    navigate(redirectTo, { replace: true })
  }

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    const result = await registerUser({ username, email, password })
    setLoading(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    navigate('/profile', { replace: true })
  }

  return (
    <div className="auth-page">
      <div className="auth-page-glow auth-page-glow--a" aria-hidden />
      <div className="auth-page-glow auth-page-glow--b" aria-hidden />

      <Link to="/" className="auth-page-back">
        ← Back to {siteName}
      </Link>

      <div className="auth-shell">
        <aside className="auth-showcase">
          <div className="auth-showcase-inner">
            <div className="auth-showcase-brand">
              <span className="auth-showcase-logo">{siteName}</span>
              <span className="auth-showcase-beta">Beta</span>
            </div>
            <p className="auth-showcase-tagline">
              {mode === 'signin'
                ? 'Pick up where you left off — your library, coins, and streak are waiting.'
                : 'Create your reader profile and start collecting chapters, coins, and ranks.'}
            </p>
            <ul className="auth-showcase-perks">
              {PERKS.map((perk) => (
                <li key={perk}>
                  <SparkIcon />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="auth-panel">
          <header className="auth-panel-head">
            <h1>{mode === 'signin' ? 'Welcome back' : 'Create account'}</h1>
            <p>
              {mode === 'signin'
                ? `Sign in to continue reading on ${siteName}.`
                : 'Join the community — it only takes a minute.'}
            </p>
          </header>

          <div className="auth-card">
            <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
              <Link
                to="/login"
                state={tabState}
                role="tab"
                aria-selected={mode === 'signin'}
                className={`auth-tab${mode === 'signin' ? ' auth-tab--active' : ''}`}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                state={tabState}
                role="tab"
                aria-selected={mode === 'register'}
                className={`auth-tab${mode === 'register' ? ' auth-tab--active' : ''}`}
              >
                Create Account
              </Link>
            </div>

            {error ? (
              <p className="auth-error" role="alert">
                {error}
              </p>
            ) : null}

            {mode === 'signin' ? (
              <form className="auth-form" onSubmit={handleSignIn}>
                <label className="auth-field">
                  <span>Email or Username</span>
                  <span className="auth-input-wrap">
                    <MailIcon />
                    <input
                      type="text"
                      autoComplete="username"
                      placeholder="your@email.com or username"
                      value={login}
                      onChange={(e) => setLogin(e.target.value)}
                      required
                    />
                  </span>
                </label>
                <label className="auth-field">
                  <span>Password</span>
                  <span className="auth-input-wrap">
                    <LockIcon />
                    <input
                      type={showPass ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="auth-eye"
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPass((v) => !v)}
                    >
                      <EyeIcon open={showPass} />
                    </button>
                  </span>
                </label>
                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>
            ) : (
              <form className="auth-form" onSubmit={handleRegister}>
                <label className="auth-field">
                  <span>Username</span>
                  <span className="auth-input-wrap">
                    <UserIcon />
                    <input
                      type="text"
                      autoComplete="username"
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      minLength={5}
                      required
                    />
                  </span>
                  <span className="auth-hint">At least 5 characters · letters, numbers, underscores</span>
                </label>
                <label className="auth-field">
                  <span>Email</span>
                  <span className="auth-input-wrap">
                    <MailIcon />
                    <input
                      type="email"
                      autoComplete="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </span>
                </label>
                <label className="auth-field">
                  <span>Password</span>
                  <span className="auth-input-wrap">
                    <LockIcon />
                    <input
                      type={showPass ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      className="auth-eye"
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPass((v) => !v)}
                    >
                      <EyeIcon open={showPass} />
                    </button>
                  </span>
                </label>
                <label className="auth-field">
                  <span>Confirm Password</span>
                  <span className="auth-input-wrap">
                    <LockIcon />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      className="auth-eye"
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                      onClick={() => setShowConfirm((v) => !v)}
                    >
                      <EyeIcon open={showConfirm} />
                    </button>
                  </span>
                </label>
                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>
              </form>
            )}

            <p className="auth-terms">
              By continuing, you agree to our{' '}
              <Link to="/preferences">Terms of Service</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function SparkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2l1.2 4.8L18 8l-4.8 1.2L12 14l-1.2-4.8L6 8l4.8-1.2L12 2z"
        fill="currentColor"
      />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
    </svg>
  )
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19" />
        <path d="M1 1l22 22" />
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
