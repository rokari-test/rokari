import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ManhwaCard } from '../components/ManhwaCard'
import { SeriesSearchField } from '../components/SeriesSearchField'
import {
  BROWSE_SORT_LABELS,
  countActiveBrowseFilters,
  filterBrowseSeries,
  getAllGenres,
  getAllLanguages,
  getAllTags,
  type BrowseFilters,
  type BrowseSortOption,
} from '../lib/browseFilters'
import {
  filterOptionList,
  groupGenresForBrowse,
} from '../lib/genreBuckets'
import { loadPreferences } from '../lib/preferences'
import './BrowsePage.css'

interface BrowsePageProps {
  searchQuery?: string
}

type FilterTab = 'format' | 'genres' | 'tags' | 'language'
type OpenPanel = FilterTab | 'sort' | null

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: 'format', label: 'Format' },
  { id: 'genres', label: 'Genres' },
  { id: 'tags', label: 'Tags' },
  { id: 'language', label: 'Language' },
]

const SORT_OPTIONS = Object.keys(BROWSE_SORT_LABELS) as BrowseSortOption[]

function parseSort(value: string | null, hasQuery: boolean): BrowseSortOption {
  const map: Record<string, BrowseSortOption> = {
    popular: 'popular',
    rating: 'rating',
    latest: 'updated',
    updated: 'updated',
    title: 'title',
    relevance: 'relevance',
    newest: 'newest',
    oldest: 'oldest',
    views: 'views',
    'trending-today': 'trending-today',
    'trending-week': 'trending-week',
    'trending-month': 'trending-month',
  }
  if (value && map[value]) return map[value]
  return hasQuery ? 'relevance' : 'trending-today'
}

