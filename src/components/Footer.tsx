import { Link } from 'react-router-dom'
import { useSiteConfig } from '../hooks/useSiteConfig'
import './Footer.css'

export function Footer() {
  const { siteName, tagline } = useSiteConfig()

  return (
    <footer className="site-footer">
      <div className="container site-footer-inner">
        <p>
          <strong>{siteName}</strong> — {tagline}
        </p>
        <p className="site-footer-links">
          <Link to="/settings">Settings</Link>
          <span aria-hidden> · </span>
          <Link to="/admin/login">Admin</Link>
        </p>
        <p className="site-footer-copy">© {new Date().getFullYear()} {siteName}</p>
      </div>
    </footer>
  )
}

