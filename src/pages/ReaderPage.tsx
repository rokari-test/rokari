import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChapterBookmarkButton } from '../components/ChapterBookmarkButton'
import { ReportModal } from '../components/ReportModal'
import { RokComicReader, type RokComicReaderHandle } from '../components/reader/RokComicReader'
import { RokReaderShell } from '../components/reader/RokReaderShell'
import { ReaderXpToast } from '../components/reader/ReaderXpToast'
import { useReaderPreferences } from '../hooks/useReaderPreferences'
import { useUser } from '../hooks/useUser'
import { getChapter, getChapterPages } from '../data/catalog'
import { getNovelChapterText } from '../data/novels'
import { useUserSubscription } from '../hooks/useUserSubscription'
import { useChapterCoinUnlock, useChapterUnlockTick } from '../hooks/useChapterCoinUnlock'
import { useWallet } from '../hooks/useWallet'
import { getChapterAccess, formatCountdown } from '../lib/chapterAccess'
import { isEditableTarget } from '../lib/keyboardShortcuts'
import { recordChapterRead } from '../lib/loyalty'
import { loadPreferences } from '../lib/preferences'
import {
  formatReaderTabTitle,
  type ReadingMode,
} from '../lib/readerPreferences'
import {
  getReadingProgress,
  loadReaderSettings,
  saveReaderSettings,
  saveReadingProgress,
} from '../lib/storage'
import './ReaderPage.css'

const CHROME_HIDE_MS = 3500
const DOCK_PIN_KEY = 'sakura-reader-dock-pinned'

function loadDockPinned(): boolean {
  try {
    return localStorage.getItem(DOCK_PIN_KEY) === '1'
  } catch {
    return false
  }
}

