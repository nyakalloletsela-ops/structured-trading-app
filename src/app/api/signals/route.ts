import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { analyzeSymbol } from "@/services/analysisService"
import { SYMBOLS } from "@/lib/instruments"

export const dynamic = "force-dynamic"

/**
 * GET: Serves recent signal history
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
 * POST: Runs strategy engine and stores ONLY latest per symbol
 */
export async function POST() {
  const supabase = await createClient()
  const persisted = []

  for (const symbol of SYMBOLS) {
    const analysis = await analyzeSymbol(symbol)
    const { signal } = analysis

    // 🛡 skip weak setups
    if (signal.type === "NO_TRADE") continue

    // 🔥 FIX: UPSERT instead of INSERT (prevents duplicates)
    const { data, error } = await supabase
      .from("signals")
      .upsert(
        {
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
          },

          created_at: new Date().toISOString(),
        },
        {
          onConflict: "symbol",
        }
      )
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    persisted.push(data)
  }

  return NextResponse.json({ persisted })
}