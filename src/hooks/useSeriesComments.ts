import { useCallback, useEffect, useState } from 'react'
import {
  getSeriesCommentCount,
  listSeriesComments,
  SERIES_COMMENTS_EVENT,
  type SeriesComment,
} from '../lib/seriesComments'

export function useSeriesComments(seriesSlug: string) {
  const [comments, setComments] = useState<SeriesComment[]>(() =>
    listSeriesComments(seriesSlug),
  )
  const [count, setCount] = useState(() => getSeriesCommentCount(seriesSlug))

  const refresh = useCallback(() => {
    setComments(listSeriesComments(seriesSlug))
    setCount(getSeriesCommentCount(seriesSlug))
  }, [seriesSlug])

  useEffect(() => {
    refresh()
    window.addEventListener(SERIES_COMMENTS_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(SERIES_COMMENTS_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [refresh])

  return { comments, count, refresh }
}
