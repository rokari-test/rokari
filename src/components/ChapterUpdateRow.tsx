import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  chapterLabel,
  getChapterAccess,
  type ChapterAccess,
} from '../lib/chapterAccess'
import { formatCountdownClock } from '../lib/earlyAccess'
import { formatRelativeDate } from '../lib/format'
import { useChapterCoinUnlock, useChapterUnlockTick } from '../hooks/useChapterCoinUnlock'
import type { PlanId, UserSubscription } from '../lib/subscriptions'
import type { Chapter, ContentType } from '../types'
import './ChapterUpdateRow.css'

interface ChapterUpdateRowProps {
  slug: string
  contentType: ContentType
  chapter: Chapter
  allChapters: Chapter[]
  planId: PlanId
  subscription: UserSubscription | null
  planName?: string
  tick?: number
  isLead?: boolean
  variant?: 'feed' | 'compact'
}

export function ChapterUpdateRow({
  slug,
  contentType,
  chapter,
  allChapters,
  planId,
  subscription,
  planName = 'Free',
  tick = 0,
  isLead = false,
  variant = 'feed',
}: ChapterUpdateRowProps) {
  const unlockTick = useChapterUnlockTick(true)
  const { tryUnlock, trySubscriptionUpsell, userId } = useChapterCoinUnlock()
  const access = useMemo(
    () =>
      getChapterAccess(chapter, allChapters, planId, subscription, {
        slug,
        userId,
      }),
    [chapter, allChapters, planId, subscription, tick, unlockTick, slug, userId],
  )

  if (variant === 'feed') {
    return (
      <FeedChapterRow
        slug={slug}
        contentType={contentType}
        chapter={chapter}
        allChapters={allChapters}
        access={access}
        planName={planName}
        planId={planId}
        subscription={subscription}
        isLead={isLead}
        tick={tick}
        onCoinUnlock={tryUnlock}
        onSubscribeUpsell={trySubscriptionUpsell}
      />
    )
  }

  return (
    <CompactChapterRow
      slug={slug}
      contentType={contentType}
      chapter={chapter}
      access={access}
    />
  )
}

function FeedChapterRow({
  slug,
  contentType,
  chapter,
  allChapters,
  access,
  planName,
  planId,
  subscription,
  isLead,
  tick,
  onCoinUnlock,
  onSubscribeUpsell,
}: {
  slug: string
  contentType: ContentType
  chapter: Chapter
  allChapters: Chapter[]
  access: ChapterAccess
  planName: string
  planId: PlanId
  subscription: UserSubscription | null
  isLead: boolean
  tick: number
  onCoinUnlock: ReturnType<typeof useChapterCoinUnlock>['tryUnlock']
  onSubscribeUpsell: ReturnType<typeof useChapterCoinUnlock>['trySubscriptionUpsell']
}) {
  const name =
    chapter.title && !chapter.title.match(/^(episode|chapter)\s*\d+/i)
      ? chapter.title
      : chapterLabel(contentType, chapter.number)
  const whenRel = formatRelativeDate(chapter.updatedAt)
  const readHref = `/read/${slug}/${chapter.number}`

  const liveRemainingMs =
    access.unlockAt != null
      ? Math.max(0, access.unlockAt - Date.now())
      : access.remainingMs

  const showWait = access.earlyAccessWait && liveRemainingMs > 0
  const showCoins = access.locked && !access.canRead
  const showLock = !access.canRead && (showWait || showCoins)

  const href = access.canRead ? readHref : '#'

  return (
    <li className={`feed-chapter${isLead ? ' feed-chapter--latest' : ''}`}>
      <Link
        to={href}
        onClick={(e) => {
          if (!access.canRead) e.preventDefault()
        }}
        className="feed-chapter__link"
      >
        <span className="feed-chapter__left">
          {showLock && (
            <span
              className={`feed-chapter__lock${showWait ? ' feed-chapter__lock--wait' : ''}`}
              aria-hidden
            >
              {showWait ? <ClockIcon /> : <LockIcon />}
            </span>
          )}
          <span className="feed-chapter__name">{name}</span>
        </span>

        {access.canRead ? (
          <time className="feed-chapter__time" dateTime={chapter.updatedAt}>
            {whenRel}
          </time>
        ) : (
          <FeedChapterAccess
            slug={slug}
            chapter={chapter}
            allChapters={allChapters}
            planId={planId}
            subscription={subscription}
            remainingMs={liveRemainingMs}
            coinPrice={access.coinPrice}
            planName={planName}
            showWait={showWait}
            showCoins={showCoins}
            tick={tick}
            onCoinUnlock={onCoinUnlock}
            onSubscribeUpsell={onSubscribeUpsell}
          />
        )}
      </Link>
    </li>
  )
}

