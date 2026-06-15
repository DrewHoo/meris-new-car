import { useMemo } from 'react'
import type { DerivedCar } from './types'
import { CRITERIA, PRESETS, rankCars, goodnessCellStyle } from './scoring'
import type { Weights } from './scoring'
import { tierLabel } from './lib/trimTiers'

const fmtMiles = (n: number): string => (n === 0 ? 'new' : `${n.toLocaleString()} mi`)

interface Props {
  cars: DerivedCar[]
  weights: Weights
  onWeightsChange: (w: Weights) => void
  normalizeTrims: boolean
}

export default function RankedTable({ cars, weights, onWeightsChange, normalizeTrims }: Props) {
  const scored = useMemo(() => rankCars(cars, weights), [cars, weights])
  const activeCriteria = CRITERIA.filter((c) => (weights[c.key] ?? 0) > 0)
  const presetMatch = PRESETS.find((p) =>
    CRITERIA.every((c) => (p.weights[c.key] ?? 0) === (weights[c.key] ?? 0)),
  )

  return (
    <section className="ranked">
      <div className="ranked-head">
        <h3>Ranked comparison <span className="muted">— best on top</span></h3>
        <span className="muted ranked-sub">colored green (good) → red (poor) within your current filter</span>
      </div>

      <div className="presets">
        <span className="presets-label">Priorities:</span>
        {PRESETS.map((p) => (
          <button
            key={p.key}
            className={presetMatch?.key === p.key ? 'preset preset--on' : 'preset'}
            onClick={() => onWeightsChange({ ...p.weights })}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="weights">
        {CRITERIA.map((c) => {
          const w = weights[c.key] ?? 0
          return (
            <label key={c.key} className={`weight ${w === 0 ? 'weight--off' : ''}`}>
              <span className="weight-label">
                {c.label}
                <span className="weight-dir">{c.direction === 'low' ? 'lower better' : 'higher better'}</span>
              </span>
              <span className="weight-control">
                <input
                  type="range" min={0} max={10} step={1} value={w}
                  onChange={(e) => onWeightsChange({ ...weights, [c.key]: Number(e.target.value) })}
                />
                <span className="weight-val">{w === 0 ? 'off' : w}</span>
              </span>
            </label>
          )
        })}
      </div>

      <div className="ranked-table-wrap">
        <table className="ranked-table">
          <thead>
            <tr>
              <th className="rank-col">#</th>
              <th className="car-col">Car</th>
              {activeCriteria.map((c) => (
                <th key={c.key} className="num" title={c.label}>{c.short}</th>
              ))}
              <th className="num score-col">Score</th>
            </tr>
          </thead>
          <tbody>
            {scored.map((s, i) => {
              const car = s.car
              const trim = car.trim
                ? normalizeTrims ? `${tierLabel(car.trimTier)} · ${car.trim}` : car.trim
                : tierLabel(car.trimTier)
              return (
                <tr key={car.id}>
                  <td className="rank-col">{i + 1}</td>
                  <td className="car-col">
                    <span className="rt-name">{car.year} {car.make} {car.model}</span>
                    <span className="rt-trim">{trim} · {fmtMiles(car.mileage)}</span>
                  </td>
                  {activeCriteria.map((c) => (
                    <td key={c.key} className="num heat" style={goodnessCellStyle(s.goodness[c.key])}>
                      {c.format(c.accessor(car))}
                    </td>
                  ))}
                  <td className="num score-col heat" style={{ ...goodnessCellStyle(s.score / 100, 0.28), fontWeight: 700 }}>
                    {Math.round(s.score)}
                  </td>
                </tr>
              )
            })}
            {scored.length === 0 && (
              <tr><td colSpan={activeCriteria.length + 3} className="muted rt-empty">No cars match the current filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
