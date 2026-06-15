import type { Assumptions, Car, Powertrain } from './types'
import { AXIS_BY_KEY, COLOR_OPTIONS, DEFAULT_COLOR, DEFAULT_X, DEFAULT_Y } from './axes'
import type { ColorKey } from './axes'
import { DEFAULT_ASSUMPTIONS } from './lib/model'
import { CRITERIA, DEFAULT_WEIGHTS } from './scoring'
import type { Weights } from './scoring'

export type ConditionFilter = 'all' | 'new' | 'used'

export interface UiState {
  xKey: string
  yKey: string
  colorKey: ColorKey
  /** null means "all" (cleaner URL than enumerating every value). */
  makes: Set<string> | null
  powertrains: Set<Powertrain> | null
  condition: ConditionFilter
  tiers: Set<number> | null
  excluded: Set<string>
  normalizeTrims: boolean
  orientGood: boolean
  weights: Weights
  assumptions: Assumptions
}

const ALL_POWERTRAINS: Powertrain[] = ['ev', 'phev', 'hybrid', 'gas']
const COLOR_KEYS = new Set(COLOR_OPTIONS.map((o) => o.key))

function num(params: URLSearchParams, key: string, fallback: number, min: number, max: number): number {
  const raw = params.get(key)
  if (raw == null) return fallback
  const v = Number(raw)
  return Number.isFinite(v) && v >= min && v <= max ? v : fallback
}

export function readInitialState(cars: Car[]): UiState {
  const empty: UiState = {
    xKey: DEFAULT_X, yKey: DEFAULT_Y, colorKey: DEFAULT_COLOR,
    makes: null, powertrains: null, condition: 'all', tiers: null,
    excluded: new Set(), normalizeTrims: false, orientGood: true,
    weights: { ...DEFAULT_WEIGHTS }, assumptions: { ...DEFAULT_ASSUMPTIONS },
  }
  if (typeof window === 'undefined') return empty

  const p = new URLSearchParams(window.location.search)
  const knownMakes = new Set(cars.map((c) => c.make))
  const knownIds = new Set(cars.map((c) => c.id))

  const xKey = AXIS_BY_KEY[p.get('x') ?? ''] ? p.get('x')! : DEFAULT_X
  const yKey = AXIS_BY_KEY[p.get('y') ?? ''] ? p.get('y')! : DEFAULT_Y
  const cRaw = (p.get('c') ?? '') as ColorKey
  const colorKey = COLOR_KEYS.has(cRaw) ? cRaw : DEFAULT_COLOR

  const csv = (key: string) => (p.get(key) ?? '').split(',').map((s) => s.trim()).filter(Boolean)

  const mkList = csv('mk').filter((m) => knownMakes.has(m))
  const makes = mkList.length ? new Set(mkList) : null

  const ptList = csv('pt').filter((v): v is Powertrain => (ALL_POWERTRAINS as string[]).includes(v))
  const powertrains = ptList.length ? new Set(ptList) : null

  const condRaw = p.get('cond')
  const condition: ConditionFilter = condRaw === 'new' || condRaw === 'used' ? condRaw : 'all'

  const ttList = csv('tt').map(Number).filter((n) => n >= 1 && n <= 4)
  const tiers = ttList.length ? new Set(ttList) : null

  const excluded = new Set(csv('ex').filter((id) => knownIds.has(id)))
  const normalizeTrims = p.get('tn') === '1'
  const orientGood = p.get('og') !== '0'

  const weights: Weights = { ...DEFAULT_WEIGHTS }
  const wRaw = p.get('w')
  if (wRaw) {
    for (const part of wRaw.split('.')) {
      const [k, v] = part.split('-')
      const val = Number(v)
      if (CRITERIA.some((c) => c.key === k) && Number.isFinite(val) && val >= 0 && val <= 10) {
        weights[k] = Math.round(val)
      }
    }
  }

  const assumptions: Assumptions = {
    annualMiles: num(p, 'am', DEFAULT_ASSUMPTIONS.annualMiles, 1000, 60000),
    salesTaxPct: p.has('tax')
      ? num(p, 'tax', DEFAULT_ASSUMPTIONS.salesTaxPct * 100, 0, 20) / 100
      : DEFAULT_ASSUMPTIONS.salesTaxPct,
    docFee: num(p, 'doc', DEFAULT_ASSUMPTIONS.docFee, 0, 2000),
    regFees: num(p, 'reg', DEFAULT_ASSUMPTIONS.regFees, 0, 2000),
    gasPricePerGal: num(p, 'gas', DEFAULT_ASSUMPTIONS.gasPricePerGal, 1, 10),
    elecPricePerKwh: num(p, 'elec', DEFAULT_ASSUMPTIONS.elecPricePerKwh, 0.05, 1),
    phevElectricFraction: DEFAULT_ASSUMPTIONS.phevElectricFraction,
  }

  return { xKey, yKey, colorKey, makes, powertrains, condition, tiers, excluded, normalizeTrims, orientGood, weights, assumptions }
}

/** Build the query string for the current state, omitting anything at its default. */
export function buildSearch(s: UiState): string {
  const p = new URLSearchParams()
  const a = s.assumptions
  const d = DEFAULT_ASSUMPTIONS

  if (s.xKey !== DEFAULT_X) p.set('x', s.xKey)
  if (s.yKey !== DEFAULT_Y) p.set('y', s.yKey)
  if (s.colorKey !== DEFAULT_COLOR) p.set('c', s.colorKey)
  if (s.makes) p.set('mk', [...s.makes].sort().join(','))
  if (s.powertrains) p.set('pt', [...s.powertrains].sort().join(','))
  if (s.condition !== 'all') p.set('cond', s.condition)
  if (s.tiers) p.set('tt', [...s.tiers].sort().join(','))
  if (s.excluded.size) p.set('ex', [...s.excluded].sort().join(','))
  if (s.normalizeTrims) p.set('tn', '1')
  if (!s.orientGood) p.set('og', '0')

  const changedWeights = CRITERIA
    .filter((c) => (s.weights[c.key] ?? 0) !== DEFAULT_WEIGHTS[c.key])
    .map((c) => `${c.key}-${s.weights[c.key] ?? 0}`)
  if (changedWeights.length) p.set('w', changedWeights.join('.'))

  if (a.annualMiles !== d.annualMiles) p.set('am', String(a.annualMiles))
  if (a.salesTaxPct !== d.salesTaxPct) p.set('tax', String(+(a.salesTaxPct * 100).toFixed(3)))
  if (a.docFee !== d.docFee) p.set('doc', String(a.docFee))
  if (a.regFees !== d.regFees) p.set('reg', String(a.regFees))
  if (a.gasPricePerGal !== d.gasPricePerGal) p.set('gas', String(a.gasPricePerGal))
  if (a.elecPricePerKwh !== d.elecPricePerKwh) p.set('elec', String(a.elecPricePerKwh))

  return p.toString()
}
