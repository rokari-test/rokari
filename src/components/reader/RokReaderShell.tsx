import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChapterBookmarkButton } from '../ChapterBookmarkButton'
import {
  loadToolbarPrefs,
  READER_TOOLBAR_EVENT,
  type ToolbarActionId,
} from '../../lib/readerToolbar'
import { saveReaderPreferences, type ReaderPreferences, type ReadingMode } from '../../lib/readerPreferences'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { useChapterComments } from '../../hooks/useChapterComments'
import { useChapterLikes } from '../../hooks/useChapterLikes'
import { useUser } from '../../hooks/useUser'
import type { RokComicReaderHandle } from './RokComicReader'
import { RokReaderDock } from './RokReaderDock'
import { RokToolbarCustomizer } from './RokToolbarCustomizer'
import { RokChapterDrawer } from './RokChapterDrawer'
import { RokCommentsDrawer } from './RokCommentsDrawer'
import { RokReaderSettingsPanel } from './RokReaderSettingsPanel'
import type { Chapter, Series } from '../../types'
import './RokReaderDock.css'
import './RokReaderOverlays.css'

type Drawer = 'none' | 'chapters' | 'comments' | 'settings' | 'toolbar'

interface RokReaderShellProps {
  series: Series
  chapter: Chapter
  prev: Chapter | null
  next: Chapter | null
  readingMode: ReadingMode
  onReadingMode: (m: ReadingMode) => void
  readerPrefs: ReaderPreferences
  scrollPercent: number
  controlsVisible: boolean
  dockPinned: boolean
  onToggleDockPin: () => void
  onStageClick: () => void
  onDockActivity: () => void
  onKeepChromeOpen: () => void
  comicRef: React.RefObject<RokComicReaderHandle | null>
  children: React.ReactNode
  showContinue?: boolean
  onContinue?: () => void
  onDismissContinue?: () => void
  readerTheme: 'dark' | 'sepia' | 'light'
  onReaderTheme: (t: 'dark' | 'sepia' | 'light') => void
  comicWidth: 'standard' | 'wide'
  onComicWidth: (w: 'standard' | 'wide') => void
}

