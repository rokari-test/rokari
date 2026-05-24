import { useCallback, useEffect, useState } from 'react'
import {
  ADMIN_REPORTS_EVENT,
  listReportsForUser,
  type ModerationReport,
} from '../lib/adminReports'

export function useUserReports(userId: string | undefined) {
  const [reports, setReports] = useState<ModerationReport[]>([])

  const refresh = useCallback(() => {
    if (!userId) {
      setReports([])
      return
    }
    setReports(listReportsForUser(userId))
  }, [userId])

  useEffect(() => {
    refresh()
    window.addEventListener(ADMIN_REPORTS_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(ADMIN_REPORTS_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [refresh])

  return { reports, refresh }
}
