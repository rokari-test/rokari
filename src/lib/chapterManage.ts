import {
  addChapter,
  createChapterId,
  deleteChapter,
  loadCatalog,
  saveCatalog,
  updateChapter,
} from './catalogStore'
import { canAccessAdminPanel, canAccessUpload, type UserRole } from './userAuth'
import type { Chapter, Series } from '../types'

export const UNLOCK_COST_PRESETS = [0, 10, 50, 100] as const

export type UnlockCostPreset =
  | 'default'
  | (typeof UNLOCK_COST_PRESETS)[number]
  | 'custom'

export function canManageChapters(role: UserRole | undefined): boolean {
  return canAccessUpload(role) || canAccessAdminPanel(role)
}

export function activeChapters(chapters: Chapter[]): Chapter[] {
  return chapters.filter((c) => !c.trashed)
}

export function trashedChapters(chapters: Chapter[]): Chapter[] {
  return chapters.filter((c) => c.trashed)
}

export function presetFromUnlockCost(cost: number | undefined): UnlockCostPreset {
  if (cost === undefined) return 'default'
  if (UNLOCK_COST_PRESETS.includes(cost as (typeof UNLOCK_COST_PRESETS)[number])) {
    return cost as UnlockCostPreset
  }
  return 'custom'
}

export function defaultChapterTitle(seriesType: Series['type'], number: number): string {
  return seriesType === 'manhwa' ? `Episode ${number}` : `Chapter ${number}`
}

export interface ChapterManageForm {
  number: number
  title: string
  unlockPreset: UnlockCostPreset
  customUnlockCost: number
  pagesText: string
}

export function formFromChapter(chapter: Chapter, seriesType: Series['type']): ChapterManageForm {
  const preset = presetFromUnlockCost(chapter.unlockCost)
  return {
    number: chapter.number,
    title: chapter.title || defaultChapterTitle(seriesType, chapter.number),
    unlockPreset: preset,
    customUnlockCost:
      preset === 'custom' ? Math.max(0, chapter.unlockCost ?? 0) : chapter.unlockCost ?? 50,
    pagesText: (chapter.pages ?? []).join('\n'),
  }
}

export function parseUnlockPreset(value: string): UnlockCostPreset {
  if (value === 'default' || value === 'custom') return value
  const n = Number(value)
  if (UNLOCK_COST_PRESETS.includes(n as (typeof UNLOCK_COST_PRESETS)[number])) {
    return n as (typeof UNLOCK_COST_PRESETS)[number]
  }
  return 'default'
}

export function resolveUnlockCost(form: ChapterManageForm): number | undefined {
  if (form.unlockPreset === 'default') return undefined
  if (form.unlockPreset === 'custom') {
    return Math.max(0, Math.floor(form.customUnlockCost))
  }
  return Number(form.unlockPreset)
}

export function buildChapterFromForm(
  series: Series,
  existing: Chapter | null,
  form: ChapterManageForm,
): Chapter {
  const pages = form.pagesText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  const pageCount = pages.length > 0 ? pages.length : existing?.pageCount ?? 12
  const number = Math.max(1, Math.floor(form.number))
  const unlockCost = resolveUnlockCost(form)
  const id =
    existing && existing.number === number
      ? existing.id
      : createChapterId(series.id, number)

  const chapter: Chapter = {
    id,
    number,
    title: form.title.trim() || defaultChapterTitle(series.type, number),
    updatedAt: existing?.updatedAt ?? new Date().toISOString().slice(0, 10),
    pageCount,
    pages: pages.length > 0 ? pages : existing?.pages,
    trashed: existing?.trashed,
  }
  if (unlockCost !== undefined) {
    chapter.unlockCost = unlockCost
  }
  return chapter
}

/** Strip unlockCost when switching back to site default rules. */
export function chapterWithoutUnlockCost(chapter: Chapter): Chapter {
  const { unlockCost: _removed, ...rest } = chapter
  return rest
}

function applyChapterSave(series: Series, existing: Chapter | null, next: Chapter): Series {
  if (existing && existing.id !== next.id) {
    const without = deleteChapter(series, existing.id)
    return addChapter(without, next)
  }
  if (existing) return updateChapter(series, next)
  return addChapter(series, next)
}

export function saveChapterFromForm(
  seriesId: string,
  existing: Chapter | null,
  form: ChapterManageForm,
): Series | null {
  const catalog = loadCatalog()
  const series = catalog.find((s) => s.id === seriesId)
  if (!series) return null

  let next = buildChapterFromForm(series, existing, form)
  if (resolveUnlockCost(form) === undefined && existing?.unlockCost !== undefined) {
    next = chapterWithoutUnlockCost(next)
  }
  const updated = applyChapterSave(series, existing, next)
  saveCatalog(catalog.map((s) => (s.id === seriesId ? updated : s)))
  return updated
}

export function trashChapter(seriesId: string, chapterId: string): void {
  const catalog = loadCatalog()
  const series = catalog.find((s) => s.id === seriesId)
  if (!series) return
  const ch = series.chapters.find((c) => c.id === chapterId)
  if (!ch) return
  const updated = updateChapter(series, { ...ch, trashed: true })
  saveCatalog(catalog.map((s) => (s.id === seriesId ? updated : s)))
}

export function restoreChapter(seriesId: string, chapterId: string): void {
  const catalog = loadCatalog()
  const series = catalog.find((s) => s.id === seriesId)
  if (!series) return
  const ch = series.chapters.find((c) => c.id === chapterId)
  if (!ch) return
  const { trashed: _t, ...rest } = ch
  const updated = updateChapter(series, rest)
  saveCatalog(catalog.map((s) => (s.id === seriesId ? updated : s)))
}

export function addNewChapter(seriesId: string): Chapter | null {
  const catalog = loadCatalog()
  const series = catalog.find((s) => s.id === seriesId)
  if (!series) return null
  const active = activeChapters(series.chapters)
  const nextNum =
    active.length > 0 ? Math.max(...active.map((c) => c.number)) + 1 : 1
  const chapter: Chapter = {
    id: createChapterId(series.id, nextNum),
    number: nextNum,
    title: defaultChapterTitle(series.type, nextNum),
    updatedAt: new Date().toISOString().slice(0, 10),
    pageCount: 12,
  }
  const updated = addChapter(series, chapter)
  saveCatalog(catalog.map((s) => (s.id === seriesId ? updated : s)))
  return chapter
}

export function permanentlyDeleteChapter(seriesId: string, chapterId: string): void {
  const catalog = loadCatalog()
  const series = catalog.find((s) => s.id === seriesId)
  if (!series) return
  const updated = deleteChapter(series, chapterId)
  saveCatalog(catalog.map((s) => (s.id === seriesId ? updated : s)))
}
