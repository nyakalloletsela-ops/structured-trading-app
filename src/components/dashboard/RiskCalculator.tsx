"use client"

import { useState, useEffect, useMemo } from "react"
import { Panel } from "@/components/ui/Panel"
import { useRiskStore } from "@/store/riskStore"
import { calculateRisk } from "@/services/riskManager"
import { INSTRUMENTS } from "@/lib/instruments"
import type { Symbol, Direction } from "@/types"
import { formatNumber } from "@/lib/utils"

interface RiskCalculatorProps {
  symbol: Symbol
  entry: number
  stopLoss: number
  takeProfit: number
  bias: Direction | "neutral"
}

export function RiskCalculator({ symbol, entry, stopLoss, takeProfit, bias }: RiskCalculatorProps) {
  const { accountBalance, riskPercent, setField } = useRiskStore()
  const [entryPrice, setEntryPrice] = useState(entry)
  const [sl, setSl] = useState(stopLoss)
  const [tp, setTp] = useState(takeProfit)

  // Sync local fields when the active signal changes.
  useEffect(() => {
    setEntryPrice(entry)
    setSl(stopLoss)
    setTp(takeProfit)
  }, [entry, stopLoss, takeProfit])

  const result = useMemo(
    () =>
      calculateRisk({
        symbol,
        accountBalance,
        riskPercent,
        entry: entryPrice,
        stopLoss: sl,
        takeProfit: tp,
      }),
    [symbol, accountBalance, riskPercent, entryPrice, sl, tp],
  )

  const cfg = INSTRUMENTS[symbol]
  const step = 1 / Math.pow(10, cfg.digits)

  return (
    <Panel title="Risk Manager" subtitle="Position sizing calculator">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Account Balance ($)">
          <input
            type="number"
            value={accountBalance}
            onChange={(e) => setField("accountBalance", Number(e.target.value))}
            className="terminal-input"
          />
        </Field>
        <Field label="Risk %">
          <input
            type="number"
            step="0.1"
            value={riskPercent}
            onChange={(e) => setField("riskPercent", Number(e.target.value))}
            className="terminal-input"
          />
        </Field>
        <Field label="Entry">
          <input
            type="number"
            step={step}
            value={entryPrice}
            onChange={(e) => setEntryPrice(Number(e.target.value))}
            className="terminal-input"
          />
        </Field>
        <Field label="Stop Loss">
          <input
            type="number"
            step={step}
            value={sl}
            onChange={(e) => setSl(Number(e.target.value))}
            className="terminal-input"
          />
        </Field>
        <Field label="Take Profit">
          <input
            type="number"
            step={step}
            value={tp}
            onChange={(e) => setTp(Number(e.target.value))}
            className="terminal-input"
          />
        </Field>
        <Field label="Direction">
          <div className="terminal-input flex items-center uppercase text-muted">
            {bias === "neutral" ? "—" : bias}
          </div>
        </Field>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border">
        <Metric label="Risk Amount" value={`$${formatNumber(result.riskAmount, 2)}`} tone="bear" />
        <Metric label="Potential Profit" value={`$${formatNumber(result.potentialProfit, 2)}`} tone="bull" />
        <Metric label="Position Size" value={`${formatNumber(result.positionSize, 2)} units`} />
        <Metric label="Risk : Reward" value={`1 : ${formatNumber(result.riskReward, 2)}`} />
        <Metric label="SL Distance" value={`${formatNumber(result.stopDistance, cfg.digits)}`} />
        <Metric label="Contract Value" value={`$${formatNumber(cfg.contractValuePerPoint, 2)} / pt`} />
      </div>
    </Panel>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-wide text-muted">{label}</span>
      {children}
    </label>
  )
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "bull" | "bear" }) {
  return (
    <div className="bg-surface px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted">{label}</div>
      <div
        className={`font-mono text-sm font-semibold ${
          tone === "bull" ? "text-bull" : tone === "bear" ? "text-bear" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  )
}
