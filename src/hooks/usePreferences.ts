import { useCallback, useEffect, useState } from 'react'
import {
  applyDisplayPreferences,
  loadPreferences,
  PREFS_EVENT,
  savePreferences,
  type UserPreferences,
} from '../lib/preferences'
import { applyThemeFromPreferences } from '../lib/theme'

export function usePreferences() {
  const [prefs, setPrefs] = useState<UserPreferences>(loadPreferences)

  useEffect(() => {
    const sync = () => {
      const next = loadPreferences()
      setPrefs(next)
      applyThemeFromPreferences(next)
      applyDisplayPreferences(next)
    }
    sync()
    window.addEventListener(PREFS_EVENT, sync)
    return () => window.removeEventListener(PREFS_EVENT, sync)
  }, [])

  const update = useCallback((partial: Partial<UserPreferences>) => {
    savePreferences(partial)
  }, [])

  return { prefs, update }
}
