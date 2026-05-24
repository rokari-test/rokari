import { useCallback, useEffect, useState } from 'react'
import {
  getCurrentUser,
  USER_AUTH_EVENT,
  type UserPublic,
} from '../lib/userAuth'

export function useUser() {
  const [user, setUser] = useState<UserPublic | null>(() => getCurrentUser())

  useEffect(() => {
    const sync = () => setUser(getCurrentUser())
    sync()
    window.addEventListener(USER_AUTH_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(USER_AUTH_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const refresh = useCallback(() => setUser(getCurrentUser()), [])

  return { user, isLoggedIn: Boolean(user), refresh }
}
