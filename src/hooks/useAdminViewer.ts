import { useEffect, useState } from 'react'
import { isAdminAuthenticated } from '../lib/adminAuth'
import { USER_AUTH_EVENT } from '../lib/userAuth'
import { useUser } from './useUser'

/** True when the viewer can see admin-only chapter stats (chapter view counts). */
export function useAdminViewer(): boolean {
  const { user } = useUser()
  const [isAdmin, setIsAdmin] = useState(() => isAdminAuthenticated())

  useEffect(() => {
    const sync = () => setIsAdmin(isAdminAuthenticated())
    sync()
    window.addEventListener(USER_AUTH_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(USER_AUTH_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [user?.id, user?.role])

  return isAdmin
}
