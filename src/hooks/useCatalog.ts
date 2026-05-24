import { useCallback, useEffect, useState } from 'react'
import { CATALOG_EVENT, loadCatalog, saveCatalog } from '../lib/catalogStore'
import type { Series } from '../types'

export function useCatalog(): Series[] {
  const [catalog, setCatalog] = useState(loadCatalog)

  useEffect(() => {
    const refresh = () => setCatalog(loadCatalog())
    window.addEventListener(CATALOG_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(CATALOG_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  return catalog
}

export function useCatalogMutations() {
  const refresh = useCallback(() => {
    window.dispatchEvent(new Event(CATALOG_EVENT))
  }, [])

  const persist = useCallback((series: Series[]) => {
    saveCatalog(series)
  }, [])

  return { catalog: loadCatalog(), persist, refresh }
}
