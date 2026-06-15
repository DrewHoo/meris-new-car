import { useEffect, useMemo, useState } from 'react'
import { cars, asOf } from './data/cars'
import { withComputed } from './lib/model'
import { AXIS_BY_KEY, COLOR_OPTIONS, DEFAULT_X, DEFAULT_Y } from './axes'
import type { ColorKey } from './axes'
import { buildColorScale } from './colors'
import { readInitialState, buildSearch } from './urlState'
import type { ConditionFilter } from './urlState'
import type { Assumptions, Powertrain } from './types'
import { track } from './analytics'
import Controls from './Controls'
import ScatterChart from './ScatterChart'
import Legend from './Legend'
import AssumptionsPanel from './AssumptionsPanel'
import ModelsPanel from './ModelsPanel'
import RankedTable from './RankedTable'
import type { Weights } from './scoring'
import { TIER_EXPLAINER } from './lib/trimTiers'

export default function App() {
  const initial = useMemo(() => readInitialState(cars), [])

  const [xKey, setXKey] = useState(initial.xKey)
  const [yKey, setYKey] = useState(initial.yKey)
  const [colorKey, setColorKey] = useState<ColorKey>(initial.colorKey)
  const [makes, setMakes] = useState<Set<string> | null>(initial.makes)
  const [powertrains, setPowertrains] = useState<Set<Powertrain> | null>(initial.powertrains)
  const [condition, setCondition] = useState<ConditionFilter>(initial.condition)
  const [tiers, setTiers] = useState<Set<number> | null>(initial.tiers)
  const [excluded, setExcluded] = useState<Set<string>>(initial.excluded)
  const [normalizeTrims, setNormalizeTrims] = useState(initial.normalizeTrims)
  const [orientGood, setOrientGood] = useState(initial.orientGood)
  const [weights, setWeights] = useState<Weights>(initial.weights)
  const [assumptions, setAssumptions] = useState<Assumptions>(initial.assumptions)

  // Single reactive recompute of all rows whenever an assumption changes.
  const derived = useMemo(() => withComputed(cars, assumptions), [assumptions])

  // Color scale built over the FULL list so excluding a model never
  // reshuffles colors.
  const colorFn = useMemo(() => buildColorScale(colorKey, derived), [colorKey, derived])

  const passesFilters = useMemo(
    () => (c: (typeof derived)[number]) =>
      (makes === null || makes.has(c.make)) &&
      (powertrains === null || powertrains.has(c.powertrain)) &&
      (condition === 'all' || c.condition === condition) &&
      (tiers === null || tiers.has(c.trimTier)),
    [makes, powertrains, condition, tiers],
  )

  const filteredIds = useMemo(
    () => new Set(derived.filter(passesFilters).map((c) => c.id)),
    [derived, passesFilters],
  )
  const visible = useMemo(
    () => derived.filter((c) => filteredIds.has(c.id) && !excluded.has(c.id)),
    [derived, filteredIds, excluded],
  )

  const xAxis = AXIS_BY_KEY[xKey] ?? AXIS_BY_KEY[DEFAULT_X]
  const yAxis = AXIS_BY_KEY[yKey] ?? AXIS_BY_KEY[DEFAULT_Y]
  const colorLabel = COLOR_OPTIONS.find((o) => o.key === colorKey)?.label ?? 'Powertrain'

  // Mirror state into the URL so links are shareable. Omit defaults.
  useEffect(() => {
    const qs = buildSearch({
      xKey, yKey, colorKey, makes, powertrains, condition, tiers, excluded, normalizeTrims, orientGood, weights, assumptions,
    })
    const next = qs ? `${window.location.pathname}?${qs}` : window.location.pathname
    if (next !== window.location.pathname + window.location.search) {
      window.history.replaceState(null, '', next)
    }
  }, [xKey, yKey, colorKey, makes, powertrains, condition, tiers, excluded, normalizeTrims, orientGood, weights, assumptions])

  // Structured analytics on axis/color changes (auto-pageview already fires
  // on every replaceState via mixpanel.init).
  useEffect(() => {
    track('View changed', { x: xKey, y: yKey, color: colorKey })
  }, [xKey, yKey, colorKey])

  function toggleExcluded(id: string) {
    setExcluded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  function resetFilters() {
    setMakes(null)
    setPowertrains(null)
    setCondition('all')
    setTiers(null)
    setExcluded(new Set())
  }

  return (
    <main>
      <header>
        <h1>Which car should we buy?</h1>
        <p className="lede">
          {cars.length} new &amp; used cars on one chart — pick any two axes (price, mileage, year,
          efficiency, running cost, cargo, backseat space), color and filter them, or rank them in a
          weighted table by what matters to you. Read true{' '}
          <strong>Connecticut out-the-door</strong> prices that update live as you change the tax,
          fee, gas, and electricity assumptions. Prices are researched estimates as of {asOf}.
        </p>
      </header>

      <Controls
        xKey={xKey}
        yKey={yKey}
        colorKey={colorKey}
        normalizeTrims={normalizeTrims}
        orientGood={orientGood}
        onXChange={setXKey}
        onYChange={setYKey}
        onColorChange={setColorKey}
        onToggleNormalize={setNormalizeTrims}
        onToggleOrient={setOrientGood}
      />

      <ScatterChart
        cars={visible}
        xAxis={xAxis}
        yAxis={yAxis}
        colorFn={colorFn}
        normalizeTrims={normalizeTrims}
        orientGood={orientGood}
      />

      <Legend colorKey={colorKey} colorLabel={colorLabel} cars={derived} />

      <AssumptionsPanel assumptions={assumptions} onChange={setAssumptions} />

      <RankedTable
        cars={visible}
        weights={weights}
        onWeightsChange={setWeights}
        normalizeTrims={normalizeTrims}
      />

      <ModelsPanel
        allCars={derived}
        filteredIds={filteredIds}
        excluded={excluded}
        makes={makes}
        powertrains={powertrains}
        condition={condition}
        tiers={tiers}
        colorFn={colorFn}
        normalizeTrims={normalizeTrims}
        visibleCount={visible.length}
        onMakes={setMakes}
        onPowertrains={setPowertrains}
        onCondition={setCondition}
        onTiers={setTiers}
        onToggleExcluded={toggleExcluded}
        onResetFilters={resetFilters}
      />

      <Methodology />
    </main>
  )
}

function Methodology() {
  return (
    <section className="methodology">
      <h3>Notes &amp; method</h3>
      <ul>
        <li>
          <strong>Out-the-door (CT).</strong> Selling price + dealer doc/conveyance fee + Connecticut
          sales tax (6.35% up to $50k, applied to price + doc) + bundled registration/title/DMV fees.
          Every input is adjustable above; the defaults are CT figures. No trade-in is assumed.
        </li>
        <li>
          <strong>One efficiency axis (MPGe).</strong> A gallon of gas ≈ 33.7 kWh, so a gas or hybrid
          car’s combined MPG equals its MPGe. That lets EVs, hybrids, and gas cars share one honest
          “combined MPGe” axis. MPGe measures <em>energy</em>, not <em>cost</em> — which is why annual
          energy cost is a separate axis. At CT’s electricity price, a 57-MPG Prius can cost less per
          year to fuel than an EV.
        </li>
        <li>
          <strong>Trim tiers.</strong> An approximate equipment ladder so you don’t have to memorize
          each brand’s names. The raw trim is always kept; toggle “Normalize trims” to show the tier
          beside it.
          <div className="tier-key">
            {TIER_EXPLAINER.map((t) => (
              <div key={t.tier} className="tier-key-row">
                <span className="tier-key-label">{t.label}</span>
                <span className="tier-key-ex">{t.examples}</span>
              </div>
            ))}
          </div>
        </li>
        <li>
          <strong>Ranking and backseat space.</strong> The ranked table scores each car by
          min–max-normalizing every criterion across your current filter and taking a weighted
          average — tune the weight sliders or pick a preset. "Backseat space" is rear-seat legroom
          (inches), the spec that most decides whether a bulky rear-facing car seat fits behind the
          front passenger. "Better points up" orients both axes so the stronger choice sits toward
          the top-right.
        </li>
        <li>
          <strong>Prices.</strong> Pre-tax selling prices are researched estimates ({asOf}) from
          CT/Northeast listings (CarGurus, Edmunds, KBB, Cars.com), converted from median asking to a
          realistic selling price; EPA specs are from fueleconomy.gov. Hover any point for its
          per-car source. The Kia Niro EV is anchored to the stated $26,000 out-the-door.
        </li>
        <li>
          <strong>Subaru note.</strong> The Solterra is a battery EV (shown as “Electric”, not a
          hybrid) — filter it out by powertrain if you only want hybrids. The 2019–2023 Crosstrek
          Hybrid is a plug-in (PHEV); the 2026 Crosstrek/Forester Hybrids are conventional hybrids.
        </li>
      </ul>
    </section>
  )
}
