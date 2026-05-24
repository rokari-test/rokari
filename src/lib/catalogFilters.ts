import { seriesPassesRatingFilter } from './contentRating'
import { loadPreferences } from './preferences'
import type { Series } from '../types'

/** Apply sidebar prefs: scanlations toggle + content rating cap. */
export function filterSeriesForUser(list: Series[]): Series[] {
  const prefs = loadPreferences()
  return list.filter((s) => {
    if (!prefs.showScanlations && s.type === 'manhwa') return false
    return seriesPassesRatingFilter(s.contentRating, prefs.contentRating)
  })
}
