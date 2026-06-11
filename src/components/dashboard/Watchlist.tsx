"use client"

import { useMarketStore } from "@/store/marketStore"
import { INSTRUMENTS, SYMBOLS } from "@/lib/instruments"
import { formatPrice, formatPercent, cn } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

export function Watchlist() {
  const analyses = useMarketStore((s) => s.analyses)
  const activeSymbol = useMarketStore((s) => s.activeSymbol)
  const setActiveSymbol = useMarketStore((s) => s.setActiveSymbol)

  return (
    <div className="flex flex-col gap-2">
      {SYMBOLS.map((symbol) => {
        const cfg = INSTRUMENTS[symbol]
        const a = analyses[symbol]
        const quote = a?.quote
        const signal = a?.signal
        const up = (quote?.change ?? 0) >= 0
        const active = symbol === activeSymbol
        return (
          <button
            key={symbol}
            onClick={() => setActiveSymbol(symbol)}
            className={cn(
              "flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors",
              active
                ? "border-primary/50 bg-primary/5"
                : "border-border bg-card hover:bg-secondary",
            )}
          >
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">{cfg.name}</span>
              <span className="text-xs text-muted-foreground">{symbol}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="tnum text-sm font-medium text-foreground">
                {quote ? formatPrice(quote.price, cfg.digits) : "—"}
              </span>
              {quote ? (
                <span
                  className={cn(
                    "flex items-center gap-1 tnum text-xs",
                    up ? "text-bull" : "text-bear",
                  )}
                >
                  {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {formatPercent(quote.changePercent)}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">loading</span>
              )}
            </div>
            {signal && (
              <span
                className={cn(
                  "ml-3 rounded px-1.5 py-0.5 text-[10px] font-bold",
                  signal.type === "BUY" && "bg-bull/20 text-bull",
                  signal.type === "SELL" && "bg-bear/20 text-bear",
                  signal.type === "NO_TRADE" && "bg-muted text-muted-foreground",
                )}
              >
                {signal.type === "NO_TRADE" ? "FLAT" : signal.type}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
