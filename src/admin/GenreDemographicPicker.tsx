import { useMemo, useState } from 'react'
import {
  filterWorkGenres,
  WORK_DEMOGRAPHICS,
  type WorkDemographic,
} from '../lib/workGenreCatalog'
import './GenreDemographicPicker.css'

interface GenreDemographicPickerProps {
  selected: string[]
  onChange: (next: string[]) => void
}

function toggleValue(list: string[], value: string): string[] {
  const key = value.toLowerCase()
  if (list.some((v) => v.toLowerCase() === key)) {
    return list.filter((v) => v.toLowerCase() !== key)
  }
  return [...list, value]
}

function isSelected(list: string[], value: string): boolean {
  return list.some((v) => v.toLowerCase() === value.toLowerCase())
}

export function GenreDemographicPicker({ selected, onChange }: GenreDemographicPickerProps) {
  const [genreQuery, setGenreQuery] = useState('')

  const filteredGenres = useMemo(() => filterWorkGenres(genreQuery), [genreQuery])

  const toggle = (value: string) => {
    onChange(toggleValue(selected, value))
  }

  const renderDemographic = (item: WorkDemographic) => {
    const checked = isSelected(selected, item.id)
    return (
      <label
        key={item.id}
        className={`work-picker-tile work-picker-tile--demo${checked ? ' is-checked' : ''}`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={() => toggle(item.id)}
        />
        <span className="work-picker-tile-title">{item.label}</span>
        <span className="work-picker-tile-desc">{item.description}</span>
      </label>
    )
  }

  return (
    <div className="work-picker">
      <section className="work-picker-section">
        <h3 className="work-picker-heading">Demographic(s)</h3>
        <div className="work-picker-grid work-picker-grid--demo">
          {WORK_DEMOGRAPHICS.map(renderDemographic)}
        </div>
      </section>

      <section className="work-picker-section">
        <h3 className="work-picker-heading">Genre(s)</h3>
        <input
          type="search"
          className="work-picker-search admin-input"
          placeholder="Search genres..."
          value={genreQuery}
          onChange={(e) => setGenreQuery(e.target.value)}
          aria-label="Search genres"
        />
        {filteredGenres.length === 0 ? (
          <p className="work-picker-empty">No genres match your search.</p>
        ) : (
          <div className="work-picker-grid work-picker-grid--genres">
            {filteredGenres.map((genre) => {
              const checked = isSelected(selected, genre)
              return (
                <label
                  key={genre}
                  className={`work-picker-tile work-picker-tile--genre${checked ? ' is-checked' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(genre)}
                  />
                  <span className="work-picker-tile-title">{genre}</span>
                </label>
              )
            })}
          </div>
        )}
        <p className="work-picker-count">
          {selected.length} selected
          {genreQuery.trim() ? ` · showing ${filteredGenres.length} of ${filterWorkGenres('').length}` : ''}
        </p>
      </section>
    </div>
  )
}
