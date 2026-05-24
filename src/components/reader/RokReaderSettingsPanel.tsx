import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  saveReaderPreferences,
  type ReaderPreferences,
  type ReadingMode,
} from '../../lib/readerPreferences'
import type { Chapter, Series } from '../../types'
import './RokReaderOverlays.css'

type SettingsTab = 'main' | 'style' | 'perf' | 'navigate'

type ReaderTheme = 'dark' | 'sepia' | 'light'

interface RokReaderSettingsPanelProps {
  open: boolean
  series: Series
  chapter: Chapter
  prefs: ReaderPreferences
  readingMode: ReadingMode
  onReadingMode: (m: ReadingMode) => void
  readerTheme: ReaderTheme
  onReaderTheme: (t: ReaderTheme) => void
  comicWidth: 'standard' | 'wide'
  onComicWidth: (w: 'standard' | 'wide') => void
  pageCurrent: number
  pageTotal: number
  onJumpPage: (n: number) => void
  prevChapter: Chapter | null
  nextChapter: Chapter | null
  onGoChapter: (n: number) => void
  onClose: () => void
  onOpenChapters: () => void
}

function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      className={`rok-toggle${on ? ' is-on' : ''}`}
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
    >
      <span />
    </button>
  )
}

export function RokReaderSettingsPanel({
  open,
  series,
  chapter,
  prefs,
  readingMode,
  onReadingMode,
  readerTheme,
  onReaderTheme,
  comicWidth,
  onComicWidth,
  pageCurrent,
  pageTotal,
  onJumpPage,
  prevChapter,
  nextChapter,
  onGoChapter,
  onClose,
  onOpenChapters,
}: RokReaderSettingsPanelProps) {
  const [tab, setTab] = useState<SettingsTab>('main')
  const [pageInput, setPageInput] = useState(String(pageCurrent))

  if (!open) return null

  const patch = (p: Partial<ReaderPreferences>) => saveReaderPreferences(p)

  const zoomKey =
    readingMode === 'scroll'
      ? 'zoomScroll'
      : readingMode === 'double'
        ? 'zoomDouble'
        : 'zoomSingle'
  const zoomVal = prefs[zoomKey]

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'main', label: 'Main' },
    { id: 'style', label: 'Style' },
    { id: 'perf', label: 'Perf' },
    { id: 'navigate', label: 'Navigate' },
  ]

  return (
    <>
      <div className="rok-sheet-backdrop" onClick={onClose} aria-hidden />
      <aside className="rok-sheet rok-sheet--settings" aria-label="Reader settings">
        <div className="rok-sheet-grab" aria-hidden />
        <header className="rok-sheet-head">
          <div>
            <p className="rok-sheet-kicker">{series.title}</p>
            <h2>
              Ch. {chapter.number} · {chapter.title}
            </h2>
          </div>
          <button type="button" className="rok-sheet-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <nav className="rok-sheet-tabs" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`rok-sheet-tab${tab === t.id ? ' is-active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="rok-sheet-body">
          {tab === 'main' && (
            <>
              <section>
                <h3>Reading mode</h3>
                <div className="rok-mode-pills">
                  {(['scroll', 'single', 'double'] as ReadingMode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={readingMode === m ? 'is-active' : ''}
                      onClick={() => onReadingMode(m)}
                    >
                      {m === 'scroll' ? 'Flow' : m === 'single' ? 'Single' : 'Spread'}
                    </button>
                  ))}
                </div>
              </section>
              <section>
                <div className="rok-settings-row">
                  <span>Zoom</span>
                  <strong>{zoomVal}%</strong>
                </div>
                <input
                  type="range"
                  min={50}
                  max={200}
                  value={zoomVal}
                  onChange={(e) => patch({ [zoomKey]: Number(e.target.value) })}
                />
              </section>
              <section className="rok-settings-row">
                <div>
                  <span>Auto-scroll</span>
                  <small>Automatically scroll down</small>
                </div>
                <Toggle
                  label="Auto-scroll"
                  on={prefs.autoScrollEnabled}
                  onChange={(v) => patch({ autoScrollEnabled: v })}
                />
              </section>
              {prefs.autoScrollEnabled && (
                <>
                  <div className="rok-segment">
                    <button
                      type="button"
                      className={prefs.autoScrollMode === 'smooth' ? 'is-active' : ''}
                      onClick={() => patch({ autoScrollMode: 'smooth' })}
                    >
                      Smooth
                    </button>
                    <button
                      type="button"
                      className={prefs.autoScrollMode === 'page' ? 'is-active' : ''}
                      onClick={() => patch({ autoScrollMode: 'page' })}
                    >
                      Page jump
                    </button>
                  </div>
                  <section>
                    <div className="rok-settings-row">
                      <span>Speed</span>
                      <strong>{prefs.autoScrollSpeed} px/s</strong>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={1000}
                      step={10}
                      value={prefs.autoScrollSpeed}
                      onChange={(e) =>
                        patch({ autoScrollSpeed: Number(e.target.value) })
                      }
                    />
                  </section>
                </>
              )}
              <section className="rok-settings-row">
                <div>
                  <span>Tap zones</span>
                  <small>Tap sides to turn pages (paged modes)</small>
                </div>
                <Toggle
                  label="Tap zones"
                  on={prefs.tapZonesEnabled}
                  onChange={(v) => patch({ tapZonesEnabled: v })}
                />
              </section>
              <section className="rok-settings-row">
                <div>
                  <span>Page gaps</span>
                </div>
                <Toggle
                  label="Page gaps"
                  on={prefs.pageGaps}
                  onChange={(v) => patch({ pageGaps: v })}
                />
              </section>
            </>
          )}

          {tab === 'style' && (
            <>
              <section>
                <h3>Reel theme</h3>
                <div className="rok-mode-pills">
                  {(['dark', 'sepia', 'light'] as ReaderTheme[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={readerTheme === t ? 'is-active' : ''}
                      onClick={() => onReaderTheme(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </section>
              <section>
                <h3>Strip width</h3>
                <div className="rok-mode-pills">
                  <button
                    type="button"
                    className={comicWidth === 'standard' ? 'is-active' : ''}
                    onClick={() => onComicWidth('standard')}
                  >
                    Standard
                  </button>
                  <button
                    type="button"
                    className={comicWidth === 'wide' ? 'is-active' : ''}
                    onClick={() => onComicWidth('wide')}
                  >
                    Wide
                  </button>
                </div>
              </section>
              <section className="rok-settings-row">
                <div>
                  <span>Page counter</span>
                </div>
                <Toggle
                  label="Page counter"
                  on={prefs.showPageCounter}
                  onChange={(v) => patch({ showPageCounter: v })}
                />
              </section>
              <section>
                <div className="rok-settings-row">
                  <span>Max strip width</span>
                  <strong>{prefs.maxStripWidth ?? 'No limit'}</strong>
                </div>
                <input
                  type="range"
                  min={320}
                  max={1200}
                  step={20}
                  value={prefs.maxStripWidth ?? 1200}
                  onChange={(e) => {
                    const v = Number(e.target.value)
                    patch({ maxStripWidth: v >= 1180 ? null : v })
                  }}
                />
              </section>
              <section className="rok-settings-row">
                <div>
                  <span>Hide reader hint</span>
                </div>
                <Toggle
                  label="Hide hint"
                  on={prefs.hideReaderHint}
                  onChange={(v) => patch({ hideReaderHint: v })}
                />
              </section>
            </>
          )}

          {tab === 'perf' && (
            <>
              <section className="rok-settings-row">
                <div>
                  <span>Preload pages</span>
                  <small>Load upcoming images early</small>
                </div>
                <Toggle
                  label="Preload"
                  on={prefs.preloadPages}
                  onChange={(v) => patch({ preloadPages: v })}
                />
              </section>
              <section className="rok-perf-stat">
                <span>Loaded pages</span>
                <strong>
                  {pageTotal} / {pageTotal}
                </strong>
                <div className="rok-perf-bar">
                  <span style={{ width: '100%' }} />
                </div>
              </section>
            </>
          )}

          {tab === 'navigate' && (
            <>
              <div className="rok-nav-presets">
                {prevChapter ? (
                  <button type="button" onClick={() => onGoChapter(prevChapter.number)}>
                    ← Prev: {prevChapter.title}
                  </button>
                ) : null}
                {nextChapter ? (
                  <button
                    type="button"
                    className="is-primary"
                    onClick={() => onGoChapter(nextChapter.number)}
                  >
                    Next: {nextChapter.title} →
                  </button>
                ) : null}
                <button type="button" onClick={onOpenChapters}>
                  All chapters ({series.chapters.length})
                </button>
                <Link to={`/series/${series.slug}`} onClick={onClose}>
                  ← Back to series
                </Link>
              </div>
              <section>
                <h3>Page</h3>
                <div className="rok-page-jump">
                  <button type="button" onClick={() => onJumpPage(1)}>
                    Top
                  </button>
                  <div className="rok-page-jump-input">
                    <button
                      type="button"
                      onClick={() => onJumpPage(Math.max(1, pageCurrent - 1))}
                    >
                      ‹
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={pageTotal}
                      value={pageInput}
                      onChange={(e) => setPageInput(e.target.value)}
                      onBlur={() => {
                        const n = Number(pageInput)
                        if (n >= 1 && n <= pageTotal) onJumpPage(n)
                        else setPageInput(String(pageCurrent))
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => onJumpPage(Math.min(pageTotal, pageCurrent + 1))}
                    >
                      ›
                    </button>
                  </div>
                  <button type="button" onClick={() => onJumpPage(pageTotal)}>
                    Bottom
                  </button>
                </div>
              </section>
            </>
          )}
        </div>
      </aside>
    </>
  )
}
