import { useEffect, useState } from 'react'
import { CHAPTER_UNLOCK_EVENT } from '../lib/chapterUnlocks'

export { useChapterCoinUnlock, ChapterCoinUnlockProvider } from '../context/ChapterCoinUnlockContext'
export type { UnlockChapterArgs, SubscriptionUpsellArgs } from '../context/ChapterCoinUnlockContext'

export function useChapterUnlockTick(enabled = true) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!enabled) return
    const sync = () => setTick((n) => n + 1)
    window.addEventListener(CHAPTER_UNLOCK_EVENT, sync)
    return () => window.removeEventListener(CHAPTER_UNLOCK_EVENT, sync)
  }, [enabled])

  return tick
}
