import type { SeriesFullInfo, SeriesTitleEntry, SeriesExternalLinkEntry } from '../types'

interface SeriesFullInfoFieldsProps {
  value: SeriesFullInfo
  onChange: (next: SeriesFullInfo) => void
}

export function SeriesFullInfoFields({ value, onChange }: SeriesFullInfoFieldsProps) {
  const distribution = value.ratingDistribution ?? Array.from({ length: 10 }, () => 0)
  const titles = value.titles ?? []
  const links = value.externalLinks ?? []

  const patch = (partial: Partial<SeriesFullInfo>) => onChange({ ...value, ...partial })

  const setDistributionAt = (index: number, count: number) => {
    const next = [...distribution]
    next[index] = Math.max(0, count)
    patch({ ratingDistribution: next })
  }

  const updateTitle = (index: number, partial: Partial<SeriesTitleEntry>) => {
    const next = titles.map((t, i) => (i === index ? { ...t, ...partial } : t))
    patch({ titles: next })
  }

  const updateLink = (index: number, partial: Partial<SeriesExternalLinkEntry>) => {
    const next = links.map((l, i) => (i === index ? { ...l, ...partial } : l))
    patch({ externalLinks: next })
  }

  return (
    <div className="rok-full-fields">
      <fieldset className="rok-full-fields-group">
        <legend>Ratings</legend>
        <div className="rok-full-fields-row">
          <label>
            Vote count
            <input
              type="number"
              min={0}
              value={value.voteCount ?? 0}
              onChange={(e) => patch({ voteCount: Number(e.target.value) || 0 })}
            />
          </label>
          <label>
            Average (/10)
            <input
              type="number"
              min={0}
              max={10}
              step={0.1}
              value={value.averageRating ?? 0}
              onChange={(e) => patch({ averageRating: Number(e.target.value) || 0 })}
            />
          </label>
          <label>
            Bayesian (/10)
            <input
              type="number"
              min={0}
              max={10}
              step={0.1}
              value={value.bayesianRating ?? 0}
              onChange={(e) => patch({ bayesianRating: Number(e.target.value) || 0 })}
            />
          </label>
        </div>
        <p className="rok-full-fields-hint">Score distribution (votes per star 1–10)</p>
        <div className="rok-full-fields-dist">
          {distribution.map((count, i) => (
            <label key={i}>
              <span>{i + 1}★</span>
              <input
                type="number"
                min={0}
                value={count}
                onChange={(e) => setDistributionAt(i, Number(e.target.value) || 0)}
              />
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="rok-full-fields-group">
        <legend>Titles</legend>
        <ul className="rok-full-fields-list">
          {titles.map((entry, i) => (
            <li key={i} className="rok-full-fields-item">
              <input
                type="text"
                placeholder="EN"
                value={entry.language}
                onChange={(e) => updateTitle(i, { language: e.target.value.toUpperCase() })}
                className="rok-full-fields-lang"
              />
              <input
                type="text"
                placeholder="Language label"
                value={entry.label ?? ''}
                onChange={(e) => updateTitle(i, { label: e.target.value })}
              />
              <input
                type="text"
                placeholder="Title"
                value={entry.title}
                onChange={(e) => updateTitle(i, { title: e.target.value })}
                className="rok-full-fields-grow"
              />
              <label className="rok-full-fields-check">
                <input
                  type="checkbox"
                  checked={Boolean(entry.primary)}
                  onChange={(e) => updateTitle(i, { primary: e.target.checked })}
                />
                Primary
              </label>
              <button
                type="button"
                className="rok-full-fields-remove"
                onClick={() => patch({ titles: titles.filter((_, j) => j !== i) })}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="rok-full-fields-add"
          onClick={() =>
            patch({
              titles: [...titles, { language: 'EN', label: 'English', title: '', primary: false }],
            })
          }
        >
          + Add title
        </button>
      </fieldset>

      <fieldset className="rok-full-fields-group">
        <legend>External links</legend>
        <ul className="rok-full-fields-list">
          {links.map((link, i) => (
            <li key={i} className="rok-full-fields-item">
              <input
                type="text"
                placeholder="Label"
                value={link.label}
                onChange={(e) => updateLink(i, { label: e.target.value })}
              />
              <input
                type="url"
                placeholder="https://"
                value={link.href}
                onChange={(e) => updateLink(i, { href: e.target.value })}
                className="rok-full-fields-grow"
              />
              <button
                type="button"
                className="rok-full-fields-remove"
                onClick={() => patch({ externalLinks: links.filter((_, j) => j !== i) })}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="rok-full-fields-add"
          onClick={() =>
            patch({
              externalLinks: [...links, { label: '', href: 'https://' }],
            })
          }
        >
          + Add link
        </button>
      </fieldset>
    </div>
  )
}
