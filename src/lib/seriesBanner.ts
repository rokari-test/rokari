import type { Series } from '../types'

export function getBannerObjectPosition(
  series: Pick<Series, 'bannerFocalX' | 'bannerFocalY'>,
): string {
  const x = clampPercent(series.bannerFocalX ?? 50)
  const y = clampPercent(series.bannerFocalY ?? 50)
  return `${x}% ${y}%`
}

export function clampPercent(n: number): number {
  if (!Number.isFinite(n)) return 50
  return Math.min(100, Math.max(0, n))
}
