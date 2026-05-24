import { useMemo, useState } from 'react'
import { Announcements } from '../components/Announcements'
import { HomeSection } from '../components/HomeSection'
import { KeepReadingRail } from '../components/KeepReadingRail'
import { PopularFeatured } from '../components/PopularFeatured'
import { SeriesCarousel } from '../components/SeriesCarousel'
import { SeriesUpdateFeed } from '../components/SeriesUpdateFeed'
import { POPULAR_LAYOUT } from '../config/homeLayout'
import {
  getPopularSeries,
  getRecentlyAdded,
  getRecentlyUpdated,
  type PopularPeriod,
} from '../data/catalog'
import { useCatalog } from '../hooks/useCatalog'
import './NovelsPage.css'

const PERIODS: { id: PopularPeriod; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'all', label: 'All Time' },
]

function novelBrowse(sort: string) {
  return `/browse?type=novel&sort=${sort}`
}

export function NovelsPage() {
  const catalog = useCatalog()
  const novels = useMemo(() => catalog.filter((s) => s.type === 'novel'), [catalog])
  const [period, setPeriod] = useState<PopularPeriod>('today')

  const popular = useMemo(() => getPopularSeries(period, 28, novels), [period, novels])
  const recentlyAdded = useMemo(() => getRecentlyAdded(28, novels), [novels])
  const recentlyUpdated = useMemo(
    () => getRecentlyUpdated(28, novels),
    [novels],
  )

  if (novels.length === 0) {
    return (
      <div className="novels-page novels-page--home">
        <div className="container--wide novels-empty-wrap">
          <p className="novels-empty">No novels in the catalog yet. Check back soon.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="novels-page novels-page--home">
      <Announcements />

      <div className="novels-sections container--wide">
        <HomeSection
          title="Popular"
          viewMoreHref={novelBrowse('trending-today')}
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

        <HomeSection title="Recently Added" viewMoreHref={novelBrowse('newest')}>
          <SeriesCarousel series={recentlyAdded} />
        </HomeSection>

        <HomeSection title="Recently Updated" viewMoreHref={novelBrowse('updated')}>
          <SeriesUpdateFeed series={recentlyUpdated.slice(0, 9)} />
        </HomeSection>

        <KeepReadingRail
          className="keep-rail--home"
          contentType="novel"
          title="Continue your novels"
          viewAllHref="/library"
        />
      </div>
    </div>
  )
}
