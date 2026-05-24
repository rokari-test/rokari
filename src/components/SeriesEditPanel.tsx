import { useEffect, useState, type FormEvent } from 'react'
import { loadCatalog, saveCatalog, slugify, upsertSeries } from '../lib/catalogStore'
import { fullInfoDraftFromSeries } from '../lib/seriesFullInfo'
import { normalizeWorkGenreSelection } from '../lib/workGenreCatalog'
import type { ContentType, Series, SeriesStatus } from '../types'
import { GenreDemographicPicker } from '../admin/GenreDemographicPicker'
import { BannerUploadField } from '../admin/BannerUploadField'
import { ImageUploadField } from '../admin/ImageUploadField'
import { SeriesFullInfoFields } from './SeriesFullInfoFields'
import { SeriesSourceSelect } from './SeriesSourceSelect'
import './SeriesFullInfo.css'
import './SeriesEditPanel.css'

interface SeriesEditPanelProps {
  series: Series
}

export function SeriesEditPanel({ series }: SeriesEditPanelProps) {
  const [form, setForm] = useState(series)
  const [altTitlesText, setAltTitlesText] = useState(series.altTitles.join(', '))
  const [selectedGenres, setSelectedGenres] = useState<string[]>(() =>
    normalizeWorkGenreSelection(series.genres),
  )
  const [slugManual, setSlugManual] = useState(true)
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    setForm(series)
    setAltTitlesText(series.altTitles.join(', '))
    setSelectedGenres(normalizeWorkGenreSelection(series.genres))
    setSlugManual(true)
  }, [series.id, series])

  const update = <K extends keyof Series>(key: K, value: Series[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const catalog = loadCatalog()
    const slug = slugManual && form.slug ? form.slug : slugify(form.title)
    const altTitles = altTitlesText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    const genres = normalizeWorkGenreSelection(selectedGenres)

    const updated: Series = {
      ...form,
      slug,
      altTitles,
      genres,
      coverUrl: form.coverUrl || `https://picsum.photos/seed/${slug}/400/560`,
      bannerUrl: form.bannerUrl || `https://picsum.photos/seed/${slug}-banner/1200/400`,
    }
    if (!updated.source) delete updated.source

    saveCatalog(upsertSeries(catalog, updated))
    setForm(updated)
    setSavedFlash(true)
    window.setTimeout(() => setSavedFlash(false), 2000)
  }

  return (
    <div className="rok-edit">
      <div className="rok-edit-head">
        <div>
          <p className="rok-edit-eyebrow">Rokari studio</p>
          <h3 className="rok-edit-title">Edit series</h3>
        </div>
        {savedFlash ? <span className="rok-edit-saved">Saved</span> : null}
      </div>

      <form className="rok-edit-form" onSubmit={handleSubmit}>
        <fieldset className="rok-full-fields-group">
          <legend>Basics</legend>
          <div className="rok-full-fields-row">
            <label>
              Title
              <input
                value={form.title}
                onChange={(e) => {
                  update('title', e.target.value)
                  if (!slugManual) update('slug', slugify(e.target.value))
                }}
                required
              />
            </label>
            <label>
              URL slug
              <input
                value={form.slug}
                onChange={(e) => {
                  setSlugManual(true)
                  update('slug', e.target.value)
                }}
                required
              />
            </label>
          </div>
          <div className="rok-full-fields-row">
            <label>
              Type
              <select
                value={form.type}
                onChange={(e) => update('type', e.target.value as ContentType)}
              >
                <option value="manhwa">Manhwa</option>
                <option value="novel">Novel</option>
              </select>
            </label>
            <label>
              Status
              <select
                value={form.status}
                onChange={(e) => update('status', e.target.value as SeriesStatus)}
              >
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="hiatus">Hiatus</option>
              </select>
            </label>
          </div>
          <div className="rok-full-fields-row">
            <label>
              Author
              <input value={form.author} onChange={(e) => update('author', e.target.value)} />
            </label>
            <label>
              Artist
              <input value={form.artist} onChange={(e) => update('artist', e.target.value)} />
            </label>
          </div>
          <label>
            Source platform (optional)
            <SeriesSourceSelect
              value={form.source}
              onChange={(source) => update('source', source)}
            />
          </label>
        </fieldset>

        <fieldset className="rok-full-fields-group">
          <legend>Story</legend>
          <label className="rok-edit-block-label">
            Description
            <textarea
              className="rok-edit-textarea"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              rows={5}
            />
          </label>
          <label className="rok-edit-block-label">
            Alternate titles (comma-separated)
            <input
              value={altTitlesText}
              onChange={(e) => setAltTitlesText(e.target.value)}
            />
          </label>
        </fieldset>

        <fieldset className="rok-full-fields-group">
          <legend>Genres</legend>
          <GenreDemographicPicker selected={selectedGenres} onChange={setSelectedGenres} />
        </fieldset>

        <fieldset className="rok-full-fields-group">
          <legend>Stats</legend>
          <div className="rok-full-fields-row">
            <label>
              Rating (0–5)
              <input
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={form.rating}
                onChange={(e) => update('rating', Number(e.target.value))}
              />
            </label>
            <label>
              Views
              <input
                type="number"
                min={0}
                value={form.views}
                onChange={(e) => update('views', Number(e.target.value))}
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="rok-full-fields-group">
          <legend>Images</legend>
          <div className="rok-edit-upload">
            <ImageUploadField
              label="Cover image"
              value={form.coverUrl}
              onChange={(url) => update('coverUrl', url)}
              maxWidth={480}
              maxHeight={672}
              previewRatio="5 / 7"
              urlPlaceholder="https://... or upload from device"
            />
          </div>
          <div className="rok-edit-upload">
            <BannerUploadField
              value={form.bannerUrl}
              focalX={form.bannerFocalX ?? 50}
              focalY={form.bannerFocalY ?? 50}
              onChange={(url) => update('bannerUrl', url)}
              onFocalChange={(x, y) => {
                setForm((f) => ({ ...f, bannerFocalX: x, bannerFocalY: y }))
              }}
            />
          </div>
        </fieldset>

        <fieldset className="rok-full-fields-group">
          <legend>Full info tab</legend>
          <p className="rok-full-fields-hint">
            Ratings, external links, and localized titles shown on the Full info tab.
          </p>
          <SeriesFullInfoFields
            value={form.fullInfo ?? fullInfoDraftFromSeries(form)}
            onChange={(fullInfo) => update('fullInfo', fullInfo)}
          />
        </fieldset>

        <div className="rok-edit-actions">
          <button type="submit" className="rok-full-btn rok-full-btn--primary">
            Save changes
          </button>
        </div>
      </form>
    </div>
  )
}
