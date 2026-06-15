import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(__dirname, '..', 'public')
mkdirSync(outDir, { recursive: true })

const W = 1200
const H = 630
const TEXT = '#0f172a'
const MUTED = '#475569'

const COLORS = { ev: '#2563eb', phev: '#0891b2', hybrid: '#16a34a', gas: '#6b7280' }

// Representative (mileage, otd, powertrain) points echoing the real dataset.
const PTS = [
  [0, 46000, 'ev'], [0, 44000, 'ev'], [50000, 30000, 'ev'], [38000, 32000, 'ev'],
  [25000, 35000, 'ev'], [22000, 23000, 'ev'], [15000, 38000, 'ev'],
  [72000, 25000, 'phev'], [48000, 26000, 'phev'], [28000, 28000, 'phev'],
  [0, 40000, 'hybrid'], [0, 39000, 'hybrid'], [30000, 30000, 'hybrid'],
  [45000, 28000, 'hybrid'], [28000, 36000, 'hybrid'], [15000, 31000, 'hybrid'],
  [12000, 31000, 'hybrid'],
  [78000, 21000, 'gas'], [70000, 16000, 'gas'], [58000, 23000, 'gas'],
  [48000, 17000, 'gas'], [60000, 24000, 'gas'], [42000, 26000, 'gas'],
]

const PX = { x0: 624, x1: 1136, y0: 470, y1: 132 }
const mx = (m) => PX.x0 + (m / 100000) * (PX.x1 - PX.x0)
const my = (v) => PX.y0 + ((v - 12000) / (47000 - 12000)) * (PX.y1 - PX.y0)

const dots = PTS.map(
  ([m, v, p]) =>
    `<circle cx="${mx(m).toFixed(1)}" cy="${my(v).toFixed(1)}" r="11" fill="${COLORS[p]}" stroke="#fff" stroke-width="2.5" opacity="0.92"/>`,
).join('\n    ')

const legend = Object.entries({ ev: 'EV', phev: 'PHEV', hybrid: 'Hybrid', gas: 'Gas' })
  .map(([k, label], i) => {
    const x = 624 + i * 132
    return `<circle cx="${x}" cy="520" r="8" fill="${COLORS[k]}"/><text x="${x + 14}" y="525" font-family="Helvetica, Arial, sans-serif" font-size="20" fill="${MUTED}">${label}</text>`
  })
  .join('\n    ')

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#fafafa"/>
  <rect x="0" y="0" width="${W}" height="10" fill="#1f4e8c"/>

  <text x="64" y="150" font-family="Helvetica, Arial, sans-serif" font-size="62" font-weight="700" fill="${TEXT}">Which car</text>
  <text x="64" y="222" font-family="Helvetica, Arial, sans-serif" font-size="62" font-weight="700" fill="${TEXT}">should we buy?</text>
  <text x="66" y="288" font-family="Helvetica, Arial, sans-serif" font-size="25" fill="${MUTED}">35 new &amp; used cars · price vs. mileage</text>
  <text x="66" y="324" font-family="Helvetica, Arial, sans-serif" font-size="25" fill="${MUTED}">vs. efficiency, with CT out-the-door pricing.</text>
  <text x="66" y="392" font-family="Helvetica, Arial, sans-serif" font-size="21" fill="#2563eb">Swap axes · filter models · normalize trims</text>

  <!-- chart panel -->
  <rect x="592" y="96" width="560" height="438" rx="16" fill="#fff" stroke="#e6e6e6" stroke-width="1.5"/>
  <path d="M624 132 V470 H1136" fill="none" stroke="#cbd5e1" stroke-width="2.5" stroke-linecap="round"/>
  <text x="612" y="128" font-family="Helvetica, Arial, sans-serif" font-size="16" fill="#94a3b8" text-anchor="end">$</text>
  <text x="1130" y="496" font-family="Helvetica, Arial, sans-serif" font-size="16" fill="#94a3b8" text-anchor="end">miles →</text>
    ${dots}
    ${legend}

  <text x="64" y="588" font-family="Helvetica, Arial, sans-serif" font-size="20" fill="${MUTED}">drewhoover.com/meris-new-car</text>
  <rect x="64" y="604" width="84" height="4" fill="#1f4e8c"/>
</svg>`

const out = resolve(outDir, 'og.png')
await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(out)
console.log(`wrote ${out}`)
