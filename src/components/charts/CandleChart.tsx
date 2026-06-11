"use client"

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceArea,
  ReferenceLine,
} from "recharts"
import type { Candle, StructureAnalysis, Timeframe } from "@/types"
import { activeOrderBlocks } from "@/strategy/orderBlocks"
import { activeFVGs } from "@/strategy/fvg"
import { format } from "date-fns"

interface Props {
  candles: Candle[]
  analysis?: StructureAnalysis
  timeframe: Timeframe
}

interface Row {
  time: number
  label: string
  open: number
  high: number
  low: number
  close: number
  // For floating bar [base, top]
  body: [number, number]
  wick: [number, number]
  bullish: boolean
}

export function CandleChart({ candles, analysis, timeframe }: Props) {
  const view = candles.slice(-80)
  const data: Row[] = view.map((c) => ({
    time: c.time,
    label: format(new Date(c.time), timeframe === "H4" ? "MMM d HH:mm" : "MMM d"),
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
    body: [Math.min(c.open, c.close), Math.max(c.open, c.close)],
    wick: [c.low, c.high],
    bullish: c.close >= c.open,
  }))

  const prices = view.flatMap((c) => [c.high, c.low])
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const pad = (max - min) * 0.08
  const domain: [number, number] = [min - pad, max + pad]

  const obs = analysis ? activeOrderBlocks(analysis.orderBlocks).slice(0, 3) : []
  const fvgs = analysis ? activeFVGs(analysis.fvgs).slice(0, 3) : []
  const startTime = view[0]?.time ?? 0

  return (
    <div className="h-[340px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            minTickGap={40}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={false}
          />
          <YAxis
            orientation="right"
            domain={domain}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            width={56}
            tickFormatter={(v: number) => v.toFixed(0)}
          />
          <Tooltip content={<CandleTooltip />} cursor={{ stroke: "hsl(var(--border))" }} />

          {/* Order block zones */}
          {obs.map((ob, i) => (
            <ReferenceArea
              key={`ob-${i}`}
              y1={ob.bottom}
              y2={ob.top}
              fill={ob.direction === "bullish" ? "hsl(var(--bull))" : "hsl(var(--bear))"}
              fillOpacity={0.08}
              stroke={ob.direction === "bullish" ? "hsl(var(--bull))" : "hsl(var(--bear))"}
              strokeOpacity={0.25}
            />
          ))}

          {/* FVG zones */}
          {fvgs.map((g, i) => (
            <ReferenceArea
              key={`fvg-${i}`}
              y1={g.bottom}
              y2={g.top}
              fill="hsl(var(--accent))"
              fillOpacity={0.06}
              strokeOpacity={0}
            />
          ))}

          {/* Last close reference */}
          {data.length > 0 && (
            <ReferenceLine
              y={data[data.length - 1].close}
              stroke="hsl(var(--primary))"
              strokeDasharray="3 3"
              strokeOpacity={0.6}
            />
          )}

          {/* Wicks (thin) */}
          <Bar dataKey="wick" barSize={1} isAnimationActive={false}>
            {data.map((d, i) => (
              <Cell
                key={`w-${i}`}
                fill={d.bullish ? "hsl(var(--bull))" : "hsl(var(--bear))"}
              />
            ))}
          </Bar>

          {/* Bodies */}
          <Bar dataKey="body" barSize={6} isAnimationActive={false} radius={1}>
            {data.map((d, i) => (
              <Cell
                key={`b-${i}`}
                fill={d.bullish ? "hsl(var(--bull))" : "hsl(var(--bear))"}
              />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

function CandleTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as Row
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs tnum shadow-lg">
      <div className="mb-1 font-medium text-popover-foreground">{d.label}</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-muted-foreground">
        <span>O</span><span className="text-right text-foreground">{d.open.toFixed(2)}</span>
        <span>H</span><span className="text-right text-foreground">{d.high.toFixed(2)}</span>
        <span>L</span><span className="text-right text-foreground">{d.low.toFixed(2)}</span>
        <span>C</span>
        <span className={`text-right ${d.bullish ? "text-bull" : "text-bear"}`}>
          {d.close.toFixed(2)}
        </span>
      </div>
    </div>
  )
}
