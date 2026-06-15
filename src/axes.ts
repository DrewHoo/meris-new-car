import { format } from 'd3-format'
import type { DerivedCar } from './types'

const money = format('$,.0f')
const num = format(',.0f')
const plain = (n: number): string => String(n)

export interface AxisOption {
  key: string
  label: string
  short: string
  accessor: (d: DerivedCar) => number | null
  format: (n: number) => string
  scaleType: 'linear'
}

// Single source of truth for both axis dropdowns. accessor reads the
// DERIVED car, so otd / annualEnergyCost / age behave like raw fields.
// Adding an axis = one entry here, no other file changes.
export const AXIS_OPTIONS: AxisOption[] = [
  { key: 'otd', label: 'Out-the-door price', short: 'OTD price', accessor: (d) => d.otd, format: money, scaleType: 'linear' },
  { key: 'sellingPrice', label: 'Selling price (pre-tax)', short: 'Selling price', accessor: (d) => d.sellingPrice, format: money, scaleType: 'linear' },
  { key: 'year', label: 'Model year', short: 'Year', accessor: (d) => d.year, format: plain, scaleType: 'linear' },
  { key: 'age', label: 'Age (years)', short: 'Age', accessor: (d) => d.age, format: num, scaleType: 'linear' },
  { key: 'mileage', label: 'Mileage', short: 'Mileage', accessor: (d) => d.mileage, format: num, scaleType: 'linear' },
  { key: 'combinedMpge', label: 'Efficiency — combined MPGe', short: 'MPGe', accessor: (d) => d.combinedMpge, format: num, scaleType: 'linear' },
  { key: 'electricRange', label: 'Electric range (mi)', short: 'Elec range', accessor: (d) => d.electricRange, format: num, scaleType: 'linear' },
  { key: 'annualEnergyCost', label: 'Annual energy cost', short: 'Energy $/yr', accessor: (d) => d.annualEnergyCost, format: money, scaleType: 'linear' },
  { key: 'cargoCuFt', label: 'Cargo (cu ft)', short: 'Cargo', accessor: (d) => d.cargoCuFt, format: num, scaleType: 'linear' },
]

export const AXIS_BY_KEY: Record<string, AxisOption> = Object.fromEntries(
  AXIS_OPTIONS.map((o) => [o.key, o]),
)

export type ColorKey = 'powertrain' | 'make' | 'condition' | 'bodyClass' | 'trimTier'

export interface ColorOption {
  key: ColorKey
  label: string
}

export const COLOR_OPTIONS: ColorOption[] = [
  { key: 'powertrain', label: 'Powertrain' },
  { key: 'make', label: 'Make' },
  { key: 'condition', label: 'Condition' },
  { key: 'bodyClass', label: 'Body class' },
  { key: 'trimTier', label: 'Trim tier' },
]

export const DEFAULT_X = 'mileage'
export const DEFAULT_Y = 'otd'
export const DEFAULT_COLOR: ColorKey = 'powertrain'
