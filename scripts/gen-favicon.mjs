import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(__dirname, '..', 'public')
mkdirSync(outDir, { recursive: true })

// A tiny scatter plot: axes + three dots on the powertrain palette
// (gas grey, hybrid green, EV blue) climbing up-right — reads at 16x16.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#1f4e8c"/>
  <path d="M16 13 V50 H53" fill="none" stroke="rgba(255,255,255,0.55)"
    stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="25" cy="43" r="5" fill="#9ca3af"/>
  <circle cx="35" cy="34" r="5" fill="#34d399"/>
  <circle cx="45" cy="23" r="5" fill="#60a5fa"/>
</svg>`

writeFileSync(resolve(outDir, 'favicon.svg'), svg + '\n')
console.log('wrote favicon.svg')

const png = [
  { name: 'favicon-32.png', size: 32 },
  { name: 'favicon-192.png', size: 192 },
  { name: 'apple-touch-icon.png', size: 180 },
]
for (const { name, size } of png) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(resolve(outDir, name))
  console.log(`wrote ${name}`)
}
