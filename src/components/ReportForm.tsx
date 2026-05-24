import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { getAllSeries } from '../data/catalog'
import {
  submitReport,
  USER_REPORT_REASONS,
  type ReportSubject,
  type ReportType,
} from '../lib/adminReports'
import './ReportForm.css'

export interface ReportFormTarget {
  seriesSlug: string
  seriesTitle: string
  chapterNumber?: number
  chapterTitle?: string
}

interface ReportFormProps {
  userId: string
  userName: string
  initialTarget?: ReportFormTarget
  lockSubject?: ReportSubject
  onSubmitted?: () => void
  compact?: boolean
}

export function ReportForm({
  userId,
  userName,
  initialTarget,
  lockSubject,
  onSubmitted,
  compact = false,
}: ReportFormProps) {
  const catalog = useMemo(() => getAllSeries(), [])
  const [subject, setSubject] = useState<ReportSubject>(
    initialTarget?.chapterNumber != null ? 'chapter' : 'series',
  )
  const [seriesSlug, setSeriesSlug] = useState(initialTarget?.seriesSlug ?? '')
  const [chapterNumber, setChapterNumber] = useState(
    initialTarget?.chapterNumber != null ? String(initialTarget.chapterNumber) : '',
  )
  const [type, setType] = useState<ReportType>('broken')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const selectedSeries = catalog.find((s) => s.slug === seriesSlug)
  const chapters = selectedSeries?.chapters ?? []

  useEffect(() => {
    if (lockSubject) setSubject(lockSubject)
  }, [lockSubject])

  useEffect(() => {
    if (initialTarget?.seriesSlug) setSeriesSlug(initialTarget.seriesSlug)
    if (initialTarget?.chapterNumber != null) {
      setSubject('chapter')
      setChapterNumber(String(initialTarget.chapterNumber))
    }
  }, [initialTarget])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!seriesSlug || !selectedSeries) {
      setError('Pick a series to report.')
      return
    }

    const chNum = chapterNumber.trim() ? Number(chapterNumber) : undefined
    if (subject === 'chapter') {
      if (!chNum || Number.isNaN(chNum)) {
        setError('Enter a valid chapter number.')
        return
      }
      if (!chapters.some((c) => c.number === chNum)) {
        setError('That chapter is not in this series.')
        return
      }
    }

    if (note.trim().length < 12) {
      setError('Add a few more details (at least 12 characters).')
      return
    }

    const chapter = chapters.find((c) => c.number === chNum)
    submitReport({
      subject,
      type,
      note: note.trim(),
      seriesSlug: selectedSeries.slug,
      seriesTitle: selectedSeries.title,
      chapterNumber: subject === 'chapter' ? chNum : undefined,
      chapterTitle: chapter?.title,
      reporterId: userId,
      reporterName: userName,
    })

    setSuccess(true)
    setNote('')
    onSubmitted?.()
  }

  if (success) {
    return (
      <div className={`report-form-success${compact ? ' report-form-success--compact' : ''}`}>
        <div className="report-form-success-icon" aria-hidden>
          <FlagIcon />
        </div>
        <h3>Report submitted</h3>
        <p>Moderation will review it. You can track status on this page.</p>
        <button type="button" className="report-form-reset" onClick={() => setSuccess(false)}>
          Submit another
        </button>
      </div>
    )
  }

  const subjectLocked = Boolean(lockSubject)
  const seriesLocked = Boolean(initialTarget?.seriesSlug)

  return (
    <form
      className={`report-form${compact ? ' report-form--compact' : ''}`}
      onSubmit={handleSubmit}
    >
      <fieldset className="report-form-subject" disabled={subjectLocked}>
        <legend>What are you reporting?</legend>
        <div className="report-form-subject-pills">
          <button
            type="button"
            className={`report-form-pill${subject === 'series' ? ' is-active' : ''}`}
            onClick={() => setSubject('series')}
          >
            Whole series
          </button>
          <button
            type="button"
            className={`report-form-pill${subject === 'chapter' ? ' is-active' : ''}`}
            onClick={() => setSubject('chapter')}
          >
            Specific chapter
          </button>
        </div>
      </fieldset>

      <label className="report-form-field">
        <span>Series</span>
        {seriesLocked && selectedSeries ? (
          <div className="report-form-locked">{selectedSeries.title}</div>
        ) : (
          <select
            value={seriesSlug}
            onChange={(e) => {
              setSeriesSlug(e.target.value)
              setChapterNumber('')
            }}
            required
          >
            <option value="">Select a series…</option>
            {catalog.map((s) => (
              <option key={s.id} value={s.slug}>
                {s.title}
              </option>
            ))}
          </select>
        )}
      </label>

      {subject === 'chapter' && (
        <label className="report-form-field">
          <span>Chapter</span>
          {initialTarget?.chapterNumber != null ? (
            <div className="report-form-locked">
              Chapter {initialTarget.chapterNumber}
              {initialTarget.chapterTitle ? ` — ${initialTarget.chapterTitle}` : ''}
            </div>
          ) : (
            <select
              value={chapterNumber}
              onChange={(e) => setChapterNumber(e.target.value)}
              required
              disabled={!selectedSeries}
            >
              <option value="">Select chapter…</option>
              {chapters.map((ch) => (
                <option key={ch.id} value={ch.number}>
                  Ch. {ch.number}
                  {ch.title ? ` — ${ch.title}` : ''}
                </option>
              ))}
            </select>
          )}
        </label>
      )}

      <fieldset className="report-form-reasons">
        <legend>Reason</legend>
        <div className="report-form-reason-grid">
          {USER_REPORT_REASONS.map((reason) => (
            <label
              key={reason.id}
              className={`report-form-reason${type === reason.id ? ' is-active' : ''}`}
            >
              <input
                type="radio"
                name="report-reason"
                value={reason.id}
                checked={type === reason.id}
                onChange={() => setType(reason.id)}
              />
              <strong>{reason.label}</strong>
              <span>{reason.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="report-form-field report-form-field--note">
        <span>Details</span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Describe what is wrong — include chapter numbers or page issues if relevant."
          rows={compact ? 4 : 5}
          required
          minLength={12}
        />
      </label>

      {error && <p className="report-form-error">{error}</p>}

      <div className="report-form-actions">
        <button type="submit" className="report-form-submit">
          <FlagIcon />
          Submit report
        </button>
      </div>

      <p className="report-form-foot">
        False or abusive reports may lead to action on your account.{' '}
        <Link to="/settings">Community rules</Link>
      </p>
    </form>
  )
}

function FlagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4 2v20M4 4h12l-2-4 2-4H4z" />
    </svg>
  )
}