export function BrowsePage({ searchQuery = '' }: BrowsePageProps) {
  const [params, setParams] = useSearchParams()
  const toolbarRef = useRef<HTMLDivElement>(null)
  const controlsRef = useRef<HTMLDivElement>(null)
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null)
  const [draftQuery, setDraftQuery] = useState(
    () => params.get('q') ?? searchQuery,
  )
  const [panelQuery, setPanelQuery] = useState('')
  const [matchAllGenres, setMatchAllGenres] = useState(false)

  const pageSize = loadPreferences().browsePageSize
  const page = Math.max(1, Number(params.get('page') ?? '1') || 1)

  const filters: BrowseFilters = useMemo(() => {
    const q = params.get('q') ?? searchQuery
    const typeParam = params.get('type')
    return {
      query: q,
      searchMode: 'fuzzy',
      type:
        typeParam === 'manhwa' || typeParam === 'novel' ? typeParam : 'all',
      genre: params.get('genre'),
      tag: params.get('tag'),
      source: null,
      contentRating: null,
      language: params.get('lang'),
      sort: parseSort(params.get('sort'), Boolean(q.trim())),
    }
  }, [params, searchQuery])

  useEffect(() => {
    setDraftQuery(params.get('q') ?? searchQuery)
  }, [params, searchQuery])

  useEffect(() => {
    setPanelQuery('')
  }, [openPanel])

  useEffect(() => {
    if (!openPanel) return
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node
      if (toolbarRef.current?.contains(target)) return
      if (controlsRef.current?.contains(target)) return
      setOpenPanel(null)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [openPanel])

  const allGenres = getAllGenres()
  const allTags = getAllTags()
  const allLanguages = getAllLanguages()
  const genreGroups = useMemo(
    () => groupGenresForBrowse(allGenres, panelQuery),
    [allGenres, panelQuery],
  )

  const filtered = useMemo(() => filterBrowseSeries(filters), [filters])
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  )

  const patchParams = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    if (!('page' in patch)) next.delete('page')
    setParams(next, { replace: true })
  }

  const runSearch = (query: string) => {
    const q = query.trim()
    patchParams({
      q: q || null,
      sort: q ? 'relevance' : params.get('sort'),
    })
  }

  const togglePanel = (tab: FilterTab) => {
    setOpenPanel((current) => (current === tab ? null : tab))
  }

  const activeFilters = countActiveBrowseFilters(filters)

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; clear: Record<string, string | null> }[] = []
    if (filters.query.trim()) {
      chips.push({
        key: 'q',
        label: `"${filters.query.trim()}"`,
        clear: { q: null },
      })
    }
    if (filters.type !== 'all') {
      chips.push({
        key: 'type',
        label: filters.type === 'manhwa' ? 'Manhwa' : 'Novel',
        clear: { type: null },
      })
    }
    if (filters.genre) {
      chips.push({ key: 'genre', label: filters.genre, clear: { genre: null } })
    }
    if (filters.tag) {
      chips.push({ key: 'tag', label: filters.tag, clear: { tag: null } })
    }
    if (filters.language) {
      chips.push({ key: 'lang', label: filters.language, clear: { lang: null } })
    }
    return chips
  }, [filters])

  const quickSorts: { id: BrowseSortOption; label: string }[] = [
    { id: 'trending-today', label: 'Trending' },
    { id: 'newest', label: 'Newest' },
    { id: 'updated', label: 'Updated' },
    { id: 'rating', label: 'Top rated' },
  ]

  return (
    <div className="browse-page container--wide">
      <header className="browse-hero">
        <div className="browse-hero-glow" aria-hidden />
        <div className="browse-hero-inner">
          <div className="browse-hero-copy">
            <p className="browse-eyebrow">Rokari · Explore</p>
            <h1>Browse</h1>
            <p className="browse-lead">
              Search the full catalog — filter by format, genre, tags, and language.
              SFW picks only.
            </p>
          </div>
          <div className="browse-hero-stats" aria-hidden>
            <div className="browse-hero-stat">
              <strong>{filtered.length.toLocaleString()}</strong>
              <span>results</span>
            </div>
            <div className="browse-hero-stat">
              <strong>{allGenres.length}</strong>
              <span>genres</span>
            </div>
          </div>
        </div>
      </header>

      <section className="browse-panel browse-panel--tools" aria-label="Search and filters">
        <div className="browse-panel-body browse-panel-body--tools">
          <SeriesSearchField
            value={draftQuery}
            onChange={setDraftQuery}
            onSubmit={runSearch}
            variant="browse"
            placeholder="Search series..."
          />

          <div className="browse-quick-sorts" role="group" aria-label="Quick sort">
            {quickSorts.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`browse-quick-sort${filters.sort === item.id ? ' is-active' : ''}`}
                onClick={() => patchParams({ sort: item.id })}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="browse-filter-bar" ref={toolbarRef}>
        <div className="browse-filter-tabs" role="tablist">
          {FILTER_TABS.map((tab) => (
            <FilterTabButton
              key={tab.id}
              label={tab.label}
              isOpen={openPanel === tab.id}
              isActive={
                (tab.id === 'format' && filters.type !== 'all') ||
                (tab.id === 'genres' && Boolean(filters.genre)) ||
                (tab.id === 'tags' && Boolean(filters.tag)) ||
                (tab.id === 'language' && Boolean(filters.language))
              }
              onClick={() => togglePanel(tab.id)}
            />
          ))}
          {activeFilters > 0 && (
            <button
              type="button"
              className="browse-clear-filters"
              onClick={() =>
                patchParams({
                  type: null,
                  genre: null,
                  tag: null,
                  lang: null,
                })
              }
            >
              Clear all
            </button>
          )}
        </div>

        {openPanel === 'format' && (
          <FilterSheet
            panelQuery={panelQuery}
            onPanelQueryChange={setPanelQuery}
            placeholder="Filter formats..."
            hint="Tap a format to include it in results."
          >
            <div className="browse-filter-tags">
              {filterOptionList(['Manhwa', 'Novel'], panelQuery).map((label) => {
                const value = label.toLowerCase() as 'manhwa' | 'novel'
                const selected = filters.type === value
                return (
                  <FilterTag
                    key={label}
                    label={label}
                    selected={selected}
                    onClick={() =>
                      patchParams({ type: selected ? null : value })
                    }
                  />
                )
              })}
            </div>
          </FilterSheet>
        )}

        {openPanel === 'genres' && (
          <FilterSheet
            panelQuery={panelQuery}
            onPanelQueryChange={setPanelQuery}
            placeholder="Filter genres..."
            hint="Tap genres to refine your Rokari library — SFW picks only."
            footer={
              <label className="browse-filter-match">
                <input
                  type="checkbox"
                  checked={matchAllGenres}
                  onChange={(e) => setMatchAllGenres(e.target.checked)}
                />
                Match ALL selected genres
              </label>
            }
          >
            {genreGroups.length === 0 ? (
              <p className="browse-filter-empty">No genres match your filter.</p>
            ) : (
              genreGroups.map((group) => (
                <section key={group.label} className="browse-filter-section">
                  <h3 className="browse-filter-section-title">{group.label}</h3>
                  <div className="browse-filter-tags">
                    {group.items.map((genre) => (
                      <FilterTag
                        key={genre}
                        label={genre}
                        selected={filters.genre === genre}
                        onClick={() =>
                          patchParams({
                            genre: filters.genre === genre ? null : genre,
                          })
                        }
                      />
                    ))}
                  </div>
                </section>
              ))
            )}
          </FilterSheet>
        )}

        {openPanel === 'tags' && (
          <FilterSheet
            panelQuery={panelQuery}
            onPanelQueryChange={setPanelQuery}
            placeholder="Filter tags..."
            hint="Tap a tag to filter results."
          >
            {allTags.length === 0 ? (
              <p className="browse-filter-empty">No tags in catalog yet.</p>
            ) : (
              <div className="browse-filter-tags">
                {filterOptionList(allTags, panelQuery).map((tag) => (
                  <FilterTag
                    key={tag}
                    label={tag}
                    selected={filters.tag === tag}
                    onClick={() =>
                      patchParams({ tag: filters.tag === tag ? null : tag })
                    }
                  />
                ))}
              </div>
            )}
          </FilterSheet>
        )}

        {openPanel === 'language' && (
          <FilterSheet
            panelQuery={panelQuery}
            onPanelQueryChange={setPanelQuery}
            placeholder="Filter languages..."
            hint="Tap a language to filter results."
          >
            <div className="browse-filter-tags">
              {filterOptionList(allLanguages, panelQuery).map((lang) => (
                <FilterTag
                  key={lang}
                  label={lang}
                  selected={filters.language === lang}
                  onClick={() =>
                    patchParams({
                      lang: filters.language === lang ? null : lang,
                    })
                  }
                />
              ))}
            </div>
          </FilterSheet>
        )}
          </div>

          {activeChips.length > 0 && (
            <div className="browse-active-chips">
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  className="browse-active-chip"
                  onClick={() => patchParams(chip.clear)}
                >
                  {chip.label}
                  <span aria-hidden>×</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="browse-panel browse-panel--results" aria-label="Results">
        <div className="browse-results-head" ref={controlsRef}>
          <div className="browse-sort-wrap">
          <button
            type="button"
            className={`browse-sort-trigger${openPanel === 'sort' ? ' is-open' : ''}`}
            aria-expanded={openPanel === 'sort'}
            aria-haspopup="listbox"
            onClick={() =>
              setOpenPanel((current) => (current === 'sort' ? null : 'sort'))
            }
          >
            <span>{BROWSE_SORT_LABELS[filters.sort]}</span>
            <ChevronIcon />
          </button>
          {openPanel === 'sort' && (
            <div className="browse-sort-menu" role="listbox" aria-label="Sort results">
              {SORT_OPTIONS.map((key) => (
                <button
                  key={key}
                  type="button"
                  role="option"
                  aria-selected={filters.sort === key}
                  className={`browse-sort-option${filters.sort === key ? ' is-active' : ''}`}
                  onClick={() => {
                    patchParams({ sort: key })
                    setOpenPanel(null)
                  }}
                >
                  {filters.sort === key && <CheckIcon />}
                  {BROWSE_SORT_LABELS[key]}
                </button>
              ))}
            </div>
          )}
          </div>

          <p className="browse-count">
            {filtered.length.toLocaleString()} result
            {filtered.length !== 1 ? 's' : ''}
          </p>
        </div>

        {filtered.length > 0 && totalPages > 1 && (
          <div className="browse-results-pagination browse-results-pagination--top">
            <BrowsePagination
              page={safePage}
              totalPages={totalPages}
              onPage={(p) => patchParams({ page: p === 1 ? null : String(p) })}
            />
          </div>
        )}

        <div className="browse-panel-body browse-panel-body--results">
          {filtered.length === 0 ? (
            <div className="browse-empty">
              <h3>No matches in this list</h3>
              <p>Try another search, clear filters, or pick a quick sort above.</p>
            </div>
          ) : (
            <div className="browse-grid">
              {pageItems.map((s) => (
                <ManhwaCard key={s.id} series={s} />
              ))}
            </div>
          )}
        </div>

        {filtered.length > 0 && totalPages > 1 && (
          <div className="browse-results-pagination browse-results-pagination--bottom">
            <BrowsePagination
              page={safePage}
              totalPages={totalPages}
              onPage={(p) => patchParams({ page: p === 1 ? null : String(p) })}
            />
          </div>
        )}
      </section>
    </div>
  )
}

function FilterTabButton({
  label,
  isOpen,
  isActive,
  onClick,
}: {
  label: string
  isOpen: boolean
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isOpen}
      className={`browse-filter-tab${isOpen ? ' is-open' : ''}${isActive ? ' is-active' : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

function FilterSheet({
  panelQuery,
  onPanelQueryChange,
  placeholder,
  hint,
  footer,
  children,
}: {
  panelQuery: string
  onPanelQueryChange: (value: string) => void
  placeholder: string
  hint: string
  footer?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="browse-filter-sheet" role="tabpanel">
      <div className="browse-filter-sheet-search">
        <SearchIcon />
        <input
          type="search"
          value={panelQuery}
          onChange={(e) => onPanelQueryChange(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
        />
      </div>
      <p className="browse-filter-hint">{hint}</p>
      <div className="browse-filter-sheet-body">{children}</div>
      {footer && <div className="browse-filter-sheet-foot">{footer}</div>}
    </div>
  )
}

function FilterTag({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={`browse-filter-tag${selected ? ' is-selected' : ''}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      {label}
    </button>
  )
}

function BrowsePagination({
  page,
  totalPages,
  onPage,
}: {
  page: number
  totalPages: number
  onPage: (page: number) => void
}) {
  const pages = buildPageList(page, totalPages)
  return (
    <nav className="browse-pagination" aria-label="Pagination">
      <button
        type="button"
        className="browse-page-btn"
        disabled={page <= 1}
        onClick={() => onPage(1)}
        aria-label="First page"
      >
        «
      </button>
      <button
        type="button"
        className="browse-page-btn"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        aria-label="Previous page"
      >
        ‹
      </button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="browse-page-gap">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            className={`browse-page-btn${p === page ? ' is-active' : ''}`}
            onClick={() => onPage(p)}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        className="browse-page-btn"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
        aria-label="Next page"
      >
        ›
      </button>
      <button
        type="button"
        className="browse-page-btn"
        disabled={page >= totalPages}
        onClick={() => onPage(totalPages)}
        aria-label="Last page"
      >
        »
      </button>
    </nav>
  )
}

function buildPageList(page: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const items: (number | '…')[] = [1]
  if (page > 3) items.push('…')
  for (let p = Math.max(2, page - 1); p <= Math.min(total - 1, page + 1); p += 1) {
    items.push(p)
  }
  if (page < total - 2) items.push('…')
  items.push(total)
  return items
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20L17 17" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}
