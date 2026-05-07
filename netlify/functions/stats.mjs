import { getStore } from '@netlify/blobs'

const EMPTY = { attempts: 0, wins: [0, 0, 0, 0, 0, 0], losses: 0 }

function isValidDate(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)
}

export default async (req) => {
  const url = new URL(req.url)
  const date = url.searchParams.get('date')

  if (!isValidDate(date)) {
    return new Response('invalid date', { status: 400 })
  }

  const store = getStore('puzzle-stats')

  if (req.method === 'GET') {
    const stats = (await store.get(date, { type: 'json' })) || EMPTY
    return Response.json(stats, {
      headers: { 'cache-control': 'public, max-age=10' },
    })
  }

  if (req.method === 'POST') {
    let body
    try {
      body = await req.json()
    } catch {
      return new Response('invalid body', { status: 400 })
    }

    const { won, guessCount } = body
    if (typeof won !== 'boolean') {
      return new Response('won required', { status: 400 })
    }
    if (won && (!Number.isInteger(guessCount) || guessCount < 1 || guessCount > 6)) {
      return new Response('invalid guessCount', { status: 400 })
    }

    const stats = (await store.get(date, { type: 'json' })) || { ...EMPTY, wins: [...EMPTY.wins] }
    stats.attempts++
    if (won) stats.wins[guessCount - 1]++
    else stats.losses++
    await store.setJSON(date, stats)

    return Response.json(stats)
  }

  return new Response('method not allowed', { status: 405 })
}