export function RokReaderShell({
  series,
  chapter,
  prev,
  next,
  readingMode,
  onReadingMode,
  readerPrefs,
  scrollPercent,
  controlsVisible,
  dockPinned,
  onToggleDockPin,
  onStageClick,
  onDockActivity,
  onKeepChromeOpen,
  comicRef,
  children,
  showContinue,
  onContinue,
  onDismissContinue,
  readerTheme,
  onReaderTheme,
  comicWidth,
  onComicWidth,
}: RokReaderShellProps) {
  const navigate = useNavigate()
  const { user } = useUser()
  const [drawer, setDrawer] = useState<Drawer>('none')
  const [toolbarVisible, setToolbarVisible] = useState(loadToolbarPrefs)
  const [autoScrollOn, setAutoScrollOn] = useState(readerPrefs.autoScrollEnabled)
  const { count: commentCount } = useChapterComments(series.slug, chapter.number)
  const { count: chapterLikeCount, liked: chapterLiked, toggle: toggleChapterLike } = useChapterLikes(
    series.slug,
    chapter.number,
    user?.id,
  )

  useEffect(() => {
    const sync = () => setToolbarVisible(loadToolbarPrefs())
    window.addEventListener(READER_TOOLBAR_EVENT, sync)
    return () => window.removeEventListener(READER_TOOLBAR_EVENT, sync)
  }, [])

  useEffect(() => {
    setAutoScrollOn(readerPrefs.autoScrollEnabled)
  }, [readerPrefs.autoScrollEnabled, chapter.number])

  useAutoScroll(
    autoScrollOn && readingMode === 'scroll',
    readerPrefs.autoScrollSpeed,
    readerPrefs.autoScrollMode,
  )

  const pageState =
    comicRef.current?.getPageState() ?? {
      current: Math.max(
        1,
        Math.round(((scrollPercent / 100) * (chapter.pageCount || 1)) || 1),
      ),
      total: chapter.pageCount || 1,
    }

  const goChapter = useCallback(
    (n: number) => navigate(`/read/${series.slug}/${n}`),
    [navigate, series.slug],
  )

  const handleDockAction = useCallback(
    (id: ToolbarActionId) => {
      const comic = comicRef.current
      switch (id) {
        case 'jumpTop':
          comic?.jumpTop()
          break
        case 'jumpBottom':
          comic?.jumpBottom()
          break
        case 'chapters':
          setDrawer('chapters')
          break
        case 'comments':
          setDrawer('comments')
          break
        case 'settings':
          setDrawer('settings')
          break
        case 'fullscreen':
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {})
          } else {
            document.exitFullscreen().catch(() => {})
          }
          break
        case 'autoScroll': {
          const nextOn = !autoScrollOn
          setAutoScrollOn(nextOn)
          saveReaderPreferences({ autoScrollEnabled: nextOn })
          break
        }
        case 'zoomIn': {
          const key =
            readingMode === 'scroll'
              ? 'zoomScroll'
              : readingMode === 'double'
                ? 'zoomDouble'
                : 'zoomSingle'
          const cur = readerPrefs[key]
          saveReaderPreferences({ [key]: Math.min(200, cur + 10) })
          break
        }
        case 'zoomOut': {
          const key =
            readingMode === 'scroll'
              ? 'zoomScroll'
              : readingMode === 'double'
                ? 'zoomDouble'
                : 'zoomSingle'
          const cur = readerPrefs[key]
          saveReaderPreferences({ [key]: Math.max(50, cur - 10) })
          break
        }
        case 'series':
          navigate(`/series/${series.slug}`)
          break
        case 'home':
          navigate('/')
          break
        default:
          break
      }
    },
    [autoScrollOn, comicRef, navigate, readerPrefs, readingMode, series.slug],
  )

  useEffect(() => {
    if (drawer !== 'none') {
      onKeepChromeOpen()
    } else if (controlsVisible) {
      onDockActivity()
    }
  }, [drawer, controlsVisible, onKeepChromeOpen, onDockActivity])

  const handleStageClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (
      target.closest(
        '.rok-dock-wrap, .rok-drawer, .rok-overlay, .rok-reader-continue, .rok-comic-tap, button, a, input, select, textarea',
      )
    ) {
      return
    }
    onStageClick()
  }

  return (
    <>
      <div
        className="rok-reader-progress rok-reader-progress--minimal"
        role="progressbar"
        aria-valuenow={Math.round(scrollPercent)}
      >
        <span style={{ width: `${scrollPercent}%` }} />
      </div>

      <div
        className={`rok-reader-stage${controlsVisible ? '' : ' rok-reader-stage--tap'}`}
        onClick={handleStageClick}
        role="presentation"
      >
        {children}
      </div>

      {showContinue && next ? (
        <div className="rok-reader-continue rok-reader-continue--float">
          <div className="rok-reader-continue-body">
            <p className="rok-reader-continue-kicker">Next up</p>
            <strong>
              Ch. {next.number}
              {next.title ? ` · ${next.title}` : ''}
            </strong>
          </div>
          <div className="rok-reader-continue-actions">
            <button type="button" className="rok-reader-continue-skip" onClick={onDismissContinue}>
              Stay
            </button>
            <button type="button" className="rok-reader-continue-go" onClick={onContinue}>
              Continue
            </button>
          </div>
        </div>
      ) : null}

      <RokReaderDock
        visible={toolbarVisible}
        page={pageState}
        scrollPercent={scrollPercent}
        commentCount={commentCount}
        autoScrollOn={autoScrollOn}
        controlsVisible={controlsVisible}
        dockPinned={dockPinned}
        onToggleDockPin={onToggleDockPin}
        onDockActivity={onDockActivity}
        onCustomizeToolbar={() => setDrawer('toolbar')}
        onPagePrev={() => comicRef.current?.pagePrev()}
        onPageNext={() => comicRef.current?.pageNext()}
        onPageSlider={(p) => comicRef.current?.jumpToPage(p)}
        onAction={(id) => {
          if (id === 'settings') setDrawer('settings')
          else handleDockAction(id)
        }}
        bookmarkSlot={
          <ChapterBookmarkButton
            slug={series.slug}
            chapterNumber={chapter.number}
            chapterTitle={chapter.title}
            variant="icon"
          />
        }
        chapterLiked={chapterLiked}
        chapterLikeCount={chapterLikeCount}
        onToggleChapterLike={() => {
          if (!user) {
            navigate('/login')
            return
          }
          toggleChapterLike()
        }}
      />

      <RokToolbarCustomizer open={drawer === 'toolbar'} onClose={() => setDrawer('none')} />
      <RokChapterDrawer
        open={drawer === 'chapters'}
        chapters={series.chapters}
        currentNumber={chapter.number}
        seriesSlug={series.slug}
        onClose={() => setDrawer('none')}
        onSelect={goChapter}
      />
      <RokCommentsDrawer
        open={drawer === 'comments'}
        series={series}
        chapter={chapter}
        onClose={() => setDrawer('none')}
      />
      <RokReaderSettingsPanel
        open={drawer === 'settings'}
        series={series}
        chapter={chapter}
        prefs={readerPrefs}
        readingMode={readingMode}
        onReadingMode={onReadingMode}
        readerTheme={readerTheme}
        onReaderTheme={onReaderTheme}
        comicWidth={comicWidth}
        onComicWidth={onComicWidth}
        pageCurrent={pageState.current}
        pageTotal={pageState.total}
        onJumpPage={(n) => comicRef.current?.jumpToPage(n)}
        prevChapter={prev}
        nextChapter={next}
        onGoChapter={goChapter}
        onClose={() => setDrawer('none')}
        onOpenChapters={() => {
          setDrawer('chapters')
        }}
      />

    </>
  )
}
