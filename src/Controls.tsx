import { useState } from 'react'
import { AXIS_OPTIONS, COLOR_OPTIONS } from './axes'
import type { ColorKey } from './axes'
import { track } from './analytics'

interface Props {
  xKey: string
  yKey: string
  colorKey: ColorKey
  normalizeTrims: boolean
  onXChange: (key: string) => void
  onYChange: (key: string) => void
  onColorChange: (key: ColorKey) => void
  onToggleNormalize: (on: boolean) => void
}

export default function Controls({
  xKey, yKey, colorKey, normalizeTrims,
  onXChange, onYChange, onColorChange, onToggleNormalize,
}: Props) {
  return (
    <section className="controls">
      <label className="control">
        <span>X axis</span>
        <select value={xKey} onChange={(e) => onXChange(e.target.value)}>
          {AXIS_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>{o.label}</option>
          ))}
        </select>
      </label>

      <label className="control">
        <span>Y axis</span>
        <select value={yKey} onChange={(e) => onYChange(e.target.value)}>
          {AXIS_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>{o.label}</option>
          ))}
        </select>
      </label>

      <label className="control">
        <span>Color by</span>
        <select value={colorKey} onChange={(e) => onColorChange(e.target.value as ColorKey)}>
          {COLOR_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>{o.label}</option>
          ))}
        </select>
      </label>

      <label className="control control--check" title="Show a normalized Base/Mid/Upper/Top tier next to each car's real trim">
        <input
          type="checkbox"
          checked={normalizeTrims}
          onChange={(e) => onToggleNormalize(e.target.checked)}
        />
        <span>Normalize trims</span>
      </label>

      <ShareButton />
    </section>
  )
}

function ShareButton() {
  const [copied, setCopied] = useState(false)
  function share() {
    const url = window.location.href
    track('Share clicked', { url })
    const done = () => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    }
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(done, done)
    } else {
      const ta = document.createElement('textarea')
      ta.value = url
      document.body.appendChild(ta)
      ta.select()
      try { document.execCommand('copy') } catch { /* noop */ }
      document.body.removeChild(ta)
      done()
    }
  }
  return (
    <button
      className={copied ? 'share-button share-button--copied' : 'share-button'}
      onClick={share}
      title="Copy a shareable link to this exact view (axes, filters, and assumptions)"
    >
      {copied ? '✓ Link copied' : 'Share this view'}
    </button>
  )
}
