import { useCallback, useEffect, useState } from 'react'
import {
  getChapterCommentCount,
  listChapterComments,
  CHAPTER_COMMENTS_EVENT,
  type ChapterComment,
} from '../lib/chapterComments'

export function useChapterComments(seriesSlug: string, chapterNumber: number) {
  const [comments, setComments] = useState<ChapterComment[]>(() =>
    listChapterComments(seriesSlug, chapterNumber),
  )
  const [count, setCount] = useState(() =>
    getChapterCommentCount(seriesSlug, chapterNumber),
  )

  const refresh = useCallback(() => {
    setComments(listChapterComments(seriesSlug, chapterNumber))
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

  return { comments, count, refresh }
}
