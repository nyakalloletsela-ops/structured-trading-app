"use client"

import type { TradeSignal, Timeframe, StructureAnalysis } from "@/types"
import { Panel } from "@/components/ui/Panel"
import { Badge } from "@/components/ui/Badge"
import { cn } from "@/lib/utils"

const TF_LABELS: Record<Timeframe, string> = {
  W: "Weekly",
  D: "Daily",
  H4: "H4",
}

function trendVariant(trend: StructureAnalysis["trend"]) {
  if (trend === "bullish") return "bull" as const
  if (trend === "bearish") return "bear" as const
  return "neutral" as const
}

export function StructurePanel({ signal }: { signal: TradeSignal }) {
  const timeframes: Timeframe[] = ["W", "D", "H4"]

  return (
    <Panel title="Market Structure (Multi-Timeframe)">
      <div className="flex flex-col gap-3">
        {timeframes.map((tf) => {
          // 🛠️ FIX: Use optional chaining to safely access timeframeAnalysis
          const a = signal.timeframeAnalysis?.[tf]
          
          if (!a) return null
          
          return (
            <div
              key={tf}
              className="rounded-md border border-border bg-secondary/40 p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">{TF_LABELS[tf]}</span>
                <Badge variant={trendVariant(a.trend)}>
                  <span className="capitalize">{a.trend}</span>
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center sm:grid-cols-5">
                <Stat label="BOS" value={a.bos.length} />
                <Stat label="CHoCH" value={a.choch.length} />
                <Stat label="OB" value={a.orderBlocks.filter((o) => !o.mitigated).length} />
                <Stat label="FVG" value={a.fvgs.filter((f) => !f.filled).length} />
                <Stat label="Sweeps" value={a.liquiditySweeps.length} />
              </div>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col">
      <span className={cn("tnum text-lg font-bold", value > 0 ? "text-foreground" : "text-muted-foreground")}>
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
    </div>
  )
}
