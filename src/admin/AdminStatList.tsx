export type AdminStatItem = {
  label: string
  value: string
  hint?: string
  highlight?: boolean
}

export type AdminStatGroup = {
  title: string
  items: AdminStatItem[]
  /** Wider grid for plan breakdown rows */
  variant?: 'plans'
}

const CARD_ACCENTS = [
  'pink',
  'rose',
  'violet',
  'teal',
  'amber',
  'sky',
  'lime',
  'coral',
  'fuchsia',
] as const

type CardAccent = (typeof CARD_ACCENTS)[number]

type AdminStatListProps = {
  title?: string
  groups: AdminStatGroup[]
}

function accentForItem(item: AdminStatItem, index: number): CardAccent {
  if (item.highlight) return 'pink'
  return CARD_ACCENTS[index % CARD_ACCENTS.length]
}

export function AdminStatList({ title, groups }: AdminStatListProps) {
  if (!groups.length) return null

  let cardIndex = 0

  return (
    <section className="admin-stat-board">
      {title && <h2 className="admin-stat-board-title">{title}</h2>}
      <div className="admin-stat-board-groups">
        {groups.map((group) => (
          <div
            key={group.title}
            className={`admin-stat-group${group.variant === 'plans' ? ' admin-stat-group--plans' : ''}`}
          >
            <h3 className="admin-stat-group-title">{group.title}</h3>
            <div className="admin-stat-group-grid">
              {group.items.map((item) => {
                const accent = accentForItem(item, cardIndex)
                cardIndex += 1
                return (
                <article
                  key={item.label}
                  className={`admin-stat-card admin-stat-card--${accent}${item.highlight ? ' admin-stat-card--highlight' : ''}`}
                >
                  <span className="admin-stat-card-label">{item.label}</span>
                  <strong className="admin-stat-card-value">{item.value}</strong>
                  {item.hint && <span className="admin-stat-card-hint">{item.hint}</span>}
                </article>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
