import { useEffect } from 'react'
import './ReaderXpToast.css'

interface ReaderXpToastProps {
  message: string | null
  onDone: () => void
}

export function ReaderXpToast({ message, onDone }: ReaderXpToastProps) {
  useEffect(() => {
    if (!message) return
    const t = window.setTimeout(onDone, 2600)
    return () => window.clearTimeout(t)
  }, [message, onDone])

  if (!message) return null

  return (
    <div className="reader-xp-toast" role="status">
      <span className="reader-xp-toast-icon" aria-hidden>
        ✨
      </span>
      <span>{message}</span>
    </div>
  )
}
