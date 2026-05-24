import { useState } from 'react'
import { useLoyalty } from '../hooks/useLoyalty'
import './LoyaltyPanel.css'

export function LoyaltyPanel() {
  const { loyalty } = useLoyalty()
  const [showAchievements, setShowAchievements] = useState(false)

  if (!loyalty) {
    return (
      <div className="loyalty-panel loyalty-panel--empty">
        <p>Sign in to track XP, streaks, and badges.</p>
      </div>
    )
  }

  const { state, level, badges, achievements } = loyalty
  const unlockedBadges = badges.filter((b) => b.unlocked).length
  const unlockedAchievements = achievements.filter((a) => a.unlocked).length
  const xpRemaining = level.xpToNext - level.xpInLevel

  return (
    <div className="loyalty-panel loyalty-panel--compact">
      <header className="loyalty-compact-head">
        <span className="loyalty-lv-pill">Lv {level.level}</span>
        <div className="loyalty-compact-title">
          <strong>{level.title}</strong>
          <span>
            {state.xp.toLocaleString()} XP · {state.totalXpEarned.toLocaleString()} earned
          </span>
        </div>
        <div className="loyalty-compact-streak" title={`Best streak: ${state.longestStreak} days`}>
          <span aria-hidden>🔥</span>
          <strong>{state.currentStreak}d</strong>
        </div>
      </header>

      <div className="loyalty-xp-track">
        <div className="loyalty-xp-bar" aria-hidden>
          <span style={{ width: `${level.progressPct}%` }} />
        </div>
        <p className="loyalty-xp-next">
          {level.xpInLevel.toLocaleString()} / {level.xpToNext.toLocaleString()} XP
          <em>· {xpRemaining.toLocaleString()} to Lv {level.level + 1}</em>
        </p>
      </div>

      <div className="loyalty-mini-stats">
        <MiniStat label="Chapters" value={String(state.chaptersRead)} />
        <MiniStat label="Started" value={String(state.seriesStarted.length)} />
        <MiniStat label="Done" value={String(state.seriesCompleted.length)} />
        <MiniStat label="Badges" value={`${unlockedBadges}/${badges.length}`} />
      </div>

      <section className="loyalty-block">
        <div className="loyalty-block-head">
          <h3>Badges</h3>
          <span>{unlockedBadges} unlocked</span>
        </div>
        <ul className="loyalty-badge-grid">
          {badges.map(({ def, unlocked }) => (
            <li
              key={def.id}
              className={`loyalty-badge-card${unlocked ? ' is-unlocked' : ''}`}
              title={def.description}
            >
              <span className="loyalty-badge-card-icon" aria-hidden>
                {def.icon}
              </span>
              <strong>{def.name}</strong>
              <small>{def.description}</small>
            </li>
          ))}
        </ul>
      </section>

      <section className="loyalty-block">
        <button
          type="button"
          className="loyalty-block-toggle"
          aria-expanded={showAchievements}
          onClick={() => setShowAchievements((v) => !v)}
        >
          <span>
            Achievements <em>{unlockedAchievements}/{achievements.length}</em>
          </span>
          <span className="loyalty-block-toggle-icon" aria-hidden>
            {showAchievements ? '−' : '+'}
          </span>
        </button>
        {showAchievements ? (
          <ul className="loyalty-achievement-grid">
            {achievements.map((item) => (
              <li
                key={item.def.id}
                className={`loyalty-achievement-card${item.unlocked ? ' is-done' : ''}`}
                title={item.def.description}
              >
                {item.unlocked ? (
                  <span className="loyalty-achievement-card-check" aria-label="Unlocked">
                    ✓
                  </span>
                ) : null}
                <span className="loyalty-achievement-card-icon" aria-hidden>
                  {item.def.icon}
                </span>
                <strong>{item.def.name}</strong>
                <div className="loyalty-achievement-card-bar" aria-hidden>
                  <span style={{ width: `${item.progressPct}%` }} />
                </div>
                <em>
                  {Math.min(item.current, item.target)}/{item.target}
                </em>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="loyalty-mini-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
