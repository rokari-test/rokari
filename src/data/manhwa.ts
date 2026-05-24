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
    d.setDate(d.getDate() + i * 7)
    return {
      id: `${seriesId}-ch-${n}`,
      number: n,
      title: n === 1 ? 'Prologue' : `Chapter ${n}`,
      updatedAt: d.toISOString().slice(0, 10),
      pageCount: 12 + (n % 5),
    }
  })
}

export const manhwaList: Series[] = [
  {
    id: '1',
    slug: 'solo-leveling',
    type: 'manhwa',
    relatedSlug: 'solo-leveling-novel',
    title: 'Solo Leveling',
    altTitles: ['나 혼자만 레벨업', 'I Level Up Alone'],
    description:
      'In a world where hunters fight monsters from other dimensions, the weakest hunter Sung Jinwoo gains a mysterious system that lets him level up without limit.',
    coverUrl: 'https://picsum.photos/seed/solo-leveling/400/560',
    bannerUrl: 'https://picsum.photos/seed/solo-leveling-banner/1200/400',
    author: 'Chugong',
    artist: 'Dubu (Redice Studio)',
    status: 'completed',
    genres: ['Action', 'Fantasy', 'Adventure'],
    rating: 4.9,
    views: 12_400_000,
    chapters: chapters('1', 24, '2020-03-04'),
  },
  {
    id: '2',
    slug: 'tower-of-god',
    type: 'manhwa',
    title: 'Tower of God',
    altTitles: ['신의 탑'],
    description:
      'Bam enters the Tower to find Rachel, climbing floors filled with deadly tests, politics, and beings far beyond human strength.',
    coverUrl: 'https://picsum.photos/seed/tower-of-god/400/560',
    bannerUrl: 'https://picsum.photos/seed/tower-of-god-banner/1200/400',
    author: 'SIU',
    artist: 'SIU',
    status: 'ongoing',
    genres: ['Fantasy', 'Mystery', 'Drama'],
    rating: 4.7,
    views: 8_900_000,
    chapters: chapters('2', 18, '2021-06-12'),
  },
  {
    id: '3',
    slug: 'omniscient-reader',
    type: 'manhwa',
    relatedSlug: 'omniscient-reader-novel',
    title: 'Omniscient Reader',
    altTitles: ['전지적 독자 시점'],
    description:
      'Kim Dokja is the only reader of a finished web novel—until the story becomes reality and he must use his knowledge to survive the scenarios.',
    coverUrl: 'https://picsum.photos/seed/omniscient-reader/400/560',
    bannerUrl: 'https://picsum.photos/seed/omniscient-reader-banner/1200/400',
    author: 'sing N song',
    artist: 'Sleepy-C, Umtoki',
    status: 'ongoing',
    genres: ['Action', 'Drama', 'Supernatural'],
    rating: 4.8,
    views: 6_200_000,
    chapters: chapters('3', 15, '2022-01-20'),
  },
  {
    id: '4',
    slug: 'lookism',
    type: 'manhwa',
    title: 'Lookism',
    altTitles: ['외모지상주의'],
    description:
      'Park Hyung Suk switches between two bodies—one handsome, one not—and navigates school life, fighting, and the cost of appearance.',
    coverUrl: 'https://picsum.photos/seed/lookism/400/560',
    bannerUrl: 'https://picsum.photos/seed/lookism-banner/1200/400',
    author: 'Park Tae-joon',
    artist: 'Park Tae-joon',
    status: 'ongoing',
    genres: ['Drama', 'School', 'Action'],
    rating: 4.6,
    views: 10_100_000,
    chapters: chapters('4', 20, '2019-11-08'),
  },
  {
    id: '5',
    slug: 'bastard',
    type: 'manhwa',
    title: 'Bastard',
    altTitles: ['후레자식'],
    description:
      'A model student hides a terrifying secret at home. When a new girl arrives, his carefully controlled life begins to unravel.',
    coverUrl: 'https://picsum.photos/seed/bastard/400/560',
    bannerUrl: 'https://picsum.photos/seed/bastard-banner/1200/400',
    author: 'Carnby Kim',
    artist: 'Youngchan Hwang',
    status: 'completed',
    genres: ['Thriller', 'Horror', 'Mystery'],
    rating: 4.8,
    views: 4_500_000,
    chapters: chapters('5', 12, '2021-09-01'),
  },
  {
    id: '6',
    slug: 'wind-breaker',
    type: 'manhwa',
    title: 'Wind Breaker',
    altTitles: ['윈드브레이커'],
    description:
      'Jo Ja-Hyun joins a high school where cycling gangs rule the streets, chasing freedom on two wheels and proving himself ride by ride.',
    coverUrl: 'https://picsum.photos/seed/wind-breaker/400/560',
    bannerUrl: 'https://picsum.photos/seed/wind-breaker-banner/1200/400',
    author: 'Yongseok Jo',
    artist: 'Yongseok Jo',
    status: 'ongoing',
    genres: ['Sports', 'Action', 'School'],
    rating: 4.5,
    views: 3_800_000,
    chapters: chapters('6', 14, '2023-04-15'),
  },
  {
    id: '7',
    slug: 'noblesse',
    type: 'manhwa',
    title: 'Noblesse',
    altTitles: ['노블레스'],
    description:
      'Rai awakens after 820 years and enrolls in Ye Ran High School, hiding his identity as the Noblesse while fighting a secret organization.',
    coverUrl: 'https://picsum.photos/seed/noblesse/400/560',
    bannerUrl: 'https://picsum.photos/seed/noblesse-banner/1200/400',
    author: 'Son Jeho',
    artist: 'Lee Kwangsu',
    status: 'completed',
    genres: ['Action', 'Supernatural', 'School'],
    rating: 4.7,
    views: 5_900_000,
    chapters: chapters('7', 16, '2021-01-10'),
  },
  {
    id: '8',
    slug: 'god-of-high-school',
    type: 'manhwa',
    title: 'The God of High School',
    altTitles: ['갓 오브 하이스쿨'],
    description:
      'Mori Jin enters a martial arts tournament where the prize is any wish — and fighters soon discover the stakes are far greater than fame.',
    coverUrl: 'https://picsum.photos/seed/goh/400/560',
    bannerUrl: 'https://picsum.photos/seed/goh-banner/1200/400',
    author: 'Yongje Park',
    artist: 'Yongje Park',
    status: 'completed',
    genres: ['Action', 'Martial Arts', 'Fantasy'],
    rating: 4.6,
    views: 7_100_000,
    chapters: chapters('8', 18, '2020-08-22'),
  },
  {
    id: '9',
    slug: 'eleceed',
    type: 'manhwa',
    title: 'Eleceed',
    altTitles: ['일렉시드'],
    description:
      'Jiwoo is a kind-hearted boy with super speed who adopts a fat cat — unaware it is a powerful awakener from another world.',
    coverUrl: 'https://picsum.photos/seed/eleceed/400/560',
    bannerUrl: 'https://picsum.photos/seed/eleceed-banner/1200/400',
    author: 'Son Jeho',
    artist: 'ZHENA',
    status: 'ongoing',
    genres: ['Action', 'Comedy', 'Supernatural'],
    rating: 4.7,
    views: 4_200_000,
    chapters: chapters('9', 12, '2024-02-01'),
  },
]

export function getManhwaBySlug(slug: string) {
  return manhwaList.find((m) => m.slug === slug)
}

