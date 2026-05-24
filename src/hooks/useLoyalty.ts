import { useEffect, useState } from 'react'
import { getLoyaltyView, LOYALTY_EVENT, type LoyaltyView } from '../lib/loyalty'
import { useUser } from './useUser'

export function useLoyalty(): {
  loyalty: LoyaltyView | null
  userId: string | null
} {
  const { user } = useUser()
  const [loyalty, setLoyalty] = useState<LoyaltyView | null>(null)

  useEffect(() => {
    if (!user) {
      setLoyalty(null)
      return
    }
    const sync = () => setLoyalty(getLoyaltyView(user.id))
    sync()
    window.addEventListener(LOYALTY_EVENT, sync)
    window.addEventListener('sakura-user-auth', sync)
    return () => {
      window.removeEventListener(LOYALTY_EVENT, sync)
      window.removeEventListener('sakura-user-auth', sync)
    }
  }, [user?.id])

  return { loyalty, userId: user?.id ?? null }
}
