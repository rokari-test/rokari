import type { Series } from '../types'

function chapters(
  seriesId: string,
  count: number,
  startDate: string,
): Series['chapters'] {
  const base = new Date(startDate)
  return Array.from({ length: count }, (_, i) => {
    const n = i + 1
    const d = new Date(base)
    d.setDate(d.getDate() + i * 14)
    return {
      id: `${seriesId}-ch-${n}`,
      number: n,
      title: n === 1 ? 'Prologue' : `Chapter ${n}`,
      updatedAt: d.toISOString().slice(0, 10),
      pageCount: 1,
    }
  })
}

export const novelList: Series[] = [
  {
    id: 'n1',
    slug: 'solo-leveling-novel',
    type: 'novel',
    title: 'Solo Leveling (Novel)',
    altTitles: ['나 혼자만 레벨업', 'Only I Level Up'],
    description:
      'The original web novel behind Solo Leveling. Follow Sung Jinwoo from the weakest E-rank hunter to humanity’s greatest hope.',
    coverUrl: 'https://picsum.photos/seed/solo-novel/400/560',
    bannerUrl: 'https://picsum.photos/seed/solo-novel-banner/1200/400',
    author: 'Chugong',
    artist: '—',
    status: 'completed',
    genres: ['Action', 'Fantasy', 'LitRPG'],
    rating: 4.9,
    views: 5_600_000,
    chapters: chapters('n1', 10, '2016-07-26'),
    relatedSlug: 'solo-leveling',
  },
  {
    id: 'n2',
    slug: 'omniscient-reader-novel',
    type: 'novel',
    title: 'Omniscient Reader (Novel)',
    altTitles: ['전지적 독자 시점'],
    description:
      'Kim Dokja survives apocalyptic scenarios using his knowledge of a finished web novel—before the manhwa ever existed.',
    coverUrl: 'https://picsum.photos/seed/orv-novel/400/560',
    bannerUrl: 'https://picsum.photos/seed/orv-novel-banner/1200/400',
    author: 'sing N song',
    artist: '—',
    status: 'completed',
    genres: ['Action', 'Drama', 'Apocalypse'],
    rating: 4.9,
    views: 4_100_000,
    chapters: chapters('n2', 8, '2018-01-06'),
    relatedSlug: 'omniscient-reader',
  },
  {
    id: 'n3',
    slug: 'the-beginning-after-the-end',
    type: 'novel',
    title: 'The Beginning After The End',
    altTitles: ['TBATE'],
    description:
      'King Grey is reborn into a world of magic as Arthur Leywin, seeking a life beyond the throne he once held.',
    coverUrl: 'https://picsum.photos/seed/tbate/400/560',
    bannerUrl: 'https://picsum.photos/seed/tbate-banner/1200/400',
    author: 'TurtleMe',
    artist: '—',
    status: 'ongoing',
    genres: ['Fantasy', 'Adventure', 'Reincarnation'],
    rating: 4.8,
    views: 7_200_000,
    chapters: chapters('n3', 12, '2019-04-10'),
  },
]

const novelParagraphs = [
  'The dungeon’s silence pressed against his ears like a physical weight. Somewhere in the dark, something breathed—slow, deliberate, hungry.',
  'He raised his weapon without thinking. Years of being the weakest had taught him caution; the System had taught him something else entirely.',
  '“Status,” he whispered. Light bloomed in his vision—stats, skills, a path forward he had never been allowed to walk before.',
  'Footsteps echoed behind him. Allies, enemies, or both—he could not tell. In this world, the line between them was thinner than a blade.',
  'The boss room opened like a wound in the stone. Crystals hung from the ceiling, pulsing with mana that made his skin prickle.',
  'He remembered a reader’s comment from another life: *This is where it gets good.* He smiled despite himself and stepped inside.',
]

export function getNovelChapterText(
  title: string,
  chapterTitle: string,
  chapterNumber: number,
): string[] {
  const intro = `${chapterTitle} — ${title}\n\n`
  const body = Array.from({ length: 8 + (chapterNumber % 4) }, (_, i) => {
    const p = novelParagraphs[(chapterNumber + i) % novelParagraphs.length]
    return p
  })
  return [intro, ...body]
}
