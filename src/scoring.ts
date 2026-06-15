import { format } from 'd3-format'
import type { DerivedCar } from './types'

const money = format('$,.0f')
const num = format(',.0f')
const inches = (n: number): string => `${n.toFixed(1)}"`

export interface Criterion {
  key: string
  label: string
  short: string
  direction: 'low' | 'high'
  accessor: (d: DerivedCar) => number
  format: (n: number) => string
}

// Criteria that feed the weighted score + heatmap. Each has a direction so
// normalization knows which end is "good".
export const CRITERIA: Criterion[] = [
  { key: 'otd', label: 'Out-the-door price', short: 'OTD', direction: 'low', accessor: (d) => d.otd, format: money },
  { key: 'mileage', label: 'Mileage', short: 'Miles', direction: 'low', accessor: (d) => d.mileage, format: num },
  { key: 'age', label: 'Age', short: 'Age', direction: 'low', accessor: (d) => d.age, format: (n) => `${n}y` },
  { key: 'annualEnergyCost', label: 'Annual energy cost', short: 'Energy/yr', direction: 'low', accessor: (d) => d.annualEnergyCost, format: money },
  { key: 'combinedMpge', label: 'Efficiency (MPGe)', short: 'MPGe', direction: 'high', accessor: (d) => d.combinedMpge ?? 0, format: num },
  { key: 'cargoCuFt', label: 'Cargo (cu ft)', short: 'Cargo', direction: 'high', accessor: (d) => d.cargoCuFt, format: num },
  { key: 'rearLegroomIn', label: 'Rear legroom', short: 'Legroom', direction: 'high', accessor: (d) => d.rearLegroomIn, format: inches },
]

export type Weights = Record<string, number>

export const DEFAULT_WEIGHTS: Weights = {
  otd: 9, mileage: 7, age: 2, annualEnergyCost: 3, combinedMpge: 3, cargoCuFt: 3, rearLegroomIn: 4,
}

export interface Preset { key: string; label: string; weights: Weights }

export const PRESETS: Preset[] = [
  { key: 'balanced', label: 'Balanced', weights: { otd: 5, mileage: 5, age: 5, annualEnergyCost: 5, combinedMpge: 5, cargoCuFt: 5, rearLegroomIn: 5 } },
  { key: 'value', label: 'Bang for buck', weights: { otd: 10, mileage: 7, age: 3, annualEnergyCost: 5, combinedMpge: 2, cargoCuFt: 2, rearLegroomIn: 2 } },
  { key: 'lowmiles', label: 'Fewest miles', weights: { otd: 4, mileage: 10, age: 6, annualEnergyCost: 2, combinedMpge: 2, cargoCuFt: 2, rearLegroomIn: 2 } },
  { key: 'efficient', label: 'Most efficient', weights: { otd: 4, mileage: 4, age: 3, annualEnergyCost: 8, combinedMpge: 9, cargoCuFt: 2, rearLegroomIn: 2 } },
  { key: 'space', label: 'Space for kids', weights: { otd: 4, mileage: 4, age: 3, annualEnergyCost: 2, combinedMpge: 2, cargoCuFt: 8, rearLegroomIn: 10 } },
]

export interface ScoredCar {
  car: DerivedCar
  score: number // 0–100
  goodness: Record<string, number> // per-criterion 0–1
}

// Min–max normalize each criterion across the given set (so colors/scores are
// relative to the cars you're currently considering), then weighted-average.
export function rankCars(cars: DerivedCar[], weights: Weights): ScoredCar[] {
  const stats: Record<string, { min: number; max: number }> = {}
  for (const c of CRITERIA) {
    let min = Infinity
    let max = -Infinity
    for (const car of cars) {
      const v = c.accessor(car)
      if (v < min) min = v
      if (v > max) max = v
    }
    stats[c.key] = { min, max }
  }
  const totalW = CRITERIA.reduce((s, c) => s + (weights[c.key] ?? 0), 0)

  const scored = cars.map((car) => {
    const goodness: Record<string, number> = {}
    let acc = 0
    for (const c of CRITERIA) {
      const { min, max } = stats[c.key]
      const v = c.accessor(car)
      let g = 0.5
      if (max > min) {
        const norm = (v - min) / (max - min)
        g = c.direction === 'high' ? norm : 1 - norm
      }
      goodness[c.key] = g
      acc += (weights[c.key] ?? 0) * g
    }
    const score = totalW > 0 ? (acc / totalW) * 100 : 0
    return { car, score, goodness }
  })
  scored.sort((a, b) => b.score - a.score)
  return scored
}

const RED = [220, 38, 38]
const AMBER = [234, 179, 8]
const GREEN = [22, 163, 74]
const lerp = (a: number, b: number, u: number): number => Math.round(a + (b - a) * u)

// goodness 0 (red) → 0.5 (amber) → 1 (green)
export function goodnessRgb(t: number): [number, number, number] {
  const c = Math.max(0, Math.min(1, t))
  if (c < 0.5) {
    const u = c * 2
    return [lerp(RED[0], AMBER[0], u), lerp(RED[1], AMBER[1], u), lerp(RED[2], AMBER[2], u)]
  }
  const u = (c - 0.5) * 2
  return [lerp(AMBER[0], GREEN[0], u), lerp(AMBER[1], GREEN[1], u), lerp(AMBER[2], GREEN[2], u)]
}

export function goodnessColor(t: number): string {
  const [r, g, b] = goodnessRgb(t)
  return `rgb(${r}, ${g}, ${b})`
}

export function goodnessCellStyle(t: number, alpha = 0.16): { background: string; color: string } {
  const [r, g, b] = goodnessRgb(t)
  return { background: `rgba(${r}, ${g}, ${b}, ${alpha})`, color: '#1a1a1a' }
}
