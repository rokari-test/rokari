import { useEffect, useState } from 'react'
import { logActivity } from '../lib/adminActivity'
import {
  DEFAULT_PLAN_DELAYS_HOURS,
  EARLY_ACCESS_EVENT,
  describePlanEarlyAccess,
  loadEarlyAccessSettings,
  saveEarlyAccessSettings,
  type EarlyAccessSettings,
} from '../lib/earlyAccess'
import type { PlanId } from '../lib/planId'
import { SUBSCRIPTION_PLANS } from '../lib/subscriptions'

export function AdminEarlyAccess() {
  const [settings, setSettings] = useState<EarlyAccessSettings>(() =>
    loadEarlyAccessSettings(),
  )
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const sync = () => setSettings(loadEarlyAccessSettings())
    window.addEventListener(EARLY_ACCESS_EVENT, sync)
    return () => window.removeEventListener(EARLY_ACCESS_EVENT, sync)
  }, [])

  const setPlanDelay = (planId: PlanId, hours: number) => {
    setSettings((s) => ({
      ...s,
      planDelays: { ...s.planDelays, [planId]: Math.max(0, hours) },
    }))
    setSaved(false)
  }

  const handleSave = () => {
    saveEarlyAccessSettings(settings)
    logActivity('settings', 'Early access updated', 'Per-plan chapter unlock delays saved')
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2500)
  }

  const resetDefaults = () => {
    setSettings({
      ...settings,
      planDelays: { ...DEFAULT_PLAN_DELAYS_HOURS },
    })
    setSaved(false)
  }

  return (
    <section className="admin-card" style={{ marginTop: '1rem' }}>
      <h2 style={{ margin: '0 0 0.35rem', fontSize: '1.05rem' }}>Early chapter access</h2>
      <p className="admin-muted-inline" style={{ marginBottom: '1rem' }}>
        Hours after a chapter is released before each plan can read the newest chapter.
        Defaults: Free 7 days, Supporter 24h, Premium 6h, Studio instant.
      </p>

      <div className="admin-form-row--2">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const hours = settings.planDelays[plan.id]
          const days = hours >= 24 && hours % 24 === 0 ? hours / 24 : null
          return (
            <div key={plan.id} className="admin-form-row">
              <label htmlFor={`delay-${plan.id}`}>
                {plan.name}
                <span className="admin-muted-inline" style={{ display: 'block', fontWeight: 400 }}>
                  {describePlanEarlyAccess(plan.id, settings)}
                </span>
              </label>
              <input
                id={`delay-${plan.id}`}
                type="number"
                min={0}
                step={plan.id === 'free' ? 24 : plan.id === 'studio' ? 0 : 1}
                className="admin-input"
                value={hours}
                onChange={(e) => setPlanDelay(plan.id, Number(e.target.value))}
              />
              <span className="admin-muted-inline">
                Hours after release
                {days != null ? ` (${days} day${days === 1 ? '' : 's'})` : ''}
              </span>
            </div>
          )
        })}
      </div>

      <div className="admin-form-row" style={{ marginTop: '0.85rem', maxWidth: 280 }}>
        <label htmlFor="base-coin-price">Base coin price (older locked chapters)</label>
        <input
          id="base-coin-price"
          type="number"
          min={0}
          className="admin-input"
          value={settings.baseCoinPrice}
          onChange={(e) => {
            setSettings((s) => ({
              ...s,
              baseCoinPrice: Math.max(0, Number(e.target.value)),
            }))
            setSaved(false)
          }}
        />
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button type="button" className="admin-btn admin-btn--primary" onClick={handleSave}>
          Save early access rules
        </button>
        <button type="button" className="admin-btn admin-btn--ghost" onClick={resetDefaults}>
          Reset to defaults
        </button>
        {saved && <span className="admin-muted-inline">Saved.</span>}
      </div>
    </section>
  )
}
