import type { Series } from '../types'

/** Build a plausible 1–10 star histogram from average rating and vote count. */
export function buildRatingDistribution(
  average: number,
  voteCount: number,
): { stars: number; count: number; pct: number }[] {
  const total = Math.max(voteCount, 1)
  const peak = Math.round(Math.min(10, Math.max(1, average)))
  const weights = Array.from({ length: 10 }, (_, i) => {
    const star = i + 1
    const dist = Math.abs(star - peak)
    return Math.max(0.05, 1.4 - dist * 0.35)
  })
  const sumW = weights.reduce((a, b) => a + b, 0)
  const counts = weights.map((w) => Math.round((w / sumW) * total))
  let diff = total - counts.reduce((a, b) => a + b, 0)
  const idx = peak - 1
  counts[idx] = Math.max(0, counts[idx] + diff)

  return counts.map((count, i) => ({
    stars: i + 1,
    count,
    pct: Math.round((count / total) * 100),
  }))
}

export function getVoteCount(views: number): number {
  return Math.max(1, Math.floor(views / 2000))
}

export interface TitleEntry {
  language: string
  label: string
  title: string
  primary?: boolean
}

const LANG_LABELS = ['EN', 'KR', 'JP', 'TH', 'CN', 'FR'] as const

export function buildTitleEntries(series: Series): TitleEntry[] {
  const entries: TitleEntry[] = [
    {
      language: series.language ?? 'EN',
      label: languageLabel(series.language ?? 'EN'),
      title: series.title,
      primary: true,
    },
  ]

  series.altTitles.forEach((t, i) => {
    const lang = LANG_LABELS[(i % (LANG_LABELS.length - 1)) + 1] ?? 'KR'
    entries.push({
      language: lang,
      label: languageLabel(lang),
      title: t,
    })
  })

  return entries
}

function languageLabel(code: string): string {
  const map: Record<string, string> = {
    EN: 'English',
    KR: 'Korean',
    JP: 'Japanese',
    TH: 'Thai',
    CN: 'Chinese',
    FR: 'French',
    GB: 'English',
  }
  return map[code] ?? code
}
