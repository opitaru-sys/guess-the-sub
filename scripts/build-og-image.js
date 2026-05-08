import sharp from 'sharp'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SVG_PATH = join(ROOT, 'public', 'og-image.svg')
const PNG_PATH = join(ROOT, 'public', 'og-image.png')

const svg = readFileSync(SVG_PATH)
await sharp(svg)
  .resize(1200, 630)
  .png()
  .toFile(PNG_PATH)

console.log(`Wrote ${PNG_PATH}`)
