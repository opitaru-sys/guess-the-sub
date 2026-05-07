import { useState, useEffect } from 'react'

function fmtPct(n) {
  if (n == null) return '—'
  return `${Math.round(n * 100)}%`
}

function fmtAvg(n) {
  if (n == null) return '—'
  return n.toFixed(1)
}

export default function AdminPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const key = params.get('key')
    if (!key) {
      setError('Missing ?key= in URL')
      setLoading(false)
      return
    }
    fetch(`/api/admin?key=${encodeURIComponent(key)}`)
      .then(async res => {
        const ct = res.headers.get('content-type') || ''
        if (!res.ok || !ct.includes('application/json')) {
          const text = await res.text()
          throw new Error(`${res.status}: ${text.slice(0, 80) || 'unavailable'}`)
        }
        return res.json()
      })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-accent text-lg font-medium animate-pulse">Loading admin stats...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-4">
        <div className="text-center space-y-3 max-w-md">
          <div className="text-4xl">🔒</div>
          <h2 className="text-xl font-bold text-text-primary">Admin unavailable</h2>
          <p className="text-text-muted text-sm">{error}</p>
          <p className="text-text-muted text-xs">
            Set <code className="text-accent">ADMIN_KEY</code> as a Netlify env var, then visit{' '}
            <code className="text-accent">/admin?key=YOURKEY</code>.
          </p>
        </div>
      </div>
    )
  }

  if (!data || data.days.length === 0) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="text-4xl">📊</div>
          <h2 className="text-xl font-bold text-text-primary">No data yet</h2>
          <p className="text-text-muted text-sm">No puzzle completions recorded.</p>
        </div>
      </div>
    )
  }

  const { days, totals } = data

  return (
    <div className="min-h-dvh max-w-4xl mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Admin · Guess the Sub</h1>
        <p className="text-sm text-text-muted">Aggregate community stats</p>
      </header>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Stat label="Total Players" value={totals.attempts.toLocaleString()} />
        <Stat label="Total Solved" value={totals.solved.toLocaleString()} />
        <Stat label="Total Failed" value={totals.failed.toLocaleString()} />
        <Stat label="Overall Solve %" value={fmtPct(totals.solveRate)} />
      </section>

      <section className="bg-bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-elevated text-text-muted text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-3 py-2 font-semibold">Date</th>
                <th className="text-right px-3 py-2 font-semibold">Players</th>
                <th className="text-right px-3 py-2 font-semibold">Solved</th>
                <th className="text-right px-3 py-2 font-semibold">Failed</th>
                <th className="text-right px-3 py-2 font-semibold">Solve %</th>
                <th className="text-right px-3 py-2 font-semibold">Avg</th>
                <th className="text-left px-3 py-2 font-semibold">Distribution</th>
              </tr>
            </thead>
            <tbody>
              {days.map(d => (
                <tr key={d.date} className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-text-primary">{d.date}</td>
                  <td className="px-3 py-2 text-right text-text-primary">{d.attempts.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right text-success">{d.solved.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right text-wrong">{d.failed.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right text-text-primary">{fmtPct(d.solveRate)}</td>
                  <td className="px-3 py-2 text-right text-text-primary">{fmtAvg(d.avgGuesses)}</td>
                  <td className="px-3 py-2">
                    <DistBar dist={d.distribution} losses={d.failed} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="bg-bg-surface border border-border rounded-lg p-3">
      <div className="text-xs text-text-muted uppercase tracking-wider">{label}</div>
      <div className="text-xl font-bold text-text-primary mt-1">{value}</div>
    </div>
  )
}

function DistBar({ dist, losses }) {
  const total = dist.reduce((a, b) => a + b, 0) + losses
  if (total === 0) return <span className="text-text-muted text-xs">—</span>
  const segs = [...dist.map((c, i) => ({ count: c, color: 'bg-accent', label: `${i + 1}` })),
    { count: losses, color: 'bg-wrong', label: 'X' }]
  return (
    <div className="flex h-4 rounded overflow-hidden min-w-[160px]" title={segs.map(s => `${s.label}: ${s.count}`).join(' · ')}>
      {segs.map((s, i) => s.count > 0 ? (
        <div
          key={i}
          className={s.color}
          style={{ width: `${(s.count / total) * 100}%` }}
        />
      ) : null)}
    </div>
  )
}
