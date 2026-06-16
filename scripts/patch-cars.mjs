// Applies CPO-upgrade rows (from the cpo-upgrade workflow) onto src/data/cars.ts
// in place, matching by id. Rows not in the update set are left untouched.
// Usage: node scripts/patch-cars.mjs <workflow-output.json>
import { readFileSync, writeFileSync } from 'node:fs'

const inPath = process.argv[2]
if (!inPath) { console.error('pass the workflow output file path'); process.exit(1) }
const raw = JSON.parse(readFileSync(inPath, 'utf8'))
const rows = raw.result?.rows ?? raw.rows ?? []
if (!rows.length) { console.error('no rows in input'); process.exit(1) }

function normalize(r) {
  if (r.powertrain === 'gas' || r.powertrain === 'hybrid') {
    r.combinedMpge = r.combinedMpg; r.evKwhPer100mi = null; r.electricRange = null
  } else if (r.powertrain === 'ev') {
    r.combinedMpg = null
  }
  return r
}
const skip = new Set((process.argv[3] || '').split(',').map((s) => s.trim()).filter(Boolean))
const updates = {}
for (const r of rows) if (!skip.has(r.id)) updates[r.id] = normalize(r)
if (skip.size) console.log('skipping (kept existing source):', [...skip].join(', '))

const num = (v) => (v === null || v === undefined ? 'null' : v)
const str = (v) => JSON.stringify(v ?? '')

function emitRow(r) {
  const tier = Math.min(4, Math.max(1, Math.round(r.trimTier || 1)))
  const phev = r.powertrain === 'phev' ? '\n    phevElectricFraction: 0.4,' : ''
  const urlLine = r.sourceUrl ? `\n    sourceUrl: ${str(r.sourceUrl)},` : ''
  return `  {
    id: '${r.id}', make: ${str(r.make)}, model: ${str(r.model)}, trim: ${str(r.trim)}, trimTier: ${tier},
    year: ${r.year}, condition: '${r.condition}', mileage: ${r.mileage}, powertrain: '${r.powertrain}',
    sellingPrice: ${Math.round(r.sellingPrice)}, combinedMpg: ${num(r.combinedMpg)}, combinedMpge: ${num(r.combinedMpge)}, evKwhPer100mi: ${num(r.evKwhPer100mi)},
    electricRange: ${num(r.electricRange)}, cargoCuFt: ${r.cargoCuFt}, rearLegroomIn: ${r.rearLegroomIn}, bodyClass: ${str(r.bodyClass)},${phev}
    sourceName: ${str(r.sourceName)},${urlLine}
    sourceNote: ${str(r.sourceNote)},
  },`
}

const path = '/Users/drewhoo/Projects/meris-new-car/src/data/cars.ts'
let content = readFileSync(path, 'utf8')
const applied = new Set()
content = content.replace(/  \{\n[\s\S]*?\n  \},/g, (block) => {
  const id = block.match(/id: '([^']+)'/)?.[1]
  if (id && updates[id]) { applied.add(id); return emitRow(updates[id]) }
  return block
})
writeFileSync(path, content)

console.log(`patched ${applied.size}/${rows.length} rows`)
const missed = rows.map((r) => r.id).filter((id) => !applied.has(id))
if (missed.length) console.log('update ids NOT found in cars.ts:', missed.join(', '))
