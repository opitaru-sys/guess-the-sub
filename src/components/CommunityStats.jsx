import { deriveCommunity } from '../utils/communityStats'

function fmtPct(n) {
  if (n == null) return '—'
  return `${Math.round(n * 100)}%`
}

function fmtAvg(n) {
  if (n == null) return '—'
  return n.toFixed(1)
}

export default function CommunityStats({ stats, loading }) {
  if (loading) {
    return (
      <div className="border-t border-border pt-4 mt-4">
        <p className="text-xs text-text-muted text-center">Loading community stats...</p>
      </div>
    )
  }

  const c = deriveCommunity(stats)
  if (!c) {
    return (
      <div className="border-t border-border pt-4 mt-4">
        <p className="text-xs text-text-muted text-center">
          Community stats unavailable
        </p>
      </div>
    )
  }

  if (c.completed === 0) {
    return (
      <div className="border-t border-border pt-4 mt-4 text-center">
        <p className="text-xs text-text-muted">You're the first to finish today!</p>
      </div>
    )
  }

  const maxDist = Math.max(...c.distribution, c.losses, 1)

  return (
    <div className="border-t border-border pt-4 mt-4">
      <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-3 text-center">
        Today's Community
      </p>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-text-primary">{c.completed.toLocaleString()}</div>
          <div className="text-xs text-text-muted">Players</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-text-primary">{fmtPct(c.solveRate)}</div>
          <div className="text-xs text-text-muted">Solve Rate</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-text-primary">{fmtAvg(c.avgGuesses)}</div>
          <div className="text-xs text-text-muted">Avg Guesses</div>
        </div>
      </div>

      <div className="space-y-1">
        {c.distribution.map((count, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-4 text-text-muted text-right">{i + 1}</span>
            <div
              className="h-4 rounded-sm bg-accent flex items-center justify-end px-1.5 text-white text-[10px] font-medium"
              style={{
                width: `${Math.max((count / maxDist) * 100, count > 0 ? 8 : 2)}%`,
                minWidth: '14px',
              }}
            >
              {count > 0 ? count : ''}
            </div>
          </div>
        ))}
        {c.losses > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="w-4 text-text-muted text-right">✗</span>
            <div
              className="h-4 rounded-sm bg-wrong flex items-center justify-end px-1.5 text-white text-[10px] font-medium"
              style={{
                width: `${Math.max((c.losses / maxDist) * 100, 8)}%`,
                minWidth: '14px',
              }}
            >
              {c.losses}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
