"use client"

import type { TradeSignal } from "@/types"
import { Panel } from "@/components/ui/Panel"
import { Badge } from "@/components/ui/Badge"
import { INSTRUMENTS } from "@/lib/instruments"
import { formatPrice, cn } from "@/lib/utils"
import { ArrowUpRight, ArrowDownRight, MinusCircle } from "lucide-react"

export function SignalCard({ signal }: { signal: TradeSignal }) {
  const cfg = INSTRUMENTS[signal.symbol]
  const isTrade = signal.type !== "NO_TRADE"
  const isBuy = signal.type === "BUY"

  return (
    <Panel
      title="Signal Engine"
      action={
        <Badge variant={isBuy ? "bull" : signal.type === "SELL" ? "bear" : "neutral"}>
          {signal.type === "NO_TRADE" ? "NO TRADE" : signal.type}
        </Badge>
      }
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-full",
            isBuy && "bg-bull/15 text-bull",
            signal.type === "SELL" && "bg-bear/15 text-bear",
            signal.type === "NO_TRADE" && "bg-muted text-muted-foreground",
          )}
        >
          {isBuy ? (
            <ArrowUpRight size={28} />
          ) : signal.type === "SELL" ? (
            <ArrowDownRight size={28} />
          ) : (
            <MinusCircle size={28} />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Confidence</span>
            <span className="tnum text-2xl font-bold text-foreground">{signal.score}%</span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                isBuy && "bg-bull",
                signal.type === "SELL" && "bg-bear",
                signal.type === "NO_TRADE" && "bg-muted-foreground",
              )}
              style={{ width: `${signal.score}%` }}
            />
          </div>
        </div>
      </div>

      {isTrade && (
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Level label="Entry" value={formatPrice(signal.entry, cfg.digits)} />
          <Level
            label="Stop Loss"
            value={formatPrice(signal.stopLoss, cfg.digits)}
            tone="bear"
          />
          <Level
            label="Take Profit"
            value={formatPrice(signal.takeProfit, cfg.digits)}
            tone="bull"
          />
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <span>
          Bias: <span className="font-medium capitalize text-foreground">{signal.bias}</span>
        </span>
        {isTrade && (
          <span>
            R:R <span className="font-medium text-foreground">1:{signal.riskReward}</span>
          </span>
        )}
      </div>
    </Panel>
  )
}

function Level({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: "bull" | "bear"
}) {
  return (
    <div className="rounded-md border border-border bg-secondary/50 px-2 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div
        className={cn(
          "tnum text-sm font-semibold",
          tone === "bull" && "text-bull",
          tone === "bear" && "text-bear",
          !tone && "text-foreground",
        )}
      >
        {value}
      </div>
    </div>
  )
}
