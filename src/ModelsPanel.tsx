import { useMemo } from 'react'
import { format } from 'd3-format'
import type { DerivedCar, Powertrain } from './types'
import type { ColorFn } from './colors'
import { POWERTRAIN_LABELS } from './colors'
import { tierLabel } from './lib/trimTiers'
import type { ConditionFilter } from './urlState'
import type { TrimTier } from './types'

const money = format('$,.0f')
const num = format(',.0f')
const ALL_POWERTRAINS: Powertrain[] = ['ev', 'phev', 'hybrid', 'gas']
const ALL_TIERS: TrimTier[] = [1, 2, 3, 4]

interface Props {
  allCars: DerivedCar[]
  filteredIds: Set<string> // passes the coarse make/pt/cond/tier filters
  excluded: Set<string>
  makes: Set<string> | null
  powertrains: Set<Powertrain> | null
  condition: ConditionFilter
  tiers: Set<number> | null
  colorFn: ColorFn
  normalizeTrims: boolean
  visibleCount: number
  onMakes: (next: Set<string> | null) => void
  onPowertrains: (next: Set<Powertrain> | null) => void
  onCondition: (next: ConditionFilter) => void
  onTiers: (next: Set<number> | null) => void
  onToggleExcluded: (id: string) => void
  onResetFilters: () => void
}

function toggleAllSet<T>(current: Set<T> | null, value: T, all: T[]): Set<T> | null {
  const set = current ? new Set(current) : new Set(all)
  if (set.has(value)) set.delete(value)
  else set.add(value)
  if (set.size === all.length) return null // everything selected = "all"
  return set
}

export default function ModelsPanel({
  allCars, filteredIds, excluded, makes, powertrains, condition, tiers,
  colorFn, normalizeTrims, visibleCount,
  onMakes, onPowertrains, onCondition, onTiers, onToggleExcluded, onResetFilters,
}: Props) {
  const allMakes = useMemo(
    () => [...new Set(allCars.map((c) => c.make))].sort(),
    [allCars],
  )
  const presentTiers = useMemo(
    () => ALL_TIERS.filter((t) => allCars.some((c) => c.trimTier === t)),
    [allCars],
  )
  const rows = useMemo(
    () =>
      [...allCars].sort(
        (a, b) =>
          a.make.localeCompare(b.make) ||
          a.model.localeCompare(b.model) ||
          b.year - a.year,
      ),
    [allCars],
  )

  const makeOn = (m: string) => makes === null || makes.has(m)
  const ptOn = (p: Powertrain) => powertrains === null || powertrains.has(p)
  const tierOn = (t: TrimTier) => tiers === null || tiers.has(t)

  return (
    <section className="models-panel">
      <div className="models-head">
        <h3>
          Models in the chart{' '}
          <span className="muted">— {visibleCount} of {allCars.length} shown</span>
        </h3>
        <button className="link-button" onClick={onResetFilters}>Reset filters</button>
      </div>

      <div className="filter-rows">
        <div className="filter-row">
          <span className="filter-label">Make</span>
          {allMakes.map((m) => (
            <label key={m} className={`chip ${makeOn(m) ? 'chip--on' : ''}`}>
              <input type="checkbox" checked={makeOn(m)} onChange={() => onMakes(toggleAllSet(makes, m, allMakes))} />
              {m}
            </label>
          ))}
        </div>

        <div className="filter-row">
          <span className="filter-label">Powertrain</span>
          {ALL_POWERTRAINS.map((p) => (
            <label key={p} className={`chip ${ptOn(p) ? 'chip--on' : ''}`}>
              <input type="checkbox" checked={ptOn(p)} onChange={() => onPowertrains(toggleAllSet(powertrains, p, ALL_POWERTRAINS))} />
              {POWERTRAIN_LABELS[p]}
            </label>
          ))}
        </div>

        <div className="filter-row">
          <span className="filter-label">Tier</span>
          {presentTiers.map((t) => (
            <label key={t} className={`chip ${tierOn(t) ? 'chip--on' : ''}`}>
              <input type="checkbox" checked={tierOn(t)} onChange={() => onTiers(toggleAllSet(tiers, t, presentTiers))} />
              {tierLabel(t)}
            </label>
          ))}
        </div>

        <div className="filter-row">
          <span className="filter-label">Condition</span>
          <div className="segmented">
            {(['all', 'new', 'used'] as ConditionFilter[]).map((c) => (
              <button
                key={c}
                className={condition === c ? 'seg seg--on' : 'seg'}
                onClick={() => onCondition(c)}
              >
                {c === 'all' ? 'All' : c === 'new' ? 'New' : 'Used'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="models-list-wrap">
        <ul className="models-list">
          {rows.map((c) => {
            const inFilter = filteredIds.has(c.id)
            const included = inFilter && !excluded.has(c.id)
            const trimText = c.trim
              ? normalizeTrims ? `${tierLabel(c.trimTier)} · ${c.trim}` : c.trim
              : tierLabel(c.trimTier)
            return (
              <li key={c.id} className={`model-row ${inFilter ? '' : 'model-row--filtered'}`}>
                <label className="model-check">
                  <input
                    type="checkbox"
                    checked={included}
                    disabled={!inFilter}
                    onChange={() => onToggleExcluded(c.id)}
                  />
                  <span className="model-swatch" style={{ background: colorFn(c) }} />
                  <span className="model-name">
                    {c.year} {c.make} {c.model}
                    <span className="model-trim">{trimText}</span>
                  </span>
                </label>
                <span className="model-meta">
                  <span className={`badge badge--${c.condition}`}>{c.condition}</span>
                  <span className="model-miles">{c.mileage === 0 ? 'new' : `${num(c.mileage)} mi`}</span>
                  <span className="model-otd">{money(c.otd)}</span>
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
