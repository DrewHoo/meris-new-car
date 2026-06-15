import { format } from 'd3-format'
import type { DerivedCar } from './types'
import type { AxisOption } from './axes'
import { tierLabel } from './lib/trimTiers'
import { POWERTRAIN_LABELS } from './colors'

const money = format('$,.0f')
const num = format(',.0f')
const pct = format('.2%')

interface Props {
  car: DerivedCar
  xAxis: AxisOption
  yAxis: AxisOption
  normalizeTrims: boolean
  left: number
  top: number
}

export default function Tooltip({ car, xAxis, yAxis, normalizeTrims, left, top }: Props) {
  const b = car.otdBreakdown
  const trimDisplay = car.trim
    ? normalizeTrims
      ? `${tierLabel(car.trimTier)} · ${car.trim}`
      : car.trim
    : tierLabel(car.trimTier)
  const fmt = (axis: AxisOption) => {
    const v = axis.accessor(car)
    return v == null ? '—' : axis.format(v)
  }

  return (
    <div className="tooltip" style={{ left, top }}>
      <div className="tt-title">
        {car.year} {car.make} {car.model}
      </div>
      <div className="tt-sub">
        <span className={`badge badge--${car.condition}`}>{car.condition}</span>
        <span className="tt-trim">{trimDisplay}</span>
        <span className="tt-dot">·</span>
        <span>{car.mileage === 0 ? 'new' : `${num(car.mileage)} mi`}</span>
        <span className="tt-dot">·</span>
        <span>{POWERTRAIN_LABELS[car.powertrain]}</span>
      </div>

      <div className="tt-plotted">
        <span>{xAxis.short}: <strong>{fmt(xAxis)}</strong></span>
        <span>{yAxis.short}: <strong>{fmt(yAxis)}</strong></span>
      </div>

      <table className="otd-breakdown">
        <tbody>
          <tr><td>Selling price</td><td>{money(b.sellingPrice)}</td></tr>
          <tr><td>+ Doc fee</td><td>{money(b.docFee)}</td></tr>
          <tr><td>+ CT sales tax ({pct(b.taxRate)})</td><td>{money(b.salesTax)}</td></tr>
          <tr><td>+ Reg &amp; fees</td><td>{money(b.regFees)}</td></tr>
          <tr className="otd-total"><td>Out-the-door</td><td>{money(car.otd)}</td></tr>
        </tbody>
      </table>

      <div className="tt-stats">
        <span>{car.combinedMpge != null ? `${num(car.combinedMpge)} MPGe` : '—'}</span>
        {(car.powertrain === 'ev' || car.powertrain === 'phev') && car.electricRange
          ? <span>· {num(car.electricRange)} mi electric</span>
          : null}
        <span>· {num(car.cargoCuFt)} cu ft cargo</span>
        <span>· ~{money(car.annualEnergyCost)}/yr to fuel</span>
      </div>

      <div className="tt-source">{car.sourceNote}</div>
    </div>
  )
}
