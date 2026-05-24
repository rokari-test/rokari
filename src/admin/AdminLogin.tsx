import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { isAdminAuthenticated, loginAdmin } from '../lib/adminAuth'
import { useSiteConfig } from '../hooks/useSiteConfig'
import './admin.css'

export function AdminLogin() {
  const { siteName } = useSiteConfig()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (isAdminAuthenticated()) {
    return <Navigate to="/admin" replace />
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (loginAdmin(password)) {
      navigate('/admin')
    } else {
      setError('Incorrect password')
    }
  }

  return (
    <div className="admin-root admin-login">
      <div className="admin-login-card">
        <h1>{siteName ? `${siteName} Admin` : 'Admin sign in'}</h1>
        <p>
          Sign in with the admin password, or use a site account with <strong>Admin</strong> /{' '}
          <strong>Site owner</strong> role on the main site.
        </p>
        <p className="admin-login-hint">
          Default password: <code>changeme</code> — set <code>VITE_ADMIN_PASSWORD</code> in{' '}
          <code>.env</code> for production.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="admin-form-row">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              className="admin-input"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              autoComplete="current-password"
              required
            />
          </div>
          {error && <p className="admin-error">{error}</p>}
          <div className="admin-form-actions" style={{ marginTop: '1rem' }}>
            <button type="submit" className="admin-btn">
              Sign in
            </button>
            <a href="/" className="admin-btn admin-btn--ghost">
              Back to site
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
