export const ADMIN_REPORTS_EVENT = 'sakura-admin-reports'

export type ReportStatus = 'open' | 'reviewing' | 'resolved' | 'dismissed'

export type ReportType = 'spam' | 'copyright' | 'harassment' | 'broken' | 'other'

export type ReportSubject = 'series' | 'chapter'

export interface ModerationReport {
  id: string
  type: ReportType
  status: ReportStatus
  target: string
  reporter: string
  reporterId?: string
  note: string
  createdAt: string
  subject?: ReportSubject
  seriesSlug?: string
  seriesTitle?: string
  chapterNumber?: number
  chapterTitle?: string
}

export const USER_REPORT_REASONS: {
  id: ReportType
  label: string
  hint: string
}[] = [
  {
    id: 'broken',
    label: 'Broken content',
    hint: 'Missing pages, wrong order, or reader errors',
  },
  {
    id: 'copyright',
    label: 'Copyright',
    hint: 'Licensed elsewhere or unauthorized upload',
  },
  {
    id: 'spam',
    label: 'Duplicate / spam',
    hint: 'Same work uploaded again or misleading listing',
  },
  {
    id: 'harassment',
    label: 'Inappropriate',
    hint: 'Content that breaks Rokari community rules',
  },
  {
    id: 'other',
    label: 'Other',
    hint: 'Something else the moderation team should review',
  },
]

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  open: 'Open',
  reviewing: 'In review',
  resolved: 'Resolved',
  dismissed: 'Dismissed',
}

const KEY = 'sakura-moderation-reports'

function dispatch() {
  window.dispatchEvent(new Event(ADMIN_REPORTS_EVENT))
}

export function listReports(): ModerationReport[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return JSON.parse(raw) as ModerationReport[]
  } catch {
    return []
  }
}

export function updateReportStatus(id: string, status: ReportStatus) {
  const items = listReports()
  const idx = items.findIndex((r) => r.id === id)
  if (idx < 0) return
  items[idx] = { ...items[idx], status }
  localStorage.setItem(KEY, JSON.stringify(items))
  dispatch()
}

export interface SubmitReportInput {
  subject: ReportSubject
  type: ReportType
  note: string
  seriesSlug: string
  seriesTitle: string
  chapterNumber?: number
  chapterTitle?: string
  reporterId: string
  reporterName: string
}

export function buildReportTarget(input: SubmitReportInput): string {
  if (input.subject === 'chapter' && input.chapterNumber != null) {
    const ch = input.chapterTitle?.trim()
    return ch
      ? `${input.seriesTitle} · Ch. ${input.chapterNumber} — ${ch}`
      : `${input.seriesTitle} · Ch. ${input.chapterNumber}`
  }
  return input.seriesTitle
}

export function submitReport(input: SubmitReportInput): ModerationReport {
  const report: ModerationReport = {
    id: crypto.randomUUID(),
    type: input.type,
    status: 'open',
    target: buildReportTarget(input),
    reporter: input.reporterName,
    reporterId: input.reporterId,
    note: input.note.trim(),
    createdAt: new Date().toISOString(),
    subject: input.subject,
    seriesSlug: input.seriesSlug,
    seriesTitle: input.seriesTitle,
    chapterNumber: input.chapterNumber,
    chapterTitle: input.chapterTitle,
  }
  const items = listReports()
  localStorage.setItem(KEY, JSON.stringify([report, ...items]))
  dispatch()
  return report
}

export function listReportsForUser(reporterId: string): ModerationReport[] {
  return listReports().filter((r) => r.reporterId === reporterId)
}

export function seedReportsIfEmpty() {
  if (listReports().length > 0) return
  const now = Date.now()
  const samples: Omit<ModerationReport, 'id' | 'createdAt'>[] = [
    {
      type: 'spam',
      status: 'open',
      target: 'Comment on Solo Leveling Ch.142',
      reporter: 'reader_88',
      note: 'Repeated promo links',
    },
    {
      type: 'broken',
      status: 'reviewing',
      target: 'Reader — Omniscient Reader Ch.89',
      reporter: 'mod_kai',
      note: 'Pages 12–14 blank',
    },
    {
      type: 'copyright',
      status: 'open',
      target: 'Series duplicate upload',
      reporter: 'rights@partner.io',
      note: 'Licensed elsewhere',
    },
    {
      type: 'harassment',
      status: 'resolved',
      target: 'Profile @toxic_user',
      reporter: 'rokari_mod',
      note: 'Warning issued',
    },
  ]
  const items: ModerationReport[] = samples.map((s, i) => ({
    ...s,
    id: crypto.randomUUID(),
    createdAt: new Date(now - i * 7200_000).toISOString(),
  }))
  localStorage.setItem(KEY, JSON.stringify(items))
  dispatch()
}
