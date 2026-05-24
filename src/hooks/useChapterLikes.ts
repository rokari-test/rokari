import { useCallback, useEffect, useState } from 'react'
import {
  getChapterLikeCount,
  isChapterLiked,
  CHAPTER_LIKES_EVENT,
  toggleChapterLike,
} from '../lib/chapterLikes'

export function useChapterLikes(seriesSlug: string, chapterNumber: number, userId?: string) {
  const [count, setCount] = useState(() => getChapterLikeCount(seriesSlug, chapterNumber))
  const [liked, setLiked] = useState(() =>
    userId ? isChapterLiked(seriesSlug, chapterNumber, userId) : false,
  )

  const refresh = useCallback(() => {
    setCount(getChapterLikeCount(seriesSlug, chapterNumber))
    setLiked(userId ? isChapterLiked(seriesSlug, chapterNumber, userId) : false)
  }, [seriesSlug, chapterNumber, userId])

  useEffect(() => {
    refresh()
    window.addEventListener(CHAPTER_LIKES_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(CHAPTER_LIKES_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [refresh])

  const toggle = useCallback(() => {
    if (!userId) return null
    const result = toggleChapterLike(seriesSlug, chapterNumber, userId)
    setCount(result.count)
    setLiked(result.liked)
    return result
  }, [seriesSlug, chapterNumber, userId])

  return { count, liked, toggle, refresh }
}
