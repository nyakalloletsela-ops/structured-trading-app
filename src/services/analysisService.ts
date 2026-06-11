import type { Symbol, TradeSignal } from "@/types"
import { generateCandles, buildQuote } from "./marketData"
import { generateSignal } from "@/strategy/signalEngine"

/**
 * Orchestrates a full top-down analysis for a symbol:
 * pulls W/D/H4 candles and runs the signal engine.
 * Returns the signal plus the live quote.
 */
export async function analyzeSymbol(symbol: Symbol) {
  // Fetch all timeframes in parallel (IMPORTANT: generateCandles is async now)
  const [W, D, H4] = await Promise.all([
    generateCandles(symbol, "W"),
    generateCandles(symbol, "D"),
    generateCandles(symbol, "H4"),
  ])

  // Run strategy engine
  const signal: TradeSignal = generateSignal({
    symbol,
    W,
    D,
    H4,
  })

  // Build live quote from H4 candles
  const quote = buildQuote(symbol, H4)

  return {
    signal,
    quote,
    candles: {
      W,
      D,
      H4,
    },
  }
}