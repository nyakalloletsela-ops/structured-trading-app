Import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { analyzeSymbol } from "@/services/analysisService"
import { SYMBOLS } from "@/lib/instruments"

export const dynamic = "force-dynamic"

// GET: return recent signal history from the database.
export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("signals")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ signals: data })
}

// POST: run fresh analysis on all instruments and persist any actionable
// (BUY/SELL) signals to the signal history.
export async function POST() {
  const supabase = await createClient()
  const persisted = []

  for (const symbol of SYMBOLS) {
    const { signal } = analyzeSymbol(symbol)
    if (signal.type === "NO_TRADE") continue

    const { data, error } = await supabase
      .from("signals")
      .insert({
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
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    persisted.push(data)
  }

  return NextResponse.json({ persisted })
}