import type { Candle, SwingPoint } from "@/types"

/**
 * Detect swing highs and lows using a fractal-style pivot lookback/lookforward.
 * A swing high is a candle whose high is greater than `lookback` candles on
 * each side; a swing low is the mirror.
 */
export function detectSwings(candles: Candle[], lookback = 2): SwingPoint[] {
  const swings: SwingPoint[] = []
  for (let i = lookback; i < candles.length - lookback; i++) {
    const c = candles[i]
    let isHigh = true
    let isLow = true
    for (let j = 1; j <= lookback; j++) {
      if (candles[i - j].high >= c.high || candles[i + j].high >= c.high) {
        isHigh = false
      }
      if (candles[i - j].low <= c.low || candles[i + j].low <= c.low) {
        isLow = false
      }
    }
    if (isHigh) {
      swings.push({ index: i, time: c.time, price: c.high, type: "high" })
    }
    if (isLow) {
      swings.push({ index: i, time: c.time, price: c.low, type: "low" })
    }
  }
  return swings
}

export function lastSwingHigh(swings: SwingPoint[], beforeIndex?: number): SwingPoint | null {
  const filtered = swings.filter(
    (s) => s.type === "high" && (beforeIndex === undefined || s.index < beforeIndex),
  )
  return filtered.length ? filtered[filtered.length - 1] : null
}

export function lastSwingLow(swings: SwingPoint[], beforeIndex?: number): SwingPoint | null {
  const filtered = swings.filter(
    (s) => s.type === "low" && (beforeIndex === undefined || s.index < beforeIndex),
  )
  return filtered.length ? filtered[filtered.length - 1] : null
}

/** Average candle range — useful for normalizing gap / displacement sizes. */
export function averageRange(candles: Candle[], period = 14): number {
  if (candles.length === 0) return 0
  const slice = candles.slice(-period)
  const sum = slice.reduce((acc, c) => acc + (c.high - c.low), 0)
  return sum / slice.length
}
