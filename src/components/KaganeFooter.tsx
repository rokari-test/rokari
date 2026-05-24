import { Link } from 'react-router-dom'
import { useSiteConfig } from '../hooks/useSiteConfig'
import './KaganeFooter.css'

export function KaganeFooter() {
  const { siteName, tagline } = useSiteConfig()
  const year = new Date().getFullYear()

  return (
    <footer className="k-footer">
      <div className="k-footer-grid">
        <div className="k-footer-brand">
          <h3>{siteName}</h3>
          <p>{tagline}</p>
        </div>
        <div>
          <h4>Information</h4>
          <ul>
            <li><Link to="/settings">About Us</Link></li>
            <li><Link to="/browse">Browse</Link></li>
            <li><Link to="/novels">Novels</Link></li>
            <li><Link to="/settings">FAQ</Link></li>
            <li><Link to="/admin/login">Admin</Link></li>
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul>
            <li>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer">
                Discord Server
              </a>
            </li>
            <li>
              <a href="mailto:support@sakura.local">support@sakura.local</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="k-footer-bottom">
        <p>© {year}– {siteName}. Some rights reserved.</p>
        <p className="k-footer-meta">Built for enthusiasts, by enthusiasts.</p>
      </div>
    </footer>
  )
}
