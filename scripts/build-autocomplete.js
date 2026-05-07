import { writeFileSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT_FILE = join(ROOT, 'src', 'data', 'autocomplete.json')
const POOL_FILE = join(ROOT, 'src', 'data', 'subreddits.json')

const USER_AGENT = 'GuessTheSub/1.0 (autocomplete builder)'
const DELAY_MS = 7000
const TARGET = 700

// Subs that exist as popular but should NEVER be in autocomplete
// (NSFW, drama, shock, defunct, ban-magnets)
const HARD_BLOCKLIST = new Set([
  'gonewild', 'nsfw', 'porn', 'cumtown',
  'IncelTear', 'TheRedPill', 'MGTOW', 'PussyPass',
  'WatchPeopleDie', 'MorbidReality',
  'fatpeoplehate',
])

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function fetchPage(after) {
  const url = `https://www.reddit.com/subreddits/popular.json?limit=100${after ? `&after=${after}` : ''}`
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

function isAcceptable(sub) {
  if (sub.over18) return false
  if (sub.subreddit_type !== 'public') return false
  if (HARD_BLOCKLIST.has(sub.display_name)) return false
  if (HARD_BLOCKLIST.has(sub.display_name.toLowerCase())) return false
  if (!/^[A-Za-z0-9_]{2,21}$/.test(sub.display_name)) return false
  if ((sub.subscribers || 0) < 50_000) return false
  return true
}

async function main() {
  console.log(`Building autocomplete list (target ~${TARGET} subs)...`)

  const subs = new Map()
  const pool = JSON.parse(readFileSync(POOL_FILE, 'utf-8'))
  for (const s of pool) {
    subs.set(s.name.toLowerCase(), { name: s.name, display: s.display })
  }
  console.log(`Seeded ${subs.size} from puzzle pool`)

  let after = null
  let pages = 0
  while (subs.size < TARGET && pages < 15) {
    try {
      const data = await fetchPage(after)
      pages++
      const children = data.data.children
      for (const c of children) {
        const s = c.data
        if (!isAcceptable(s)) continue
        const key = s.display_name.toLowerCase()
        if (subs.has(key)) continue
        subs.set(key, {
          name: s.display_name,
          display: `r/${s.display_name}`,
        })
      }
      console.log(`Page ${pages}: total ${subs.size}`)
      after = data.data.after
      if (!after) break
      if (subs.size < TARGET) await sleep(DELAY_MS)
    } catch (err) {
      console.error(`Page ${pages + 1} error: ${err.message}`)
      break
    }
  }

  const list = Array.from(subs.values()).sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  )
  writeFileSync(OUT_FILE, JSON.stringify(list, null, 2) + '\n')
  console.log(`\nWrote ${list.length} subs to ${OUT_FILE}`)
}

main().catch(console.error)
