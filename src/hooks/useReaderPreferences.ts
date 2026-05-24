import { useEffect, useState } from 'react'
import {
  loadReaderPreferences,
  READER_PREFS_EVENT,
  type ReaderPreferences,
} from '../lib/readerPreferences'

export function useReaderPreferences(): ReaderPreferences {
  const [prefs, setPrefs] = useState(loadReaderPreferences)

  useEffect(() => {
    const sync = () => setPrefs(loadReaderPreferences())
    window.addEventListener(READER_PREFS_EVENT, sync)
    return () => window.removeEventListener(READER_PREFS_EVENT, sync)
  }, [])

  return prefs
}
