import type { Assumptions } from './types'
import { DEFAULT_ASSUMPTIONS } from './lib/model'

interface Props {
  assumptions: Assumptions
  onChange: (next: Assumptions) => void
}

interface FieldProps {
  label: string
  value: number
  step: number
  min: number
  max: number
  prefix?: string
  suffix?: string
  onChange: (v: number) => void
}

function NumberField({ label, value, step, min, max, prefix, suffix, onChange }: FieldProps) {
  return (
    <label className="assume-field">
      <span className="assume-label">{label}</span>
      <span className="assume-input">
        {prefix && <span className="assume-affix">{prefix}</span>}
        <input
          type="number"
          inputMode="decimal"
          value={value}
          step={step}
          min={min}
          max={max}
          onChange={(e) => {
            const v = Number(e.target.value)
            if (Number.isFinite(v)) onChange(Math.min(max, Math.max(min, v)))
          }}
        />
        {suffix && <span className="assume-affix">{suffix}</span>}
      </span>
    </label>
  )
}

export default function AssumptionsPanel({ assumptions: a, onChange }: Props) {
  const set = (patch: Partial<Assumptions>) => onChange({ ...a, ...patch })
  const isDefault = (Object.keys(a) as (keyof Assumptions)[]).every(
    (k) => a[k] === DEFAULT_ASSUMPTIONS[k],
  )

  return (
    <section className="assumptions">
      <div className="assumptions-head">
        <h3>Cost assumptions <span className="muted">(Connecticut defaults)</span></h3>
        {!isDefault && (
          <button className="link-button" onClick={() => onChange({ ...DEFAULT_ASSUMPTIONS })}>
            Reset to CT defaults
          </button>
        )}
      </div>
      <div className="assume-grid">
        <NumberField
          label="Sales tax" value={+(a.salesTaxPct * 100).toFixed(3)} step={0.05} min={0} max={20}
          suffix="%" onChange={(v) => set({ salesTaxPct: v / 100 })}
        />
        <NumberField
          label="Doc / conveyance fee" value={a.docFee} step={25} min={0} max={2000}
          prefix="$" onChange={(v) => set({ docFee: v })}
        />
        <NumberField
          label="Registration & fees" value={a.regFees} step={10} min={0} max={2000}
          prefix="$" onChange={(v) => set({ regFees: v })}
        />
        <NumberField
          label="Annual miles" value={a.annualMiles} step={1000} min={1000} max={60000}
          onChange={(v) => set({ annualMiles: v })}
        />
        <NumberField
          label="Gas price" value={a.gasPricePerGal} step={0.1} min={1} max={10}
          prefix="$" suffix="/gal" onChange={(v) => set({ gasPricePerGal: v })}
        />
        <NumberField
          label="Electricity" value={a.elecPricePerKwh} step={0.01} min={0.05} max={1}
          prefix="$" suffix="/kWh" onChange={(v) => set({ elecPricePerKwh: v })}
        />
      </div>
      <p className="assume-note">
        Out-the-door = selling price + doc fee + CT sales tax (on price + doc) + registration.
        Annual energy cost uses these gas/electric prices and your annual miles. CT electricity is
        among the priciest in the US — nudge it and watch the EVs’ running-cost advantage shrink.
      </p>
    </section>
  )
}
