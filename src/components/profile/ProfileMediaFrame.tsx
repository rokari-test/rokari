import { useEffect, useRef, useState, type PointerEvent, type WheelEvent } from 'react'
import {
  getUserMedia,
  updateUserMediaTransform,
  USER_MEDIA_EVENT,
  type UserMediaItem,
} from '../../lib/userMedia'
import './ProfileMediaFrame.css'

interface ProfileMediaFrameProps {
  mediaId: string
  variant: 'avatar' | 'banner'
  editable?: boolean
}

function clampPercent(n: number): number {
  if (!Number.isFinite(n)) return 50
  return Math.min(100, Math.max(0, n))
}

function clampZoom(n: number): number {
  if (!Number.isFinite(n)) return 100
  return Math.min(220, Math.max(100, n))
}

export function ProfileMediaFrame({ mediaId, variant, editable = false }: ProfileMediaFrameProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ startX: number; startY: number; focalX: number; focalY: number } | null>(null)
  const [media, setMedia] = useState<UserMediaItem | null>(() => getUserMedia(mediaId))
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    const sync = () => setMedia(getUserMedia(mediaId))
    sync()
    window.addEventListener(USER_MEDIA_EVENT, sync)
    return () => window.removeEventListener(USER_MEDIA_EVENT, sync)
  }, [mediaId])

  if (!media) return null

  const posX = clampPercent(media.focalX)
  const posY = clampPercent(media.focalY)
  const scale = clampZoom(media.zoom) / 100

  const applyTransform = (patch: Partial<Pick<UserMediaItem, 'focalX' | 'focalY' | 'zoom'>>) => {
    const next = updateUserMediaTransform(mediaId, patch)
    if (next) setMedia(next)
  }

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!editable) return
    e.preventDefault()
    frameRef.current?.setPointerCapture(e.pointerId)
    dragRef.current = { startX: e.clientX, startY: e.clientY, focalX: posX, focalY: posY }
    setDragging(true)
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!editable || !dragRef.current || !frameRef.current) return
    const rect = frameRef.current.getBoundingClientRect()
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    const nextX = clampPercent(dragRef.current.focalX - (dx / rect.width) * 100)
    const nextY = clampPercent(dragRef.current.focalY - (dy / rect.height) * 100)
    applyTransform({ focalX: nextX, focalY: nextY })
  }

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return
    dragRef.current = null
    setDragging(false)
    try {
      frameRef.current?.releasePointerCapture(e.pointerId)
    } catch {
      /* already released */
    }
  }

  const onWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (!editable) return
    e.preventDefault()
    const delta = e.deltaY > 0 ? -6 : 6
    applyTransform({ zoom: clampZoom(media.zoom + delta) })
  }

  return (
    <div className="profile-media-frame-wrap">
      <div
        ref={frameRef}
        className={`profile-media-frame profile-media-frame--${variant}${editable ? ' profile-media-frame--editable' : ''}${dragging ? ' profile-media-frame--drag' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onWheel={onWheel}
        role="img"
        aria-label={editable ? 'Drag to reposition · scroll to zoom' : undefined}
      >
        <img
          src={media.dataUrl}
          alt=""
          draggable={false}
          style={{
            objectPosition: `${posX}% ${posY}%`,
            transform: scale > 1 ? `scale(${scale})` : undefined,
            transformOrigin: `${posX}% ${posY}%`,
          }}
        />
        {editable ? <span className="profile-media-frame-hint">Drag · scroll to zoom</span> : null}
      </div>
      {editable ? (
        <div className="profile-media-frame-tools">
          <button type="button" onClick={() => applyTransform({ focalX: 50, focalY: 50, zoom: 100 })}>
            Center
          </button>
          <span className="profile-media-frame-coords">
            {Math.round(posX)}% · {Math.round(posY)}% · {Math.round(media.zoom)}%
          </span>
        </div>
      ) : null}
    </div>
  )
}
