/**
 * Remove generateCandles from exports.
 * This function is no longer used - use MarketDataProvider instead.
 */

import type { Candle, Symbol, Timeframe, MarketQuote } from "@/types"

/**
 * DEPRECATED: Use MarketDataProvider instead.
 *
 * This function is kept for backwards compatibility but should not be used
 * in new code. All market data should come from the MT5 Python bridge.
 */
export async function generateCandles(
  symbol: Symbol,
  timeframe: Timeframe,
): Promise<Candle[]> {
  console.warn(
    "DEPRECATED: generateCandles() is deprecated. Use MarketDataProvider.fetchCandles() instead.",
  )
  return []
}

/**
 * DEPRECATED: Use MarketDataProvider instead.
 */
export function buildQuote(symbol: Symbol, h4: Candle[]): MarketQuote {
  console.warn("DEPRECATED: buildQuote() is deprecated. Use MarketDataProvider.getQuote() instead.")
  const last = h4[h4.length - 1]
  const prev = h4[h4.length - 2] ?? last
  const change = last.close - prev.close
  const changePercent = (change / prev.close) * 100
  const recent = h4.slice(-6)
  return {
    symbol,
    price: last.close,
    change: round(change, 2),
    changePercent: round(changePercent, 2),
    high: Math.max(...recent.map((c) => c.high)),
    low: Math.min(...recent.map((c) => c.low)),
    updatedAt: Date.now(),
  }
}

function round(value: number, digits: number): number {
  const f = Math.pow(10, digits)
  return Math.round(value * f) / f
}
