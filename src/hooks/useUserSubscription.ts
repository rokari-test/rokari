import { useEffect, useState } from 'react'
import {
  getSubscriptionForUser,
  getUserPlan,
  SUBSCRIPTIONS_EVENT,
  type SubscriptionPlan,
  type UserSubscription,
} from '../lib/subscriptions'
import { useUser } from './useUser'

export function useUserSubscription() {
  const { user } = useUser()
  const [sub, setSub] = useState<UserSubscription | null>(null)
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null)

  useEffect(() => {
    if (!user) {
      setSub(null)
      setPlan(null)
      return
    }
    const sync = () => {
      const s = getSubscriptionForUser(user.id)
      setSub(s)
      setPlan(getUserPlan(user.id))
    }
    sync()
    window.addEventListener(SUBSCRIPTIONS_EVENT, sync)
    window.addEventListener('sakura-user-auth', sync)
    return () => {
      window.removeEventListener(SUBSCRIPTIONS_EVENT, sync)
      window.removeEventListener('sakura-user-auth', sync)
    }
  }, [user?.id])

  return { subscription: sub, plan, userId: user?.id ?? null }
}
