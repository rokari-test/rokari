import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  loadCatalog,
  nextSeriesId,
  saveCatalog,
  slugify,
  upsertSeries,
} from '../lib/catalogStore'
import type { ContentType, Series, SeriesStatus } from '../types'
import { normalizeWorkGenreSelection } from '../lib/workGenreCatalog'
import { fullInfoDraftFromSeries } from '../lib/seriesFullInfo'
import { SeriesFullInfoFields } from '../components/SeriesFullInfoFields'
import { SeriesSourceSelect } from '../components/SeriesSourceSelect'
import { BannerUploadField } from './BannerUploadField'
import { GenreDemographicPicker } from './GenreDemographicPicker'
import { ImageUploadField } from './ImageUploadField'

const emptyForm = (): Omit<Series, 'chapters'> & { chapters: Series['chapters'] } => ({
  id: '',
  slug: '',
  type: 'manhwa',
  title: '',
  altTitles: [],
  description: '',
  coverUrl: '',
  bannerUrl: '',
  bannerFocalX: 50,
  bannerFocalY: 50,
  author: '',
  artist: '',
  status: 'ongoing',
  genres: [],
  rating: 4.5,
  views: 0,
  chapters: [],
})

export function AdminSeriesForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [altTitlesText, setAltTitlesText] = useState('')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [slugManual, setSlugManual] = useState(false)

  useEffect(() => {
    if (!id) return
    const found = loadCatalog().find((s) => s.id === id)
    if (found) {
      setForm(found)
      setAltTitlesText(found.altTitles.join(', '))
      setSelectedGenres(normalizeWorkGenreSelection(found.genres))
      setSlugManual(true)
    }
  }, [id])

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const catalog = loadCatalog()
    const seriesId = isEdit ? form.id : nextSeriesId(catalog)
    const slug = slugManual && form.slug ? form.slug : slugify(form.title)
    const altTitles = altTitlesText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    const genres = normalizeWorkGenreSelection(selectedGenres)

    const series: Series = {
      ...form,
      id: seriesId,
      slug,
      altTitles,
      genres,
      coverUrl: form.coverUrl || `https://picsum.photos/seed/${slug}/400/560`,
      bannerUrl: form.bannerUrl || `https://picsum.photos/seed/${slug}-banner/1200/400`,
    }
    if (!series.source) delete series.source

    saveCatalog(upsertSeries(catalog, series))
    navigate(`/admin/series/${series.id}/chapters`)
  }

  return (
    <>
      <h1 className="admin-page-title">{isEdit ? 'Edit series' : 'New series'}</h1>
      <p className="admin-page-sub">
        {isEdit ? 'Update metadata and cover images.' : 'Create a new title, then add chapters.'}
      </p>

      <form className="admin-form admin-form--series admin-card" onSubmit={handleSubmit}>
        <div className="admin-form-row">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            className="admin-input"
            value={form.title}
            onChange={(e) => {
              update('title', e.target.value)
              if (!slugManual) update('slug', slugify(e.target.value))
            }}
            required
          />
        </div>

        <div className="admin-form-row">
          <label htmlFor="slug">URL slug *</label>
          <input
            id="slug"
            className="admin-input"
            value={form.slug}
            onChange={(e) => {
              setSlugManual(true)
              update('slug', e.target.value)
            }}
            required
          />
        </div>

        <div className="admin-form-row admin-form-row--2">
          <div className="admin-form-row">
            <label htmlFor="type">Type</label>
            <select
              id="type"
              className="admin-select"
              value={form.type}
              onChange={(e) => update('type', e.target.value as ContentType)}
            >
              <option value="manhwa">Manhwa</option>
              <option value="novel">Novel</option>
            </select>
          </div>
          <div className="admin-form-row">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              className="admin-select"
              value={form.status}
              onChange={(e) => update('status', e.target.value as SeriesStatus)}
            >
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="hiatus">Hiatus</option>
            </select>
          </div>
        </div>

        <div className="admin-form-row admin-form-row--2">
          <div className="admin-form-row">
            <label htmlFor="author">Author</label>
            <input
              id="author"
              className="admin-input"
              value={form.author}
              onChange={(e) => update('author', e.target.value)}
            />
          </div>
          <div className="admin-form-row">
            <label htmlFor="artist">Artist</label>
            <input
              id="artist"
              className="admin-input"
              value={form.artist}
              onChange={(e) => update('artist', e.target.value)}
            />
          </div>
        </div>

        <div className="admin-form-row">
          <label htmlFor="source">Source platform (optional)</label>
          <SeriesSourceSelect
            id="source"
            className="admin-select"
            value={form.source}
            onChange={(source) => update('source', source)}
          />
          <p className="admin-form-hint">
            e.g. Webtoon, Lezhin, Tapas — shown on cards and search when set.
          </p>
        </div>

        <div className="admin-form-row">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            className="admin-textarea"
            style={{ minHeight: 100 }}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
          />
        </div>

        <div className="admin-form-row">
          <label htmlFor="altTitles">Alternate titles (comma-separated)</label>
          <input
            id="altTitles"
            className="admin-input"
            value={altTitlesText}
            onChange={(e) => setAltTitlesText(e.target.value)}
          />
        </div>

        <div className="admin-form-row admin-form-row--wide">
          <GenreDemographicPicker
            selected={selectedGenres}
            onChange={setSelectedGenres}
          />
        </div>

        <div className="admin-form-row admin-form-row--2">
          <div className="admin-form-row">
            <label htmlFor="rating">Rating (0–5)</label>
            <input
              id="rating"
              className="admin-input"
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={form.rating}
              onChange={(e) => update('rating', Number(e.target.value))}
            />
          </div>
          <div className="admin-form-row">
            <label htmlFor="views">Views</label>
            <input
              id="views"
              className="admin-input"
              type="number"
              min={0}
              value={form.views}
              onChange={(e) => update('views', Number(e.target.value))}
            />
          </div>
        </div>

        <div className="admin-form-row">
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

        <div className="admin-form-row">
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

        <div className="admin-form-row admin-form-row--full">
          <h2 className="admin-form-section-title">Full info</h2>
          <p className="admin-form-hint">
            Ratings, external links, and localized titles shown on the series Full info tab.
          </p>
          <SeriesFullInfoFields
            value={
              form.fullInfo ??
              fullInfoDraftFromSeries({
                ...(form as Series),
                id: form.id || 'draft',
                slug: form.slug || 'draft',
              })
            }
            onChange={(fullInfo) => update('fullInfo', fullInfo)}
          />
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="admin-btn">
            {isEdit ? 'Save changes' : 'Create & add chapters'}
          </button>
          <Link to="/admin/series" className="admin-btn admin-btn--ghost">
            Cancel
          </Link>
        </div>
      </form>
    </>
  )
}
