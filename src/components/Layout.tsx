import { Outlet, useLocation } from 'react-router-dom'
import { SeriesQuickViewProvider } from '../context/SeriesQuickViewContext'
import { AuthPromptProvider } from '../context/AuthPromptContext'
import { ChapterCoinUnlockProvider } from '../context/ChapterCoinUnlockContext'
import { Footer } from './Footer'
import { Header } from './Header'
import './Layout.css'

interface LayoutProps {
  searchQuery?: string
  onSearchChange?: (query: string) => void
  onSearchSubmit?: (query: string) => void
}

export function Layout({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
}: LayoutProps) {
  const location = useLocation()
  const isReader = location.pathname.includes('/read/')
  const isSeriesDetail = /^\/series\/[^/]+$/.test(location.pathname)
  const isAuth =
    location.pathname === '/login' || location.pathname === '/register'
  const hasBottomNav =
    !isReader &&
    !isAuth &&
    (location.pathname === '/profile' ||
      location.pathname.startsWith('/users/'))

  return (
    <SeriesQuickViewProvider>
      <AuthPromptProvider>
      <ChapterCoinUnlockProvider>
      <div className="layout">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        {!isReader && !isAuth && (
          <Header
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onSearchSubmit={onSearchSubmit}
          />
        )}
        <main
          id="main-content"
          className={`layout-main${isReader ? ' layout-main--reader' : ''}${hasBottomNav ? ' layout-main--bottom-nav' : ''}`}
        >
          <Outlet />
        </main>
        {!isReader && !isSeriesDetail && <Footer />}
      </div>
      </ChapterCoinUnlockProvider>
      </AuthPromptProvider>
    </SeriesQuickViewProvider>
  )
}

