import type { Series } from '../types'

export interface ExternalLink {
  label: string
  href: string
}

export function getSeriesExternalLinks(series: Series): ExternalLink[] {
  const q = encodeURIComponent(series.title)
  return [
    { label: 'Anilist', href: `https://anilist.co/search/manga?search=${q}` },
    { label: 'Kitsu', href: `https://kitsu.io/api/edge/manga?filter[text]=${q}` },
    { label: 'Mangabaka', href: `https://mangabaka.dev/search?q=${q}` },
    { label: 'My Anime List', href: `https://myanimelist.net/manga.php?q=${q}` },
    { label: series.source ?? 'Source', href: `https://www.google.com/search?q=${q}+manhwa` },
  ]
}
