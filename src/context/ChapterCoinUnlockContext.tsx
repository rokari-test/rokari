import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { CoinUnlockModal } from '../components/CoinUnlockModal'
import { SubscriptionUpsellModal } from '../components/SubscriptionUpsellModal'
import { getChapterAccess, chapterLabel } from '../lib/chapterAccess'
import { purchaseChapterUnlock } from '../lib/chapterUnlocks'
import type { PlanId, UserSubscription } from '../lib/subscriptions'
import type { Chapter, ContentType } from '../types'
import { useAuthPrompt } from './AuthPromptContext'
import { useUser } from '../hooks/useUser'
import { useWallet } from '../hooks/useWallet'

export interface UnlockChapterArgs {
  slug: string
  chapter: Chapter
  allChapters: Chapter[]
  planId: PlanId | null
  subscription: UserSubscription | null
  coinPrice: number
  contentType?: ContentType
}

export interface SubscriptionUpsellArgs {
  slug: string
  chapter: Chapter
  remainingMs: number
  planId: PlanId | null
  planName: string
  contentType?: ContentType
}

interface PendingUnlock extends UnlockChapterArgs {
  chapterTitle: string
}

interface PendingSubscriptionUpsell extends SubscriptionUpsellArgs {
  chapterTitle: string
}

interface ChapterCoinUnlockContextValue {
  tryUnlock: (args: UnlockChapterArgs, e?: MouseEvent) => void
  trySubscriptionUpsell: (args: SubscriptionUpsellArgs, e?: MouseEvent) => void
  userId: string | null
  isLoggedIn: boolean
}

const ChapterCoinUnlockContext = createContext<ChapterCoinUnlockContextValue | null>(null)

function chapterDisplayTitle(
  chapter: Chapter,
  contentType: ContentType = 'manhwa',
): string {
  if (chapter.title && !chapter.title.match(/^(episode|chapter)\s*\d+/i)) {
    return chapter.title
  }
  return chapterLabel(contentType, chapter.number)
}

export function ChapterCoinUnlockProvider({ children }: { children: ReactNode }) {
  const { user, isLoggedIn } = useUser()
  const { promptAuth } = useAuthPrompt()
  const { balance } = useWallet()
  const navigate = useNavigate()
  const [pending, setPending] = useState<PendingUnlock | null>(null)
  const [pendingSub, setPendingSub] = useState<PendingSubscriptionUpsell | null>(null)
  const [error, setError] = useState<string | null>(null)

  const closeCoin = useCallback(() => {
    setPending(null)
    setError(null)
  }, [])

  const closeSub = useCallback(() => {
    setPendingSub(null)
  }, [])

  const tryUnlock = useCallback(
    (args: UnlockChapterArgs, e?: MouseEvent) => {
      e?.preventDefault()
      e?.stopPropagation()

      const { slug, chapter, allChapters, planId, subscription, contentType } = args

      if (!isLoggedIn || !user) {
        promptAuth('unlock')
        return
      }

      const current = getChapterAccess(chapter, allChapters, planId, subscription, {
        slug,
        userId: user.id,
      })
      if (current.canRead) {
        navigate(`/read/${slug}/${chapter.number}`)
        return
      }

      setPendingSub(null)
      setError(null)
      setPending({
        ...args,
        chapterTitle: chapterDisplayTitle(chapter, contentType),
      })
    },
    [isLoggedIn, navigate, promptAuth, user],
  )

  const trySubscriptionUpsell = useCallback(
    (args: SubscriptionUpsellArgs, e?: MouseEvent) => {
      e?.preventDefault()
      e?.stopPropagation()

      if (!isLoggedIn || !user) {
        promptAuth('subscribe')
        return
      }

      setPending(null)
      setError(null)
      setPendingSub({
        ...args,
        chapterTitle: chapterDisplayTitle(args.chapter, args.contentType),
      })
    },
    [isLoggedIn, promptAuth, user],
  )

  const confirmUnlock = useCallback(() => {
    if (!pending || !user) return

    const result = purchaseChapterUnlock({
      userId: user.id,
      slug: pending.slug,
      chapter: pending.chapter,
      allChapters: pending.allChapters,
      planId: pending.planId,
      subscription: pending.subscription,
    })

    if (result.ok) {
      const target = `/read/${pending.slug}/${pending.chapter.number}`
      closeCoin()
      navigate(target)
      return
    }

    setError(result.error)
  }, [closeCoin, navigate, pending, user])

  const goToPackages = useCallback(
    (chapterRef?: { slug: string; chapterNumber: number }) => {
      closeCoin()
      closeSub()
      if (chapterRef) {
        navigate(`/store?chapter=${chapterRef.slug}-${chapterRef.chapterNumber}`)
      } else {
        navigate('/store')
      }
    },
    [closeCoin, closeSub, navigate],
  )

  const goToSubscriptions = useCallback(() => {
    closeCoin()
    closeSub()
    navigate('/store?tab=subscriptions')
  }, [closeCoin, closeSub, navigate])

  const value = useMemo(
    () => ({
      tryUnlock,
      trySubscriptionUpsell,
      userId: user?.id ?? null,
      isLoggedIn,
    }),
    [tryUnlock, trySubscriptionUpsell, user?.id, isLoggedIn],
  )

  return (
    <ChapterCoinUnlockContext.Provider value={value}>
      {children}
      <CoinUnlockModal
        open={Boolean(pending)}
        chapterTitle={pending?.chapterTitle ?? ''}
        coinPrice={pending?.coinPrice ?? 0}
        currentBalance={balance}
        error={error}
        onClose={closeCoin}
        onConfirm={confirmUnlock}
        onGoToPackages={() =>
          goToPackages(
            pending
              ? { slug: pending.slug, chapterNumber: pending.chapter.number }
              : undefined,
          )
        }
        onGoToSubscriptions={goToSubscriptions}
      />
      <SubscriptionUpsellModal
        open={Boolean(pendingSub)}
        chapterTitle={pendingSub?.chapterTitle ?? ''}
        remainingMs={pendingSub?.remainingMs ?? 0}
        planName={pendingSub?.planName ?? 'Free'}
        planId={pendingSub?.planId ?? null}
        onClose={closeSub}
        onGoToSubscriptions={goToSubscriptions}
        onGoToPackages={() =>
          goToPackages(
            pendingSub
              ? { slug: pendingSub.slug, chapterNumber: pendingSub.chapter.number }
              : undefined,
          )
        }
      />
    </ChapterCoinUnlockContext.Provider>
  )
}

export function useChapterCoinUnlock() {
  const ctx = useContext(ChapterCoinUnlockContext)
  if (!ctx) {
    throw new Error('useChapterCoinUnlock must be used within ChapterCoinUnlockProvider')
  }
  return ctx
}
