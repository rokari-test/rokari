import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCatalog } from '../hooks/useCatalog'
import {
  addChapter,
  createChapterId,
  deleteChapter,
  loadCatalog,
  saveCatalog,
  updateChapter,
} from '../lib/catalogStore'
import type { Chapter } from '../types'

export function AdminChapters() {
  const { id } = useParams<{ id: string }>()
  const catalog = useCatalog()
  const series = catalog.find((s) => s.id === id)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    number: 1,
    title: 'Chapter 1',
    updatedAt: new Date().toISOString().slice(0, 10),
    pagesText: '',
  })

  if (!series) {
    return (
      <>
        <h1 className="admin-page-title">Series not found</h1>
        <Link to="/admin/series">Back to list</Link>
      </>
    )
  }

  const resetForm = () => {
    const nextNum =
      series.chapters.length > 0
        ? Math.max(...series.chapters.map((c) => c.number)) + 1
        : 1
    setForm({
      number: nextNum,
      title: `Chapter ${nextNum}`,
      updatedAt: new Date().toISOString().slice(0, 10),
      pagesText: '',
    })
    setEditingId(null)
  }

  const startEdit = (chapter: Chapter) => {
    setEditingId(chapter.id)
    setForm({
      number: chapter.number,
      title: chapter.title,
      updatedAt: chapter.updatedAt,
      pagesText: (chapter.pages ?? []).join('\n'),
    })
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const pages = form.pagesText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    const pageCount = pages.length > 0 ? pages.length : 12

    const chapter: Chapter = {
      id: editingId ?? createChapterId(series.id, form.number),
      number: form.number,
      title: form.title,
      updatedAt: form.updatedAt,
      pageCount,
      pages: pages.length > 0 ? pages : undefined,
    }

    let updated = loadCatalog().find((s) => s.id === series.id)!
    if (editingId) {
      updated = updateChapter(updated, chapter)
    } else {
      updated = addChapter(updated, chapter)
    }

    const nextCatalog = catalog.map((s) => (s.id === series.id ? updated : s))
    saveCatalog(nextCatalog)
    resetForm()
  }

  const handleDelete = (chapterId: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return
    const updated = deleteChapter(
      loadCatalog().find((s) => s.id === series.id)!,
      chapterId,
    )
    saveCatalog(catalog.map((s) => (s.id === series.id ? updated : s)))
    if (editingId === chapterId) resetForm()
  }

  return (
    <>
      <h1 className="admin-page-title">Chapters — {series.title}</h1>
      <p className="admin-page-sub">
        {series.chapters.length} chapters ·{' '}
        <Link to={`/series/${series.slug}`}>View on site</Link>
      </p>

      <div className="admin-toolbar">
        <Link to={`/admin/series/${series.id}/edit`} className="admin-btn admin-btn--ghost">
          Edit series
        </Link>
        <Link to="/admin/series" className="admin-btn admin-btn--ghost">
          All series
        </Link>
      </div>

      <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: '0 0 1rem', fontSize: '1.05rem' }}>
          {editingId ? 'Edit chapter' : 'Add chapter'}
        </h2>
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form-row admin-form-row--2">
            <div className="admin-form-row">
              <label htmlFor="ch-num">Number</label>
              <input
                id="ch-num"
                className="admin-input"
                type="number"
                min={0}
                value={form.number}
                onChange={(e) => setForm((f) => ({ ...f, number: Number(e.target.value) }))}
                required
              />
            </div>
            <div className="admin-form-row">
              <label htmlFor="ch-date">Updated</label>
              <input
                id="ch-date"
                className="admin-input"
                type="date"
                value={form.updatedAt}
                onChange={(e) => setForm((f) => ({ ...f, updatedAt: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="admin-form-row">
            <label htmlFor="ch-title">Title</label>
            <input
              id="ch-title"
              className="admin-input"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </div>
          <div className="admin-form-row">
            <label htmlFor="ch-pages">
              Page image URLs (one per line). Leave empty for placeholder images.
            </label>
            <textarea
              id="ch-pages"
              className="admin-textarea"
              value={form.pagesText}
              onChange={(e) => setForm((f) => ({ ...f, pagesText: e.target.value }))}
              placeholder="https://cdn.example.com/ch1/page01.jpg&#10;https://..."
            />
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="admin-btn">
              {editingId ? 'Save chapter' : 'Add chapter'}
            </button>
            {editingId && (
              <button type="button" className="admin-btn admin-btn--ghost" onClick={resetForm}>
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-card">
        <h2 style={{ margin: '0 0 1rem', fontSize: '1.05rem' }}>Chapter list</h2>
        <div className="admin-chapter-list">
          {[...series.chapters]
            .sort((a, b) => b.number - a.number)
            .map((ch) => (
              <div key={ch.id} className="admin-chapter-item">
                <div>
                  <strong>
                    #{ch.number} — {ch.title}
                  </strong>
                  <br />
                  <span style={{ color: 'var(--admin-muted)', fontSize: '0.8rem' }}>
                    {ch.pageCount} pages · {ch.updatedAt}
                    {ch.pages?.length ? ' · custom URLs' : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost"
                    style={{ padding: '0.35rem 0.6rem' }}
                    onClick={() => startEdit(ch)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn--danger"
                    style={{ padding: '0.35rem 0.6rem' }}
                    onClick={() => handleDelete(ch.id, ch.title)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  )
}
