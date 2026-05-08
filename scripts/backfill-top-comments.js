// Fetch top_comment for any existing puzzle that's missing it.
// Run once after deploying the new hint structure.

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUZZLES_DIR = join(__dirname, '..', 'public', 'puzzles')
const TUTORIAL_PATH = join(__dirname, '..', 'public', 'tutorial.json')

const USER_AGENT = 'GuessTheSub/1.0 (top-comment backfill)'
const DELAY_MS = 5000

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function fetchTopComment(permalink, subredditName) {
  const url = `https://www.reddit.com${permalink}.json?limit=15&sort=top`
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()

  if (!Array.isArray(data) || data.length < 2) return null
  const comments = data[1].data.children
    .map(c => c.data)
    .filter(c =>
      c.body &&
      c.body !== '[deleted]' &&
      c.body !== '[removed]' &&
      !c.distinguished &&
      !c.stickied
    )
    .sort((a, b) => (b.score || 0) - (a.score || 0))

  if (comments.length === 0) return null

  let body = comments[0].body
    .replace(/\s+/g, ' ')
    .replace(/\*+/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()

  const subEsc = subredditName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  body = body.replace(new RegExp('/?r/' + subEsc + '\\b', 'gi'), '[hidden]')
  body = body.replace(new RegExp('\\b' + subEsc + '\\b', 'gi'), '[hidden]')

  if (body.length > 220) body = body.slice(0, 217) + '...'
  return body
}

async function processFile(path) {
  const puzzle = JSON.parse(readFileSync(path, 'utf8'))
  if (puzzle.post.top_comment) {
    console.log(`SKIP ${path.split(/[/\\]/).pop()} (already has top_comment)`)
    return false
  }
  const sub = puzzle.answer.subreddit
  const permalink = puzzle.post.permalink
  if (!permalink) {
    console.log(`SKIP ${path.split(/[/\\]/).pop()} (no permalink)`)
    return false
  }
  try {
    const top = await fetchTopComment(permalink, sub)
    puzzle.post.top_comment = top
    writeFileSync(path, JSON.stringify(puzzle, null, 2) + '\n')
    console.log(`✓ ${path.split(/[/\\]/).pop()} r/${sub} -> ${top ? top.slice(0, 60) + '...' : 'no comment found'}`)
    return true
  } catch (err) {
    console.log(`✗ ${path.split(/[/\\]/).pop()} r/${sub}: ${err.message}`)
    return false
  }
}

async function main() {
  const files = readdirSync(PUZZLES_DIR)
    .filter(f => f.endsWith('.json'))
    .sort()
    .map(f => join(PUZZLES_DIR, f))

  files.push(TUTORIAL_PATH)

  let processed = 0
  for (const f of files) {
    const fetched = await processFile(f)
    if (fetched) {
      processed++
      await sleep(DELAY_MS)
    }
  }
  console.log(`\nDone. Processed ${processed} puzzles.`)
}

main().catch(console.error)
