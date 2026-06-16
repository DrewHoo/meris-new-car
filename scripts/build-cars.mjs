// Builds src/data/cars.ts from the fleet-sourcing workflow output JSON.
// Usage: node scripts/build-cars.mjs <path-to-workflow-output.json>
import { readFileSync, writeFileSync } from 'node:fs'

const inPath = process.argv[2]
if (!inPath) { console.error('pass the workflow output file path'); process.exit(1) }
const raw = JSON.parse(readFileSync(inPath, 'utf8'))
const sourced = (raw.result?.rows ?? raw.rows ?? [])
if (!sourced.length) { console.error('no rows found in input'); process.exit(1) }

// The Kia Niro EV stays as the owner's out-the-door anchor (kept verbatim).
const anchor = {
  make: 'Kia', model: 'Niro EV', trim: 'Wind', trimTier: 1, year: 2023,
  condition: 'used', mileage: 20000, powertrain: 'ev', sellingPrice: 23623,
  combinedMpg: null, combinedMpge: 113, evKwhPer100mi: 29, electricRange: 253,
  cargoCuFt: 22.8, rearLegroomIn: 36.9, bodyClass: 'compact-suv',
  sourceName: "Owner's out-the-door quote", sourceUrl: undefined,
  sourceNote: 'ANCHOR: your stated $26,000 CT out-the-door; pre-tax back-derived to $23,623 so OTD round-trips at default tax/doc/reg. EPA fueleconomy.gov #46008: 113 MPGe, 253 mi, 29 kWh/100mi. As of June 2026.',
}

const all = [anchor, ...sourced]

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const seen = new Set()
function makeId(r) {
  const base = `${slug(r.model)}-${r.year}-${r.condition === 'new' ? 'new' : Math.round(r.mileage / 1000) + 'k'}`
  let id = base
  let n = 1
  while (seen.has(id)) { n++; id = `${base}-${n}` }
  seen.add(id)
  return id
}

const num = (v) => (v === null || v === undefined ? 'null' : v)
const str = (v) => JSON.stringify(v ?? '')

// Normalize specs by powertrain (agents were inconsistent about MPGe).
function normalize(r) {
  if (r.powertrain === 'gas' || r.powertrain === 'hybrid') {
    r.combinedMpge = r.combinedMpg
    r.evKwhPer100mi = null
    r.electricRange = null
  } else if (r.powertrain === 'ev') {
    r.combinedMpg = null
  }
  const warn = []
  if ((r.powertrain === 'gas' || r.powertrain === 'hybrid') && !r.combinedMpg) warn.push('no MPG')
  if (r.powertrain === 'ev' && (!r.electricRange || !r.evKwhPer100mi)) warn.push('EV missing range/kWh')
  if (!r.cargoCuFt) warn.push('no cargo')
  if (!r.rearLegroomIn) warn.push('no legroom')
  if (warn.length) console.log(`  WARN ${r.year} ${r.model} ${r.trim}: ${warn.join(', ')}`)
  return r
}

const blocks = []
let groupKey = ''
for (const r0 of all) {
  const r = normalize(r0)
  const id = makeId(r)
  const gk = `${r.make} ${r.model}`
  if (gk !== groupKey) { groupKey = gk; blocks.push(`\n  // ── ${gk} ──`) }
  const tier = Math.min(4, Math.max(1, Math.round(r.trimTier || 1)))
  const phev = r.powertrain === 'phev' ? '\n    phevElectricFraction: 0.4,' : ''
  const urlLine = r.sourceUrl ? `\n    sourceUrl: ${str(r.sourceUrl)},` : ''
  blocks.push(`  {
    id: '${id}', make: ${str(r.make)}, model: ${str(r.model)}, trim: ${str(r.trim)}, trimTier: ${tier},
    year: ${r.year}, condition: '${r.condition}', mileage: ${r.mileage}, powertrain: '${r.powertrain}',
    sellingPrice: ${Math.round(r.sellingPrice)}, combinedMpg: ${num(r.combinedMpg)}, combinedMpge: ${num(r.combinedMpge)}, evKwhPer100mi: ${num(r.evKwhPer100mi)},
    electricRange: ${num(r.electricRange)}, cargoCuFt: ${r.cargoCuFt}, rearLegroomIn: ${r.rearLegroomIn}, bodyClass: ${str(r.bodyClass)},${phev}
    sourceName: ${str(r.sourceName)},${urlLine}
    sourceNote: ${str(r.sourceNote)},
  },`)
}

const out = `import type { Car } from '../types'

// Hand-curated snapshot of cars for a Connecticut buyer. sellingPrice is the
// PRE-TAX price; out-the-door is computed live in lib/model.ts from the
// adjustable CT tax/fee assumptions.
//
// Every USED row is grounded in a real Carvana or certified-pre-owned (CPO)
// listing — see sourceName / sourceUrl. New rows are MSRP + destination from a
// dealer. Listings are a point-in-time snapshot and individual links may sell
// out over time. The Kia Niro EV is the owner's out-the-door anchor.

export const asOf = 'June 2026'

export const cars: Car[] = [
${blocks.join('\n')}
]
`

writeFileSync('/Users/drewhoo/Projects/meris-new-car/src/data/cars.ts', out)
const withUrl = all.filter((r) => r.sourceUrl).length
console.log(`wrote ${all.length} cars (${withUrl} with source URLs, ${all.length - withUrl} without)`)
const noUrl = all.filter((r) => !r.sourceUrl && r.sourceName !== "Owner's out-the-door quote")
if (noUrl.length) console.log('rows missing sourceUrl:', noUrl.map((r) => `${r.year} ${r.model} ${r.trim}`).join('; '))
