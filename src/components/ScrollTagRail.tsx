import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './ScrollTagRail.css'

interface ScrollTagRailProps {
  label: string
  items: { key: string; label: string; href: string; variant?: 'genre' | 'tag' }[]
}

export function ScrollTagRail({ label, items }: ScrollTagRailProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canScroll, setCanScroll] = useState(false)

  const update = () => {
    const el = trackRef.current
    if (!el) return
    setCanScroll(el.scrollWidth > el.clientWidth + 4)
  }

  useEffect(() => {
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [items])

  const scrollRight = () => {
    trackRef.current?.scrollBy({ left: 180, behavior: 'smooth' })
  }

  return (
    <div className="tag-rail">
      <h3 className="tag-rail-label">{label}</h3>
      <div className="tag-rail-wrap">
        <div ref={trackRef} className="tag-rail-track" onScroll={update}>
          {items.map((item) => (
            <Link
              key={item.key}
              to={item.href}
              className={`tag-rail-pill tag-rail-pill--${item.variant ?? 'tag'}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        {canScroll && (
          <button
            type="button"
            className="tag-rail-scroll"
            aria-label={`Scroll ${label} right`}
            onClick={scrollRight}
          >
            ›
          </button>
        )}
      </div>
    </div>
  )
}
