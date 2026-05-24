import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { AuthPromptModal } from '../components/AuthPromptModal'

export type AuthPromptReason = 'unlock' | 'bookmark' | 'subscribe' | 'generic'

interface AuthPromptContextValue {
  promptAuth: (reason?: AuthPromptReason) => void
}

const AuthPromptContext = createContext<AuthPromptContextValue | null>(null)

export function AuthPromptProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<AuthPromptReason>('generic')

  const promptAuth = useCallback((next: AuthPromptReason = 'generic') => {
    setReason(next)
    setOpen(true)
  }, [])

  const close = useCallback(() => setOpen(false), [])

  const redirectTo = `${location.pathname}${location.search}`

  const value = useMemo(() => ({ promptAuth }), [promptAuth])

  return (
    <AuthPromptContext.Provider value={value}>
      {children}
      <AuthPromptModal open={open} reason={reason} redirectTo={redirectTo} onClose={close} />
    </AuthPromptContext.Provider>
  )
}

export function useAuthPrompt() {
  const ctx = useContext(AuthPromptContext)
  if (!ctx) {
    throw new Error('useAuthPrompt must be used within AuthPromptProvider')
  }
  return ctx
}
