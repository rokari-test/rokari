export interface RokariGenreGroup {
  label: string
  items: string[]
}

export interface SfwDemographic {
  id: string
  label: string
  description: string
}

/** Tags excluded everywhere (browse + admin add work). */
const BLOCKED_GENRES = new Set(
  [
    'Ecchi',
    'Hentai',
    'Yaoi',
    'Yuri',
    'Bara',
    'Shoujo ai',
    'Shounen ai',
    'Smut',
    'Erotica',
    'Adult',
    'NSFW',
    'Mature',
    'Sexual Content',
    'Fan Service',
    'Doujinshi',
    'Shotacon',
    'Lolicon',
    'Fetish',
    'Incest',
    'Netori',
    'Netorare',
    'Netorare/NTR',
    'NTR',
    'SM/BDSM/SUB-DOM',
    'BDSM',
    'Gore',
    'Harem',
    'Reverse Harem',
    'Omegaverse',
    'Cheating/Infidelity',
    'Imageset',
    'Violence',
    'Bloody',
  ].map((g) => g.toLowerCase()),
)

/** Full SFW genre catalog — grouped for browse filters and admin picker. */
export const ROKARI_GENRE_GROUPS: RokariGenreGroup[] = [
  {
    label: 'FORMAT',
    items: [
      'Manga',
      'Manhwa',
      'Webtoon',
      'Western',
      'Comic',
      'Cartoon',
      '4-Koma',
      'Oneshot',
      'Artbook',
      'Fan-Colored',
      'Full Color',
    ],
  },
  {
    label: 'GENRE',
    items: [
      'Action',
      'Adaptation',
      'Adventure',
      'Comedy',
      'Crime',
      'Drama',
      'Fantasy',
      'Historical',
      'Horror',
      'Mecha',
      'Medical',
      'Military',
      'Music',
      'Mystery',
      'Philosophical',
      'Psychological',
      'Romance',
      'Sci-Fi',
      'Showbiz',
      'Slice of Life',
      'Sports',
      'Superhero',
      'Supernatural',
      'Thriller',
      'Tragedy',
      'War',
      'Wuxia',
      'Xianxia',
      'Xuanhuan',
      'Cultivation',
      'Martial Arts',
    ],
  },
  {
    label: 'THEME',
    items: [
      'Age Gap',
      'Aliens',
      'Animals',
      'Anthology',
      'Apocalypse',
      'Academy',
      'Beasts',
      'Bodyswap',
      'Boys',
      'Cars',
      'Childhood Friends',
      'College Life',
      'Coming of Age',
      'Contest Winning',
      'Cooking',
      'Crossdressing',
      'Delinquents',
      'Dementia',
      'Demons',
      'Detective',
      'Dungeon',
      'Dungeons',
      'Emperor\'s Daughter',
      'Friendship',
      'Game',
      'Gaming',
      'Gender Bender',
      'Genderswap',
      'Ghosts',
      'Girls',
      'Guild',
      'Gyaru',
      'Harlequin',
      'Idol',
      'Isekai',
      'LitRPG',
      'Magic',
      'Magical Girls',
      'Monster Girls',
      'Monsters',
      'Ninja',
      'Office Workers',
      'Police',
      'Post-Apocalyptic',
      'Regression',
      'Reincarnation',
      'Reverse Isekai',
      'Revenge',
      'Robots',
      'Royal Family',
      'Royalty',
      'Samurai',
      'School',
      'School Life',
      'Space',
      'Super Power',
      'Survival',
      'Time Travel',
      'Tower Climbing',
      'Tournament',
      'Traditional Games',
      'Transmigration',
      'Vampires',
      'Villainess',
      'Video Games',
      'Virtual Reality',
      'Workplace',
      'Yakuzas',
      'Zombies',
    ],
  },
  {
    label: 'DEMOGRAPHIC',
    items: ['Shounen', 'Shoujo', 'Seinen', 'Josei', 'Kodomo', 'Kids', 'Silver & Golden', 'Non-human'],
  },
  {
    label: 'SETTING',
    items: [
      'Modern',
      'Urban',
      'Rural',
      'Medieval',
      'Historical China',
      'Historical Korea',
      'Historical Japan',
      'Ocean',
      'Winter',
      'Summer',
    ],
  },
  {
    label: 'MOOD',
    items: [
      'Feel Good',
      'Heartwarming',
      'Dark',
      'Suspense',
      'Wholesome',
      'Inspirational',
      'Slow Burn',
      'Epic',
    ],
  },
]

