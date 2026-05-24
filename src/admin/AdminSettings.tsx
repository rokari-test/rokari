import { useState, type FormEvent } from 'react'
import { loadSiteConfig, saveSiteConfig } from '../lib/siteConfig'
import { useSiteConfig } from '../hooks/useSiteConfig'

export function AdminSettings() {
  const current = useSiteConfig()
  const [siteName, setSiteName] = useState(current.siteName)
  const [tagline, setTagline] = useState(current.tagline)
  const [saved, setSaved] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    saveSiteConfig({ siteName, tagline })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleResetConfig = () => {
    localStorage.removeItem('inkscroll-site-config')
    window.dispatchEvent(new Event('inkscroll-site-config'))
    const defaults = loadSiteConfig()
    setSiteName(defaults.siteName)
    setTagline(defaults.tagline)
  }

  return (
    <>
      <h1 className="admin-page-title">Site settings</h1>
      <p className="admin-page-sub">Branding shown in the public header and admin panel.</p>

      <form className="admin-form admin-card" onSubmit={handleSubmit}>
        <div className="admin-form-row">
          <label htmlFor="siteName">Site name</label>
          <input
            id="siteName"
            className="admin-input"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            required
          />
        </div>
        <div className="admin-form-row">
          <label htmlFor="tagline">Tagline</label>
          <input
            id="tagline"
            className="admin-input"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
          />
        </div>
        <div className="admin-form-actions">
          <button type="submit" className="admin-btn">
            Save settings
          </button>
          <button type="button" className="admin-btn admin-btn--ghost" onClick={handleResetConfig}>
            Reset defaults
          </button>
          {saved && <span style={{ color: 'var(--admin-success)' }}>Saved!</span>}
        </div>
      </form>

      <div className="admin-card" style={{ marginTop: '1.5rem' }}>
        <h2 style={{ margin: '0 0 0.75rem', fontSize: '1.05rem' }}>Production notes</h2>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--admin-muted)', lineHeight: 1.7 }}>
          <li>
            Set <code>VITE_ADMIN_PASSWORD</code> in <code>.env</code> before deploying.
          </li>
          <li>
            Catalog is stored in the browser (<code>localStorage</code>). For a live site like
            Kagane, add a backend (Node, Supabase, etc.) and connect the admin API.
          </li>
          <li>Upload images to your CDN and paste URLs in chapter editor.</li>
        </ul>
      </div>
    </>
  )
}
