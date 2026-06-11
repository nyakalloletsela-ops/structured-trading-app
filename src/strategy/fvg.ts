import type { Candle, FairValueGap } from "@/types"
import { averageRange } from "./swings"

/**
 * Fair Value Gap (FVG) / imbalance: a 3-candle pattern where the wicks of
 * candle 1 and candle 3 do not overlap, leaving an inefficiency.
 *  - Bullish FVG: candle[i-1].high < candle[i+1].low
 *  - Bearish FVG: candle[i-1].low  > candle[i+1].high
 * Gaps smaller than a fraction of the average range are ignored as noise.
 * A gap is "filled" once later price trades back through it.
 */
export function detectFVG(candles: Candle[], minFactor = 0.1): FairValueGap[] {
  const gaps: FairValueGap[] = []
  const avg = averageRange(candles)
  const minSize = avg * minFactor

  for (let i = 1; i < candles.length - 1; i++) {
    const prev = candles[i - 1]
    const next = candles[i + 1]

    // Bullish gap
    if (next.low > prev.high && next.low - prev.high >= minSize) {
      gaps.push({
        index: i,
        time: candles[i].time,
        top: next.low,
        bottom: prev.high,
        direction: "bullish",
        filled: isFilled(candles, i + 2, prev.high, next.low, "bullish"),
      })
    }

    // Bearish gap
    if (prev.low > next.high && prev.low - next.high >= minSize) {
      gaps.push({
        index: i,
        time: candles[i].time,
        top: prev.low,
        bottom: next.high,
        direction: "bearish",
        filled: isFilled(candles, i + 2, next.high, prev.low, "bearish"),
      })
    }
  }

  return gaps
}

function isFilled(
  candles: Candle[],
  from: number,
  bottom: number,
  top: number,
  direction: "bullish" | "bearish",
): boolean {
  for (let i = from; i < candles.length; i++) {
    if (direction === "bullish" && candles[i].low <= bottom) return true
    if (direction === "bearish" && candles[i].high >= top) return true
  }
  return false
}

/** Returns the most recent unmitigated gaps, newest first. */
export function activeFVGs(gaps: FairValueGap[]): FairValueGap[] {
  return gaps.filter((g) => !g.filled).reverse()
}
