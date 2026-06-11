import type { Symbol, TradeSignal } from "@/types"
import { generateCandles, buildQuote } from "./marketData"
import { generateSignal } from "@/strategy/signalEngine"

/**
 * Orchestrates a full top-down analysis for a symbol: pulls W/D/H4 candles and
 * runs the signal engine. Returns the signal plus the live quote.
 */
export function analyzeSymbol(symbol: Symbol) {
  const W = generateCandles(symbol, "W")
  const D = generateCandles(symbol, "D")
  const H4 = generateCandles(symbol, "H4")

  const signal: TradeSignal = generateSignal({ symbol, W, D, H4 })
  const quote = buildQuote(symbol, H4)

  return { signal, quote, candles: { W, D, H4 } }
}
