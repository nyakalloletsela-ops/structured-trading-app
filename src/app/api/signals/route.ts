import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { analyzeSymbol } from "@/services/analysisService"
import { SYMBOLS } from "@/lib/instruments"

export const dynamic = "force-dynamic"

// TEMPORARY TESTING CONFIG: GET will now actively run the analysis 
// so you can trigger it directly by refreshing your phone browser!
export async function GET() {
  const supabase = await createClient()
  const persisted = []

  // 1. Run the live calculation loop across all your instruments
  for (const symbol of SYMBOLS) {
    const { signal } = analyzeSymbol(symbol)
    
    // For testing: we can log everything, or keep your NO_TRADE filter
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

  // 2. Return what was calculated and saved right onto your screen
  return NextResponse.json({ 
    message: "Engine triggered successfully via mobile browser!",
    persisted structural_signals: persisted 
  })
}

// Keep your clean POST function exactly as it is below
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
