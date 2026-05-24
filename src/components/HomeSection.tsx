import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import './HomeSection.css'

interface HomeSectionProps {
  title: string
  viewMoreHref?: string
  viewMoreLabel?: string
  defaultOpen?: boolean
  /** Inline controls in the section header (e.g. Popular period tabs). */
  actions?: ReactNode
  tabs?: ReactNode
  children: ReactNode
}

export function HomeSection({
  title,
  viewMoreHref,
  viewMoreLabel = 'View More',
  defaultOpen = true,
  actions,
  tabs,
  children,
}: HomeSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className={`home-section${open ? '' : ' home-section--collapsed'}`}>
      <div className="home-section-head">
        <button
          type="button"
          className="home-section-toggle"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="home-section-chevron" aria-hidden />
          <h2>{title}</h2>
        </button>
        {(actions || viewMoreHref) && (
          <div className="home-section-actions">
            {actions}
            {viewMoreHref && (
              <Link to={viewMoreHref} className="home-section-more">
                {viewMoreLabel}
              </Link>
            )}
          </div>
        )}
      </div>
      {open && (
        <div className="home-section-body">
          {tabs}
          {children}
        </div>
      )}
    </section>
  )
}
