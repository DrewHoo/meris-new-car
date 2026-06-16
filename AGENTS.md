# AGENTS.md — meris-new-car

A guide for any agent picking up this project cold. Read this first, then skim the files it points to.

## What this is

An interactive car-shopping data-viz for a Connecticut buyer, live at
**https://drewhoover.com/meris-new-car/**. ~60 new & used cars on one page:

- A **scatter plot** with swappable X/Y axes (price, mileage, year, efficiency, running cost, cargo,
  backseat space), color/filter by powertrain/make/condition/body/trim-tier.
- **"Better points up"** — orients each axis so the stronger choice sits toward the top-right.
- A **weighted ranked heatmap table** — scores every car, best on top, green→red cells, tunable
  weight sliders + presets.
- **Live Connecticut out-the-door pricing** — OTD and annual running cost recompute as you drag the
  tax/fee/gas/electricity/annual-miles assumptions.
- **Shareable URL state** — every axis, filter, weight, and assumption is encoded in the URL.

It's a sibling of the other `drewhoover.com/<slug>/` data-viz sites (see the `dataviz-pages-site`
skill). The owner is a data-viz person; quality of both the analysis and the chart craft matters.

## Stack & deploy

- **Vite + React 18 + TypeScript**, granular `d3-*` (scale/array/format), lazy Mixpanel analytics.
- **GitHub Pages via Actions.** `DrewHoo/meris-new-car`, public. `.github/workflows/deploy.yml` builds
  on push to `main` (`npm ci` → `npm run build` → upload `dist` → deploy-pages). **No cron** — the data
  is a committed snapshot, not a scheduled fetch.
- `vite.config.ts` sets `base: '/meris-new-car/'` — this MUST match the repo name or every asset 404s.
- The project card on the index lives in a *different* repo:
  `DrewHoo.github.io/src/content/projects/meris-new-car.md` (Astro frontmatter; bump `updated` when you
  change things materially).
- Shared chrome (back-bar + giscus comments) is injected by `<script>` tags in `index.html` pointing at
  `drewhoover.com/embed/*.js`. OG image + favicons are pre-generated into `public/` (see scripts).

### Commands

```bash
npm install
npm run dev      # local dev server (http://localhost:5173/meris-new-car/)
npm test         # vitest — OTD round-trip, energy-cost model, dataset integrity
npm run build    # tsc -b && vite build   (the type-check is the real gate; vitest skips types)
npm run gen:og       # regenerate public/og.png after a visual/headline change
npm run gen:favicon  # regenerate the favicon set
node scripts/build-cars.mjs <workflow-output.json>   # regenerate src/data/cars.ts (see Data)
```

Deploy = commit + push to `main`; watch with `gh run watch <id> --repo DrewHoo/meris-new-car`, then
`curl -sI https://drewhoover.com/meris-new-car/` should be 200.

## Repo layout

