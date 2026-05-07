import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const PUZZLES_DIR = join(ROOT, 'public', 'puzzles')
const SUBREDDITS_FILE = join(ROOT, 'src', 'data', 'subreddits.json')
const CATEGORIES_FILE = join(ROOT, 'src', 'data', 'categories.json')

const USER_AGENT = 'GuessTheSub/1.0 (puzzle game generator)'
const DELAY_MS = 7000

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchJSON(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.json()
}

function subscriberRange(count) {
  if (count >= 40_000_000) return '40M+'
  if (count >= 20_000_000) return '20M - 40M'
  if (count >= 10_000_000) return '10M - 20M'
  if (count >= 5_000_000) return '5M - 10M'
  if (count >= 3_000_000) return '3M - 5M'
  if (count >= 1_000_000) return '1M - 3M'
  if (count >= 500_000) return '500K - 1M'
  if (count >= 100_000) return '100K - 500K'
  if (count >= 50_000) return '50K - 100K'
  return 'Under 50K'
}

const TITLE_BLOCKLIST = [
  /episode\s*\d+\s*(discussion|thread)/i,
  /\bdiscussion\s+thread\b/i,
  /\bmegathread\b/i,
  /\b(weekly|daily|monthly|biweekly)\b.*\b(thread|discussion|chat|recap|wrap)\b/i,
  /\b(thread|discussion|chat|recap|wrap)\b.*\b(weekly|daily|monthly)\b/i,
  /^free\s+talk/i,
  /\bsimple questions\b/i,
  /\bwhat are you\b.*\b(playing|watching|reading|cooking)\b/i,
  /\b(rate|judge)\s+my\b/i,
  /\bofficial\s+(thread|discussion)\b/i,
  /\bgame\s+thread\b/i,
  /\bmatch\s+thread\b/i,
  /\bpost-?match\b/i,
  /\bpre-?match\b/i,
]

function filterPost(post, subredditName) {
  const title = post.title || ''
  const lowerTitle = title.toLowerCase()
  const lowerSub = subredditName.toLowerCase()

  if (lowerTitle.includes(lowerSub)) return false
  if (post.over_18) return false
  if (post.score < 100) return false
  if (title.length < 30 || title.length > 300) return false
  if (post.stickied) return false
  if (post.distinguished) return false
  if (!post.is_self) return false
  if (!post.selftext || post.selftext.length < 80) return false
  if (post.selftext === '[removed]' || post.selftext === '[deleted]') return false

  for (const pattern of TITLE_BLOCKLIST) {
    if (pattern.test(title)) return false
  }

  if (post.link_flair_text) {
    const flair = post.link_flair_text.toLowerCase()
    if (flair.includes(lowerSub)) return false
    if (/megathread|weekly|daily|official|announcement/.test(flair)) return false
  }

  return true
}

function cleanTitle(title) {
  return title
    .replace(/^\[[^\]]+\]\s*/g, '')
    .replace(/\s*\[[^\]]+\]\s*$/g, '')
    .replace(/\(.*?flair.*?\)/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

async function generateForSubreddit(subredditName) {
  console.log(`  Fetching posts from r/${subredditName}...`)
  const postsData = await fetchJSON(
    `https://www.reddit.com/r/${subredditName}/hot.json?limit=50`
  )

  const posts = postsData.data.children
    .map(c => c.data)
    .filter(p => filterPost(p, subredditName))

  if (posts.length === 0) {
    throw new Error(`No suitable posts found in r/${subredditName}`)
  }

  const post = posts[Math.floor(Math.random() * Math.min(posts.length, 15))]

  await sleep(DELAY_MS)

  console.log(`  Fetching about info for r/${subredditName}...`)
  const aboutData = await fetchJSON(
    `https://www.reddit.com/r/${subredditName}/about.json`
  )
  const about = aboutData.data

  const isLinkPost = !post.is_self
  let bodyPreview = null
  if (post.is_self && post.selftext) {
    const sentences = post.selftext.split(/[.!?]+/).filter(Boolean)
    bodyPreview = sentences.slice(0, 2).join('. ').trim()
    if (bodyPreview && !bodyPreview.endsWith('.')) bodyPreview += '...'
    if (bodyPreview.length > 300) bodyPreview = bodyPreview.slice(0, 297) + '...'
  }

  const categoriesMap = JSON.parse(readFileSync(CATEGORIES_FILE, 'utf-8'))

  return {
    post: {
      title: cleanTitle(post.title),
      body_preview: bodyPreview,
      is_link_post: isLinkPost,
      link_domain: isLinkPost ? post.domain : null,
      permalink: post.permalink,
    },
    answer: {
      subreddit: subredditName,
      display_name: `r/${subredditName}`,
      subscribers_range: subscriberRange(about.subscribers || 0),
      created_year: new Date((about.created_utc || 0) * 1000).getFullYear(),
      description: about.public_description || about.title || '',
      category: categoriesMap[subredditName] || 'Uncategorized',
    },
  }
}

async function main() {
  const args = process.argv.slice(2)
  let count = 7
  let startDate = null

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--count' && args[i + 1]) count = parseInt(args[++i])
    if (args[i] === '--start-date' && args[i + 1]) startDate = args[++i]
  }

  if (!startDate) {
    const tomorrow = new Date()
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
    startDate = tomorrow.toISOString().slice(0, 10)
  }

  const subreddits = JSON.parse(readFileSync(SUBREDDITS_FILE, 'utf-8'))
  const available = [...subreddits].sort(() => Math.random() - 0.5)

  console.log(`Generating ${count} puzzles starting from ${startDate}`)

  let subIndex = 0
  for (let i = 0; i < count; i++) {
    const date = new Date(startDate)
    date.setUTCDate(date.getUTCDate() + i)
    const dateStr = date.toISOString().slice(0, 10)
    const outPath = join(PUZZLES_DIR, `${dateStr}.json`)

    if (existsSync(outPath)) {
      console.log(`Skipping ${dateStr} — already exists`)
      continue
    }

    const sub = available[subIndex++ % available.length]
    try {
      console.log(`\nPuzzle for ${dateStr}: r/${sub.name}`)
      const puzzleData = await generateForSubreddit(sub.name)

      const existing = existsSync(PUZZLES_DIR)
        ? readdirSync(PUZZLES_DIR).filter(f => f.endsWith('.json')).length
        : 0

      const puzzle = {
        id: existing + i,
        date: dateStr,
        ...puzzleData,
      }

      writeFileSync(outPath, JSON.stringify(puzzle, null, 2))
      console.log(`  ✓ Saved ${outPath}`)
    } catch (err) {
      console.error(`  ✗ Failed for r/${sub.name}: ${err.message}`)
    }

    if (i < count - 1) {
      console.log(`  Waiting ${DELAY_MS / 1000}s before next request...`)
      await sleep(DELAY_MS)
    }
  }

  console.log('\nDone!')
}

main().catch(console.error)
