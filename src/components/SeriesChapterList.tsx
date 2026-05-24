import { useMemo, type MouseEvent } from 'react'
import { ChapterBookmarkButton } from '../components/ChapterBookmarkButton'
import { Link } from 'react-router-dom'
import { useAdminViewer } from '../hooks/useAdminViewer'
import { useChapterCommentCount } from '../hooks/useChapterCommentCount'
import { useChapterLikes } from '../hooks/useChapterLikes'
import { useChapterCoinUnlock, useChapterUnlockTick } from '../hooks/useChapterCoinUnlock'
import { useEarlyAccessTick } from '../hooks/useEarlyAccessTick'
import { useUserSubscription } from '../hooks/useUserSubscription'
import { ChapterAccessChip } from './ChapterAccessChip'
import { getChapterAccess } from '../lib/chapterAccess'
import {
  chapterHeading,
  chapterShortLabel,
  formatChapterTimeAgo,
  getChapterViewCount,
} from '../lib/chapterDisplay'
import type { PlanId, UserSubscription } from '../lib/subscriptions'
import type { Chapter, Series } from '../types'
import './SeriesChapterList.css'

interface SeriesChapterListProps {
  series: Series
  chapters: Chapter[]
  currentChapterNumber?: number
}

export function SeriesChapterList({
  series,
  chapters,
  currentChapterNumber,
}: SeriesChapterListProps) {
  const tick = useEarlyAccessTick(true)
  const unlockTick = useChapterUnlockTick(true)
  const { tryUnlock, trySubscriptionUpsell, userId } = useChapterCoinUnlock()
  const isAdminViewer = useAdminViewer()
  const { subscription, plan } = useUserSubscription()
  const planId = plan?.id ?? null

  if (chapters.length === 0) return null

  return (
    <ol className="rok-reel-list">
      {chapters.map((ch) => (
        <SeriesChapterRow
          key={ch.id}
          series={series}
          chapter={ch}
          allChapters={series.chapters}
          planId={planId}
          subscription={subscription}
          isCurrent={currentChapterNumber === ch.number}
          tick={tick}
          unlockTick={unlockTick}
          isAdminViewer={isAdminViewer}
          userId={userId}
          onCoinUnlock={tryUnlock}
          onSubscribeUpsell={trySubscriptionUpsell}
          planName={plan?.name ?? 'Free'}
        />
      ))}
    </ol>
  )
}

