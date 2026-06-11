"use client"

import { useState } from "react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"
import { Panel } from "@/components/ui/Panel"
import { SYMBOLS } from "@/lib/instruments"
import type { BacktestResult, Symbol } from "@/types"
import { formatNumber } from "@/lib/utils"

export function BacktestPanel() {
  const [symbol, setSymbol] = useState<Symbol>("XAUUSD")
  const [rr, setRr] = useState(2)
  const [risk, setRisk] = useState(1)
  const [result, setResult] = useState<BacktestResult | null>(null)
  const [loading, setLoading] = useState(false)

  const run = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/backtest?symbol=${symbol}&rr=${rr}&risk=${risk}`, {
        cache: "no-store",
      })
      setResult((await res.json()) as BacktestResult)
    } finally {
      setLoading(false)
    }
  }

  const curve = result?.equityCurve.map((p, i) => ({ i, equity: p.equity })) ?? []

  return (
    <Panel
      title="Backtesting Engine"
      subtitle="BOS continuation strategy on H4"
      action={
        <button onClick={run} disabled={loading} className="terminal-btn-primary">
          {loading ? "Running…" : "Run Backtest"}
        </button>
      }
    >
      <div className="mb-4 grid grid-cols-3 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-wide text-muted">Instrument</span>
          <select value={symbol} onChange={(e) => setSymbol(e.target.value as Symbol)} className="terminal-input">
            {SYMBOLS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-wide text-muted">Risk : Reward</span>
          <input type="number" step="0.5" value={rr} onChange={(e) => setRr(Number(e.target.value))} className="terminal-input" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-wide text-muted">Risk % / trade</span>
          <input type="number" step="0.5" value={risk} onChange={(e) => setRisk(Number(e.target.value))} className="terminal-input" />
        </label>
      </div>

      {!result ? (
        <p className="py-8 text-center text-sm text-muted">
          Run a backtest to simulate the strategy over historical structure.
        </p>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-6">
            <Stat label="Trades" value={`${result.totalTrades}`} />
            <Stat label="Win Rate" value={`${formatNumber(result.winRate, 1)}%`} />
            <Stat label="Net P&L" value={`$${formatNumber(result.netPnl, 0)}`} tone={result.netPnl >= 0 ? "bull" : "bear"} />
            <Stat label="Profit Factor" value={formatNumber(result.profitFactor, 2)} />
            <Stat label="Max DD" value={`$${formatNumber(result.maxDrawdown, 0)}`} tone="bear" />
            <Stat label="Wins / Losses" value={`${result.wins}/${result.losses}`} />
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={curve} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                <defs>
                  <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="i" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <YAxis
                  domain={["auto", "auto"]}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  width={48}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                />
                <Area type="monotone" dataKey="equity" stroke="hsl(var(--primary))" fill="url(#eq)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </Panel>
  )
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "bull" | "bear" }) {
  return (
    <div className="bg-surface px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted">{label}</div>
      <div className={`font-mono text-sm font-semibold ${tone === "bull" ? "text-bull" : tone === "bear" ? "text-bear" : "text-foreground"}`}>
        {value}
      </div>
    </div>
  )
}