```
src/
  types.ts          Car, Assumptions, OtdBreakdown, DerivedCar
  data/cars.ts      THE DATASET (~60 hand-curated rows) + asOf stamp
  lib/
    model.ts        DEFAULT_ASSUMPTIONS, computeOtd, computeAnnualEnergyCost, computeAge,
                    deriveCar, withComputed, CURRENT_YEAR   (pure; the compute core)
    trimTiers.ts    TIER_LABELS, tierLabel, TIER_EXPLAINER  (Base/Mid/Upper/Top ladder)
    model.test.ts   the Niro $26k OTD round-trip + energy-cost + dataset-integrity tests
  axes.ts           AXIS_OPTIONS registry (drives both X/Y dropdowns + the chart), COLOR_OPTIONS,
                    DEFAULT_X/Y/COLOR. Each axis has a betterDirection ('low' | 'high').
  scoring.ts        CRITERIA, DEFAULT_WEIGHTS, PRESETS, rankCars(), goodnessColor/CellStyle()
  colors.ts         POWERTRAIN/CONDITION/TIER colors, buildColorScale(), colorDomain()
  urlState.ts       UiState, readInitialState(cars), buildSearch(state)  (URL <-> state)
  App.tsx           the integration point: state, derived memos, URL mirroring, layout
  ScatterChart.tsx  SVG scatter; per-axis scales (reversible for orientation); pointer hit-testing
  Controls.tsx      X/Y/color selects, "Better points up" + "Normalize trims" toggles, ShareButton
  AssumptionsPanel.tsx  6 CT cost inputs + reset
  RankedTable.tsx   weighted heatmap table + weight sliders + presets
  ModelsPanel.tsx   make/powertrain/tier/condition filters + per-car include/exclude + source links
  Tooltip.tsx       hover/tap card with the OTD breakdown + specs + source
  Legend.tsx        color legend
  analytics.ts      lazy Mixpanel (shared drewhoover.com token; safe to commit)
  main.tsx, styles.css
scripts/
  build-cars.mjs    (re)generates the whole src/data/cars.ts from a sourcing-workflow JSON
  patch-cars.mjs    applies targeted updates onto cars.ts by id (e.g. CPO upgrades); arg2 = skip-list
  gen-og.mjs, gen-favicon.mjs   sharp-based asset generation
```

## The data model & math

A `Car` (see `types.ts`) stores **pre-tax** facts; the assumption-dependent fields are computed live in
`lib/model.ts` so the chart reacts to the sliders. One `useMemo` in `App.tsx` re-derives all rows when
`assumptions` changes.

- **CT out-the-door:** `taxable = sellingPrice + docFee`; `tax = taxable × rate` (6.35% ≤ $50k, 7.75%
  above); `otd = sellingPrice + docFee + tax + regFees`. Defaults: 6.35%, $599 doc, $240 reg. The Kia
  Niro EV `sellingPrice` is **back-derived ($23,623)** so its OTD round-trips to the owner's stated
  **$26,000** — there's a unit test asserting this; don't break it.
- **One efficiency axis (MPGe):** a gallon of gas ≈ 33.7 kWh, so a gas/hybrid's combined MPG equals its
  MPGe. `combinedMpge` therefore **must equal `combinedMpg` for gas/hybrid**, the EV MPGe for EVs.
  `scripts/build-cars.mjs` enforces this (agents kept getting it wrong) — keep that normalization.
