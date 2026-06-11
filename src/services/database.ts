import { createClient } from "@/lib/supabase/client"
import type { TradeSignal, JournalEntry, Symbol, Direction, SignalType } from "@/types"

// ---------- Signal history ----------

interface SignalRow {
  id: string
  symbol: string
  type: string
  bias: string
  score: number
  entry: number
  stop_loss: number
  take_profit: number
  risk_reward: number
  price: number
  factors: unknown
  created_at: string
}

export async function saveSignal(signal: TradeSignal): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("signals").insert({
    symbol: signal.symbol,
    type: signal.type,
    bias: signal.bias,
    score: signal.score,
    entry: signal.entry,
    stop_loss: signal.stopLoss,
    take_profit: signal.takeProfit,
    risk_reward: signal.riskReward,
    price: signal.price,
    factors: signal.factors,
  })
  if (error) throw error
}

export async function getSignalHistory(limit = 50): Promise<TradeSignal[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("signals")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data as SignalRow[]).map(mapSignal)
}

function mapSignal(row: SignalRow): TradeSignal {
  return {
    id: row.id,
    symbol: row.symbol as Symbol,
    type: row.type as SignalType,
    bias: row.bias as Direction | "neutral",
    score: row.score,
    entry: row.entry,
    stopLoss: row.stop_loss,
    takeProfit: row.take_profit,
    riskReward: row.risk_reward,
    price: row.price,
    factors: (row.factors as TradeSignal["factors"]) ?? [],
    timeframeAnalysis: {} as TradeSignal["timeframeAnalysis"],
    createdAt: row.created_at,
  }
}

// ---------- Trading journal ----------

interface JournalRow {
  id: string
  symbol: string
  direction: string
  entry: number
  exit: number | null
  stop_loss: number
  take_profit: number
  size: number
  pnl: number | null
  status: string
  notes: string
  created_at: string
  closed_at: string | null
}

export async function getJournalEntries(): Promise<JournalEntry[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data as JournalRow[]).map(mapJournal)
}

export async function createJournalEntry(
  entry: Omit<JournalEntry, "id" | "createdAt" | "closedAt">,
): Promise<JournalEntry> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("journal_entries")
    .insert({
      symbol: entry.symbol,
      direction: entry.direction,
      entry: entry.entry,
      exit: entry.exit,
      stop_loss: entry.stopLoss,
      take_profit: entry.takeProfit,
      size: entry.size,
      pnl: entry.pnl,
      status: entry.status,
      notes: entry.notes,
    })
    .select()
    .single()
  if (error) throw error
  return mapJournal(data as JournalRow)
}

export async function closeJournalEntry(
  id: string,
  exit: number,
  pnl: number,
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from("journal_entries")
    .update({ exit, pnl, status: "closed", closed_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw error
}

export async function deleteJournalEntry(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("journal_entries").delete().eq("id", id)
  if (error) throw error
}

function mapJournal(row: JournalRow): JournalEntry {
  return {
    id: row.id,
    symbol: row.symbol as Symbol,
    direction: row.direction as Direction,
    entry: row.entry,
    exit: row.exit,
    stopLoss: row.stop_loss,
    takeProfit: row.take_profit,
    size: row.size,
    pnl: row.pnl,
    status: row.status as "open" | "closed",
    notes: row.notes ?? "",
    createdAt: row.created_at,
    closedAt: row.closed_at,
  }
}
