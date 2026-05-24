import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { SeriesQuickViewModal } from '../components/SeriesQuickViewModal'
import { useCatalog } from '../hooks/useCatalog'
interface SeriesQuickViewContextValue {
  openQuickView: (slug: string) => void
  closeQuickView: () => void
  activeSlug: string | null
}

const SeriesQuickViewContext = createContext<SeriesQuickViewContextValue | null>(
  null,
)

export function SeriesQuickViewProvider({ children }: { children: ReactNode }) {
  const catalog = useCatalog()
  const [activeSlug, setActiveSlug] = useState<string | null>(null)

  const series = useMemo(
    () => (activeSlug ? catalog.find((s) => s.slug === activeSlug) : undefined),
    [activeSlug, catalog],
  )

  const openQuickView = useCallback((slug: string) => {
    setActiveSlug(slug)
  }, [])

  const closeQuickView = useCallback(() => {
    setActiveSlug(null)
  }, [])

  useEffect(() => {
    if (!activeSlug) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeQuickView()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [activeSlug, closeQuickView])

  const value = useMemo(
    () => ({ openQuickView, closeQuickView, activeSlug }),
    [openQuickView, closeQuickView, activeSlug],
  )

  return (
    <SeriesQuickViewContext.Provider value={value}>
      {children}
      {series && (
        <SeriesQuickViewModal
          series={series}
          onClose={closeQuickView}
        />
      )}
    </SeriesQuickViewContext.Provider>
  )
}

export function useSeriesQuickView() {
  const ctx = useContext(SeriesQuickViewContext)
  if (!ctx) {
    throw new Error('useSeriesQuickView must be used within SeriesQuickViewProvider')
  }
  return ctx
}

/** Safe when provider is optional (e.g. tests). */
export function useSeriesQuickViewOptional(): SeriesQuickViewContextValue | null {
  return useContext(SeriesQuickViewContext)
}
