"use client"

import type { TradeSignal } from "@/types"
import { Panel } from "@/components/ui/Panel"
import { cn } from "@/lib/utils"

export function ConfluencePanel({ signal }: { signal: TradeSignal }) {
  return (
    <Panel title="Confluence Factors">
      <ul className="flex flex-col gap-2.5">
        {signal.factors.map((f) => {
          const pct = Math.round(Math.abs(f.score) * 100)
          const bullish = f.score > 0
          const bearish = f.score < 0
          return (
            <li key={f.name} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">{f.name}</span>
                <span
                  className={cn(
                    "tnum",
                    bullish && "text-bull",
                    bearish && "text-bear",
                    !bullish && !bearish && "text-muted-foreground",
                  )}
                >
                  {bullish ? "+" : bearish ? "-" : ""}
                  {pct > 0 ? `${pct}%` : "neutral"} · w{f.weight}
                </span>
              </div>
              {/* Centered diverging bar */}
              <div className="relative h-1.5 w-full rounded-full bg-secondary">
                <div className="absolute left-1/2 top-0 h-full w-px bg-border" />
                {f.score !== 0 && (
                  <div
                    className={cn(
                      "absolute top-0 h-full rounded-full",
                      bullish ? "bg-bull" : "bg-bear",
                    )}
                    style={{
                      width: `${pct / 2}%`,
                      left: bullish ? "50%" : undefined,
                      right: bearish ? "50%" : undefined,
                    }}
                  />
                )}
              </div>
              <span className="text-[11px] text-muted-foreground">{f.detail}</span>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}
