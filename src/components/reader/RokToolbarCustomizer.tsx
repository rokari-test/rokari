import { useEffect, useState } from 'react'
import {
  TOOLBAR_ACTIONS,
  loadToolbarPrefs,
  saveToolbarPrefs,
  type ToolbarActionId,
} from '../../lib/readerToolbar'
import './RokReaderOverlays.css'

interface RokToolbarCustomizerProps {
  open: boolean
  onClose: () => void
}

export function RokToolbarCustomizer({ open, onClose }: RokToolbarCustomizerProps) {
  const [visible, setVisible] = useState<ToolbarActionId[]>(() => loadToolbarPrefs())

  useEffect(() => {
    if (open) setVisible(loadToolbarPrefs())
  }, [open])

  if (!open) return null

  const toggle = (id: ToolbarActionId) => {
    setVisible((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      saveToolbarPrefs(next)
      return next
    })
  }

  const items = TOOLBAR_ACTIONS.filter((a) => a.id !== 'zoomIn' && a.id !== 'zoomOut')

  return (
    <>
      <div className="rok-sheet-backdrop" onClick={onClose} aria-hidden />
      <div
        className="rok-sheet rok-sheet--popup"
        role="dialog"
        aria-labelledby="rok-toolbar-title"
      >
        <div className="rok-sheet-grab" aria-hidden />
        <header className="rok-sheet-head">
          <div>
            <p className="rok-sheet-kicker">Reel dock</p>
            <h2 id="rok-toolbar-title">Shortcuts</h2>
          </div>
          <button type="button" className="rok-sheet-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <div className="rok-toolbar-grid">
          {items.map((a) => {
            const on = visible.includes(a.id)
            return (
              <button
                key={a.id}
                type="button"
                className={`rok-toolbar-chip${on ? ' is-on' : ''}`}
                aria-pressed={on}
                onClick={() => toggle(a.id)}
              >
                <span>{a.label}</span>
                <span className={`rok-chip-dot${on ? ' is-on' : ''}`} aria-hidden />
              </button>
            )
          })}
        </div>
        <p className="rok-sheet-note">Tap to show or hide in the dock bar.</p>
      </div>
    </>
  )
}
