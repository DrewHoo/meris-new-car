import { colorDomain } from './colors'
import type { ColorKey } from './axes'
import type { DerivedCar } from './types'

interface Props {
  colorKey: ColorKey
  colorLabel: string
  cars: DerivedCar[]
}

export default function Legend({ colorKey, colorLabel, cars }: Props) {
  const entries = colorDomain(colorKey, cars)
  return (
    <section className="legend">
      <span className="legend-label">{colorLabel}:</span>
      {entries.map((e) => (
        <span className="legend-item" key={e.value}>
          <span className="legend-swatch" style={{ background: e.color }} />
          {e.label}
        </span>
      ))}
    </section>
  )
}
