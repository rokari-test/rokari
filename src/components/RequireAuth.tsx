import { Navigate, useLocation } from 'react-router-dom'
import { useUser } from '../hooks/useUser'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useUser()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}
