import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useUser } from '../hooks/useUser'
import { useCatalog } from '../hooks/useCatalog'
import {
  activeChapters,
  addNewChapter,
  canManageChapters,
  trashedChapters,
} from '../lib/chapterManage'
import { SeriesChapterList } from './SeriesChapterList'
import { SeriesCommentsPanel } from './SeriesCommentsPanel'
import { useSeriesComments } from '../hooks/useSeriesComments'
import { SeriesChapterManageList } from './SeriesChapterManageList'
import { SeriesEditPanel } from './SeriesEditPanel'
import { SeriesFullInfoPanel } from './SeriesFullInfo'
import { canManageSeriesFullInfo } from '../lib/seriesFullInfo'
import { canManageSeries } from '../lib/seriesManage'
import { SeriesPanelTabIcon } from './seriesPanelIcons'
import type { DetailTab } from './seriesPanelTypes'
import type { Series } from '../types'
import './SeriesChapterPanel.css'

type SortMode = 'chapter' | 'latest'

interface SeriesChapterPanelProps {
  series: Series
  related?: Series
  currentChapterNumber?: number
}

const PAGE_SIZES = [20, 40, 60] as const

export function SeriesChapterPanel({
  series: seriesProp,
  related,
  currentChapterNumber,
}: SeriesChapterPanelProps) {
  const [tab, setTab] = useState<DetailTab>('chapters')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortMode>('latest')
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(20)
  const [page, setPage] = useState(1)
  const [sizeOpen, setSizeOpen] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [manageMode, setManageMode] = useState(false)
  const [manageView, setManageView] = useState<'active' | 'trash'>('active')
  const { user } = useUser()
  const catalog = useCatalog()
  const series = catalog.find((s) => s.id === seriesProp.id) ?? seriesProp
  const canManage = canManageChapters(user?.role)
  const canEditSeries = canManageSeries(user?.role)
  const canEditFullInfo = canManageSeriesFullInfo(user?.role)
  const { count: commentCount } = useSeriesComments(series.slug)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = manageMode && manageView === 'trash'
      ? trashedChapters(series.chapters)
      : activeChapters(series.chapters)
    if (q) {
      list = list.filter(
        (ch) =>
          ch.title.toLowerCase().includes(q) ||
          String(ch.number).includes(q),
      )
    }
    list.sort((a, b) =>
      sort === 'latest' ? b.number - a.number : a.number - b.number,
    )
    return list
  }, [series.chapters, query, sort, manageMode, manageView])

  const effectivePageSize = showAll ? Math.max(filtered.length, 1) : pageSize
  const effectiveTotalPages = Math.max(1, Math.ceil(filtered.length / effectivePageSize))
  const safePage = Math.min(page, effectiveTotalPages)
  const pageItems = filtered.slice(
    (safePage - 1) * effectivePageSize,
    safePage * effectivePageSize,
  )

  const tabs: { id: DetailTab; label: string; count?: number }[] = [
    {
      id: 'chapters',
      label: 'Chapters',
      count: activeChapters(series.chapters).length,
    },
    { id: 'reviews', label: 'Reviews', count: 0 },
    { id: 'comments', label: 'Comments', count: commentCount },
    { id: 'covers', label: 'Covers' },
    ...(related ? [{ id: 'related' as const, label: 'Related' }] : []),
    ...(canEditSeries ? [{ id: 'edit' as const, label: 'Edit' }] : []),
    { id: 'fullinfo', label: 'Full info' },
  ]

  return (
    <section className="series-panel">
      <div className="series-panel-tabs" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`series-panel-tab${tab === t.id ? ' series-panel-tab--active' : ''}`}
            onClick={() => {
              setTab(t.id)
              setSizeOpen(false)
            }}
          >
            <SeriesPanelTabIcon tab={t.id} />
            <span className="series-panel-tab-label">{t.label}</span>
            {t.count != null && (
              <span className="series-panel-tab-count">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      <div className="series-panel-stage" key={tab} role="tabpanel">
      {tab === 'chapters' && (
        <div className="rok-reel-deck">
          <div className="rok-reel-deck-head">
            <div>
              <p className="rok-reel-deck-eyebrow">Rokari reel</p>
              <h3 className="rok-reel-deck-title">Chapter pass</h3>
            </div>
            <div className="rok-reel-deck-stats">
              <span className="rok-reel-deck-stat">
                <strong>{activeChapters(series.chapters).length}</strong>
                <span>chapters</span>
              </span>
              {currentChapterNumber ? (
                <span className="rok-reel-deck-stat rok-reel-deck-stat--accent">
                  <strong>Ch. {currentChapterNumber}</strong>
                  <span>reading</span>
                </span>
              ) : null}
            </div>
          </div>

          <div className="rok-reel-controls">
            <label className="rok-reel-scan">
              <SearchIcon />
              <input
                type="search"
                placeholder="Scan the reel…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(1)
                }}
              />
            </label>
            <div className="rok-reel-filters">
              {canManage && (
                <>
                  <button
                    type="button"
                    className={`rok-reel-filter${manageMode ? ' rok-reel-filter--active' : ''}`}
                    onClick={() => {
                      setManageMode((m) => !m)
                      setManageView('active')
                      setPage(1)
                    }}
                  >
                    {manageMode ? 'Reading view' : 'Manage'}
                  </button>
                  {manageMode && (
                    <>
                      <button
                        type="button"
                        className={`rok-reel-filter${manageView === 'active' ? ' is-active' : ''}`}
                        onClick={() => {
                          setManageView('active')
                          setPage(1)
                        }}
                      >
                        Active
                      </button>
                      <button
                        type="button"
                        className={`rok-reel-filter${manageView === 'trash' ? ' is-active' : ''}`}
                        onClick={() => {
                          setManageView('trash')
                          setPage(1)
                        }}
                      >
                        Trash ({trashedChapters(series.chapters).length})
                      </button>
                      <button
                        type="button"
                        className="rok-reel-filter rok-reel-filter--add"
                        onClick={() => addNewChapter(series.id)}
                      >
                        + Add chapter
                      </button>
                    </>
                  )}
                </>
              )}
              <button
                type="button"
                className={`rok-reel-filter${sort === 'chapter' ? ' rok-reel-filter--active' : ''}`}
                onClick={() => setSort('chapter')}
                disabled={manageMode}
              >
                Chapter
              </button>
              <button
                type="button"
                className={`rok-reel-filter rok-reel-filter--latest${sort === 'latest' ? ' is-active' : ''}`}
                onClick={() => setSort('latest')}
              >
                <ClockIcon />
                Latest
              </button>
              <div className="rok-reel-filter-size">
                <button
                  type="button"
                  className={`rok-reel-filter${!showAll ? ' is-active' : ''}`}
                  aria-expanded={sizeOpen}
                  disabled={showAll}
                  onClick={() => setSizeOpen((o) => !o)}
                >
                  {pageSize}
                </button>
                {sizeOpen && (
                  <div className="rok-reel-filter-menu">
                    {PAGE_SIZES.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => {
                          setPageSize(n)
                          setShowAll(false)
                          setPage(1)
                          setSizeOpen(false)
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                className={`rok-reel-filter rok-reel-filter--all${showAll ? ' is-active' : ''}`}
                onClick={() => {
                  setShowAll((all) => !all)
                  setPage(1)
                  setSizeOpen(false)
                }}
              >
                All
              </button>
            </div>
          </div>

          {manageMode && canManage ? (
            <SeriesChapterManageList
              series={series}
              chapters={pageItems}
              showTrash={manageView === 'trash'}
            />
          ) : (
            <SeriesChapterList
              series={series}
              chapters={pageItems}
              currentChapterNumber={currentChapterNumber}
            />
          )}

          {filtered.length === 0 && (
            <p className="rok-reel-empty">No chapters match your scan.</p>
          )}

          {!showAll && effectiveTotalPages > 1 && (
            <nav className="rok-reel-pagination" aria-label="Chapter pages">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              {Array.from({ length: Math.min(effectiveTotalPages, 5) }, (_, i) => i + 1).map(
                (n) => (
                  <button
                    key={n}
                    type="button"
                    className={n === safePage ? 'rok-reel-pagination--active' : ''}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                ),
              )}
              <button
                type="button"
                disabled={safePage >= effectiveTotalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </nav>
          )}
        </div>
      )}

      {tab === 'reviews' && (
        <EmptyTab message="No reviews yet. Be the first to rate this series." />
      )}

      {tab === 'comments' && <SeriesCommentsPanel series={series} />}

      {tab === 'covers' && (
        <div className="series-covers-tab">
          <figure>
            <img src={series.coverUrl} alt="" />
            <figcaption>Primary cover</figcaption>
          </figure>
          {series.bannerUrl !== series.coverUrl && (
            <figure>
              <img
                src={series.bannerUrl}
                alt=""
                style={{
                  objectFit: 'cover',
                  objectPosition: `${series.bannerFocalX ?? 50}% ${series.bannerFocalY ?? 50}%`,
                }}
              />
              <figcaption>Banner</figcaption>
            </figure>
          )}
        </div>
      )}

      {tab === 'edit' && canEditSeries && (
        <SeriesEditPanel series={series} />
      )}

      {tab === 'related' && related && (
        <div className="rok-related">
          <div className="rok-related-head">
            <p className="rok-related-eyebrow">Rokari link</p>
            <h3 className="rok-related-title">
              {series.type === 'manhwa'
                ? 'Continue in the original novel'
                : 'Read the manhwa adaptation'}
            </h3>
          </div>
          <Link to={`/series/${related.slug}`} className="rok-related-pass">
            <span className="rok-related-cover">
              <img src={related.coverUrl} alt="" />
            </span>
            <span className="rok-related-body">
              <span className="rok-related-kicker">
                {related.type === 'manhwa' ? 'Manhwa' : 'Novel'}
              </span>
              <span className="rok-related-name">{related.title}</span>
              <span className="rok-related-chip">
                {related.chapters.length} chapters
              </span>
            </span>
            <span className="rok-related-go" aria-hidden>
              <RelatedChevronIcon />
            </span>
          </Link>
        </div>
      )}

      {tab === 'fullinfo' && (
        <SeriesFullInfoPanel series={series} canEdit={canEditFullInfo} />
      )}
      </div>
    </section>
  )
}

function EmptyTab({ message }: { message: string }) {
  return <p className="series-tab-empty">{message}</p>
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20L17 17" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}

function RelatedChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}
