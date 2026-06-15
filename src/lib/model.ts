import type { Assumptions, Car, DerivedCar, OtdBreakdown } from '../types'

export const CURRENT_YEAR = 2026

// Connecticut defaults (as of June 2026).
export const DEFAULT_ASSUMPTIONS: Assumptions = {
  annualMiles: 12000,
  salesTaxPct: 0.0635, // CT motor-vehicle sales/use tax for price <= $50k
  docFee: 599, // CT dealer conveyance fee cap (taxable in CT)
  regFees: 240, // bundled title $25 + 2-yr passenger reg + GHG + Clean Air + plate + Passport to Parks
  gasPricePerGal: 3.3, // CT regular, mid-2026
  elecPricePerKwh: 0.31, // CT residential — among the highest in the US
  phevElectricFraction: 0.55, // SAE J2841 utility-factor midpoint
}

// CT applies the 7.75% "luxury" rate to the FULL price once it exceeds $50k.
const CT_LUXURY_THRESHOLD = 50000
const CT_LUXURY_RATE = 0.0775

// 1 US gallon of gasoline ≈ 33.7 kWh of energy, so kWh/100mi = 3370 / MPGe.
const KWH_PER_GALLON_EQUIV = 33.7

export function computeOtd(input: {
  sellingPrice: number
  docFee: number
  regFees: number
  salesTaxPct: number
}): { otd: number; breakdown: OtdBreakdown } {
  const { sellingPrice, docFee, regFees } = input
  const taxableBase = sellingPrice + docFee // CT taxes the conveyance fee
  const taxRate = taxableBase > CT_LUXURY_THRESHOLD ? CT_LUXURY_RATE : input.salesTaxPct
  const salesTax = taxableBase * taxRate
  const otd = sellingPrice + docFee + salesTax + regFees
  return { otd, breakdown: { sellingPrice, docFee, taxableBase, salesTax, taxRate, regFees } }
}

function mpgeToKwhPer100(mpge: number | null): number | null {
  if (!mpge) return null
  return (KWH_PER_GALLON_EQUIV * 100) / mpge
}

export function computeAnnualEnergyCost(car: Car, a: Assumptions): number {
  const { annualMiles, gasPricePerGal, elecPricePerKwh } = a
  switch (car.powertrain) {
    case 'gas':
    case 'hybrid':
      return car.combinedMpg ? (annualMiles / car.combinedMpg) * gasPricePerGal : 0
    case 'ev': {
      const kwhPer100 = car.evKwhPer100mi ?? mpgeToKwhPer100(car.combinedMpge)
      return kwhPer100 ? annualMiles * (kwhPer100 / 100) * elecPricePerKwh : 0
    }
    case 'phev': {
      const f = car.phevElectricFraction ?? a.phevElectricFraction
      const kwhPer100 = car.evKwhPer100mi ?? mpgeToKwhPer100(car.combinedMpge)
      const elecCost = kwhPer100 ? annualMiles * f * (kwhPer100 / 100) * elecPricePerKwh : 0
      const gasCost = car.combinedMpg
        ? ((annualMiles * (1 - f)) / car.combinedMpg) * gasPricePerGal
        : 0
      return elecCost + gasCost
    }
  }
}

export function computeAge(car: Car, currentYear = CURRENT_YEAR): number {
  return Math.max(0, currentYear - car.year)
}

export function deriveCar(car: Car, a: Assumptions, currentYear = CURRENT_YEAR): DerivedCar {
  const { otd, breakdown } = computeOtd({
    sellingPrice: car.sellingPrice,
    docFee: a.docFee,
    regFees: a.regFees,
    salesTaxPct: a.salesTaxPct,
  })
  return {
    ...car,
    otd,
    otdBreakdown: breakdown,
    annualEnergyCost: computeAnnualEnergyCost(car, a),
    age: computeAge(car, currentYear),
  }
}

export function withComputed(cars: Car[], a: Assumptions, currentYear = CURRENT_YEAR): DerivedCar[] {
  return cars.map((c) => deriveCar(c, a, currentYear))
}
