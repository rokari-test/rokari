import { useMemo, useState } from 'react'
import { Announcements } from '../components/Announcements'
import { HomeSection } from '../components/HomeSection'
import { PopularFeatured } from '../components/PopularFeatured'
import { SeriesCarousel } from '../components/SeriesCarousel'
import { KeepReadingRail } from '../components/KeepReadingRail'
import { SeriesUpdateFeed } from '../components/SeriesUpdateFeed'
import { POPULAR_LAYOUT } from '../config/homeLayout'
import {
  getPopularSeries,
  getRecentlyAdded,
  getRecentlyUpdated,
  type PopularPeriod,
} from '../data/catalog'
import { useCatalog } from '../hooks/useCatalog'
import './HomePage.css'

const PERIODS: { id: PopularPeriod; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'all', label: 'All Time' },
]

export function HomePage() {
  const catalog = useCatalog()
  const manhwa = useMemo(
    () => catalog.filter((s) => s.type === 'manhwa'),
    [catalog],
  )
  const [period, setPeriod] = useState<PopularPeriod>('today')

  const popular = useMemo(
    () => getPopularSeries(period, 28, manhwa),
    [period, manhwa],
  )
  const recentlyAdded = useMemo(() => getRecentlyAdded(28, manhwa), [manhwa])
  const recentlyUpdated = useMemo(
    () => getRecentlyUpdated(28, manhwa),
    [manhwa],
  )

  return (
    <div className="home">
      <Announcements />

      <div className="home-sections container--wide">
        <HomeSection
          title="Popular"
          viewMoreHref="/browse?sort=trending-today"
          actions={
            <div className="period-tabs" role="tablist" aria-label="Popular period">
              {PERIODS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={period === p.id}
                  className={`period-tab${period === p.id ? ' period-tab--active' : ''}`}
                  onClick={() => setPeriod(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          }
        >
          {POPULAR_LAYOUT === 'featured' ? (
            <PopularFeatured series={popular} />
          ) : (
            <SeriesCarousel series={popular} />
          )}
        </HomeSection>

        <HomeSection
          title="Recently Added"
          viewMoreHref="/browse?sort=newest"
        >
          <SeriesCarousel series={recentlyAdded} />
        </HomeSection>

        <HomeSection
          title="Recently Updated"
          viewMoreHref="/browse?sort=updated"
        >
          <SeriesUpdateFeed series={recentlyUpdated.slice(0, 9)} />
        </HomeSection>

        <KeepReadingRail className="keep-rail--home" />
      </div>
    </div>
  )
}
