"use client"

import { useState, useEffect, useCallback } from "react"
import { Panel } from "@/components/ui/Panel"
import { Badge } from "@/components/ui/Badge"
import { getSignalHistory } from "@/services/database"
import type { TradeSignal } from "@/types"
import { formatNumber, formatDate } from "@/lib/utils"

export function SignalHistory() {
  const [signals, setSignals] = useState<TradeSignal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setSignals(await getSignalHistory(30))
      setError(null)
    } catch {
      setError("Connect Supabase to persist signal history.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <Panel title="Signal History" subtitle="Recently generated signals">
      {error && <p className="py-2 text-sm text-bear">{error}</p>}
      {loading ? (
        <p className="py-6 text-center text-sm text-muted">Loading…</p>
      ) : signals.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">No saved signals yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted">
                <th className="py-2 pr-3">Symbol</th>
                <th className="py-2 pr-3">Signal</th>
                <th className="py-2 pr-3">Score</th>
                <th className="py-2 pr-3">Entry</th>
                <th className="py-2 pr-3">SL</th>
                <th className="py-2 pr-3">TP</th>
                <th className="py-2 pr-3">R:R</th>
                <th className="py-2 pr-3">Time</th>
              </tr>
            </thead>
            <tbody className="tnum">
              {signals.map((s) => (
                <tr key={s.id} className="border-b border-border/50">
                  <td className="py-2 pr-3 font-medium">{s.symbol}</td>
                  <td className="py-2 pr-3">
                    <Badge tone={s.type === "BUY" ? "bull" : s.type === "SELL" ? "bear" : "neutral"}>
                      {s.type}
                    </Badge>
                  </td>
                  <td className="py-2 pr-3">{s.score}</td>
                  <td className="py-2 pr-3">{formatNumber(s.entry, 2)}</td>
                  <td className="py-2 pr-3 text-bear">{s.stopLoss ? formatNumber(s.stopLoss, 2) : "—"}</td>
                  <td className="py-2 pr-3 text-bull">{s.takeProfit ? formatNumber(s.takeProfit, 2) : "—"}</td>
                  <td className="py-2 pr-3">{s.riskReward ? formatNumber(s.riskReward, 2) : "—"}</td>
                  <td className="py-2 pr-3 text-muted">{formatDate(s.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  )
}
