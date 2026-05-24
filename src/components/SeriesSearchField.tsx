import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { suggestSeries } from '../lib/seriesSearch'
import { getSourceColor } from '../lib/sources'
import type { Series } from '../types'
import './SeriesSearchField.css'

interface SeriesSearchFieldProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  variant?: 'header' | 'browse' | 'mobile'
  placeholder?: string
  inputId?: string
  showButton?: boolean
  buttonLabel?: string
}

export function SeriesSearchField({
  value,
  onChange,
  onSubmit,
  variant = 'browse',
  placeholder = 'Search series...',
  inputId,
  showButton = variant === 'browse',
  buttonLabel = 'Search',
}: SeriesSearchFieldProps) {
  const listId = useId()
  const navigate = useNavigate()
  const wrapRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const suggestions = useMemo(
    () => (value.trim().length >= 1 ? suggestSeries(value, 6) : []),
    [value],
  )

  const showList = open && value.trim().length >= 1 && suggestions.length > 0

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  useEffect(() => {
    setActiveIndex(-1)
  }, [value, suggestions.length])

  const rememberSeries = (series: Series) => {
    onChange(series.title)
    setOpen(false)
  }

  const openSeries = (series: Series) => {
    rememberSeries(series)
    navigate(`/series/${series.slug}`)
  }

  const submit = (e?: FormEvent) => {
    e?.preventDefault()
    onSubmit(value.trim())
    setOpen(false)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showList) {
      if (e.key === 'ArrowDown' && suggestions.length > 0) {
        e.preventDefault()
        setOpen(true)
        setActiveIndex(0)
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      openSeries(suggestions[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  const SearchIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20L17 17" />
    </svg>
  )

  return (
    <div
      ref={wrapRef}
      className={`series-search series-search--${variant}${showList ? ' is-open' : ''}`}
    >
      <form className="series-search-form" onSubmit={submit}>
        <div className="series-search-input-wrap">
          <SearchIcon />
          <input
            id={inputId}
            type="search"
            value={value}
            onChange={(e) => {
              onChange(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            aria-label={placeholder}
            aria-expanded={showList}
            aria-controls={showList ? listId : undefined}
            aria-autocomplete="list"
            role="combobox"
            autoComplete="off"
          />
        </div>
        {showButton ? (
          <button type="submit" className="series-search-btn">
            <SearchIcon />
            {buttonLabel}
          </button>
        ) : null}
      </form>

      {showList ? (
        <ul id={listId} className="series-search-suggest" role="listbox">
          {suggestions.map((series, index) => (
            <li key={series.id} role="option" aria-selected={index === activeIndex}>
              <Link
                to={`/series/${series.slug}`}
                className={`series-search-suggest-row${index === activeIndex ? ' is-active' : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => rememberSeries(series)}
              >
                <span className="series-search-suggest-cover">
                  {series.coverUrl ? (
                    <img src={series.coverUrl} alt="" />
                  ) : (
                    <span>{series.title.charAt(0)}</span>
                  )}
                </span>
                <span className="series-search-suggest-copy">
                  <strong>{highlightMatch(series.title, value)}</strong>
                  {series.source ? (
                    <span className="series-search-suggest-source">
                      <span
                        className="series-search-suggest-source-dot"
                        style={{ backgroundColor: getSourceColor(series.source) }}
                        aria-hidden
                      />
                      {series.source}
                    </span>
                  ) : null}
                </span>
              </Link>
              <Link to={`/series/${series.slug}`} className="series-search-suggest-open" onClick={() => rememberSeries(series)}>
                Open
              </Link>
            </li>
          ))}
          <li className="series-search-suggest-foot">
            <button type="button" onClick={() => submit()}>
              Search for &ldquo;{value.trim()}&rdquo;
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  )
}

function highlightMatch(title: string, query: string) {
  const q = query.trim()
  if (!q) return title

  const lowerTitle = title.toLowerCase()
  const lowerQ = q.toLowerCase()
  const direct = lowerTitle.indexOf(lowerQ)
  if (direct >= 0) {
    return (
      <>
        {title.slice(0, direct)}
        <mark>{title.slice(direct, direct + q.length)}</mark>
        {title.slice(direct + q.length)}
      </>
    )
  }

  const parts: ReactNode[] = []
  let titleIdx = 0
  let queryIdx = 0
  let buffer = ''

  while (titleIdx < title.length && queryIdx < lowerQ.length) {
    const c = title[titleIdx]
    if (c.toLowerCase() === lowerQ[queryIdx]) {
      if (buffer) {
        parts.push(buffer)
        buffer = ''
      }
      parts.push(<mark key={`${titleIdx}-${queryIdx}`}>{c}</mark>)
      queryIdx += 1
    } else {
      buffer += c
    }
    titleIdx += 1
  }

  if (buffer) parts.push(buffer)
  if (titleIdx < title.length) parts.push(title.slice(titleIdx))
  return parts.length ? <>{parts}</> : title
}
