// Shared domain types for the car-comparison scatter plot.

export type Powertrain = 'ev' | 'phev' | 'hybrid' | 'gas'
export type Condition = 'new' | 'used'
export type BodyClass =
  | 'subcompact'
  | 'compact'
  | 'hatchback'
  | 'sedan'
  | 'wagon'
  | 'compact-suv'
  | 'suv'

/** Normalized equipment ladder, shared across makes. 1 Base · 2 Mid · 3 Upper · 4 Top. */
export type TrimTier = 1 | 2 | 3 | 4

/** One car at one (year, mileage) point. Hand-curated; see src/data/cars.ts. */
export interface Car {
  id: string
  make: string
  model: string
  /** Raw, make-specific trim, e.g. "EX-L". Never replaced — only annotated by trimTier. */
  trim: string
  /** Normalized tier (1–4) mapping the raw trim onto one common ladder. */
  trimTier: TrimTier
  year: number
  condition: Condition
  mileage: number
  powertrain: Powertrain
  /** Pre-tax CT market (negotiated) price, USD. The headline researched number. */
  sellingPrice: number
  /** EPA combined MPG (gas & hybrid). null for pure BEV. */
  combinedMpg: number | null
  /** EPA combined MPGe (all powertrains; for gas/hybrid this equals combinedMpg). */
  combinedMpge: number | null
  /** EPA kWh/100mi (BEV & PHEV). null for gas/hybrid. */
  evKwhPer100mi: number | null
  /** EPA all-electric range, miles (BEV full range; PHEV AER). null for gas/hybrid. */
  electricRange: number | null
  /** Cargo volume behind the rear seats (seats up), cubic feet. */
  cargoCuFt: number
  /** Rear-seat legroom, inches — proxy for backseat space / bulky car-seat fit. */
  rearLegroomIn: number
  bodyClass: BodyClass
  /** Per-car PHEV electric-mile fraction override; falls back to Assumptions.phevElectricFraction. */
  phevElectricFraction?: number
  /** Provenance + assumptions for sellingPrice and specs. */
  sourceNote: string
}

/** User-adjustable economic assumptions (CT defaults live in lib/model.ts). */
export interface Assumptions {
  annualMiles: number
  salesTaxPct: number // e.g. 0.0635
  docFee: number
  regFees: number
  gasPricePerGal: number
  elecPricePerKwh: number
  phevElectricFraction: number
}

export interface OtdBreakdown {
  sellingPrice: number
  docFee: number
  taxableBase: number
  salesTax: number
  taxRate: number
  regFees: number
}

/** A Car with the assumption-dependent fields computed in. */
export interface DerivedCar extends Car {
  otd: number
  otdBreakdown: OtdBreakdown
  annualEnergyCost: number
  age: number
}
