import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  deleteSeries,
  loadCatalog,
  resetCatalog,
  saveCatalog,
} from '../lib/catalogStore'
import { useCatalog } from '../hooks/useCatalog'
import type { ContentType } from '../types'

export function AdminSeriesList() {
  const catalog = useCatalog()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<ContentType | 'all'>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return catalog.filter((s) => {
      const typeOk = typeFilter === 'all' || s.type === typeFilter
      const searchOk =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.slug.includes(q) ||
        s.author.toLowerCase().includes(q)
      return typeOk && searchOk
    })
  }, [catalog, query, typeFilter])

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Delete "${title}" and all its chapters?`)) return
    saveCatalog(deleteSeries(loadCatalog(), id))
  }

  const handleReset = () => {
    if (!confirm('Reset catalog to demo seed data? Custom edits will be lost.')) return
    resetCatalog()
  }

  return (
    <>
      <h1 className="admin-page-title">Series</h1>
      <p className="admin-page-sub">{catalog.length} titles in catalog</p>

      <div className="admin-toolbar">
        <input
          className="admin-input"
          type="search"
          placeholder="Search title, slug, author..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <select
          className="admin-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as ContentType | 'all')}
        >
          <option value="all">All types</option>
          <option value="manhwa">Manhwa</option>
          <option value="novel">Novel</option>
        </select>
        <Link to="/admin/series/new" className="admin-btn">
          + New
        </Link>
        <button type="button" className="admin-btn admin-btn--danger" onClick={handleReset}>
          Reset seed
        </button>
      </div>

      <div className="admin-card admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Status</th>
              <th>Chapters</th>
              <th>Views</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td>
                  <strong>{s.title}</strong>
                  <br />
                  <span style={{ color: 'var(--admin-muted)', fontSize: '0.8rem' }}>
                    /series/{s.slug}
                  </span>
                </td>
                <td>
                  <span className="admin-badge">{s.type}</span>
                </td>
                <td>{s.status}</td>
                <td>{s.chapters.length}</td>
                <td>{(s.views / 1000).toFixed(0)}K</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost"
                    style={{ padding: '0.35rem 0.6rem', marginRight: '0.35rem' }}
                    onClick={() => navigate(`/admin/series/${s.id}/edit`)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost"
                    style={{ padding: '0.35rem 0.6rem', marginRight: '0.35rem' }}
                    onClick={() => navigate(`/admin/series/${s.id}/chapters`)}
                  >
                    Chapters
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn--danger"
                    style={{ padding: '0.35rem 0.6rem' }}
                    onClick={() => handleDelete(s.id, s.title)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p style={{ padding: '1rem', color: 'var(--admin-muted)' }}>No series match.</p>
        )}
      </div>
    </>
  )
}
