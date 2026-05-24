import { useCallback, useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { AdminChapters } from './admin/AdminChapters'
import { AdminDashboard } from './admin/AdminDashboard'
import { AdminPackages } from './admin/AdminPackages'
import { AdminGuard } from './admin/AdminGuard'
import { AdminLayout } from './admin/AdminLayout'
import { AdminLogin } from './admin/AdminLogin'
import { AdminLoyalty } from './admin/AdminLoyalty'
import { AdminSeriesForm } from './admin/AdminSeriesForm'
import { AdminSeriesList } from './admin/AdminSeriesList'
import { AdminSettings } from './admin/AdminSettings'
import { AdminUsers } from './admin/AdminUsers'
import { AdminSubscriptions } from './admin/AdminSubscriptions'
import { AdminReports } from './admin/AdminReports'
import { AdminAnnouncements } from './admin/AdminAnnouncements'
import { AdminAnnouncementForm } from './admin/AdminAnnouncementForm'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Layout } from './components/Layout'
import { NewsPage } from './pages/NewsPage'
import { NewsDetailPage } from './pages/NewsDetailPage'
import { BookmarksPage } from './pages/BookmarksPage'
import { ReportsPage } from './pages/ReportsPage'
import { BrowsePage } from './pages/BrowsePage'
import { HomePage } from './pages/HomePage'
import { ReaderPage } from './pages/ReaderPage'
import { SearchPage } from './pages/SearchPage'
import { LibraryPage } from './pages/LibraryPage'
import { HistoryPage } from './pages/HistoryPage'
import { PreferencesPage } from './pages/PreferencesPage'
import { SettingsPage } from './pages/SettingsPage'
import { StorePage } from './pages/StorePage'
import { AuthPage } from './pages/AuthPage'
import { ProfilePage } from './pages/ProfilePage'
import { PublicUserPage } from './pages/PublicUserPage'
import { SeriesPage } from './pages/SeriesPage'
import { NovelsPage } from './pages/NovelsPage'

function AppRoutes() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchSubmit = useCallback(
    (query: string) => {
      const q = query.trim()
      if (q) navigate(`/browse?q=${encodeURIComponent(q)}&sort=relevance`)
      else navigate('/browse')
    },
    [navigate],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const inField =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      if (inField) return

      if (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault()
        document.getElementById('global-search')?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <Routes>
      <Route
        element={
          <Layout
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchSubmit={handleSearchSubmit}
          />
        }
      >
        <Route index element={<HomePage />} />
        <Route path="news" element={<NewsPage />} />
        <Route path="news/:slug" element={<NewsDetailPage />} />
        <Route path="bookmarks" element={<BookmarksPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="browse" element={<BrowsePage searchQuery={searchQuery} />} />
        <Route path="novels" element={<NovelsPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="library" element={<LibraryPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="preferences" element={<PreferencesPage />} />
        <Route path="store" element={<StorePage />} />
        <Route path="login" element={<AuthPage />} />
        <Route path="register" element={<AuthPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="users/:id" element={<PublicUserPage />} />
        <Route path="series/:slug" element={<SeriesPage />} />
        <Route path="read/:slug/:chapter" element={<ReaderPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminGuard />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="packages" element={<AdminPackages />} />
          <Route path="subscriptions" element={<AdminSubscriptions />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="announcements/new" element={<AdminAnnouncementForm />} />
          <Route path="announcements/:id/edit" element={<AdminAnnouncementForm />} />
          <Route path="series" element={<AdminSeriesList />} />
          <Route path="loyalty" element={<AdminLoyalty />} />
          <Route path="series/new" element={<AdminSeriesForm />} />
          <Route path="series/:id/edit" element={<AdminSeriesForm />} />
          <Route path="series/:id/chapters" element={<AdminChapters />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>
    </Routes>
  )
}

function routerBasename(): string | undefined {
  const base = import.meta.env.BASE_URL
  if (!base || base === '/') return undefined
  return base.replace(/\/$/, '')
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter basename={routerBasename()}>
        <AppRoutes />
      </BrowserRouter>
    </ErrorBoundary>
  )
}