function FeedChapterAccess({
  slug,
  chapter,
  allChapters,
  planId,
  subscription,
  remainingMs,
  coinPrice,
  planName,
  showWait,
  showCoins,
  tick,
  onCoinUnlock,
  onSubscribeUpsell,
}: {
  slug: string
  chapter: Chapter
  allChapters: Chapter[]
  planId: PlanId
  subscription: UserSubscription | null
  remainingMs: number
  coinPrice: number
  planName: string
  showWait: boolean
  showCoins: boolean
  tick: number
  onCoinUnlock: ReturnType<typeof useChapterCoinUnlock>['tryUnlock']
  onSubscribeUpsell: ReturnType<typeof useChapterCoinUnlock>['trySubscriptionUpsell']
}) {
  const clock = formatCountdownClock(remainingMs)

  return (
    <span
      className="feed-chapter__access"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      role="presentation"
    >
      {showWait && (
        <button
          type="button"
          className="feed-pill feed-pill--wait"
          title={`${planName} — free in ${clock}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onSubscribeUpsell(
              {
                slug,
                chapter,
                remainingMs,
                planId,
                planName,
              },
              e,
            )
          }}
        >
          <span className="feed-pill__icon" aria-hidden>
            <ClockIcon />
          </span>
          <span className="feed-pill__body">
            <span className="feed-pill__time" key={tick}>
              {clock}
            </span>
            <span className="feed-pill__meta">{planName}</span>
          </span>
        </button>
      )}

      {showCoins && (
        <button
          type="button"
          className="feed-pill feed-pill--coins"
          title={`Unlock for ${coinPrice} coins`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onCoinUnlock(
              {
                slug,
                chapter,
                allChapters,
                planId,
                subscription,
                coinPrice,
              },
              e,
            )
          }}
        >
          <span className="feed-pill__icon" aria-hidden>
            <CoinIcon />
          </span>
          <span className="feed-pill__body">
            <strong>{coinPrice}</strong>
            <span className="feed-pill__meta">coins</span>
          </span>
        </button>
      )}
    </span>
  )
}

function CompactChapterRow({
  slug,
  contentType,
  chapter,
  access,
}: {
  slug: string
  contentType: ContentType
  chapter: Chapter
  access: ChapterAccess
}) {
  const label = chapterLabel(contentType, chapter.number)
  const when = formatRelativeDate(chapter.updatedAt)
  const readHref = `/read/${slug}/${chapter.number}`
  const storeHref = `/store?chapter=${slug}-${chapter.number}`
  const href = access.canRead
    ? readHref
    : access.earlyAccessWait
      ? '/store?tab=subscriptions'
      : storeHref

  return (
    <li className="chapter-update-row">
      <Link to={href} className="chapter-update-main">
        <span className="chapter-update-num">{label}</span>
        <span className="chapter-update-time">{when}</span>
      </Link>
    </li>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 118 0v3" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

function CoinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 0 1 0 4H8" />
      <path d="M12 18V6" />
    </svg>
  )
}
