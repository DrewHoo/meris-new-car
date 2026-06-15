# meris-new-car

An interactive scatter plot for car shopping — **[drewhoover.com/meris-new-car](https://drewhoover.com/meris-new-car/)**.

Plot ~35 new & used cars on any two of: out-the-door price, selling price, model year, age,
mileage, combined MPGe, electric range, annual energy cost, and cargo. Color and filter by
powertrain, make, condition, body class, or trim tier. **Connecticut out-the-door** prices and
annual running costs recompute live as you adjust the tax, fee, gas, electricity, and annual-miles
assumptions. Shareable URL state.

## Stack

Vite + React 18 + TypeScript + granular `d3-*` (scale/array/format). Lazy Mixpanel analytics.
Deploys to GitHub Pages via Actions. Same family as the other drewhoover.com data-viz sites.

```bash
npm install
npm run dev      # local dev server
npm test         # vitest (OTD round-trip, energy-cost model, dataset integrity)
npm run build    # tsc -b && vite build
npm run gen:og       # regenerate public/og.png       (after a redesign)
npm run gen:favicon  # regenerate the favicon set
```

## Data

`src/data/cars.ts` is a **hand-curated, committed snapshot** — there's no clean free API for used-car
transaction prices and listings are ephemeral, so this is intentional (not a build-time fetch).
Pre-tax selling prices are researched estimates (`asOf` in the same file) from CT/Northeast listings
(CarGurus, Edmunds, KBB, Cars.com), converted from median asking to a realistic selling price; EPA
specs are from fueleconomy.gov. Each row carries a `sourceNote`. **To refresh:** re-research prices,
update the rows, and bump `asOf`.

## How the numbers work

- **Out-the-door (CT):** `sellingPrice + docFee + (sellingPrice + docFee) × salesTax + regFees`.
  Defaults: 6.35% (7.75% above $50k), $599 doc, $240 reg. The Kia Niro EV is anchored so its OTD
  equals the owner-supplied $26,000.
- **One efficiency axis:** a gallon of gas ≈ 33.7 kWh, so a gas/hybrid's combined MPG equals its
  MPGe — letting EVs, hybrids, and gas cars share a single "combined MPGe" axis.
- **Annual energy cost:** gas/hybrid `miles/mpg × gasPrice`; EV `miles × kWh/100mi × elecPrice`;
  PHEV a blend (electric-mile fraction, default 0.55). At CT's high electricity price a 57-MPG Prius
  can cost less per year to fuel than an EV.
