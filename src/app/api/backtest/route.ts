import { NextResponse } from "next/server"
import { generateCandles } from "@/services/marketData"
import { runBacktest } from "@/strategy/backtest"
import { SYMBOLS } from "@/lib/instruments"
import type { Symbol } from "@/types"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = (searchParams.get("symbol") as Symbol) ?? "XAUUSD"
  const riskReward = Number(searchParams.get("rr") ?? "2")
  const slAtrMultiple = Number(searchParams.get("sl") ?? "1.5")
  const riskPerTrade = Number(searchParams.get("risk") ?? "1") / 100

  if (!SYMBOLS.includes(symbol)) {
    return NextResponse.json({ error: "Invalid symbol" }, { status: 400 })
  }

  const candles = generateCandles(symbol, "H4")
  const result = runBacktest(candles, {
    symbol,
    riskReward,
    slAtrMultiple,
    riskPerTrade,
    startingEquity: 10000,
  })

  return NextResponse.json(result)
}
