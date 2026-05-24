import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { AuthPromptReason } from '../context/AuthPromptContext'
import './AuthPromptModal.css'

const COPY: Record<
  AuthPromptReason,
  { eyebrow: string; title: string; body: string }
> = {
  unlock: {
    eyebrow: 'Coins',
    title: 'Sign in to unlock',
    body: 'Create a free account or sign in to unlock chapters with coins and track your balance.',
  },
  bookmark: {
    eyebrow: 'Library',
    title: 'Sign in to bookmark',
    body: 'Save chapters to your library — sign in or create an account first.',
  },
  subscribe: {
    eyebrow: 'Early access',
    title: 'Sign in to continue',
    body: 'Log in to see subscription options and unlock new chapters sooner.',
  },
  generic: {
    eyebrow: 'Account',
    title: 'Sign in required',
    body: 'Please sign in or create an account to use this feature.',
  },
}

interface AuthPromptModalProps {
  open: boolean
  reason: AuthPromptReason
  redirectTo: string
  onClose: () => void
}

export function AuthPromptModal({ open, reason, redirectTo, onClose }: AuthPromptModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const copy = COPY[reason]
  const authState = { from: redirectTo }

  return (
    <div className="auth-prompt-backdrop" onClick={onClose} role="presentation">
      <div
        className="auth-prompt-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-prompt-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="auth-prompt-head">
          <div>
            <p className="auth-prompt-eyebrow">{copy.eyebrow}</p>
            <h2 id="auth-prompt-title">{copy.title}</h2>
            <p className="auth-prompt-body">{copy.body}</p>
          </div>
          <button type="button" className="auth-prompt-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <div className="auth-prompt-actions">
          <Link to="/login" state={authState} className="auth-prompt-btn auth-prompt-btn--primary" onClick={onClose}>
            Sign In
          </Link>
          <Link
            to="/register"
            state={authState}
            className="auth-prompt-btn auth-prompt-btn--ghost"
            onClick={onClose}
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  )
}
