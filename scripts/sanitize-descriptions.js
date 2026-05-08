// Run this manually to retroactively clean descriptions in committed puzzle JSONs.
// The generator already calls cleanDescription on new puzzles.

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { cleanDescription } from './clean-description.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUZZLES_DIR = join(__dirname, '..', 'public', 'puzzles')

const files = readdirSync(PUZZLES_DIR).filter(f => f.endsWith('.json')).sort()
let fixed = 0
for (const f of files) {
  const p = JSON.parse(readFileSync(join(PUZZLES_DIR, f), 'utf8'))
  const before = p.answer.description
  const after = cleanDescription(before, p.answer.subreddit)
  if (before !== after) {
    p.answer.description = after
    writeFileSync(join(PUZZLES_DIR, f), JSON.stringify(p, null, 2) + '\n')
    console.log(`${f} r/${p.answer.subreddit}`)
    fixed++
  }
}
console.log(`\nFixed ${fixed} puzzles`)
