// Appends new car rows (from a sourcing workflow) to src/data/cars.ts.
// Generates ids, normalizes specs by powertrain, groups by make/model.
// Usage: node scripts/append-cars.mjs <workflow-output.json>
import { readFileSync, writeFileSync } from 'node:fs'

const inPath = process.argv[2]
if (!inPath) { console.error('pass the workflow output file path'); process.exit(1) }
const raw = JSON.parse(readFileSync(inPath, 'utf8'))
const rows = raw.result?.rows ?? raw.rows ?? []
if (!rows.length) { console.error('no rows in input'); process.exit(1) }

const path = '/Users/drewhoo/Projects/meris-new-car/src/data/cars.ts'
let content = readFileSync(path, 'utf8')
const existingIds = new Set([...content.matchAll(/id: '([^']+)'/g)].map((m) => m[1]))

function normalize(r) {
  if (r.powertrain === 'gas' || r.powertrain === 'hybrid') {
    r.combinedMpge = r.combinedMpg; r.evKwhPer100mi = null; r.electricRange = null
  } else if (r.powertrain === 'ev') {
    r.combinedMpg = null
  }
  return r
}
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
function makeId(r) {
  const base = `${slug(r.model)}-${r.year}-${r.condition === 'new' ? 'new' : Math.round(r.mileage / 1000) + 'k'}`
  let id = base, n = 1
  while (existingIds.has(id)) { n++; id = `${base}-${n}` }
  existingIds.add(id)
  return id
}

const num = (v) => (v === null || v === undefined ? 'null' : v)
const str = (v) => JSON.stringify(v ?? '')
function emitRow(r, id) {
  const tier = Math.min(4, Math.max(1, Math.round(r.trimTier || 1)))
  const phev = r.powertrain === 'phev' ? '\n    phevElectricFraction: 0.4,' : ''
  const urlLine = r.sourceUrl ? `\n    sourceUrl: ${str(r.sourceUrl)},` : ''
  return `  {
    id: '${id}', make: ${str(r.make)}, model: ${str(r.model)}, trim: ${str(r.trim)}, trimTier: ${tier},
    year: ${r.year}, condition: '${r.condition}', mileage: ${r.mileage}, powertrain: '${r.powertrain}',
    sellingPrice: ${Math.round(r.sellingPrice)}, combinedMpg: ${num(r.combinedMpg)}, combinedMpge: ${num(r.combinedMpge)}, evKwhPer100mi: ${num(r.evKwhPer100mi)},
    electricRange: ${num(r.electricRange)}, cargoCuFt: ${r.cargoCuFt}, rearLegroomIn: ${r.rearLegroomIn}, bodyClass: ${str(r.bodyClass)},${phev}
    sourceName: ${str(r.sourceName)},${urlLine}
    sourceNote: ${str(r.sourceNote)},
  },`
}

// group rows by make+model, emit with a header comment per group
const groups = {}
for (const r of rows.map(normalize)) (groups[`${r.make} ${r.model}`] ||= []).push(r)
const blocks = []
for (const [gk, arr] of Object.entries(groups)) {
  blocks.push(`\n  // ── ${gk} ──`)
  arr.sort((a, b) => a.mileage - b.mileage)
  for (const r of arr) blocks.push(emitRow(r, makeId(r)))
}

content = content.replace(/\n\]\s*$/, `\n${blocks.join('\n')}\n]\n`)
writeFileSync(path, content)
console.log(`appended ${rows.length} rows (${Object.keys(groups).join(', ')})`)
