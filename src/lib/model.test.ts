import { describe, it, expect } from 'vitest'
import {
  computeOtd,
  computeAnnualEnergyCost,
  DEFAULT_ASSUMPTIONS,
} from './model'
import type { Car } from '../types'
import { cars } from '../data/cars'

describe('computeOtd (Connecticut)', () => {
  it('round-trips the Niro anchor to exactly $26,000 at CT defaults', () => {
    const { otd } = computeOtd({
      sellingPrice: 23623,
      docFee: 599,
      regFees: 240,
      salesTaxPct: 0.0635,
    })
    expect(otd).toBeCloseTo(26000, 0)
  })

  it('taxes the doc fee and applies the 7.75% luxury rate above $50k', () => {
    const { breakdown } = computeOtd({
      sellingPrice: 60000,
      docFee: 599,
      regFees: 240,
      salesTaxPct: 0.0635,
    })
    expect(breakdown.taxRate).toBe(0.0775)
    expect(breakdown.taxableBase).toBe(60599)
  })
})

describe('computeAnnualEnergyCost', () => {
  const base = (over: Partial<Car>): Car => ({
    id: 't', make: 'X', model: 'Y', trim: '', trimTier: 1, year: 2024,
    condition: 'used', mileage: 0, powertrain: 'gas', sellingPrice: 0,
    combinedMpg: null, combinedMpge: null, evKwhPer100mi: null,
    electricRange: null, cargoCuFt: 0, rearLegroomIn: 0, bodyClass: 'compact', sourceNote: '',
    ...over,
  })

  it('gas/hybrid uses miles / mpg * gas price', () => {
    const c = base({ powertrain: 'hybrid', combinedMpg: 57, combinedMpge: 57 })
    // 12000 / 57 * 3.30 ≈ 694.7
    expect(computeAnnualEnergyCost(c, DEFAULT_ASSUMPTIONS)).toBeCloseTo(694.7, 0)
  })

  it('EV uses kWh/100mi * elec price (CT electricity is pricey)', () => {
    const c = base({ powertrain: 'ev', evKwhPer100mi: 29 })
    // 12000 * 0.29 * 0.31 ≈ 1078.8
    expect(computeAnnualEnergyCost(c, DEFAULT_ASSUMPTIONS)).toBeCloseTo(1078.8, 0)
  })

  it('surfaces the CT inversion: the Prius is cheaper to fuel than the Niro EV', () => {
    const prius = base({ powertrain: 'hybrid', combinedMpg: 57, combinedMpge: 57 })
    const ev = base({ powertrain: 'ev', evKwhPer100mi: 29 })
    expect(computeAnnualEnergyCost(prius, DEFAULT_ASSUMPTIONS))
      .toBeLessThan(computeAnnualEnergyCost(ev, DEFAULT_ASSUMPTIONS))
  })
})

describe('dataset integrity', () => {
  it('has unique ids and valid powertrain-specific specs', () => {
    const ids = new Set(cars.map((c) => c.id))
    expect(ids.size).toBe(cars.length)
    for (const c of cars) {
      if (c.powertrain === 'ev') {
        expect(c.combinedMpg).toBeNull()
        expect(c.electricRange).toBeGreaterThan(0)
      }
      if (c.powertrain === 'gas' || c.powertrain === 'hybrid') {
        expect(c.combinedMpg).toBeGreaterThan(0)
        expect(c.combinedMpge).toBe(c.combinedMpg)
      }
      expect(c.cargoCuFt).toBeGreaterThan(0)
    }
  })
})