export const SFW_DEMOGRAPHICS: SfwDemographic[] = [
  {
    id: 'Shoujo',
    label: 'Shoujo (G)',
    description: 'For young teenage girls, roughly between 12–18.',
  },
  {
    id: 'Shounen',
    label: 'Shounen (B)',
    description: 'For young teenage boys, roughly between 12–18.',
  },
  {
    id: 'Josei',
    label: 'Josei (W)',
    description: 'For adult females or younger women, roughly 18–40.',
  },
  {
    id: 'Seinen',
    label: 'Seinen (M)',
    description: 'For young adult males or younger men, roughly 18–40.',
  },
  {
    id: 'Kodomo',
    label: 'Kodomo (Kid)',
    description: 'For little kids or young children (under 8).',
  },
  {
    id: 'Kids',
    label: 'Kids',
    description: 'Family-friendly stories for children and young readers.',
  },
  {
    id: 'Silver & Golden',
    label: 'Silver & Golden',
    description: 'Stories aimed at older readers.',
  },
  {
    id: 'Non-human',
    label: 'Non-human',
    description: 'Stories not centered on humans.',
  },
]

const ALL_PREDEFINED = new Set(
  ROKARI_GENRE_GROUPS.flatMap((g) => g.items.map((i) => i.toLowerCase())),
)

export function getAllSfwGenresFlat(): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const group of ROKARI_GENRE_GROUPS) {
    for (const item of group.items) {
      if (isBlockedGenre(item)) continue
      const key = item.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      out.push(item)
    }
  }
  return out.sort((a, b) => a.localeCompare(b))
}

export function isBlockedGenre(name: string): boolean {
  const normalized = name.trim().toLowerCase()
  if (!normalized) return true
  if (BLOCKED_GENRES.has(normalized)) return true
  return [...BLOCKED_GENRES].some((blocked) => {
    if (blocked.length < 4) return normalized === blocked
    return normalized.includes(blocked) || blocked.includes(normalized)
  })
}

export function sanitizeGenreList(genres: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of genres) {
    const g = raw.trim()
    if (!g || isBlockedGenre(g)) continue
    const key = g.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(g)
  }
  return out.sort((a, b) => a.localeCompare(b))
}

export function filterSfwGenres(query: string, pool?: string[]): string[] {
  const q = query.trim().toLowerCase()
  const base = sanitizeGenreList(pool ?? getAllSfwGenresFlat())
  if (!q) return base
  return base.filter((g) => g.toLowerCase().includes(q))
}

export function getBrowseGenreGroups(
  catalogGenres: string[],
  query: string,
): RokariGenreGroup[] {
  const q = query.trim().toLowerCase()
  const catalogOnly = sanitizeGenreList(catalogGenres)

  const groups = ROKARI_GENRE_GROUPS.map((group) => ({
    label: group.label,
    items: group.items.filter((item) => {
      if (isBlockedGenre(item)) return false
      if (q && !item.toLowerCase().includes(q)) return false
      return true
    }),
  })).filter((group) => group.items.length > 0)

  const extras = catalogOnly.filter((g) => {
    if (ALL_PREDEFINED.has(g.toLowerCase())) return false
    if (q && !g.toLowerCase().includes(q)) return false
    return true
  })

  if (extras.length > 0) {
    groups.push({ label: 'IN CATALOG', items: extras })
  }

  return groups
}

export function normalizeGenreSelection(values: string[]): string[] {
  return sanitizeGenreList(values)
}
