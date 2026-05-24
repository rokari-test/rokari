import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ANNOUNCEMENT_CATEGORY_LABELS, type AnnouncementCategory } from '../data/announcements'
import {
  emptyAnnouncement,
  getAnnouncementById,
  newBlockId,
  slugifyAnnouncement,
  upsertAnnouncement,
  type Announcement,
  type AnnouncementBlock,
} from '../lib/announcementStore'
import { ImageUploadField } from './ImageUploadField'

const BLOCK_LABELS: Record<AnnouncementBlock['type'], string> = {
  paragraph: 'Paragraph',
  heading: 'Heading',
  quote: 'Quote',
  image: 'Image',
}

export function AdminAnnouncementForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState<Announcement>(() => emptyAnnouncement())
  const [slugManual, setSlugManual] = useState(false)

  useEffect(() => {
    if (!id) return
    const found = getAnnouncementById(id)
    if (found) {
      setForm(found)
      setSlugManual(true)
    }
  }, [id])

  const update = (patch: Partial<Announcement>) => {
    setForm((prev) => ({ ...prev, ...patch }))
  }

  const updateBlock = (blockId: string, patch: Partial<AnnouncementBlock>) => {
    setForm((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) => (b.id === blockId ? ({ ...b, ...patch } as AnnouncementBlock) : b)),
    }))
  }

  const addBlock = (type: AnnouncementBlock['type']) => {
    const blockId = newBlockId()
    const block: AnnouncementBlock =
      type === 'image'
        ? { id: blockId, type: 'image', src: '', alt: '', caption: '' }
        : type === 'heading'
          ? { id: blockId, type: 'heading', text: '' }
          : type === 'quote'
            ? { id: blockId, type: 'quote', text: '' }
            : { id: blockId, type: 'paragraph', text: '' }
    setForm((prev) => ({ ...prev, blocks: [...prev.blocks, block] }))
  }

  const removeBlock = (blockId: string) => {
    setForm((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((b) => b.id !== blockId),
    }))
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const slug = form.slug.trim() || slugifyAnnouncement(form.title)
    const body =
      form.body.trim() ||
      form.blocks
        .filter((b) => b.type === 'paragraph' || b.type === 'heading')
        .map((b) => ('text' in b ? b.text : ''))
        .filter(Boolean)
        .join('\n\n')
    upsertAnnouncement({ ...form, slug, body })
    navigate('/admin/announcements')
  }

  const slugPreview = form.slug.trim() || slugifyAnnouncement(form.title) || 'your-slug'

  return (
    <>
      <header className="admin-page-head admin-announce-head">
        <div>
          <p className="admin-announce-eyebrow">News editor</p>
          <h1 className="admin-page-title">{isEdit ? 'Edit announcement' : 'New announcement'}</h1>
          <p className="admin-page-sub admin-page-sub--flush">
            Compose a full article with cover art, rich blocks, and a public detail page.
          </p>
        </div>
        <div className="admin-announce-head-actions">
          {slugPreview !== 'your-slug' ? (
            <Link
              to={`/news/${slugPreview}`}
              className="admin-btn admin-btn--ghost"
              target="_blank"
              rel="noreferrer"
            >
              Preview page
            </Link>
          ) : null}
          <Link to="/admin/announcements" className="admin-btn admin-btn--ghost">
            ← Back to list
          </Link>
        </div>
      </header>

      <form className="admin-announce-editor" onSubmit={onSubmit}>
        <div className="admin-announce-layout">
          <div className="admin-announce-main">
            <section className="admin-announce-section admin-card">
              <header className="admin-announce-section-head">
                <h2>Basics</h2>
                <p>Title and short preview shown in feeds and on the News page.</p>
              </header>

              <div className="admin-form-row">
                <label htmlFor="announce-title">Title *</label>
                <input
                  id="announce-title"
                  className="admin-input"
                  required
                  value={form.title}
                  onChange={(e) => {
                    const title = e.target.value
                    update({
                      title,
                      slug: slugManual ? form.slug : slugifyAnnouncement(title),
                    })
                  }}
                  placeholder="Summer event, new feature, etc."
                />
              </div>

              <div className="admin-form-row">
                <label htmlFor="announce-preview">Short preview *</label>
                <textarea
                  id="announce-preview"
                  className="admin-textarea admin-textarea--compact"
                  required
                  rows={3}
                  value={form.preview}
                  onChange={(e) => update({ preview: e.target.value })}
                  placeholder="One or two sentences for cards and the home widget."
                />
              </div>
            </section>

            <section className="admin-announce-section admin-card">
              <header className="admin-announce-section-head">
                <h2>Cover image</h2>
                <p>Wide hero banner on the public detail page (21:9 recommended).</p>
              </header>
              <ImageUploadField
                label="Hero banner"
                value={form.coverImage ?? ''}
                onChange={(url) => update({ coverImage: url || undefined })}
                previewRatio="21 / 9"
                maxWidth={1600}
                maxHeight={900}
              />
            </section>

            <section className="admin-announce-section admin-card admin-announce-blocks">
              <header className="admin-announce-section-head">
                <div>
                  <h2>Article content</h2>
                  <p>Build the full post with paragraphs, headings, quotes, and inline images.</p>
                </div>
                <span className="admin-announce-block-count">{form.blocks.length} blocks</span>
              </header>

              <div className="admin-blocks-toolbar">
                {(Object.keys(BLOCK_LABELS) as AnnouncementBlock['type'][]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`admin-block-add admin-block-add--${type}`}
                    onClick={() => addBlock(type)}
                  >
                    <span className="admin-block-add-icon" aria-hidden />
                    {BLOCK_LABELS[type]}
                  </button>
                ))}
              </div>

              <div className="admin-blocks-list">
                {form.blocks.length === 0 ? (
                  <div className="admin-blocks-empty">
                    <strong>No content blocks yet</strong>
                    <p>Use the buttons above to add your first paragraph, heading, quote, or image.</p>
                  </div>
                ) : (
                  form.blocks.map((block, index) => (
                    <article key={block.id} className={`admin-block-card admin-block-card--${block.type}`}>
                      <div className="admin-block-card-head">
                        <div className="admin-block-card-title">
                          <span className={`admin-block-type admin-block-type--${block.type}`}>
                            {BLOCK_LABELS[block.type]}
                          </span>
                          <span className="admin-block-index">Block {index + 1}</span>
                        </div>
                        <button
                          type="button"
                          className="admin-btn admin-btn--ghost admin-btn--sm admin-btn--danger"
                          onClick={() => removeBlock(block.id)}
                        >
                          Remove
                        </button>
                      </div>

                      {block.type === 'image' ? (
                        <div className="admin-block-fields">
                          <ImageUploadField
                            label="Image file"
                            value={block.src}
                            onChange={(src) => updateBlock(block.id, { src })}
                            previewRatio="16 / 9"
                          />
                          <div className="admin-form-row--2">
                            <div className="admin-form-row">
                              <label htmlFor={`alt-${block.id}`}>Alt text</label>
                              <input
                                id={`alt-${block.id}`}
                                className="admin-input"
                                value={block.alt ?? ''}
                                onChange={(e) => updateBlock(block.id, { alt: e.target.value })}
                                placeholder="Describe the image"
                              />
                            </div>
                            <div className="admin-form-row">
                              <label htmlFor={`cap-${block.id}`}>Caption</label>
                              <input
                                id={`cap-${block.id}`}
                                className="admin-input"
                                value={block.caption ?? ''}
                                onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                                placeholder="Optional caption under the image"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="admin-form-row">
                          <label htmlFor={`text-${block.id}`}>
                            {block.type === 'heading' ? 'Heading text' : block.type === 'quote' ? 'Quote' : 'Paragraph'}
                          </label>
                          <textarea
                            id={`text-${block.id}`}
                            className={`admin-textarea${block.type === 'paragraph' ? '' : ' admin-textarea--compact'}`}
                            rows={block.type === 'paragraph' ? 5 : 2}
                            value={block.text}
                            onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                            placeholder={
                              block.type === 'heading'
                                ? 'Section heading…'
                                : block.type === 'quote'
                                  ? 'Pull quote or highlight…'
                                  : 'Write your paragraph…'
                            }
                          />
                        </div>
                      )}
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>

          <aside className="admin-announce-sidebar">
            <section className="admin-card admin-announce-panel">
              <header className="admin-announce-section-head">
                <h2>Publish</h2>
                <p>Visibility, URL, and scheduling.</p>
              </header>

              <div className="admin-form-row">
                <label htmlFor="announce-slug">URL slug *</label>
                <div className="admin-slug-field">
                  <span className="admin-slug-prefix">/news/</span>
                  <input
                    id="announce-slug"
                    className="admin-input admin-slug-input"
                    required
                    value={form.slug}
                    onChange={(e) => {
                      setSlugManual(true)
                      update({ slug: slugifyAnnouncement(e.target.value) })
                    }}
                    placeholder="welcome-to-rokari"
                  />
                </div>
                <p className="admin-field-hint">Public link: <code>/news/{slugPreview}</code></p>
              </div>

              <div className="admin-form-row">
                <label htmlFor="announce-category">Category</label>
                <select
                  id="announce-category"
                  className="admin-select"
                  value={form.category}
                  onChange={(e) => update({ category: e.target.value as AnnouncementCategory })}
                >
                  {(Object.keys(ANNOUNCEMENT_CATEGORY_LABELS) as AnnouncementCategory[]).map((key) => (
                    <option key={key} value={key}>
                      {ANNOUNCEMENT_CATEGORY_LABELS[key]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-form-row">
                <label htmlFor="announce-date">Posted date</label>
                <input
                  id="announce-date"
                  className="admin-input"
                  type="datetime-local"
                  value={form.postedAt.slice(0, 16)}
                  onChange={(e) => update({ postedAt: new Date(e.target.value).toISOString() })}
                />
              </div>

              <div className="admin-toggle-list">
                <label className="admin-toggle">
                  <input
                    type="checkbox"
                    checked={form.published !== false}
                    onChange={(e) => update({ published: e.target.checked })}
                  />
                  <span className="admin-toggle-copy">
                    <strong>Published</strong>
                    <small>Visible on News and the home widget</small>
                  </span>
                </label>
                <label className="admin-toggle">
                  <input
                    type="checkbox"
                    checked={Boolean(form.pinned)}
                    onChange={(e) => update({ pinned: e.target.checked })}
                  />
                  <span className="admin-toggle-copy">
                    <strong>Featured</strong>
                    <small>Pin as the hero card on the News page</small>
                  </span>
                </label>
              </div>

              <div className="admin-announce-panel-actions">
                <button type="submit" className="admin-btn admin-btn--block">
                  {isEdit ? 'Save changes' : 'Publish announcement'}
                </button>
                <Link to="/admin/announcements" className="admin-btn admin-btn--ghost admin-btn--block">
                  Cancel
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </form>
    </>
  )
}
