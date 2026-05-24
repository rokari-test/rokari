import { useCallback, useEffect, useState } from 'react'
import { getCoinBalance, WALLET_EVENT, WALLET_STORAGE_KEY } from '../lib/userWallet'
import { useUser } from './useUser'

export function useWallet() {
  const { user } = useUser()
  const [balance, setBalance] = useState(0)

  const sync = useCallback(() => {
    if (!user) {
      setBalance(0)
      return
    }
    setBalance(getCoinBalance(user.id, user.username))
  }, [user?.id, user?.username])

  useEffect(() => {
    sync()
    window.addEventListener(WALLET_EVENT, sync)
    window.addEventListener('sakura-user-auth', sync)

    const onStorage = (event: StorageEvent) => {
      if (event.key === WALLET_STORAGE_KEY || event.key === null) sync()
    }
    window.addEventListener('storage', onStorage)

    const onVisible = () => {
      if (document.visibilityState === 'visible') sync()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', sync)

    return () => {
      window.removeEventListener(WALLET_EVENT, sync)
      window.removeEventListener('sakura-user-auth', sync)
      window.removeEventListener('storage', onStorage)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', sync)
    }
  }, [sync])

  return { balance, userId: user?.id ?? null }
}
