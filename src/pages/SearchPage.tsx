import { Navigate, useSearchParams } from 'react-router-dom'

export function SearchPage() {
  const [params] = useSearchParams()
  const q = params.get('q')?.trim()
  const target = q
    ? `/browse?q=${encodeURIComponent(q)}&sort=relevance`
    : '/browse'
  return <Navigate to={target} replace />
}
