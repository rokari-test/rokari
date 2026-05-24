import { useCallback, useEffect, useState } from 'react'
import {
  CHAPTER_COMMENTS_EVENT,
  getChapterCommentCount,
} from '../lib/chapterComments'

export function useChapterCommentCount(seriesSlug: string, chapterNumber: number) {
  const [count, setCount] = useState(() => getChapterCommentCount(seriesSlug, chapterNumber))

  const refresh = useCallback(() => {
    setCount(getChapterCommentCount(seriesSlug, chapterNumber))
  }, [seriesSlug, chapterNumber])

  useEffect(() => {
    refresh()
    window.addEventListener(CHAPTER_COMMENTS_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(CHAPTER_COMMENTS_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [refresh])

  return count
}
