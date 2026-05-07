export default function StatsDisplay({ stats }) {
  const winPct = stats.gamesPlayed > 0
    ? Math.round((stats.wins / stats.gamesPlayed) * 100)
    : 0

  const maxDist = Math.max(...stats.distribution, 1)

  return (
    <div>
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Played', value: stats.gamesPlayed },
          { label: 'Win %', value: `${winPct}%` },
          { label: 'Streak', value: stats.currentStreak },
          { label: 'Max', value: stats.maxStreak },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <div className="text-xl font-bold text-text-primary">{value}</div>
            <div className="text-xs text-text-muted">{label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-1">
        <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-2">
          Guess Distribution
        </p>
        {stats.distribution.map((count, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-4 text-text-muted text-right">
              {i < 6 ? i + 1 : '✗'}
            </span>
            <div
              className={`h-5 rounded-sm flex items-center justify-end px-1.5 text-white text-xs font-medium ${
                i < 6 ? 'bg-accent' : 'bg-wrong'
              }`}
              style={{
                width: `${Math.max((count / maxDist) * 100, count > 0 ? 8 : 2)}%`,
                minWidth: '16px',
              }}
            >
              {count}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
