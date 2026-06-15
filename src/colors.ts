import { scaleOrdinal } from 'd3-scale'
import type { DerivedCar, TrimTier } from './types'
import type { ColorKey } from './axes'
import { tierLabel } from './lib/trimTiers'

export const POWERTRAIN_COLORS: Record<string, string> = {
  ev: '#2563eb',
  phev: '#0891b2',
  hybrid: '#16a34a',
  gas: '#6b7280',
}
export const POWERTRAIN_LABELS: Record<string, string> = {
  ev: 'Electric (EV)',
  phev: 'Plug-in hybrid',
  hybrid: 'Hybrid',
  gas: 'Gasoline',
}
export const CONDITION_COLORS: Record<string, string> = {
  new: '#7c3aed',
  used: '#d97706',
}
// Trim tier ramp, light → dark of one hue so the order reads visually.
export const TIER_COLORS: Record<number, string> = {
  1: '#bfdbfe',
  2: '#60a5fa',
  3: '#2563eb',
  4: '#1e3a8a',
}
const RAMP = [
  '#2563eb', '#16a34a', '#dc2626', '#d97706', '#7c3aed',
  '#0891b2', '#db2777', '#65a30d', '#ca8a04', '#475569',
]

export type ColorFn = (d: DerivedCar) => string

export function buildColorScale(colorKey: ColorKey, cars: DerivedCar[]): ColorFn {
  if (colorKey === 'powertrain') return (d) => POWERTRAIN_COLORS[d.powertrain] ?? '#6b7280'
  if (colorKey === 'condition') return (d) => CONDITION_COLORS[d.condition] ?? '#6b7280'
  if (colorKey === 'trimTier') return (d) => TIER_COLORS[d.trimTier] ?? '#6b7280'
  // make / bodyClass — ordinal ramp over the full sorted domain so that
  // excluding a model never reshuffles colors.
  const domain = [...new Set(cars.map((c) => String(c[colorKey])))].sort()
  const scale = scaleOrdinal<string, string>(RAMP).domain(domain)
  return (d) => scale(String(d[colorKey]))
}

export interface LegendEntry {
  value: string
  label: string
  color: string
}

export function colorDomain(colorKey: ColorKey, cars: DerivedCar[]): LegendEntry[] {
  if (colorKey === 'powertrain') {
    const order = ['ev', 'phev', 'hybrid', 'gas']
    const present = new Set(cars.map((c) => c.powertrain))
    return order
      .filter((v) => present.has(v as DerivedCar['powertrain']))
      .map((v) => ({ value: v, label: POWERTRAIN_LABELS[v] ?? v, color: POWERTRAIN_COLORS[v] }))
  }
  if (colorKey === 'condition') {
    return [...new Set(cars.map((c) => c.condition))]
      .sort()
      .map((v) => ({ value: v, label: v === 'new' ? 'New' : 'Used', color: CONDITION_COLORS[v] }))
  }
  if (colorKey === 'trimTier') {
    return [...new Set(cars.map((c) => c.trimTier))]
      .sort((a, b) => a - b)
      .map((v) => ({ value: String(v), label: tierLabel(v as TrimTier), color: TIER_COLORS[v] }))
  }
  const fn = buildColorScale(colorKey, cars)
  return [...new Set(cars.map((c) => String(c[colorKey])))].sort().map((v) => {
    const sample = cars.find((c) => String(c[colorKey]) === v)!
    return { value: v, label: v, color: fn(sample) }
  })
}
