import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  progressFromVirtualIndex,
  resolveDirection,
  slicePagesForVirtualIndex,
  virtualIndexFromProgress,
  virtualPageCount,
  zoomForMode,
} from '../../lib/readerEngine'
import { isEditableTarget } from '../../lib/keyboardShortcuts'
import type { ReadingMode, ReaderPreferences } from '../../lib/readerPreferences'
import './RokComicReader.css'

export interface RokComicReaderPageState {
  current: number
  total: number
}

export interface RokComicReaderHandle {
  jumpTop: () => void
  jumpBottom: () => void
  pagePrev: () => void
  pageNext: () => void
  jumpToPage: (page: number) => void
  getPageState: () => RokComicReaderPageState
}

interface RokComicReaderProps {
  pages: string[]
  prefs: ReaderPreferences
  mode: ReadingMode
  initialProgressPercent: number
  scrollPercent?: number
  onProgress: (percent: number) => void
  onNearEnd: () => void
  onPageBoundary?: (edgeInfo: 'start' | 'end') => void
}

export const RokComicReader = forwardRef<RokComicReaderHandle, RokComicReaderProps>(
  function RokComicReader(
    {
      pages,
      prefs,
      mode,
      initialProgressPercent,
      scrollPercent = 0,
      onProgress,
      onNearEnd,
      onPageBoundary,
    },
    ref,
  ) {
    const direction = resolveDirection(prefs.defaultReadingDirection, 'manhwa')
    const zoom = zoomForMode(mode, prefs) / 100
    const totalVirtual = virtualPageCount(mode, pages.length)
    const [pageIndex, setPageIndex] = useState(() =>
      mode === 'scroll' ? 0 : virtualIndexFromProgress(mode, initialProgressPercent, pages.length),
    )
    const restored = useRef(false)
    const nearEndFired = useRef(false)

    useEffect(() => {
      restored.current = false
      nearEndFired.current = false
      setPageIndex(
        mode === 'scroll' ? 0 : virtualIndexFromProgress(mode, initialProgressPercent, pages.length),
      )
    }, [pages, mode, initialProgressPercent])

  useEffect(() => {
    if (mode !== 'scroll') return
    if (restored.current) return

    const applyRestore = () => {
      if (restored.current) return
      const doc = document.documentElement
      const max = doc.scrollHeight - doc.clientHeight
      if (max <= 0) return
      if (initialProgressPercent > 2) {
        window.scrollTo(0, (initialProgressPercent / 100) * max)
      }
      restored.current = true
    }

    const t = window.setTimeout(applyRestore, 120)
    window.addEventListener('load', applyRestore)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('load', applyRestore)
    }
  }, [mode, initialProgressPercent, pages.length])

    useEffect(() => {
      if (mode !== 'scroll') return

      const onScrollHandler = () => {
        const doc = document.documentElement
        const max = doc.scrollHeight - doc.clientHeight
        const percent = max > 0 ? (window.scrollY / max) * 100 : 100
        onProgress(percent)
        if (percent >= 94 && !nearEndFired.current) {
          nearEndFired.current = true
          onNearEnd()
        }
      }

      window.addEventListener('scroll', onScrollHandler, { passive: true })
      window.addEventListener('resize', onScrollHandler, { passive: true })
      onScrollHandler()
      return () => {
        window.removeEventListener('scroll', onScrollHandler)
        window.removeEventListener('resize', onScrollHandler)
      }
    }, [mode, onProgress, onNearEnd, pages.length])

    useEffect(() => {
      if (mode === 'scroll') return
      const percent = progressFromVirtualIndex(mode, pageIndex, pages.length)
      onProgress(percent)
      if (percent >= 94 && !nearEndFired.current) {
        nearEndFired.current = true
        onNearEnd()
      }
    }, [mode, pageIndex, pages.length, onProgress, onNearEnd])

    const goPage = useCallback(
      (delta: number) => {
        setPageIndex((i) => {
          const next = i + delta
          if (next < 0) {
            onPageBoundary?.('start')
            return 0
          }
          if (next >= totalVirtual) {
            onPageBoundary?.('end')
            return totalVirtual - 1
          }
          return next
        })
      },
      [totalVirtual, onPageBoundary],
    )

    const goForward = useCallback(() => {
      goPage(direction === 'rtl' ? -1 : 1)
    }, [goPage, direction])

    const goBack = useCallback(() => {
      goPage(direction === 'rtl' ? 1 : -1)
    }, [goPage, direction])

    const scrollToPage = useCallback(
      (page: number) => {
        const total = pages.length
        if (total <= 0) return
        const clamped = Math.max(1, Math.min(total, page))
        const doc = document.documentElement
        const max = doc.scrollHeight - doc.clientHeight
        if (max <= 0) return
        const y = total === 1 ? 0 : ((clamped - 1) / (total - 1)) * max
        window.scrollTo({ top: y, behavior: 'smooth' })
      },
      [pages.length],
    )

    const jumpTop = useCallback(() => {
      if (mode === 'scroll') window.scrollTo({ top: 0, behavior: 'smooth' })
      else setPageIndex(0)
    }, [mode])

    const jumpBottom = useCallback(() => {
      if (mode === 'scroll') {
        const max = document.documentElement.scrollHeight - document.documentElement.clientHeight
        window.scrollTo({ top: max, behavior: 'smooth' })
      } else setPageIndex(totalVirtual - 1)
    }, [mode, totalVirtual])

    const getPageState = useCallback((): RokComicReaderPageState => {
      if (mode === 'scroll') {
        const total = pages.length
        const current =
          total <= 1
            ? 1
            : Math.max(
                1,
                Math.min(total, Math.round((scrollPercent / 100) * total) || 1),
              )
        return { current, total }
      }
      return { current: pageIndex + 1, total: totalVirtual }
    }, [mode, pages.length, pageIndex, scrollPercent, totalVirtual])

    useImperativeHandle(
      ref,
      () => ({
        jumpTop,
        jumpBottom,
        pagePrev: () => {
          if (mode === 'scroll') scrollToPage(getPageState().current - 1)
          else goBack()
        },
        pageNext: () => {
          if (mode === 'scroll') scrollToPage(getPageState().current + 1)
          else goForward()
        },
        jumpToPage: (page: number) => {
          if (mode === 'scroll') scrollToPage(page)
          else setPageIndex(Math.max(0, Math.min(totalVirtual - 1, page - 1)))
        },
        getPageState,
      }),
      [
        jumpTop,
        jumpBottom,
        goBack,
        goForward,
        scrollToPage,
        getPageState,
        mode,
        totalVirtual,
      ],
    )

    useEffect(() => {
      if (mode === 'scroll') return
      const onKey = (e: KeyboardEvent) => {
        if (isEditableTarget(e.target)) return
        if (e.key === 'ArrowRight') {
          e.preventDefault()
          goForward()
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          goBack()
        }
      }
      window.addEventListener('keydown', onKey)
      return () => window.removeEventListener('keydown', onKey)
    }, [mode, goForward, goBack])

    const handleTapZone = useCallback(
      (zone: 'prev' | 'next') => {
        if (!prefs.tapZonesEnabled || mode === 'scroll') return
        if (zone === 'next') goForward()
        else goBack()
      },
      [prefs.tapZonesEnabled, mode, goForward, goBack],
    )

    const visiblePages = useMemo(
      () => slicePagesForVirtualIndex(mode, pages, pageIndex),
      [mode, pages, pageIndex],
    )

    const maxWidth =
      prefs.maxStripWidth != null ? `${prefs.maxStripWidth}px` : undefined
    const scrollMaxWidth = maxWidth ?? `${Math.round(820 * zoom)}px`

    if (mode === 'scroll') {
      return (
        <article
          className={`rok-comic rok-comic--scroll${prefs.pageGaps ? ' rok-comic--gaps' : ''}`}
          style={{ maxWidth: scrollMaxWidth, width: '100%' }}
        >
          {pages.map((src, i) => (
            <img
              key={`${src}-${i}`}
              src={src}
              alt={`Page ${i + 1}`}
              loading={
                prefs.preloadPages && i < 4 ? 'eager' : i < 2 ? 'eager' : 'lazy'
              }
            onLoad={() => {
              if (!restored.current) {
                window.dispatchEvent(new Event('resize'))
              }
            }}
            />
          ))}
        </article>
      )
    }

    return (
      <div className="rok-comic-paged">
        {prefs.tapZonesEnabled ? (
          <div className="rok-comic-tap-layer" aria-hidden>
            <button
              type="button"
              className="rok-comic-tap rok-comic-tap--prev"
              onClick={() => handleTapZone('prev')}
            />
            <button
              type="button"
              className="rok-comic-tap rok-comic-tap--next"
              onClick={() => handleTapZone('next')}
            />
          </div>
        ) : null}

        <article
          className={`rok-comic rok-comic--${mode}${prefs.pageGaps ? ' rok-comic--gaps' : ''}`}
          style={{ maxWidth: scrollMaxWidth, width: '100%' }}
        >
          {visiblePages.map((src, i) => (
            <img
              key={`${src}-${pageIndex}-${i}`}
              src={src}
              alt={`Page ${pageIndex * (mode === 'double' ? 2 : 1) + i + 1}`}
              loading="eager"
            />
          ))}
        </article>

        {prefs.showPageCounter ? (
          <div className="rok-comic-page-indicator">
            {pageIndex + 1} / {totalVirtual}
          </div>
        ) : null}
      </div>
    )
  },
)
