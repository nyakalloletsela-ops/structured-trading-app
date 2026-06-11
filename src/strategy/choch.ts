import type { Candle, SwingPoint, CHoCHEvent, Direction } from "@/types"

/**
 * Change of Character (CHoCH): the first break against the prevailing trend.
 * In an uptrend (series of higher highs / higher lows), a close below the most
 * recent higher low signals a bearish CHoCH — an early reversal warning.
 * The mirror applies for downtrends.
 */
export function detectCHoCH(candles: Candle[], swings: SwingPoint[]): CHoCHEvent[] {
  const events: CHoCHEvent[] = []
  const ordered = [...swings].sort((a, b) => a.index - b.index)

  let trend: Direction | null = null
  let lastHigh: SwingPoint | null = null
  let lastLow: SwingPoint | null = null

  // Establish initial trend from the first two swings of opposite type.
  for (let i = 0; i < candles.length; i++) {
    const c = candles[i]
    const newSwings = ordered.filter((s) => s.index === i - 1)
    for (const s of newSwings) {
      if (s.type === "high") {
        if (lastHigh && s.price > lastHigh.price) trend = "bullish"
        lastHigh = s
      } else {
        if (lastLow && s.price < lastLow.price) trend = "bearish"
        lastLow = s
      }
    }

    // Bearish CHoCH: uptrend invalidated by closing below last swing low.
    if (trend === "bullish" && lastLow && c.close < lastLow.price) {
      events.push({
        index: i,
        time: c.time,
        price: c.close,
        direction: "bearish",
        brokenSwingPrice: lastLow.price,
      })
      trend = "bearish"
    }

    // Bullish CHoCH: downtrend invalidated by closing above last swing high.
    if (trend === "bearish" && lastHigh && c.close > lastHigh.price) {
      events.push({
        index: i,
        time: c.time,
        price: c.close,
        direction: "bullish",
        brokenSwingPrice: lastHigh.price,
      })
      trend = "bullish"
    }
  }

  return events
}
