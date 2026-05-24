import { useEffect, useState } from 'react'
import { EARLY_ACCESS_EVENT } from '../lib/earlyAccess'

/** Re-render every second while countdown labels tick down. */
export function useEarlyAccessTick(enabled = true): number {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!enabled) return
    const bump = () => setTick((t) => t + 1)
    const id = window.setInterval(bump, 1000)
    window.addEventListener(EARLY_ACCESS_EVENT, bump)
    return () => {
      window.clearInterval(id)
      window.removeEventListener(EARLY_ACCESS_EVENT, bump)
    }
  }, [enabled])

  return tick
}