function SeriesChapterRow({
  series,
  chapter,
  allChapters,
  planId,
  subscription,
  isCurrent,
  tick,
  unlockTick,
  isAdminViewer,
  userId,
  onCoinUnlock,
  onSubscribeUpsell,
  planName,
}: {
  series: Series
  chapter: Chapter
  allChapters: Chapter[]
  planId: PlanId | null
  subscription: UserSubscription | null
  isCurrent: boolean
  tick: number
  unlockTick: number
  isAdminViewer: boolean
  userId: string | null
  onCoinUnlock: ReturnType<typeof useChapterCoinUnlock>['tryUnlock']
  onSubscribeUpsell: ReturnType<typeof useChapterCoinUnlock>['trySubscriptionUpsell']
  planName: string
}) {
  const access = useMemo(
    () =>
      getChapterAccess(chapter, allChapters, planId, subscription, {
        slug: series.slug,
        userId,
      }),
    [chapter, allChapters, planId, subscription, tick, unlockTick, series.slug, userId],
  )

  const showPlanWait = access.earlyAccessWait && access.remainingMs > 0
  const showViews = isAdminViewer

  const views = getChapterViewCount(series, chapter)
  const time = formatChapterTimeAgo(chapter.updatedAt)
  const { count: heartCount } = useChapterLikes(series.slug, chapter.number)
  const commentCount = useChapterCommentCount(series.slug, chapter.number)
  const readHref = `/read/${series.slug}/${chapter.number}`
  const title =
    chapter.title && !chapter.title.match(/^(episode|chapter)\s*\d+/i)
      ? chapter.title
      : chapterHeading(series.type, chapter.number)

  const rowHref = access.canRead ? readHref : '#'

  const kind = series.type === 'manhwa' ? 'Ch' : 'Ep'

  return (
    <li className="rok-reel-item">
      <Link
        to={rowHref}
        onClick={(e) => {
          if (!access.canRead) e.preventDefault()
        }}
        className={[
          'rok-reel-ticket',
          isCurrent && 'rok-reel-ticket--current',
          access.locked && 'rok-reel-ticket--locked',
          showPlanWait && 'rok-reel-ticket--early',
          access.isNew && 'rok-reel-ticket--new',
          access.canRead && !access.locked && 'rok-reel-ticket--open',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-disabled={access.locked && !access.earlyAccessWait ? true : undefined}
      >
        <span className="rok-reel-stub" aria-label={`${kind} ${chapter.number}`}>
          <span className="rok-reel-stub-num">{chapter.number}</span>
          <span className="rok-reel-stub-kind">{kind}</span>
        </span>

        <span className="rok-reel-body">
          <span className="rok-reel-body-head">
            <span className="rok-reel-kicker">{chapterShortLabel(series.type, chapter.number)}</span>
            {isCurrent ? <span className="rok-reel-chip rok-reel-chip--here">Reading</span> : null}
            {access.isNew && !showPlanWait ? (
              <span className="rok-reel-chip rok-reel-chip--new">New</span>
            ) : null}
          </span>
          <span className="rok-reel-title-row">
            <span className="rok-reel-title">
              <span className="rok-reel-title-text">{title}</span>
              <span className="rok-reel-stats">
                <span className="rok-reel-stat rok-reel-stat--likes" aria-label={`${heartCount} likes`}>
                  <HeartIcon />
                  <strong>{heartCount}</strong>
                </span>
                <span className="rok-reel-stat rok-reel-stat--comments" aria-label={`${commentCount} comments`}>
                  <CommentIcon />
                  <strong>{commentCount}</strong>
                </span>
              </span>
            </span>
          </span>
        </span>

        <span className="rok-reel-dock">
          <span className="rok-reel-dock-cell rok-reel-dock-cell--status">
            <DockStatus
              access={access}
              showPlanWait={showPlanWait}
              remainingMs={access.remainingMs}
              planName={planName}
              slug={series.slug}
              chapter={chapter}
              planId={planId}
              onSubscribeUpsell={onSubscribeUpsell}
            />
          </span>

          <span className="rok-reel-dock-cell rok-reel-dock-cell--time">
            {showViews && !showPlanWait ? (
              <>
                <strong>{views}</strong>
                <span>views</span>
              </>
            ) : (
              <>
                <strong>{time.when}</strong>
                <span>{time.label}</span>
              </>
            )}
          </span>

          <span className="rok-reel-dock-cell rok-reel-dock-cell--action">
            <DockAction
              access={access}
              showPlanWait={showPlanWait}
              coinPrice={access.coinPrice}
              onCoinUnlock={(e) =>
                onCoinUnlock(
                  {
                    slug: series.slug,
                    chapter,
                    allChapters,
                    planId,
                    subscription,
                    coinPrice: access.coinPrice,
                  },
                  e,
                )
              }
            />
          </span>

          <span className="rok-reel-dock-cell rok-reel-dock-cell--mark">
            <ChapterBookmarkButton
              slug={series.slug}
              chapterNumber={chapter.number}
              chapterTitle={title}
              variant="chapter-row"
            />
          </span>
        </span>
      </Link>
    </li>
  )
}

function DockStatus({
  access,
  showPlanWait,
  remainingMs,
  planName,
  slug,
  chapter,
  planId,
  onSubscribeUpsell,
}: {
  access: ReturnType<typeof getChapterAccess>
  showPlanWait: boolean
  remainingMs: number
  planName: string
  slug: string
  chapter: Chapter
  planId: PlanId | null
  onSubscribeUpsell: ReturnType<typeof useChapterCoinUnlock>['trySubscriptionUpsell']
}) {
  if (showPlanWait) {
    return (
      <ChapterAccessChip
        mode="timer"
        remainingMs={remainingMs}
        planName={planName}
        onSubscribePrompt={(e) =>
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
        }
        compact
        className="access-chip--dock"
      />
    )
  }

  if (access.locked && !access.earlyAccessWait) {
    return (
      <span className="rok-reel-pill rok-reel-pill--locked">
        <LockIcon />
        Locked
      </span>
    )
  }

  if (!access.locked) {
    return (
      <span className="rok-reel-pill rok-reel-pill--open">
        <OpenIcon />
        Open
      </span>
    )
  }

  return <span className="rok-reel-dock-spacer" aria-hidden />
}

function DockAction({
  access,
  showPlanWait,
  coinPrice,
  onCoinUnlock,
}: {
  access: ReturnType<typeof getChapterAccess>
  showPlanWait: boolean
  coinPrice: number
  onCoinUnlock: (e: MouseEvent<HTMLButtonElement>) => void
}) {
  if (showPlanWait) {
    return (
      <ChapterAccessChip
        mode="coins"
        coinPrice={coinPrice}
        onUnlock={onCoinUnlock}
        compact
        className="access-chip--dock"
      />
    )
  }

  if (access.locked) {
    return (
      <ChapterAccessChip
        mode="coins"
        coinPrice={coinPrice}
        onUnlock={onCoinUnlock}
        compact
        className="access-chip--dock"
      />
    )
  }

  return (
    <span className="rok-reel-go" aria-hidden>
      <ChevronIcon />
    </span>
  )
}

function OpenIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a5 5 0 00-5 5v3H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V12a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zm-3 8V7a3 3 0 116 0v3H9z" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

function CommentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 20.5s-6.5-4.2-8.5-8.2C2.2 9.2 3.6 5.5 7 5.5c1.9 0 3.6 1 4.5 2.5C12.4 6.5 14.1 5.5 16 5.5c3.4 0 4.8 3.7 3.5 6.8-2 4-8.5 8.2-8.5 8.2Z" />
    </svg>
  )
}