- **Annual energy cost:** gas/hybrid `miles/mpg × gasPrice`; EV `miles × kWh100/100 × elecPrice`; PHEV a
  blend by `phevElectricFraction` (assumption default 0.55, overridden to **0.4 on every PHEV row** by
  the builder — today that's only the low-AER Crosstreks; a new PHEV would silently get 0.4 too). CT's
  high electricity (~$0.31/kWh default) is the headline: a 57-MPG Prius can out-cost an EV to fuel.
- **Scoring (`scoring.ts`):** min-max normalize each `CRITERIA` metric across the *currently filtered*
  cars (direction-aware), weighted-average to 0–100, sort desc. Weight 0 drops a criterion. The heatmap
  colors cells by per-criterion goodness.

### Registries — how to add things

- **Add a plottable axis:** one entry in `AXIS_OPTIONS` (`axes.ts`) — `{key,label,short,accessor,format,
  scaleType,betterDirection}`. The accessor reads a `DerivedCar`, so computed fields work like raw ones.
  Nothing else changes; both dropdowns and the chart pick it up.
- **Add a scoring criterion / heatmap column:** one entry in `CRITERIA` (`scoring.ts`) + a default in
  `DEFAULT_WEIGHTS` (and optionally tweak `PRESETS`).
- **Add a color encoding:** add a `COLOR_OPTIONS` key and handle it in `buildColorScale` + `colorDomain`
  (`colors.ts`).
- **Add a data field:** extend `Car` in `types.ts`, set it on every row in `data/cars.ts` (and the test
  helper in `model.test.ts`), surface it in `Tooltip`/registries as needed.
- **URL state:** add the field to `UiState`, parse it in `readInitialState`, emit it (omitting defaults)
  in `buildSearch` (`urlState.ts`), and add it to the `useEffect` deps + `buildSearch` call in `App.tsx`.

## The dataset & how to fetch/source data

`src/data/cars.ts` is a **committed, hand-curated snapshot** (with an `asOf` stamp), NOT a build-time
fetch. This is deliberate: there is **no clean free API** for used-car transaction prices, listings are
ephemeral, and scraping is fragile/ToS-fraught. Refreshing = re-run the sourcing research and rebuild
the file, then bump `asOf`.

**Sourcing rules the owner set (honor these):**
- Every **used** row must be a real **Carvana** listing (preferred — no-haggle, national) or, if Carvana
  has nothing suitable, a **certified pre-owned (CPO)** listing. No ordinary non-certified/private comps.
- **New** rows = MSRP + destination with a dealer/manufacturer link.
- `sourceName` + `sourceUrl` are on every row and shown in the tooltip + as a clickable link in the
  models panel. The Niro EV keeps `sourceName: "Owner's out-the-door quote"` (no URL) — it's the anchor.
- Specs (`combinedMpg`, cargo, legroom, EV range/kWh) come from **fueleconomy.gov** + manufacturer specs,
  keyed by model **generation** — NOT from the listing. Watch trim-driven MPG drops (e.g. Niro/Crosstrek
  "Touring" trims lose mpg to bigger wheels).

**How to actually fetch (amended — important):**
- **`WebFetch` 403s on car-listing sites.** Carvana's vehicle detail pages return HTTP 403 to automated
  fetch, and so do many dealer sites (e.g. `premierkiact.com` — confirmed) behind Cloudflare/bot
  protection. Do **not** rely on WebFetch resolving a listing page.
- **Use `WebSearch` to extract listing details.** Search engines index these pages, so a query like
  `"Premier Kia Branford 2023 Kia Niro certified price mileage trim"` returns the price/mileage/trim/VIN
  in the result snippets even when the page itself won't fetch. That's how the canonical
  Premier-Kia Niro listing (SX Touring, 43,778 mi, $24,909) was verified.
- **Capture the canonical listing URL anyway** for `sourceUrl` (the owner wants the link even if we
  can't deep-fetch it). For Carvana, a specific `vehicle/<id>` URL is best; a model-search URL
  (`carvana.com/cars/<model>`) is the documented fallback when the VIN page can't be confirmed.
- **CPO dealer listings are first-class — and the owner prefers them over weak Carvana-search links.**
  They satisfy "else certified", are usually in-CT, and the owner will sometimes hand you one directly
  (as with the Premier Kia link). The **proven method** (workflow `cpo-upgrade`):
  1. Pick ONE reputable CT certified-pre-owned dealer per make (e.g. Premier Kia of Branford, Hoffman
     Toyota/Honda of West Simsbury, Mitchell Subaru of Canton, Liberty Mazda of Hartford).
  2. Targeted searches: `"<dealer> certified <year> <make> <model> <trim>"`. Read the price / mileage /
     trim / VIN / stock# straight from the **search-result snippets** (the dealer page itself 403s).
  3. `sourceName: "<Brand> Certified (CPO) — <Dealer>, <City> CT"`, `sourceUrl` = the specific vehicle
     `.htm` page if it's in results, else the dealer's certified-inventory page for that model.
  - **Manufacturer CPO only covers recent, low-mileage cars** (~within 5–6 model years and under
    ~60–85k mi, brand-dependent). So CPO upgrades naturally apply to the newer/low-mileage rows; the
    **older/high-mileage rows stay on Carvana** — that's expected, not a gap. Watch for **body-style
    mismatches** (a sedan Civic/Mazda3 listing is NOT our hatchback) and **brand-mismatched URLs** (a
    "Honda Certified" car on a Hyundai-dealer domain is a red flag) — skip those.
- Carvana is no-haggle → `sellingPrice` = the listed price (pre-tax). CPO → the listed price.

**The sourcing pipeline (how the current data was built):**
1. A `Workflow` with one agent per model finds real listings across mileage buckets (0–30k / 30–60k /
   60–90k / 90k+, plus NEW) — see prior `resource-fleet-carvana` runs for the prompt shape. Each agent
   returns structured rows (listing price/mileage/trim/source/url + generation-correct specs + trim tier).
2. `node scripts/build-cars.mjs <workflow-output.json>` turns that JSON into `src/data/cars.ts`:
   generates stable ids, prepends the Niro anchor, sets `phevElectricFraction: 0.4` on every PHEV row,
   and **normalizes specs by powertrain** (MPGe=MPG for gas/hybrid; nulls the EV-only fields; PHEV MPGe
   passes through unchanged). It logs any row missing a URL or spec.
3. Sanity-check before deploy: re-run the audit (group by model, list buckets + prices + sources) and
   fix outliers — e.g. a "RAV4 Hybrid" priced like a Prime, or used-over-new inversions.

## Conventions

- **Trim tiers:** 1 Base · 2 Mid · 3 Upper · 4 Top — an *approximate* equipment ladder so trims compare
  across makes (`trimTiers.ts`). Raw trim is always preserved; "Normalize trims" shows `Tier · trim`.
- **Powertrains:** `ev | phev | hybrid | gas`. **Body classes:** the `BodyClass` union in `types.ts`.
- **The Niro EV is the anchor** (owner's $26k OTD). Keep it; keep the round-trip test passing.
- It's a **light-theme** app (hand-rolled CSS vars in `styles.css`); no dark mode. Mobile uses
  `pointer*` events + `touch-action: pan-y` (tap a point for its tooltip).
- When verifying in the browser preview, the first `eval`/`screenshot` after `preview_start` often races
  the initial React mount (returns empty/"Awaiting server") — wait for the dev server, reload, retry.

## Directions for richer visualizations

The scatter + ranked-heatmap cover "where does each car sit" and "what's the best given my weights." The
`scoring.ts` normalization and the axis/criteria registries are the reusable substrate for more. Good
next steps, roughly in order of value:

1. **Pareto frontier overlay (on the existing scatter).** Highlight the non-dominated set — cars nothing
   else beats on *both* chosen axes (or on a chosen criteria subset). Draw the frontier line; fade
   dominated points. It's the objective shortlist (no weights needed). Implement as a derived set in
   `App.tsx` from `visible` + the two axis accessors, drawn in `ScatterChart`.
2. **Parallel coordinates view.** Each car = a polyline across vertical axes (price, miles, MPGe, cargo,
   legroom, age), every axis oriented good-up (reuse `betterDirection`). A strong all-rounder rides high
   across all axes. Add brushing per axis to filter. New component fed by `visible` + a chosen axis list.
3. **Radar / small-multiples** for a shortlist (the top-N by score): one normalized polygon per car
   (reuse `rankCars` goodness values directly). Best for eyeballing 5–8 finalists.
4. **True cost of ownership axis.** Extend `model.ts` with `tco = otd + N×annualEnergyCost (+ est.
   depreciation + maintenance/insurance)`; expose `N` (years) as an assumption; add it as one
   `AXIS_OPTIONS` + `CRITERIA` entry. Folds price + efficiency + your miles into one honest dollar number.
5. **Linked brushing** between the scatter, the ranked table, and the models panel (hover/select in one
   highlights the same car everywhere) — lift a `highlightedId` into `App.tsx`.
6. **Value-colored scatter** — color points by their composite score (green→red) regardless of position,
   so the best pop out on any axis pair. `goodnessColor(score/100)` already exists.
7. **Dealer/listing map** — plot CPO listing locations (we have dealer city/state in `sourceName`) on a
   small CT/Northeast map; useful since proximity matters for the owner.

When adding a view: feed it `derived`/`visible` from `App.tsx`, lean on the existing registries and
`scoring.ts`, add any new state to `urlState.ts` so it stays shareable, and keep the light-theme
card-section styling. Verify in the preview (mobile + desktop) and keep `npm run build` + `npm test`
green before deploying.
