import { useEffect, useRef } from 'react'

export function useAutoScroll(
  enabled: boolean,
  speedPxPerSec: number,
  mode: 'smooth' | 'page',
) {
  const raf = useRef<number | null>(null)
  const last = useRef<number | null>(null)
  const pausedUntil = useRef(0)

  useEffect(() => {
  if (!enabled) return

    const pause = () => {
      pausedUntil.current = Date.now() + 2500
    }

    window.addEventListener('wheel', pause, { passive: true })
    window.addEventListener('touchstart', pause, { passive: true })
    window.addEventListener('keydown', pause, { passive: true })

    return () => {
      window.removeEventListener('wheel', pause)
      window.removeEventListener('touchstart', pause)
      window.removeEventListener('keydown', pause)
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled || mode !== 'page') return
    const id = window.setInterval(() => {
      if (Date.now() < pausedUntil.current) return
      const max = document.documentElement.scrollHeight - document.documentElement.clientHeight
      if (window.scrollY >= max - 4) return
      window.scrollBy({ top: window.innerHeight * 0.88, behavior: 'smooth' })
    }, 1300)
    return () => window.clearInterval(id)
  }, [enabled, mode])

  useEffect(() => {
    if (!enabled || mode !== 'smooth') {
      if (raf.current != null) cancelAnimationFrame(raf.current)
      raf.current = null
      last.current = null
      return
    }

    const tick = (now: number) => {
      if (Date.now() < pausedUntil.current) {
        last.current = null
        raf.current = requestAnimationFrame(tick)
        return
      }

      if (last.current == null) last.current = now
      const dt = (now - last.current) / 1000
      last.current = now

      const max = document.documentElement.scrollHeight - document.documentElement.clientHeight
      if (max > 0) {
        const delta = speedPxPerSec * dt
        window.scrollTo(0, Math.min(max, window.scrollY + delta))
      }
      raf.current = requestAnimationFrame(tick)
    }

    raf.current = requestAnimationFrame(tick)
    return () => {
      if (raf.current != null) cancelAnimationFrame(raf.current)
      raf.current = null
      last.current = null
    }
  }, [enabled, speedPxPerSec, mode])
}
