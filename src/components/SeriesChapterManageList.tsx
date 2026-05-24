import { useState, type FormEvent } from 'react'
import { formatChapterTimeAgo } from '../lib/chapterDisplay'
import { getChapterAccess } from '../lib/chapterAccess'
import { useUserSubscription } from '../hooks/useUserSubscription'
import {
  defaultChapterTitle,
  formFromChapter,
  parseUnlockPreset,
  permanentlyDeleteChapter,
  restoreChapter,
  saveChapterFromForm,
  trashChapter,
  type ChapterManageForm,
} from '../lib/chapterManage'
import type { Chapter, Series } from '../types'
import './SeriesChapterManageList.css'

interface SeriesChapterManageListProps {
  series: Series
  chapters: Chapter[]
  showTrash?: boolean
}

export function SeriesChapterManageList({
  series,
  chapters,
  showTrash = false,
}: SeriesChapterManageListProps) {
  const [openId, setOpenId] = useState<string | null>(null)

  if (chapters.length === 0) {
    return (
      <p className="series-manage-empty">
        {showTrash ? 'Trash is empty.' : 'No chapters to manage.'}
      </p>
    )
  }

  return (
    <ul className="series-manage-list">
      {chapters.map((ch) => (
        <SeriesChapterManageItem
          key={ch.id}
          series={series}
          chapter={ch}
          isOpen={openId === ch.id}
          onToggle={() => setOpenId((id) => (id === ch.id ? null : ch.id))}
          onClose={() => setOpenId(null)}
          showTrash={showTrash}
        />
      ))}
    </ul>
  )
}

function SeriesChapterManageItem({
  series,
  chapter,
  isOpen,
  onToggle,
  onClose,
  showTrash,
}: {
  series: Series
  chapter: Chapter
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
  showTrash: boolean
}) {
  const [form, setForm] = useState<ChapterManageForm>(() =>
    formFromChapter(chapter, series.type),
  )
  const [savedFlash, setSavedFlash] = useState(false)
  const { subscription, plan } = useUserSubscription()

  const time = formatChapterTimeAgo(chapter.updatedAt)
  const label = defaultChapterTitle(series.type, chapter.number)
  const access = getChapterAccess(
    chapter,
    series.chapters,
    plan?.id ?? null,
    subscription,
  )
  const locked = access.locked && !showTrash

  const syncForm = () => setForm(formFromChapter(chapter, series.type))

  const handleSave = (e: FormEvent) => {
    e.preventDefault()
    saveChapterFromForm(series.id, chapter, form)
    setSavedFlash(true)
    window.setTimeout(() => setSavedFlash(false), 2000)
    onClose()
  }

  const handleTrash = () => {
    if (!confirm(`Move "${chapter.title}" to trash?`)) return
    trashChapter(series.id, chapter.id)
    onClose()
  }

  const handleRestore = () => {
    restoreChapter(series.id, chapter.id)
    onClose()
  }

  const handleDelete = () => {
    if (!confirm(`Permanently delete "${chapter.title}"? This cannot be undone.`)) {
      return
    }
    permanentlyDeleteChapter(series.id, chapter.id)
    onClose()
  }

  return (
    <li className={`series-manage-item${isOpen ? ' series-manage-item--open' : ''}`}>
      <div className="series-manage-head">
        <div className="series-manage-head-main">
          <span className="series-manage-ch-label">{label}</span>
          {!showTrash && (
            <span
              className={`series-manage-lock${locked ? ' series-manage-lock--locked' : ''}`}
              title={locked ? 'Coin unlock required' : 'Free / default access'}
              aria-label={locked ? 'Locked' : 'Unlocked'}
            >
              <LockIcon locked={locked} />
            </span>
          )}
        </div>
        <div className="series-manage-head-meta">
          <span className="series-manage-comments" title="Comments">
            <CommentIcon />
            <span>0</span>
          </span>
          <span className="series-manage-time">
            {time.when} {time.label}
          </span>
          <button
            type="button"
            className="series-manage-toggle"
            onClick={() => {
              if (!isOpen) syncForm()
              onToggle()
            }}
          >
            {isOpen ? 'Close' : 'Manage'}
          </button>
        </div>
      </div>

      {isOpen && (
        <form className="series-manage-form" onSubmit={handleSave}>
          <div className="series-manage-form-grid">
            <label className="series-manage-field">
              <span>Chapter number</span>
              <input
                type="number"
                min={1}
                step={1}
                value={form.number}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    number: Math.max(1, Number(e.target.value) || 1),
                  }))
                }
              />
            </label>
            <label className="series-manage-field series-manage-field--wide">
              <span>Chapter title</span>
              <input
                type="text"
                placeholder="Enter chapter title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </label>
          </div>

          <div className="series-manage-unlock-row">
            <label className="series-manage-field series-manage-field--cost">
              <span>Unlock cost</span>
              <select
                value={form.unlockPreset}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    unlockPreset: parseUnlockPreset(e.target.value),
                  }))
                }
              >
                <option value="default">Default (site formula)</option>
                <option value={0}>Free</option>
                <option value={10}>10 coins</option>
                <option value={50}>50 coins</option>
                <option value={100}>100 coins</option>
                <option value="custom">Custom amount…</option>
              </select>
            </label>
            {form.unlockPreset === 'custom' && (
              <label className="series-manage-field series-manage-field--custom">
                <span>Custom coins</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  placeholder="Enter amount"
                  value={form.customUnlockCost}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      customUnlockCost: Math.max(0, Number(e.target.value) || 0),
                    }))
                  }
                />
              </label>
            )}
          </div>

          <label className="series-manage-field series-manage-field--wide">
            <span>Page URLs (one per line, optional)</span>
            <textarea
              rows={3}
              placeholder="https://…"
              value={form.pagesText}
              onChange={(e) => setForm((f) => ({ ...f, pagesText: e.target.value }))}
            />
          </label>

          <div className="series-manage-actions">
            <button type="submit" className="series-manage-btn series-manage-btn--save">
              {savedFlash ? 'Saved!' : 'Save changes'}
            </button>
            {showTrash ? (
              <button
                type="button"
                className="series-manage-btn series-manage-btn--restore"
                onClick={handleRestore}
              >
                Restore from trash
              </button>
            ) : (
              <button
                type="button"
                className="series-manage-btn series-manage-btn--trash"
                onClick={handleTrash}
              >
                Move to trash
              </button>
            )}
            <button
              type="button"
              className="series-manage-btn series-manage-btn--delete"
              onClick={handleDelete}
            >
              Delete permanently
            </button>
          </div>
        </form>
      )}
    </li>
  )
}

function LockIcon({ locked }: { locked: boolean }) {
  if (locked) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2a5 5 0 00-5 5v3H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V12a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zm-3 8V7a3 3 0 116 0v3H9z" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a5 5 0 00-5 5v2H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V11a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zm-3 7V7a3 3 0 116 0v2H9z" />
    </svg>
  )
}

function CommentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M21 15a2 2 0 01-2 2H8l-5 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  )
}
