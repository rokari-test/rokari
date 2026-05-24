import { Link } from 'react-router-dom'
import type { ToolbarActionId } from '../../lib/readerToolbar'
import { isToolbarActionVisible } from '../../lib/readerToolbar'
import {
  IconBook,
  IconChat,
  IconChevDown,
  IconChevLeft,
  IconChevRight,
  IconChevUp,
  IconFullscreen,
  IconHeart,
  IconHome,
  IconLayout,
  IconList,
  IconPause,
  IconPin,
  IconPinOff,
  IconPlay,
  IconSettings,
  IconZoomIn,
  IconZoomOut,
} from './ReaderDockIcons'
import './RokReaderDock.css'

export interface DockPageState {
  current: number
  total: number
}

interface RokReaderDockProps {
  visible: ToolbarActionId[]
  page: DockPageState
  scrollPercent: number
  commentCount: number
  autoScrollOn: boolean
  controlsVisible: boolean
  dockPinned: boolean
  onToggleDockPin: () => void
  onDockActivity: () => void
  onCustomizeToolbar: () => void
  onPagePrev: () => void
  onPageNext: () => void
  onPageSlider: (page: number) => void
  onAction: (id: ToolbarActionId) => void
  bookmarkSlot?: React.ReactNode
  chapterLiked: boolean
  chapterLikeCount: number
  onToggleChapterLike: () => void
}

function ToolBtn({
  label,
  active,
  badge,
  indicatorDot,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  badge?: number
  indicatorDot?: boolean
  onClick?: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      className={`rok-dock-tool${active ? ' is-active' : ''}`}
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {children}
      {indicatorDot ? <span className="rok-dock-dot" aria-hidden /> : null}
      {badge != null && badge > 0 ? (
        <span className="rok-dock-badge">{badge > 99 ? '99+' : badge}</span>
      ) : null}
    </button>
  )
}

export function RokReaderDock({
  visible,
  page,
  scrollPercent,
  commentCount,
  autoScrollOn,
  controlsVisible,
  dockPinned,
  onToggleDockPin,
  onDockActivity,
  onCustomizeToolbar,
  onPagePrev,
  onPageNext,
  onPageSlider,
  onAction,
  bookmarkSlot,
  chapterLiked,
  chapterLikeCount,
  onToggleChapterLike,
}: RokReaderDockProps) {
  const show = (id: ToolbarActionId) => isToolbarActionVisible(visible, id)
  const maxVal = Math.max(1, page.total || 100)
  const sliderVal = page.total > 0 ? page.current : Math.round(scrollPercent)
  const clampedVal = Math.min(Math.max(1, sliderVal), maxVal)
  const pct = Math.round(scrollPercent)
  const fillPct = page.total > 0 ? (clampedVal / maxVal) * 100 : pct
  const dockShown = controlsVisible || dockPinned

  return (
    <div
      className={`rok-dock-wrap${dockShown ? ' is-visible' : ''}${dockPinned ? ' is-pinned' : ''}`}
      role="toolbar"
      aria-label="Reader controls"
      onMouseEnter={onDockActivity}
      onFocusCapture={onDockActivity}
    >
      <nav className="rok-dock">
        <div className="rok-dock-nav">
          <button type="button" className="rok-dock-nav-btn" aria-label="Previous page" onClick={onPagePrev}>
            <IconChevLeft size={15} />
          </button>
          <div className="rok-dock-track">
            <span className="rok-dock-track-fill" style={{ width: `${fillPct}%` }} aria-hidden />
            <input
              type="range"
              min={1}
              max={maxVal}
              value={clampedVal}
              onChange={(e) => onPageSlider(Number(e.target.value))}
              aria-label="Page position"
              className="rok-dock-track-input"
            />
          </div>
          <div className="rok-dock-meta">
            <strong>
              {page.current || 1}/{page.total || '—'}
            </strong>
            <span>{pct}%</span>
          </div>
          <button type="button" className="rok-dock-nav-btn" aria-label="Next page" onClick={onPageNext}>
            <IconChevRight size={15} />
          </button>
        </div>

        <span className="rok-dock-sep" aria-hidden />

        <div className="rok-dock-tools">
          <ToolBtn label="Customize dock" onClick={onCustomizeToolbar}>
            <IconLayout size={16} />
          </ToolBtn>
          {show('jumpTop') && (
            <ToolBtn label="Top" onClick={() => onAction('jumpTop')}>
              <IconChevUp size={16} />
            </ToolBtn>
          )}
          {show('jumpBottom') && (
            <ToolBtn label="Bottom" onClick={() => onAction('jumpBottom')}>
              <IconChevDown size={16} />
            </ToolBtn>
          )}
          {show('chapters') && (
            <ToolBtn label="Chapters" onClick={() => onAction('chapters')}>
              <IconList size={16} />
            </ToolBtn>
          )}
          {show('comments') && (
            <ToolBtn
              label="Comments"
              indicatorDot
              badge={commentCount}
              onClick={() => onAction('comments')}
            >
              <IconChat size={16} />
            </ToolBtn>
          )}
          {show('zoomOut') && (
            <ToolBtn label="Zoom out" onClick={() => onAction('zoomOut')}>
              <IconZoomOut size={16} />
            </ToolBtn>
          )}
          {show('zoomIn') && (
            <ToolBtn label="Zoom in" onClick={() => onAction('zoomIn')}>
              <IconZoomIn size={16} />
            </ToolBtn>
          )}
          {show('autoScroll') && (
            <ToolBtn label="Auto-scroll" active={autoScrollOn} onClick={() => onAction('autoScroll')}>
              {autoScrollOn ? <IconPause size={16} /> : <IconPlay size={16} />}
            </ToolBtn>
          )}
          {show('bookmark') && bookmarkSlot ? (
            <div className="rok-dock-bookmark">{bookmarkSlot}</div>
          ) : null}
          {show('fullscreen') && (
            <ToolBtn label="Fullscreen" onClick={() => onAction('fullscreen')}>
              <IconFullscreen size={16} />
            </ToolBtn>
          )}
          {show('settings') && (
            <ToolBtn label="Settings" onClick={() => onAction('settings')}>
              <IconSettings size={16} />
            </ToolBtn>
          )}
          {show('series') && (
            <ToolBtn label="Series" onClick={() => onAction('series')}>
              <IconBook size={16} />
            </ToolBtn>
          )}
          {show('home') && (
            <Link to="/" className="rok-dock-tool rok-dock-tool--link" aria-label="Home" title="Home">
              <IconHome size={16} />
            </Link>
          )}
        </div>

        <button
          type="button"
          className={`rok-dock-like${chapterLiked ? ' is-liked' : ''}`}
          aria-label={chapterLiked ? 'Unlike chapter' : 'Like chapter'}
          aria-pressed={chapterLiked}
          title={chapterLiked ? 'Unlike chapter' : 'Like this chapter'}
          onClick={onToggleChapterLike}
        >
          <IconHeart size={16} filled={chapterLiked} />
          {chapterLikeCount > 0 ? (
            <span className="rok-dock-like-count">{chapterLikeCount > 99 ? '99+' : chapterLikeCount}</span>
          ) : null}
        </button>

        <button
          type="button"
          className={`rok-dock-pin${dockPinned ? ' is-pinned' : ''}`}
          aria-label={dockPinned ? 'Unpin dock' : 'Pin dock'}
          aria-pressed={dockPinned}
          onClick={onToggleDockPin}
        >
          {dockPinned ? <IconPinOff size={15} /> : <IconPin size={15} />}
        </button>
      </nav>
    </div>
  )
}
