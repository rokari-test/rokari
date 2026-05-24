import { ReportForm, type ReportFormTarget } from './ReportForm'
import './ReportModal.css'

interface ReportModalProps {
  open: boolean
  onClose: () => void
  userId: string
  userName: string
  target?: ReportFormTarget
  lockSubject?: 'series' | 'chapter'
}

export function ReportModal({
  open,
  onClose,
  userId,
  userName,
  target,
  lockSubject,
}: ReportModalProps) {
  if (!open) return null

  return (
    <div className="report-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="report-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="report-modal-head">
          <div>
            <p className="report-modal-eyebrow">Rokari · Moderation</p>
            <h2 id="report-modal-title">Submit a report</h2>
          </div>
          <button type="button" className="report-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <ReportForm
          userId={userId}
          userName={userName}
          initialTarget={target}
          lockSubject={lockSubject}
          compact
          onSubmitted={() => {
            setTimeout(onClose, 1200)
          }}
        />
      </div>
    </div>
  )
}
