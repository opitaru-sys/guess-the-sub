const SUBMITTED_KEY = 'guessTheSub_submitted'

function loadSubmitted() {
  try {
    return JSON.parse(localStorage.getItem(SUBMITTED_KEY) || '{}')
  } catch {
    return {}
  }
}

function markSubmitted(date) {
  const submitted = loadSubmitted()
  submitted[date] = true
  localStorage.setItem(SUBMITTED_KEY, JSON.stringify(submitted))
}

function alreadySubmitted(date) {
  return !!loadSubmitted()[date]
}

async function safeJson(res) {
  if (!res.ok) return null
  if (!res.headers.get('content-type')?.includes('application/json')) return null
  try {
    return await res.json()
  } catch {
    return null
  }
}

export async function recordCompletion(date, won, guessCount) {
  if (alreadySubmitted(date)) return fetchStats(date)
  try {
    const res = await fetch(`/api/stats?date=${encodeURIComponent(date)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ won, guessCount: won ? guessCount : null }),
    })
    const data = await safeJson(res)
    if (data) markSubmitted(date)
    return data
  } catch {
    return null
  }
}

export async function fetchStats(date) {
  try {
    const res = await fetch(`/api/stats?date=${encodeURIComponent(date)}`)
    return await safeJson(res)
  } catch {
    return null
  }
}

export function deriveCommunity(stats) {
  if (!stats) return null
  const winsTotal = stats.wins.reduce((a, b) => a + b, 0)
  const completed = winsTotal + stats.losses
  if (completed === 0) return { attempts: stats.attempts, completed: 0, solveRate: null, avgGuesses: null, distribution: stats.wins, losses: stats.losses }
  const avg = winsTotal > 0
    ? stats.wins.reduce((a, c, i) => a + c * (i + 1), 0) / winsTotal
    : null
  return {
    attempts: stats.attempts,
    completed,
    solveRate: winsTotal / completed,
    avgGuesses: avg,
    distribution: stats.wins,
    losses: stats.losses,
  }
}
