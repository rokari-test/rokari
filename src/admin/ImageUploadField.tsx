import { useId, useRef, useState } from 'react'
import { processImageFile } from '../lib/imageUpload'
import './ImageUploadField.css'

interface ImageUploadFieldProps {
  label: string
  value: string
  onChange: (url: string) => void
  maxWidth?: number
  maxHeight?: number
  previewRatio?: string
  urlPlaceholder?: string
}

export function ImageUploadField({
  label,
  value,
  onChange,
  maxWidth = 800,
  maxHeight = 1200,
  previewRatio = '5 / 7',
  urlPlaceholder = 'https://... or upload from device',
}: ImageUploadFieldProps) {
  const inputId = useId()
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onPickFile = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const dataUrl = await processImageFile(file, { maxWidth, maxHeight })
      onChange(dataUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="admin-image-field">
      <label htmlFor={inputId}>{label}</label>

      <div className="admin-image-field__toolbar">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="admin-image-field__file"
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
          <button
            type="button"
            className="admin-btn admin-btn--ghost admin-btn--sm"
            disabled={busy}
            onClick={() => onChange('')}
          >
            Clear
          </button>
        ) : null}
      </div>

      {value ? (
        <div
          className="admin-image-field__preview"
          style={{ aspectRatio: previewRatio }}
        >
          <img src={value} alt="" />
        </div>
      ) : (
        <div
          className="admin-image-field__placeholder"
          style={{ aspectRatio: previewRatio }}
        >
          <span>No image yet</span>
        </div>
      )}

      <input
        id={inputId}
        className="admin-input"
        value={value.startsWith('data:') ? '' : value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={value.startsWith('data:') ? 'Uploaded image saved' : urlPlaceholder}
        readOnly={value.startsWith('data:')}
      />
      {value.startsWith('data:') ? (
        <p className="admin-image-field__hint">
          Image stored from your device. Use Clear to remove or upload again.
        </p>
      ) : null}
      {error ? <p className="admin-image-field__error">{error}</p> : null}
    </div>
  )
}
