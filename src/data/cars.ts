import type { Car } from '../types'

// Hand-curated snapshot of Connecticut-market cars. sellingPrice is the
// PRE-TAX (negotiated) price; out-the-door is computed live in lib/model.ts
// from the adjustable CT tax/fee assumptions.
//
// Prices and EPA specs were researched per-row against CT/Northeast comps
// (CarGurus, Edmunds, KBB, Cars.com) and fueleconomy.gov, then cross-checked
// for internal consistency. There is no clean free API for used-car
// transaction prices and listings are ephemeral, so this is a committed
// snapshot (re-research + bump `asOf` to refresh), not a build-time fetch.
//
// The Niro EV row is an ANCHOR: its sellingPrice is back-derived so the
// computed CT out-the-door rounds to the user's stated $26,000 at defaults.

export const asOf = 'June 2026'

export const cars: Car[] = [
  // ── Kia Niro EV ──────────────────────────────────────────────────────
  {
    id: 'niro-ev-2023-20k', make: 'Kia', model: 'Niro EV', trim: 'Wind', trimTier: 1,
    year: 2023, condition: 'used', mileage: 20000, powertrain: 'ev',
    sellingPrice: 23623, combinedMpg: null, combinedMpge: 113, evKwhPer100mi: 29,
    electricRange: 253, cargoCuFt: 22.8, bodyClass: 'compact-suv',
    sourceNote: 'ANCHOR: sellingPrice back-derived so CT out-the-door rounds to the stated $26,000 at default tax/doc/reg ($26,000.10). A touch above typical CT market (CarGurus/KBB asking ~$22,700, selling ~$21,600). EPA fueleconomy.gov #46008: 113 MPGe, 253 mi range, 29 kWh/100mi. As of June 2026.',
  },

  // ── Toyota Prius ─────────────────────────────────────────────────────
  {
    id: 'prius-le-2026-new', make: 'Toyota', model: 'Prius', trim: 'LE', trimTier: 1,
    year: 2026, condition: 'new', mileage: 0, powertrain: 'hybrid',
    sellingPrice: 29700, combinedMpg: 57, combinedMpge: 57, evKwhPer100mi: null,
    electricRange: null, cargoCuFt: 20.3, bodyClass: 'hatchback',
    sourceNote: 'New 2026 Prius LE FWD; MSRP $28,550 + ~$1,135 dest. 2026 Toyota hybrids transact at/near MSRP (Hartford CT dealers) → ~$29,700 pre-tax. EPA 57 combined. Gen5 cargo 20.3 cu ft. As of June 2026.',
  },
  {
    id: 'prius-2023-30k', make: 'Toyota', model: 'Prius', trim: 'LE', trimTier: 1,
    year: 2023, condition: 'used', mileage: 30000, powertrain: 'hybrid',
    sellingPrice: 27000, combinedMpg: 57, combinedMpge: 57, evKwhPer100mi: null,
    electricRange: null, cargoCuFt: 20.3, bodyClass: 'hatchback',
    sourceNote: '2023 Prius LE (Gen5) ~30k mi; CT comps median asking ~$27,800 (above ~$26.4k national). Hot low-mile Prius ×0.97 → ~$27,000. EPA 57 combined, 20.3 cu ft. 4 comps. As of June 2026.',
  },
  {
    id: 'prius-2021-45k', make: 'Toyota', model: 'Prius', trim: 'LE', trimTier: 1,
    year: 2021, condition: 'used', mileage: 45000, powertrain: 'hybrid',
    sellingPrice: 22200, combinedMpg: 52, combinedMpge: 52, evKwhPer100mi: null,
    electricRange: null, cargoCuFt: 27.4, bodyClass: 'hatchback',
    sourceNote: '2021 Prius LE (Gen4) ~45k mi; CT/NE comps median asking ~$23,400 ×0.95 → ~$22,200. EPA 52 combined, 27.4 cu ft. 3 comps. As of June 2026.',
  },
  {
    id: 'prius-2019-62k', make: 'Toyota', model: 'Prius', trim: 'LE', trimTier: 1,
    year: 2019, condition: 'used', mileage: 62000, powertrain: 'hybrid',
    sellingPrice: 19700, combinedMpg: 52, combinedMpge: 52, evKwhPer100mi: null,
    electricRange: null, cargoCuFt: 27.4, bodyClass: 'hatchback',
    sourceNote: '2019 Prius LE (Gen4) ~62k mi; Edmunds Hartford avg list ~$20,576. Median asking ~$20,700 ×0.95 → ~$19,700. EPA 52 combined, 27.4 cu ft. 4 comps. As of June 2026.',
  },
  {
    id: 'prius-2016-95k', make: 'Toyota', model: 'Prius', trim: 'Two', trimTier: 1,
    year: 2016, condition: 'used', mileage: 95000, powertrain: 'hybrid',
    sellingPrice: 14400, combinedMpg: 52, combinedMpge: 52, evKwhPer100mi: null,
    electricRange: null, cargoCuFt: 24.6, bodyClass: 'hatchback',
    sourceNote: '2016 Prius Two (Gen4) ~95k mi; Edmunds Hartford avg list ~$14,823. Median asking ~$15,200 ×0.95 → ~$14,400. EPA 52 combined, 24.6 cu ft. 3 comps. As of June 2026.',
  },
  {
    id: 'prius-2023-15k', make: 'Toyota', model: 'Prius', trim: 'XLE', trimTier: 2,
    year: 2023, condition: 'used', mileage: 15000, powertrain: 'hybrid',
    sellingPrice: 28500, combinedMpg: 52, combinedMpge: 52, evKwhPer100mi: null,
    electricRange: null, cargoCuFt: 20.3, bodyClass: 'hatchback',
    sourceNote: '2023 Prius XLE FWD, premium low-mile ~15k. Corrected down from initial ~$30.4k to sit below the new 2026 LE (used-over-new fix). EPA 52 combined (XLE FWD), 20.3 cu ft. As of June 2026.',
  },

  // ── Honda Fit ────────────────────────────────────────────────────────
  {
    id: 'fit-2019-48k', make: 'Honda', model: 'Fit', trim: 'LX', trimTier: 1,
    year: 2019, condition: 'used', mileage: 48000, powertrain: 'gas',
    sellingPrice: 15800, combinedMpg: 36, combinedMpge: 36, evKwhPer100mi: null,
    electricRange: null, cargoCuFt: 16.6, bodyClass: 'subcompact',
    sourceNote: 'Edmunds 2019 LX @48k retail ~$16,762; CarGurus 2019 avg ~$15,735. Median asking ~$16,600 ×0.95 → ~$15,800. 4+ CT/NE comps. As of June 2026.',
  },
  {
    id: 'fit-2019-70k', make: 'Honda', model: 'Fit', trim: 'Sport', trimTier: 2,
    year: 2019, condition: 'used', mileage: 70000, powertrain: 'gas',
    sellingPrice: 13900, combinedMpg: 33, combinedMpge: 33, evKwhPer100mi: null,
    electricRange: null, cargoCuFt: 16.6, bodyClass: 'subcompact',
    sourceNote: '2019 Sport, higher 70k mi + discontinued gas = slow seller. Median asking ~$14,900 ×0.93 → ~$13,900. 3+ CT/NE comps. As of June 2026.',
  },
  {
    id: 'fit-2020-39k', make: 'Honda', model: 'Fit', trim: 'LX', trimTier: 1,
    year: 2020, condition: 'used', mileage: 39000, powertrain: 'gas',
    sellingPrice: 16900, combinedMpg: 36, combinedMpge: 36, evKwhPer100mi: null,
    electricRange: null, cargoCuFt: 16.6, bodyClass: 'subcompact',
    sourceNote: 'CarGurus 2020 Fit avg ~$16,962; low-mile 39k commands a premium. Median asking ~$17,800 ×0.95 → ~$16,900. 4+ CT/NE comps. As of June 2026.',
  },
  {
    id: 'fit-2020-55k', make: 'Honda', model: 'Fit', trim: 'EX', trimTier: 2,
    year: 2020, condition: 'used', mileage: 55000, powertrain: 'gas',
    sellingPrice: 15500, combinedMpg: 33, combinedMpge: 33, evKwhPer100mi: null,
    electricRange: null, cargoCuFt: 16.6, bodyClass: 'subcompact',
    sourceNote: 'CarGurus 2020 Fit EX avg ~$16,865; NE comp $14,999 @51k. Median asking ~$16,300 ×0.95 → ~$15,500. 3+ CT/NE comps. As of June 2026.',
  },

  // ── Tesla Model Y ────────────────────────────────────────────────────
  {
    id: 'modely-2021-50k', make: 'Tesla', model: 'Model Y', trim: 'Long Range AWD', trimTier: 3,
    year: 2021, condition: 'used', mileage: 50000, powertrain: 'ev',
    sellingPrice: 27400, combinedMpg: null, combinedMpge: 125, evKwhPer100mi: 27,
    electricRange: 326, cargoCuFt: 30.2, bodyClass: 'compact-suv',
    sourceNote: 'CarGurus CT comps (4) ~$28,200 median asking ×0.97 (Tesla, hot) → $27,400. EPA fueleconomy.gov 2021 LR AWD: 125 MPGe, 27 kWh/100mi, 326 mi. As of June 2026.',
  },
  {
    id: 'modely-2022-38k', make: 'Tesla', model: 'Model Y', trim: 'Long Range AWD', trimTier: 3,
    year: 2022, condition: 'used', mileage: 38000, powertrain: 'ev',
    sellingPrice: 29100, combinedMpg: null, combinedMpge: 122, evKwhPer100mi: 28,
    electricRange: 330, cargoCuFt: 30.2, bodyClass: 'compact-suv',
    sourceNote: 'CarGurus CT comps near 38k mi ~$30,000 median asking ×0.97 → $29,100. EPA 2022 LR AWD: 122 MPGe, 28 kWh/100mi, 330 mi. As of June 2026.',
  },
  {
    id: 'modely-2023-25k', make: 'Tesla', model: 'Model Y', trim: 'RWD', trimTier: 1,
    year: 2023, condition: 'used', mileage: 25000, powertrain: 'ev',
    sellingPrice: 31800, combinedMpg: null, combinedMpge: 129, evKwhPer100mi: 26,
    electricRange: 260, cargoCuFt: 30.2, bodyClass: 'compact-suv',
    sourceNote: '2023 RWD (single-motor); RWD trades ~$2-3k below LR AWD. Est median asking ~$32,800 ×0.97 → $31,800. EPA 2023 RWD: ~129 MPGe, 26 kWh/100mi, 260 mi. As of June 2026.',
  },
  {
    id: 'modely-2026-new', make: 'Tesla', model: 'Model Y', trim: 'RWD', trimTier: 1,
    year: 2026, condition: 'new', mileage: 0, powertrain: 'ev',
    sellingPrice: 41600, combinedMpg: null, combinedMpge: 138, evKwhPer100mi: 24,
    electricRange: 321, cargoCuFt: 29, bodyClass: 'compact-suv',
    sourceNote: 'New 2026 Standard RWD: Tesla no-haggle MSRP $39,990 + $1,640 dest/order = ~$41,600. EPA 2026 Standard RWD (18"): 138 MPGe, 24 kWh/100mi, 321 mi. Juniper cargo ~29 cu ft seats-up. As of June 2026.',
  },
  {
    id: 'modely-2024-15k', make: 'Tesla', model: 'Model Y', trim: 'Long Range AWD', trimTier: 3,
    year: 2024, condition: 'used', mileage: 15000, powertrain: 'ev',
    sellingPrice: 35700, combinedMpg: null, combinedMpge: 117, evKwhPer100mi: 29,
    electricRange: 310, cargoCuFt: 30.2, bodyClass: 'compact-suv',
    sourceNote: 'Low-mi 2024 LR AWD; est median asking ~$36,800 for ~15k mi ×0.97 → $35,700. EPA 2024 LR AWD: 117 MPGe, 29 kWh/100mi, 310 mi. As of June 2026.',
  },

  // ── Subaru Crosstrek (PHEV, 2019–2023) ───────────────────────────────
  {
    id: 'crosstrek-phev-2019-72k', make: 'Subaru', model: 'Crosstrek Hybrid', trim: 'PHEV', trimTier: 1,
    year: 2019, condition: 'used', mileage: 72000, powertrain: 'phev',
    sellingPrice: 22800, combinedMpg: 35, combinedMpge: 90, evKwhPer100mi: 38,
    electricRange: 17, cargoCuFt: 15.9, bodyClass: 'compact-suv', phevElectricFraction: 0.4,
    sourceNote: 'Plug-in PHEV. CT+MA comps (4) ~$24,000 mileage-adjusted median ×0.95 → $22,800; NE holds value. ~17mi AER → eFrac 0.4. EPA 35 mpg / 90 MPGe / 38 kWh-100mi. As of June 2026.',
  },
  {
    id: 'crosstrek-phev-2021-48k', make: 'Subaru', model: 'Crosstrek Hybrid', trim: 'PHEV', trimTier: 1,
    year: 2021, condition: 'used', mileage: 48000, powertrain: 'phev',
    sellingPrice: 24200, combinedMpg: 35, combinedMpge: 90, evKwhPer100mi: 38,
    electricRange: 17, cargoCuFt: 15.9, bodyClass: 'compact-suv', phevElectricFraction: 0.4,
    sourceNote: 'Plug-in PHEV. Few 40-55k mi NE comps; interpolated 48k median asking ~$25,500 ×0.95 → ~$24,200 (low confidence). ~17mi AER → eFrac 0.4. As of June 2026.',
  },
  {
    id: 'crosstrek-phev-2023-28k', make: 'Subaru', model: 'Crosstrek Hybrid', trim: 'PHEV', trimTier: 1,
    year: 2023, condition: 'used', mileage: 28000, powertrain: 'phev',
    sellingPrice: 25800, combinedMpg: 35, combinedMpge: 90, evKwhPer100mi: 38,
    electricRange: 17, cargoCuFt: 15.9, bodyClass: 'compact-suv', phevElectricFraction: 0.4,
    sourceNote: 'Plug-in PHEV. CT/NE comps (5) near 22-31k mi, median asking ~$27,000 ×0.95 → ~$25,800. ~17mi AER → eFrac 0.4. As of June 2026.',
  },

  // ── Subaru 2026 conventional hybrids ─────────────────────────────────
  {
    id: 'forester-hybrid-2026-new', make: 'Subaru', model: 'Forester Hybrid', trim: 'Premium', trimTier: 2,
    year: 2026, condition: 'new', mileage: 0, powertrain: 'hybrid',
    sellingPrice: 36500, combinedMpg: 35, combinedMpge: 35, evKwhPer100mi: null,
    electricRange: null, cargoCuFt: 27.5, bodyClass: 'compact-suv',
    sourceNote: 'New 2026 Forester Hybrid Premium (conventional Toyota-system HEV, not plug-in). MSRP $34,730 + $1,450 dest → ~$36,500 pre-tax in CT (transacts at MSRP). EPA 35 combined (fueleconomy.gov #50131); 27.5 cu ft. As of June 2026.',
  },
  {
    id: 'crosstrek-hybrid-2026-new', make: 'Subaru', model: 'Crosstrek Hybrid', trim: 'Sport', trimTier: 1,
    year: 2026, condition: 'new', mileage: 0, powertrain: 'hybrid',
    sellingPrice: 35400, combinedMpg: 36, combinedMpge: 36, evKwhPer100mi: null,
    electricRange: null, cargoCuFt: 18.6, bodyClass: 'compact-suv',
    sourceNote: 'New 2026 Crosstrek Hybrid Sport (conventional next-gen HEV, not the discontinued plug-in). MSRP $33,995 + $1,450 dest → ~$35,400 pre-tax in CT (transacts at MSRP). EPA 36 combined; 18.6 cu ft. As of June 2026.',
  },

  // ── Subaru Solterra (BEV — included as ev, not a hybrid) ─────────────
  {
    id: 'solterra-2023-22k', make: 'Subaru', model: 'Solterra', trim: 'Premium AWD', trimTier: 1,
    year: 2023, condition: 'used', mileage: 22000, powertrain: 'ev',
    sellingPrice: 20800, combinedMpg: null, combinedMpge: 104, evKwhPer100mi: 31,
    electricRange: 228, cargoCuFt: 23.8, bodyClass: 'compact-suv',
    sourceNote: "Subaru's battery EV (NOT a hybrid). EPA fueleconomy.gov #46030: 104 MPGe, 31 kWh/100mi, 228 mi. 6+ NE/CT comps cluster $21-23k; slow-selling EV ×0.93 → ~$20,800 (heavy EV depreciation, below earlier $27k seed). As of June 2026.",
  },

  // ── Subaru Crosstrek (gas, AWD) ──────────────────────────────────────
  {
    id: 'crosstrek-2018-82k', make: 'Subaru', model: 'Crosstrek', trim: 'Premium', trimTier: 2,
    year: 2018, condition: 'used', mileage: 82000, powertrain: 'gas',
    sellingPrice: 16400, combinedMpg: 29, combinedMpge: 29, evKwhPer100mi: null,
    electricRange: null, cargoCuFt: 20.8, bodyClass: 'compact-suv',
    sourceNote: '2018 Crosstrek 2.0i Premium AWD ~82k mi. CT/Hartford comps $15.5-18k; median asking ~$17.6k, older high-mile ×0.93 → $16,400 (Subaru holds value in NE). EPA AWD 29 combined. As of June 2026.',
  },
  {
    id: 'crosstrek-2020-58k', make: 'Subaru', model: 'Crosstrek', trim: 'Premium', trimTier: 2,
    year: 2020, condition: 'used', mileage: 58000, powertrain: 'gas',
    sellingPrice: 20400, combinedMpg: 29, combinedMpge: 29, evKwhPer100mi: null,
    electricRange: null, cargoCuFt: 20.8, bodyClass: 'compact-suv',
    sourceNote: '2020 Crosstrek Premium AWD ~58k mi. CARFAX 2020 avg selling ~$20,000 (national), CT/NE +2-4%; median asking ~$21.5k ×0.95 → $20,400. EPA AWD 29 combined. As of June 2026.',
  },
  {
    id: 'crosstrek-2022-38k', make: 'Subaru', model: 'Crosstrek', trim: 'Premium', trimTier: 2,
    year: 2022, condition: 'used', mileage: 38000, powertrain: 'gas',
    sellingPrice: 22800, combinedMpg: 29, combinedMpge: 29, evKwhPer100mi: null,
    electricRange: null, cargoCuFt: 20.8, bodyClass: 'compact-suv',
    sourceNote: '2022 Crosstrek Premium AWD ~38k mi. CarGurus CT (North Haven) $24,694 @24.5k; CARFAX 2022 avg ~$23k. Median asking ~$24.0k ×0.95 → $22,800. EPA AWD 29 combined. As of June 2026.',
  },
  {
    id: 'crosstrek-2024-18k', make: 'Subaru', model: 'Crosstrek', trim: 'Premium', trimTier: 2,
    year: 2024, condition: 'used', mileage: 18000, powertrain: 'gas',
    sellingPrice: 24900, combinedMpg: 29, combinedMpge: 29, evKwhPer100mi: null,
    electricRange: null, cargoCuFt: 20.0, bodyClass: 'compact-suv',
    sourceNote: '2024 Crosstrek Premium AWD ~18k mi (current gen). Median asking ~$27.0k ×0.96 → ~$25.9k; nudged to $24,900 to sit below the same-era Crosstrek PHEV. EPA AWD 29 combined. As of June 2026.',
  },

  // ── Subaru Forester (gas, AWD) ───────────────────────────────────────
  {
    id: 'forester-2018-88k', make: 'Subaru', model: 'Forester', trim: 'Premium', trimTier: 2,
    year: 2018, condition: 'used', mileage: 88000, powertrain: 'gas',
    sellingPrice: 16000, combinedMpg: 28, combinedMpge: 28, evKwhPer100mi: null,
    electricRange: null, cargoCuFt: 31.5, bodyClass: 'compact-suv',
    sourceNote: '2018 Forester 2.5i Premium AWD ~88k mi (4th gen). CT comps $14.5-17.2k; median asking ~$17.2k, older high-mile ×0.93 → $16,000. EPA AWD 28 combined (26/32). Cargo 31.5 cu ft. As of June 2026.',
  },
  {
    id: 'forester-2020-60k', make: 'Subaru', model: 'Forester', trim: 'Premium', trimTier: 2,
    year: 2020, condition: 'used', mileage: 60000, powertrain: 'gas',
    sellingPrice: 20700, combinedMpg: 29, combinedMpge: 29, evKwhPer100mi: null,
    electricRange: null, cargoCuFt: 28.9, bodyClass: 'compact-suv',
    sourceNote: '2020 Forester Premium AWD ~60k mi (5th gen). CT comps; Edmunds Hartford avg list $19,537; median Premium asking ~$21.8k ×0.95 → $20,700. EPA AWD 29 combined (26/33). Cargo 28.9 cu ft. As of June 2026.',
  },
  {
    id: 'forester-2022-40k', make: 'Subaru', model: 'Forester', trim: 'Premium', trimTier: 2,
    year: 2022, condition: 'used', mileage: 40000, powertrain: 'gas',
    sellingPrice: 23000, combinedMpg: 29, combinedMpge: 29, evKwhPer100mi: null,
    electricRange: null, cargoCuFt: 28.9, bodyClass: 'compact-suv',
    sourceNote: '2022 Forester Premium AWD ~40k mi. CarGurus NE comps $23,600-$24,990; median asking ~$23.9k ×0.96 → $23,000. EPA AWD 29 combined (26/33). Cargo 28.9 cu ft. As of June 2026.',
  },
  {
    id: 'forester-2024-20k', make: 'Subaru', model: 'Forester', trim: 'Premium', trimTier: 2,
    year: 2024, condition: 'used', mileage: 20000, powertrain: 'gas',
    sellingPrice: 28300, combinedMpg: 29, combinedMpge: 29, evKwhPer100mi: null,
    electricRange: null, cargoCuFt: 28.9, bodyClass: 'compact-suv',
    sourceNote: '2024 Forester Premium AWD ~20k mi. CarGurus 2024 avg $30,085; median Premium asking ~$29.5k ×0.96 → $28,300. EPA AWD 29 combined (26/33). Cargo 28.9 cu ft. As of June 2026.',
  },

  // ── Honda CR-V (gas) ─────────────────────────────────────────────────
  {
    id: 'crv-2018-78k', make: 'Honda', model: 'CR-V', trim: 'EX', trimTier: 1,
    year: 2018, condition: 'used', mileage: 78000, powertrain: 'gas',
    sellingPrice: 18900, combinedMpg: 29, combinedMpge: 29, evKwhPer100mi: null,
    electricRange: null, cargoCuFt: 39.2, bodyClass: 'compact-suv',
    sourceNote: '2018 CR-V EX 1.5T AWD ~78k mi. CT comps; median asking ~$20,000, older high-mileage gas ×0.92 → $18,900. EPA AWD 29 combined. As of June 2026.',
  },
  {
    id: 'crv-2019-60k', make: 'Honda', model: 'CR-V', trim: 'EX-L', trimTier: 2,
    year: 2019, condition: 'used', mileage: 60000, powertrain: 'gas',
    sellingPrice: 21700, combinedMpg: 29, combinedMpge: 29, evKwhPer100mi: null,
    electricRange: null, cargoCuFt: 39.2, bodyClass: 'compact-suv',
    sourceNote: '2019 CR-V EX-L 1.5T AWD ~60k mi. CT comps median asking ~$22,800 ×0.95 → $21,700. EPA AWD 29 combined. As of June 2026.',
  },
  {
    id: 'crv-2021-42k', make: 'Honda', model: 'CR-V', trim: 'EX', trimTier: 1,
    year: 2021, condition: 'used', mileage: 42000, powertrain: 'gas',
    sellingPrice: 24200, combinedMpg: 29, combinedMpge: 29, evKwhPer100mi: null,
    electricRange: null, cargoCuFt: 39.2, bodyClass: 'compact-suv',
    sourceNote: '2021 CR-V EX 1.5T AWD ~42k mi. Edmunds Hartford avg list $24,191; median asking ~$25,500 ×0.95 → $24,200. EPA AWD 29 combined. As of June 2026.',
  },
  {
    id: 'crv-2022-35k', make: 'Honda', model: 'CR-V', trim: 'Touring', trimTier: 3,
    year: 2022, condition: 'used', mileage: 35000, powertrain: 'gas',
    sellingPrice: 27500, combinedMpg: 29, combinedMpge: 29, evKwhPer100mi: null,
    electricRange: null, cargoCuFt: 39.2, bodyClass: 'compact-suv',
    sourceNote: '2022 CR-V Touring 1.5T AWD ~35k mi. CT comps median asking ~$29,000 ×0.95 → $27,500. EPA AWD 29 combined. As of June 2026.',
  },

  // ── Honda CR-V Hybrid ────────────────────────────────────────────────
  {
    id: 'crv-hybrid-2023-30k', make: 'Honda', model: 'CR-V Hybrid', trim: 'Sport', trimTier: 1,
    year: 2023, condition: 'used', mileage: 30000, powertrain: 'hybrid',
    sellingPrice: 30600, combinedMpg: 37, combinedMpge: 37, evKwhPer100mi: null,
    electricRange: null, cargoCuFt: 36.3, bodyClass: 'compact-suv',
    sourceNote: '2023 CR-V Hybrid Sport AWD ~30k mi. Edmunds Hartford avg $31,380; median asking ~$31,500, hot low-mile ×0.97 → $30,600. EPA 40/34/37. 36.3 cu ft. 5 comps. As of June 2026.',
  },
  {
    id: 'crv-hybrid-2024-18k', make: 'Honda', model: 'CR-V Hybrid', trim: 'Sport-L', trimTier: 3,
    year: 2024, condition: 'used', mileage: 18000, powertrain: 'hybrid',
    sellingPrice: 32500, combinedMpg: 37, combinedMpge: 37, evKwhPer100mi: null,
    electricRange: null, cargoCuFt: 36.3, bodyClass: 'compact-suv',
    sourceNote: '2024 CR-V Hybrid Sport-L AWD ~18k mi. CT/NE comps; low-mile dealer median asking ~$33,500 ×0.97 → $32,500. EPA 40/34/37. 36.3 cu ft. 4 comps. As of June 2026.',
  },

  // ── Honda Civic Hatchback Hybrid (MY2025+ only) ──────────────────────
  {
    id: 'civic-hb-hybrid-2025-12k', make: 'Honda', model: 'Civic Hatchback Hybrid', trim: 'Sport Hybrid', trimTier: 2,
    year: 2025, condition: 'used', mileage: 12000, powertrain: 'hybrid',
    sellingPrice: 28300, combinedMpg: 48, combinedMpge: 48, evKwhPer100mi: null,
    electricRange: null, cargoCuFt: 24.5, bodyClass: 'hatchback',
    sourceNote: 'First hatch-hybrid model year (2025). CT/NE comps stepped to ~12k mi ~$29,200; sells near new ×0.97 → $28,300. EPA 2025 Civic 5Dr Hybrid 48 combined (18" hatch). 4 comps. As of June 2026.',
  },
  {
    id: 'civic-hb-hybrid-2026-new', make: 'Honda', model: 'Civic Hatchback Hybrid', trim: 'Sport Touring Hybrid', trimTier: 3,
    year: 2026, condition: 'new', mileage: 0, powertrain: 'hybrid',
    sellingPrice: 34790, combinedMpg: 48, combinedMpge: 48, evKwhPer100mi: null,
    electricRange: null, cargoCuFt: 24.5, bodyClass: 'hatchback',
    sourceNote: 'New 2026 Sport Touring Hybrid: MSRP $33,595 + $1,195 dest = $34,790 (matches Hoffman Honda Hartford). Transacts at MSRP. EPA 48 combined (carryover). As of June 2026.',
  },

  // ── Toyota RAV4 (gas) ────────────────────────────────────────────────
  {
    id: 'rav4-2019-70k', make: 'Toyota', model: 'RAV4', trim: 'LE', trimTier: 1,
    year: 2019, condition: 'used', mileage: 70000, powertrain: 'gas',
    sellingPrice: 19500, combinedMpg: 28, combinedMpge: 28, evKwhPer100mi: null,
    electricRange: null, cargoCuFt: 37.6, bodyClass: 'compact-suv',
    sourceNote: '2019 RAV4 LE AWD ~70k mi. CT comps median asking ~$21,200, older high-mileage gas ×0.92 → $19,500. EPA AWD LE 28 combined. As of June 2026.',
  },
  {
    id: 'rav4-2020-58k', make: 'Toyota', model: 'RAV4', trim: 'XLE', trimTier: 2,
    year: 2020, condition: 'used', mileage: 58000, powertrain: 'gas',
    sellingPrice: 23300, combinedMpg: 28, combinedMpge: 28, evKwhPer100mi: null,
    electricRange: null, cargoCuFt: 37.6, bodyClass: 'compact-suv',
    sourceNote: '2020 RAV4 XLE AWD ~58k mi. CT comps median asking ~$24,500, in-demand ×0.95 → $23,300. EPA AWD 28 combined. As of June 2026.',
  },
  {
    id: 'rav4-2022-40k', make: 'Toyota', model: 'RAV4', trim: 'XLE', trimTier: 2,
    year: 2022, condition: 'used', mileage: 40000, powertrain: 'gas',
    sellingPrice: 29200, combinedMpg: 29, combinedMpge: 29, evKwhPer100mi: null,
    electricRange: null, cargoCuFt: 37.6, bodyClass: 'compact-suv',
    sourceNote: '2022 RAV4 XLE AWD ~40k mi. CT comps median non-CPO asking ~$30,700, strong value ×0.95 → $29,200. EPA AWD 29 combined. As of June 2026.',
  },

  // ── Toyota RAV4 Hybrid ───────────────────────────────────────────────
  {
    id: 'rav4-hybrid-2021-46k', make: 'Toyota', model: 'RAV4 Hybrid', trim: 'XLE', trimTier: 2,
    year: 2021, condition: 'used', mileage: 46000, powertrain: 'hybrid',
    sellingPrice: 28900, combinedMpg: 40, combinedMpge: 40, evKwhPer100mi: null,
    electricRange: null, cargoCuFt: 37.5, bodyClass: 'compact-suv',
    sourceNote: '2021 RAV4 Hybrid XLE AWD ~46k mi. Edmunds Hartford avg $29,771; median asking ~$29,800, hot ×0.97 → $28,900. EPA 40 combined. As of June 2026.',
  },
  {
    id: 'rav4-hybrid-2023-28k', make: 'Toyota', model: 'RAV4 Hybrid', trim: 'XLE', trimTier: 2,
    year: 2023, condition: 'used', mileage: 28000, powertrain: 'hybrid',
    sellingPrice: 32500, combinedMpg: 40, combinedMpge: 40, evKwhPer100mi: null,
    electricRange: null, cargoCuFt: 37.6, bodyClass: 'compact-suv',
    sourceNote: '2023 RAV4 Hybrid XLE AWD ~28k mi. Median asking ~$33,500, hot ×0.97 → $32,500. EPA 40 combined. As of June 2026.',
  },
]