export function ReaderPage() {
  const { slug, chapter: chapterParam } = useParams<{ slug: string; chapter: string }>()
  const navigate = useNavigate()
  const chapterNumber = Number(chapterParam)
  const data = useMemo(
    () => (slug && chapterNumber ? getChapter(slug, chapterNumber) : undefined),
    [slug, chapterNumber],
  )
  const { subscription, plan } = useUserSubscription()
  const unlockTick = useChapterUnlockTick(true)
  const { tryUnlock, trySubscriptionUpsell } = useChapterCoinUnlock()
  const { balance } = useWallet()
  const readerPrefs = useReaderPreferences()
  const sitePrefs = loadPreferences()

  const savedSettings = loadReaderSettings()
  const [fontSize, setFontSize] = useState(savedSettings.fontSize)
  const [readerTheme, setReaderTheme] = useState(savedSettings.theme)
  const [comicWidth, setComicWidth] = useState(
    savedSettings.comicWidth ?? readerPrefs.defaultComicWidth,
  )
  const [readingMode, setReadingMode] = useState<ReadingMode>(
    readerPrefs.defaultReadingMode,
  )
  const [controlsVisible, setControlsVisible] = useState(true)
  const [dockPinned, setDockPinned] = useState(loadDockPinned)
  const [scrollPercent, setScrollPercent] = useState(0)
  const [reportOpen, setReportOpen] = useState(false)
  const [showContinue, setShowContinue] = useState(false)
  const [xpToast, setXpToast] = useState<string | null>(null)
  const { user, isLoggedIn } = useUser()
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loyaltyAwarded = useRef<string | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const comicRef = useRef<RokComicReaderHandle>(null)

  const chapterAccess = useMemo(() => {
    if (!data) return null
    return getChapterAccess(
      data.chapter,
      data.series.chapters,
      plan?.id ?? null,
      subscription,
      { slug: data.series.slug, userId: user?.id },
    )
  }, [data, plan?.id, subscription, user?.id, unlockTick])

  const pages = useMemo(() => {
    if (!data || data.series.type !== 'manhwa') return []
    return getChapterPages(
      data.series.slug,
      data.chapter.number,
      data.chapter.pageCount,
      data.chapter.pages,
    )
  }, [data?.series.slug, data?.series.type, data?.chapter.number, data?.chapter.pageCount, data?.chapter.pages])

  const novelParagraphs = useMemo(() => {
    if (!data || data.series.type !== 'novel') return []
    return getNovelChapterText(
      data.series.title,
      data.chapter.title,
      data.chapter.number,
    )
  }, [data?.series.type, data?.series.title, data?.chapter.title, data?.chapter.number])

  const initialProgress = useMemo(() => {
    if (!slug || !chapterNumber) return 0
    const p = getReadingProgress(slug)
    if (p && p.chapterNumber === chapterNumber) return p.scrollPercent
    return 0
  }, [slug, chapterNumber])

  useEffect(() => {
    setReadingMode(readerPrefs.defaultReadingMode)
  }, [readerPrefs.defaultReadingMode, slug, chapterNumber])

  useEffect(() => {
    saveReaderSettings({ fontSize, theme: readerTheme, comicWidth })
  }, [fontSize, readerTheme, comicWidth])

  useEffect(() => {
    if (!slug || !chapterNumber) return
    loyaltyAwarded.current = null
    setShowContinue(false)
    setScrollPercent(0)
    if (readingMode === 'scroll') {
      requestAnimationFrame(() => window.scrollTo(0, 0))
    }
  }, [slug, chapterNumber, readingMode])

  useEffect(() => {
    if (!data) return
    const title = formatReaderTabTitle(readerPrefs.readerTabTitle, {
      series_title: data.series.title,
      volume_label: '',
      chapter_number: String(data.chapter.number),
      chapter_name: data.chapter.title,
    })
    document.title = title || `${data.series.title} — Ch. ${data.chapter.number}`
    return () => {
      document.title = 'Rokari — Manhwa'
    }
  }, [data?.series.title, data?.chapter.number, data?.chapter.title, readerPrefs.readerTabTitle])

  const persistProgress = useCallback(
    (percent: number) => {
      if (!slug || !chapterNumber || !data) return
      setScrollPercent(percent)
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        saveReadingProgress(
          slug,
          chapterNumber,
          data.chapter.title,
          percent,
        )
      }, 400)
    },
    [slug, chapterNumber, data?.chapter.title],
  )

  useEffect(() => {
    if (!user || !slug || !chapterNumber || scrollPercent < 90) return
    const key = `${slug}::${chapterNumber}`
    if (loyaltyAwarded.current === key) return
    loyaltyAwarded.current = key
    recordChapterRead(user.id, slug, chapterNumber)
    setXpToast('+25 XP · Chapter complete')
  }, [user, slug, chapterNumber, scrollPercent])

  const pauseChromeHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    setControlsVisible(true)
  }, [])

  const scheduleChromeHide = useCallback(() => {
    if (dockPinned) return
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setControlsVisible(false), CHROME_HIDE_MS)
  }, [dockPinned])

  const toggleDockPin = useCallback(() => {
    setDockPinned((pinned) => {
      const next = !pinned
      if (hideTimer.current) clearTimeout(hideTimer.current)
      if (next) {
        setControlsVisible(true)
      } else {
        setControlsVisible(false)
      }
      try {
        localStorage.setItem(DOCK_PIN_KEY, next ? '1' : '0')
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  const toggleChrome = useCallback(() => {
    if (dockPinned) {
      toggleDockPin()
      return
    }
    setControlsVisible((visible) => {
      if (visible) {
        if (hideTimer.current) clearTimeout(hideTimer.current)
        return false
      }
      scheduleChromeHide()
      return true
    })
  }, [dockPinned, scheduleChromeHide, toggleDockPin])

  useEffect(() => {
    setControlsVisible(true)
    if (dockPinned) {
      if (hideTimer.current) clearTimeout(hideTimer.current)
    } else {
      scheduleChromeHide()
    }
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
  }, [slug, chapterNumber, dockPinned, scheduleChromeHide])

  const goChapter = useCallback(
    (n: number) => {
      if (!slug) return
      navigate(`/read/${slug}/${n}`)
    },
    [slug, navigate],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {})
        } else {
          document.exitFullscreen().catch(() => {})
        }
      }
      if (e.key === ' ') {
        if (e.shiftKey) {
          e.preventDefault()
          toggleChrome()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleChrome])

  useEffect(() => {
    if (!data || readingMode !== 'scroll') return
    const onKey = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return
      const idx = data.series.chapters.findIndex((c) => c.number === data.chapter.number)
      const prevCh = idx > 0 ? data.series.chapters[idx - 1] : null
      const nextCh = idx < data.series.chapters.length - 1 ? data.series.chapters[idx + 1] : null
      if (e.key === 'ArrowLeft' && prevCh) {
        e.preventDefault()
        goChapter(prevCh.number)
      }
      if (e.key === 'ArrowRight' && nextCh) {
        e.preventDefault()
        goChapter(nextCh.number)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [data?.series.chapters, data?.chapter.number, goChapter, readingMode])

  if (!data) {
    return (
      <div className="reader-empty">
        <p>Chapter not found.</p>
        <Link to="/browse">Back to browse</Link>
      </div>
    )
  }

  if (chapterAccess && !chapterAccess.canRead) {
    const cd =
      chapterAccess.earlyAccessWait && chapterAccess.remainingMs > 0
        ? formatCountdown(chapterAccess.remainingMs)
        : null
    return (
      <div className="reader-empty reader-empty--locked">
        <h1>Chapter locked</h1>
        {chapterAccess.earlyAccessWait && cd ? (
          <p>
            Unlocks in <strong>{cd.value}</strong> {cd.unit} for your plan
            {plan ? ` (${plan.name})` : ''}. Upgrade for earlier access.
          </p>
        ) : (
          <p>
            Unlock this chapter for <strong>{chapterAccess.coinPrice} coins</strong> or
            browse free chapters on the series page.
          </p>
        )}
        <div className="reader-empty-actions">
          {chapterAccess.earlyAccessWait ? (
            <button
              type="button"
              className="reader-empty-btn"
              onClick={() => {
                if (!data) return
                trySubscriptionUpsell({
                  slug: data.series.slug,
                  chapter: data.chapter,
                  remainingMs: chapterAccess.remainingMs,
                  planId: plan?.id ?? null,
                  planName: plan?.name ?? 'Free',
                  contentType: data.series.type,
                })
              }}
            >
              View plans
            </button>
          ) : (
            <>
              <button
                type="button"
                className="reader-empty-btn"
                onClick={() => {
                  if (!data) return
                  tryUnlock({
                    slug: data.series.slug,
                    chapter: data.chapter,
                    allChapters: data.series.chapters,
                    planId: plan?.id ?? null,
                    subscription,
                    coinPrice: chapterAccess.coinPrice,
                  })
                }}
              >
                Unlock for {chapterAccess.coinPrice} coins
              </button>
              {balance < chapterAccess.coinPrice ? (
                <Link to="/store" className="reader-empty-btn reader-empty-btn--ghost">
                  Get coins ({balance} available)
                </Link>
              ) : null}
            </>
          )}
          <Link to={`/series/${data.series.slug}`}>Back to {data.series.title}</Link>
        </div>
      </div>
    )
  }

  const { series, chapter } = data
  const idx = series.chapters.findIndex((c) => c.number === chapter.number)
  const prev = idx > 0 ? series.chapters[idx - 1] : null
  const next = idx < series.chapters.length - 1 ? series.chapters[idx + 1] : null

  const hintHidden = sitePrefs.hideReaderHint || readerPrefs.hideReaderHint
  const useKaganeShell = series.type === 'manhwa'

  const readerBody =
    series.type === 'manhwa' ? (
      <div className={`rok-comic-shell${comicWidth === 'wide' ? ' rok-comic-shell--wide' : ''}`}>
        <RokComicReader
          ref={comicRef}
          pages={pages}
          prefs={readerPrefs}
          mode={readingMode}
          initialProgressPercent={initialProgress}
          scrollPercent={scrollPercent}
          onProgress={persistProgress}
          onNearEnd={() => setShowContinue(true)}
          onPageBoundary={(edge) => {
            if (edge === 'end' && next) setShowContinue(true)
            if (edge === 'start' && prev) goChapter(prev.number)
          }}
        />
      </div>
    ) : (
      <article className="rok-reader-novel" style={{ fontSize: `${fontSize}px` }}>
        {novelParagraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </article>
    )

  return (
    <div
      className={`rok-reader rok-reader--${readerTheme}${controlsVisible ? '' : ' rok-reader--minimal'}${useKaganeShell ? ' rok-reader--shell' : ''}`}
    >
      {useKaganeShell ? (
        <RokReaderShell
          series={series}
          chapter={chapter}
          prev={prev}
          next={next}
          readingMode={readingMode}
          onReadingMode={setReadingMode}
          readerPrefs={readerPrefs}
          scrollPercent={scrollPercent}
          controlsVisible={controlsVisible}
          dockPinned={dockPinned}
          onToggleDockPin={toggleDockPin}
          onStageClick={toggleChrome}
          onDockActivity={scheduleChromeHide}
          onKeepChromeOpen={pauseChromeHide}
          comicRef={comicRef}
          showContinue={showContinue}
          onContinue={() => next && goChapter(next.number)}
          onDismissContinue={() => setShowContinue(false)}
          readerTheme={readerTheme}
          onReaderTheme={setReaderTheme}
          comicWidth={comicWidth}
          onComicWidth={setComicWidth}
        >
          {readerBody}
        </RokReaderShell>
      ) : (
        <>
          <div
            className="rok-reader-progress"
            role="progressbar"
            aria-valuenow={Math.round(scrollPercent)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ width: `${scrollPercent}%` }} />
          </div>
          <header className={`rok-reader-bar${controlsVisible ? '' : ' rok-reader-bar--hidden'}`}>
            <Link to={`/series/${series.slug}`} className="rok-reader-back">
              ← {series.title}
            </Link>
            <div className="rok-reader-ticket">
              <span className="rok-reader-ticket-kicker">Rokari reel</span>
              <span className="rok-reader-ticket-title">
                Ch. {chapter.number} · {chapter.title}
              </span>
            </div>
            <div className="rok-reader-bar-actions">
              <ChapterBookmarkButton
                slug={series.slug}
                chapterNumber={chapter.number}
                chapterTitle={chapter.title}
                variant="reader"
              />
              <select
                aria-label="Font size"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
              >
                <option value={16}>16px</option>
                <option value={18}>18px</option>
                <option value={20}>20px</option>
                <option value={22}>22px</option>
              </select>
            </div>
          </header>
          {!hintHidden && controlsVisible && (
            <p className="rok-reader-hint">Shift+Space toggles controls · F fullscreen</p>
          )}
          {readerBody}
        </>
      )}

      {!useKaganeShell && (
        <button
          type="button"
          className="rok-reader-report-fab"
          onClick={() => {
            if (!isLoggedIn || !user) {
              navigate('/login')
              return
            }
            setReportOpen(true)
          }}
        >
          Report
        </button>
      )}

      <ReaderXpToast message={xpToast} onDone={() => setXpToast(null)} />

      {user && (
        <ReportModal
          open={reportOpen}
          onClose={() => setReportOpen(false)}
          userId={user.id}
          userName={user.displayName || user.username}
          target={{
            seriesSlug: series.slug,
            seriesTitle: series.title,
            chapterNumber: chapter.number,
            chapterTitle: chapter.title,
          }}
          lockSubject="chapter"
        />
      )}
    </div>
  )
}
