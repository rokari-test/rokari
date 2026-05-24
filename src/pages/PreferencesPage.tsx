import { Navigate } from 'react-router-dom'

/** Legacy route — Kagane uses /settings */
export function PreferencesPage() {
  return <Navigate to="/settings" replace />
}
