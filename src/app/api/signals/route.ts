import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { analyzeSymbol } from "@/services/analysisService"
import { SYMBOLS } from "@/lib/instruments"

export const dynamic = "force-dynamic"

// TEMPORARY TESTING CONFIG: GET allows direct execution from your phone browser
export async function GET() {
  const supabase = await createClient()
  const persisted = []

  for (const symbol of SYMBOLS) {
    const { signal } = analyzeSymbol(symbol)
    
    // 🔍 TEMPORARY: Commented out so neutral setups populate your table for testing
    // if (signal.type === "NO_TRADE") continue

    const { data, error } = await supabase
      .from("signals")
      .insert({
        symbol: signal.symbol,
        type: signal.type,
        bias: signal.bias,
        score: signal.score,
        // 📦 Pack all extra structural metrics cleanly into your jsonb details column
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

  return NextResponse.json({ 
    message: "Engine triggered successfully via mobile browser!",
    structural_signals: persisted 
  })
}

// Production POST function matching your exact database schema
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
