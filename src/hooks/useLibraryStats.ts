import { useEffect, useState } from 'react'
import { getLibraryCatchUpPercent } from '../lib/libraryStats'

export function useLibraryCatchUpPercent(): number {
  const [percent, setPercent] = useState(() => getLibraryCatchUpPercent())

  useEffect(() => {
    const refresh = () => setPercent(getLibraryCatchUpPercent())
    refresh()
    window.addEventListener('readdex-library', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('readdex-library', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  return percent
}
