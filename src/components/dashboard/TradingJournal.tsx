"use client"

import { useState, useEffect, useCallback } from "react"
import { Panel } from "@/components/ui/Panel"
import { Badge } from "@/components/ui/Badge"
import { SYMBOLS } from "@/lib/instruments"
import {
  getJournalEntries,
  createJournalEntry,
  closeJournalEntry,
  deleteJournalEntry,
} from "@/services/database"
import type { JournalEntry, Symbol, Direction } from "@/types"
import { formatNumber, formatDate } from "@/lib/utils"

export function TradingJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setEntries(await getJournalEntries())
      setError(null)
    } catch (e) {
      setError("Connect Supabase to persist journal entries.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const stats = computeStats(entries)

  return (
    <Panel
      title="Trading Journal"
      subtitle="Live trade log & performance"
      action={
        <button onClick={() => setShowForm((s) => !s)} className="terminal-btn-primary">
          {showForm ? "Cancel" : "New Trade"}
        </button>
      }
    >
      <div className="mb-3 grid grid-cols-4 gap-px overflow-hidden rounded-lg border border-border bg-border">
        <Stat label="Trades" value={`${stats.total}`} />
        <Stat label="Win Rate" value={`${formatNumber(stats.winRate, 1)}%`} />
        <Stat
          label="Net P&L"
          value={`$${formatNumber(stats.netPnl, 2)}`}
          tone={stats.netPnl >= 0 ? "bull" : "bear"}
        />
        <Stat label="Open" value={`${stats.open}`} />
      </div>

      {showForm && <JournalForm onCreated={() => { setShowForm(false); load() }} />}

      {error && <p className="py-2 text-sm text-bear">{error}</p>}
      {loading ? (
        <p className="py-6 text-center text-sm text-muted">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">No journal entries yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted">
                <th className="py-2 pr-3">Symbol</th>
                <th className="py-2 pr-3">Dir</th>
                <th className="py-2 pr-3">Entry</th>
                <th className="py-2 pr-3">Exit</th>
                <th className="py-2 pr-3">P&L</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Date</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody className="tnum">
              {entries.map((e) => (
                <JournalRow key={e.id} entry={e} onChange={load} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  )
}

function JournalRow({ entry, onChange }: { entry: JournalEntry; onChange: () => void }) {
  const [exitPrice, setExitPrice] = useState("")

  const handleClose = async () => {
    const exit = Number(exitPrice)
    if (!exit) return
    const dir = entry.direction === "bullish" ? 1 : -1
    const pnl = (exit - entry.entry) * dir * entry.size
    await closeJournalEntry(entry.id, exit, pnl)
    onChange()
  }

  return (
    <tr className="border-b border-border/50">
      <td className="py-2 pr-3 font-medium">{entry.symbol}</td>
      <td className="py-2 pr-3">
        <Badge tone={entry.direction === "bullish" ? "bull" : "bear"}>
          {entry.direction === "bullish" ? "LONG" : "SHORT"}
        </Badge>
      </td>
      <td className="py-2 pr-3">{formatNumber(entry.entry, 2)}</td>
      <td className="py-2 pr-3">{entry.exit != null ? formatNumber(entry.exit, 2) : "—"}</td>
      <td className={`py-2 pr-3 ${entry.pnl == null ? "text-muted" : entry.pnl >= 0 ? "text-bull" : "text-bear"}`}>
        {entry.pnl != null ? `$${formatNumber(entry.pnl, 2)}` : "—"}
      </td>
      <td className="py-2 pr-3">
        <Badge tone={entry.status === "open" ? "accent" : "neutral"}>{entry.status}</Badge>
      </td>
      <td className="py-2 pr-3 text-muted">{formatDate(entry.createdAt)}</td>
      <td className="py-2">
        {entry.status === "open" ? (
          <div className="flex items-center gap-1">
            <input
              type="number"
              placeholder="exit"
              value={exitPrice}
              onChange={(e) => setExitPrice(e.target.value)}
              className="terminal-input w-20 px-1 py-0.5 text-xs"
            />
            <button onClick={handleClose} className="terminal-btn px-2 py-0.5 text-xs">
              Close
            </button>
          </div>
        ) : (
          <button
            onClick={async () => { await deleteJournalEntry(entry.id); onChange() }}
            className="text-xs text-muted hover:text-bear"
          >
            Delete
          </button>
        )}
      </td>
    </tr>
  )
}

function JournalForm({ onCreated }: { onCreated: () => void }) {
  const [symbol, setSymbol] = useState<Symbol>("XAUUSD")
  const [direction, setDirection] = useState<Direction>("bullish")
  const [entry, setEntry] = useState("")
  const [stopLoss, setStopLoss] = useState("")
  const [takeProfit, setTakeProfit] = useState("")
  const [size, setSize] = useState("")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await createJournalEntry({
        symbol,
        direction,
        entry: Number(entry),
        exit: null,
        stopLoss: Number(stopLoss),
        takeProfit: Number(takeProfit),
        size: Number(size),
        pnl: null,
        status: "open",
        notes,
      })
      onCreated()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="mb-3 grid grid-cols-2 gap-2 rounded-lg border border-border bg-surface p-3 md:grid-cols-3">
      <select value={symbol} onChange={(e) => setSymbol(e.target.value as Symbol)} className="terminal-input">
        {SYMBOLS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <select value={direction} onChange={(e) => setDirection(e.target.value as Direction)} className="terminal-input">
        <option value="bullish">Long</option>
        <option value="bearish">Short</option>
      </select>
      <input type="number" step="any" placeholder="Entry" value={entry} onChange={(e) => setEntry(e.target.value)} className="terminal-input" required />
      <input type="number" step="any" placeholder="Stop Loss" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} className="terminal-input" required />
      <input type="number" step="any" placeholder="Take Profit" value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)} className="terminal-input" required />
      <input type="number" step="any" placeholder="Size (units)" value={size} onChange={(e) => setSize(e.target.value)} className="terminal-input" required />
      <input placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="terminal-input md:col-span-2" />
      <button type="submit" disabled={saving} className="terminal-btn-primary">
        {saving ? "Saving…" : "Add Trade"}
      </button>
    </form>
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

function computeStats(entries: JournalEntry[]) {
  const closed = entries.filter((e) => e.status === "closed" && e.pnl != null)
  const wins = closed.filter((e) => (e.pnl ?? 0) > 0).length
  const netPnl = closed.reduce((acc, e) => acc + (e.pnl ?? 0), 0)
  return {
    total: entries.length,
    open: entries.filter((e) => e.status === "open").length,
    winRate: closed.length ? (wins / closed.length) * 100 : 0,
    netPnl,
  }
}
