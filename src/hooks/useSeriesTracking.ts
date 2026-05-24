import { useEffect, useState } from 'react'
import { SERIES_STATUS_EVENT } from '../lib/seriesStatus'

export function useSeriesTrackingSync(): number {
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const refresh = () => setVersion((v) => v + 1)
    window.addEventListener(SERIES_STATUS_EVENT, refresh)
    window.addEventListener('readdex-library', refresh)
    return () => {
      window.removeEventListener(SERIES_STATUS_EVENT, refresh)
      window.removeEventListener('readdex-library', refresh)
    }
  }, [])

  return version
}
