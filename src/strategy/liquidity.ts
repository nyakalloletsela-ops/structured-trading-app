import type { Candle, SwingPoint, LiquiditySweep } from "@/types"
import { averageRange } from "./swings"

/**
 * Liquidity Sweep (stop hunt): price spikes beyond a prior swing high/low
 * (taking resting liquidity) but closes back inside the range, leaving a
 * rejection wick. A sweep above old highs = buy-side liquidity taken; a sweep
 * below old lows = sell-side liquidity taken.
 */
export function detectLiquiditySweeps(
  candles: Candle[],
  swings: SwingPoint[],
): LiquiditySweep[] {
  const sweeps: LiquiditySweep[] = []
  const avg = averageRange(candles)
  const highs = swings.filter((s) => s.type === "high")
  const lows = swings.filter((s) => s.type === "low")

  for (let i = 2; i < candles.length; i++) {
    const c = candles[i]

    // Buy-side: wick takes out a prior swing high, body closes back below it.
    const ph = highs.filter((s) => s.index < i).pop()
    if (ph && c.high > ph.price && c.close < ph.price) {
      const wick = c.high - Math.max(c.open, c.close)
      if (wick >= avg * 0.3) {
        sweeps.push({
          index: i,
          time: c.time,
          price: c.high,
          type: "buy_side",
          sweptLevel: ph.price,
        })
      }
    }

    // Sell-side: wick takes out a prior swing low, body closes back above it.
    const pl = lows.filter((s) => s.index < i).pop()
    if (pl && c.low < pl.price && c.close > pl.price) {
      const wick = Math.min(c.open, c.close) - c.low
      if (wick >= avg * 0.3) {
        sweeps.push({
          index: i,
          time: c.time,
          price: c.low,
          type: "sell_side",
          sweptLevel: pl.price,
        })
      }
    }
  }

  return sweeps
}
