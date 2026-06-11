import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { analyzeSymbol } from "@/services/analysisService"
import { SYMBOLS } from "@/lib/instruments"

export const dynamic = "force-dynamic"

/**
 * GET: Serves recent signal history to populate your frontend dashboard.
 * Reads directly from Supabase, keeping the application fast and efficient.
 */
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

/**
 * POST: Runs the multi-timeframe top-down strategy engine on all symbols.
 * Filters out low-confidence setups and persists high-probability trades.
 */
export async function POST() {
  const supabase = await createClient()
  const persisted = []

  for (const symbol of SYMBOLS) {
    const { signal } = analyzeSymbol(symbol)
    
    // 🛡️ Production Safety Filter: Skip setups without clear institutional edge
    if (signal.type === "NO_TRADE") continue

    const { data, error } = await supabase
      .from("signals")
      .insert({
        symbol: signal.symbol,
        type: signal.type,
        bias: signal.bias,
        score: signal.score,
        // 📦 Nested cleanly inside your jsonb schema column
        details: {
          entry: signal.entry,
          stop_loss: signal.stopLoss,
          take_profit: signal.takeProfit,
          risk_reward: signal.riskReward,
          price: signal.price,
          factors: signal.factors,
        }
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
