import { getStore } from '@netlify/blobs'

export default async (req) => {
  const url = new URL(req.url)
  const provided = url.searchParams.get('key') ||
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')

  const expected = process.env.ADMIN_KEY
  if (!expected) {
    return new Response('admin disabled (set ADMIN_KEY env var)', { status: 503 })
  }
  if (provided !== expected) {
    return new Response('unauthorized', { status: 401 })
  }

  const store = getStore('puzzle-stats')
  const { blobs } = await store.list()

  const days = await Promise.all(
    blobs.map(async ({ key }) => {
      const stats = await store.get(key, { type: 'json' })
      if (!stats) return null
      const winsSum = stats.wins.reduce((a, b) => a + b, 0)
      const completed = winsSum + stats.losses
      const avg = winsSum > 0
        ? stats.wins.reduce((a, c, i) => a + c * (i + 1), 0) / winsSum
        : null
      return {
        date: key,
        attempts: stats.attempts,
        solved: winsSum,
        failed: stats.losses,
        solveRate: completed > 0 ? winsSum / completed : null,
        avgGuesses: avg,
        distribution: stats.wins,
      }
    })
  )

  const filtered = days.filter(Boolean).sort((a, b) => b.date.localeCompare(a.date))

  const totals = filtered.reduce((t, d) => ({
    attempts: t.attempts + d.attempts,
    solved: t.solved + d.solved,
    failed: t.failed + d.failed,
  }), { attempts: 0, solved: 0, failed: 0 })

  const completedTotal = totals.solved + totals.failed
  totals.solveRate = completedTotal > 0 ? totals.solved / completedTotal : null

  return Response.json({ days: filtered, totals })
}
