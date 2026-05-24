import { useId, useRef, useState } from 'react'
import { processImageFile } from '../lib/imageUpload'
import { clampPercent } from '../lib/seriesBanner'
import './BannerUploadField.css'

interface BannerUploadFieldProps {
  value: string
  focalX: number
  focalY: number
  onChange: (url: string) => void
  onFocalChange: (x: number, y: number) => void
}

export function BannerUploadField({
  value,
  focalX,
  focalY,
  onChange,
  onFocalChange,
}: BannerUploadFieldProps) {
  const inputId = useId()
  const fileRef = useRef<HTMLInputElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    startX: number
    startY: number
    focalX: number
    focalY: number
  } | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  const posX = clampPercent(focalX)
  const posY = clampPercent(focalY)

  const onPickFile = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const dataUrl = await processImageFile(file, {
        maxWidth: 1280,
        maxHeight: 480,
      })
      onChange(dataUrl)
      onFocalChange(50, 50)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!value || busy) return
    e.preventDefault()
    frameRef.current?.setPointerCapture(e.pointerId)
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      focalX: posX,
      focalY: posY,
    }
    setDragging(true)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || !frameRef.current) return
    const rect = frameRef.current.getBoundingClientRect()
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    const nextX = clampPercent(
      dragRef.current.focalX - (dx / rect.width) * 100,
    )
    const nextY = clampPercent(
      dragRef.current.focalY - (dy / rect.height) * 100,
    )
    onFocalChange(nextX, nextY)
  }

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return
    dragRef.current = null
    setDragging(false)
    try {
      frameRef.current?.releasePointerCapture(e.pointerId)
    } catch {
      /* already released */
    }
  }

  return (
    <div className="admin-banner-field">
      <label htmlFor={inputId}>Banner image</label>

      <div className="admin-banner-field__toolbar">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="admin-banner-field__file"
          onChange={(e) => void onPickFile(e.target.files?.[0])}
        />
        <button
          type="button"
          className="admin-btn admin-btn--ghost admin-btn--sm"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          {busy ? 'Processing…' : 'Upload from device'}
        </button>
        {value ? (
          <>
            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--sm"
              disabled={busy}
              onClick={() => onFocalChange(50, 50)}
            >
              Center
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--sm"
              disabled={busy}
              onClick={() => {
                onChange('')
                onFocalChange(50, 50)
              }}
            >
              Clear
            </button>
          </>
        ) : null}
      </div>

      {value ? (
        <div
          ref={frameRef}
          className={`admin-banner-field__frame${dragging ? ' admin-banner-field__frame--drag' : ''}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          role="img"
          aria-label="Banner preview — drag to reposition"
        >
          <img
            src={value}
            alt=""
            draggable={false}
            style={{ objectPosition: `${posX}% ${posY}%` }}
          />
          <span className="admin-banner-field__hint-overlay">
            Drag to adjust position
          </span>
        </div>
      ) : (
        <div className="admin-banner-field__placeholder">
          <span>No banner yet</span>
        </div>
      )}

      <input
        id={inputId}
        className="admin-input"
        value={value.startsWith('data:') ? '' : value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          value.startsWith('data:') ? 'Uploaded image saved' : 'https://...'
        }
        readOnly={value.startsWith('data:')}
      />

      {value ? (
        <p className="admin-banner-field__coords">
          Position: {Math.round(posX)}% · {Math.round(posY)}%
        </p>
      ) : null}

      {value.startsWith('data:') ? (
        <p className="admin-banner-field__note">
          Image stored from your device. Drag the preview to choose the visible area.
        </p>
      ) : null}

      {error ? <p className="admin-banner-field__error">{error}</p> : null}
    </div>
  )
}
