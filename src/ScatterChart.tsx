import React, { useEffect, useMemo, useRef, useState } from 'react'
import { scaleLinear } from 'd3-scale'
import { extent } from 'd3-array'
import type { DerivedCar } from './types'
import type { AxisOption } from './axes'
import type { ColorFn } from './colors'
import Tooltip from './Tooltip'

const MARGIN = { top: 22, right: 26, bottom: 56, left: 78 }
const HIT_RADIUS = 26 // px; a tap/hover within this distance selects a point

interface Props {
  cars: DerivedCar[]
  xAxis: AxisOption
  yAxis: AxisOption
  colorFn: ColorFn
  normalizeTrims: boolean
}

interface PlotPoint {
  car: DerivedCar
  px: number
  py: number
  color: string
}

function niceDomain(values: (number | undefined)[]): [number, number] {
  const [lo, hi] = extent(values.filter((v): v is number => v != null))
  if (lo == null || hi == null) return [0, 1]
  if (lo === hi) return [lo - 1, hi + 1]
  return [lo, hi]
}

export default function ScatterChart({ cars, xAxis, yAxis, colorFn, normalizeTrims }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(900)
  const height = width < 600 ? 380 : 480

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width
      if (w > 0) setWidth(w)
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // Only points with finite values on BOTH axes can be plotted (e.g. a gas
  // car has null electricRange and is dropped when that axis is selected).
  const valid = useMemo(
    () =>
      cars.filter((c) => {
        const x = xAxis.accessor(c)
        const y = yAxis.accessor(c)
        return x != null && Number.isFinite(x) && y != null && Number.isFinite(y)
      }),
    [cars, xAxis, yAxis],
  )

  const xScale = useMemo(() => {
    const domain = niceDomain(valid.map((c) => xAxis.accessor(c) ?? undefined))
    return scaleLinear().domain(domain).nice().range([MARGIN.left, width - MARGIN.right])
  }, [valid, xAxis, width])

  const yScale = useMemo(() => {
    const domain = niceDomain(valid.map((c) => yAxis.accessor(c) ?? undefined))
    return scaleLinear().domain(domain).nice().range([height - MARGIN.bottom, MARGIN.top])
  }, [valid, yAxis, height])

  const points: PlotPoint[] = useMemo(
    () =>
      valid.map((c) => ({
        car: c,
        px: xScale(xAxis.accessor(c) as number),
        py: yScale(yAxis.accessor(c) as number),
        color: colorFn(c),
      })),
    [valid, xScale, yScale, xAxis, yAxis, colorFn],
  )

  const xTicks = useMemo(
    () => xScale.ticks(width < 600 ? 5 : 7).map((v) => ({ v, label: xAxis.format(v) })),
    [xScale, width, xAxis],
  )
  const yTicks = useMemo(
    () => yScale.ticks(width < 600 ? 5 : 7).map((v) => ({ v, label: yAxis.format(v) })),
    [yScale, width, yAxis],
  )

  const [hoverId, setHoverId] = useState<string | null>(null)
  const hovered = useMemo(
    () => points.find((p) => p.car.id === hoverId) ?? null,
    [points, hoverId],
  )

  function svgPoint(e: React.PointerEvent<SVGSVGElement>) {
    const r = e.currentTarget.getBoundingClientRect()
    return {
      px: ((e.clientX - r.left) / r.width) * width,
      py: ((e.clientY - r.top) / r.height) * height,
    }
  }

  function nearestId(px: number, py: number): string | null {
    let best: string | null = null
    let bestD = HIT_RADIUS * HIT_RADIUS
    for (const p of points) {
      const dx = p.px - px
      const dy = p.py - py
      const d = dx * dx + dy * dy
      if (d <= bestD) {
        bestD = d
        best = p.car.id
      }
    }
    return best
  }

  // Pointer events unify mouse + touch. Mouse hovers on move; touch taps to
  // select (and taps on empty space clear). touchAction:'pan-y' lets the
  // page scroll vertically through the chart.
  function isTouch(e: React.PointerEvent) {
    return e.pointerType === 'touch' || e.pointerType === 'pen'
  }
  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (isTouch(e)) return
    const { px, py } = svgPoint(e)
    setHoverId(nearestId(px, py))
  }
  function onPointerDown(e: React.PointerEvent<SVGSVGElement>) {
    if (!isTouch(e)) return
    const { px, py } = svgPoint(e)
    setHoverId(nearestId(px, py))
  }
  function onPointerLeave(e: React.PointerEvent<SVGSVGElement>) {
    if (!isTouch(e)) setHoverId(null)
  }

  const plotW = width - MARGIN.left - MARGIN.right
  const plotH = height - MARGIN.top - MARGIN.bottom

  return (
    <div className="chart" ref={containerRef}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        style={{ touchAction: 'pan-y' }}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerLeave={onPointerLeave}
      >
        {/* Gridlines + y labels */}
        {yTicks.map((t) => (
          <g key={`y-${t.v}`}>
            <line
              x1={MARGIN.left}
              x2={width - MARGIN.right}
              y1={yScale(t.v)}
              y2={yScale(t.v)}
              stroke="#eee"
            />
            <text x={MARGIN.left - 8} y={yScale(t.v) + 4} textAnchor="end" fontSize={11} fill="#888">
              {t.label}
            </text>
          </g>
        ))}
        {/* x ticks + labels */}
        {xTicks.map((t) => (
          <g key={`x-${t.v}`} transform={`translate(${xScale(t.v)}, 0)`}>
            <line y1={height - MARGIN.bottom} y2={height - MARGIN.bottom + 4} stroke="#bbb" />
            <text
              y={height - MARGIN.bottom + 18}
              textAnchor="middle"
              fontSize={11}
              fill="#888"
            >
              {t.label}
            </text>
          </g>
        ))}
        {/* baseline */}
        <line
          x1={MARGIN.left}
          x2={width - MARGIN.right}
          y1={height - MARGIN.bottom}
          y2={height - MARGIN.bottom}
          stroke="#ccc"
        />

        {/* axis titles */}
        <text
          x={MARGIN.left + plotW / 2}
          y={height - 14}
          textAnchor="middle"
          fontSize={12}
          fontWeight={600}
          fill="#444"
        >
          {xAxis.label}
        </text>
        <text
          transform={`translate(18, ${MARGIN.top + plotH / 2}) rotate(-90)`}
          textAnchor="middle"
          fontSize={12}
          fontWeight={600}
          fill="#444"
        >
          {yAxis.label}
        </text>

        {/* points (hovered drawn last so it sits on top) */}
        {points
          .filter((p) => p.car.id !== hoverId)
          .map((p) => (
            <circle
              key={p.car.id}
              cx={p.px}
              cy={p.py}
              r={6}
              fill={p.color}
              stroke="#fff"
              strokeWidth={1.5}
              opacity={0.88}
            />
          ))}
        {hovered && (
          <>
            <circle
              cx={hovered.px}
              cy={hovered.py}
              r={9}
              fill={hovered.color}
              stroke="#fff"
              strokeWidth={2}
            />
            <text
              x={hovered.px}
              y={hovered.py - 14}
              textAnchor="middle"
              fontSize={12}
              fontWeight={700}
              fill="#1a1a1a"
            >
              {hovered.car.year} {hovered.car.model}
            </text>
          </>
        )}
      </svg>

      {valid.length === 0 && (
        <div className="chart-empty">No cars match the current filters.</div>
      )}

      {hovered && (
        <Tooltip
          car={hovered.car}
          xAxis={xAxis}
          yAxis={yAxis}
          normalizeTrims={normalizeTrims}
          left={Math.min(Math.max(hovered.px + 16, 8), width - 248)}
          top={Math.min(Math.max(hovered.py - 12, 8), Math.max(8, height - 232))}
        />
      )}
    </div>
  )
}
