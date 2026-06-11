import type { Candle, SwingPoint, BOSEvent, Direction } from "@/types"

/**
 * Break of Structure (BOS): price closes beyond the most recent confirmed
 * swing high (bullish BOS) or swing low (bearish BOS), confirming continuation
 * of the prevailing trend.
 */
export function detectBOS(candles: Candle[], swings: SwingPoint[]): BOSEvent[] {
  const events: BOSEvent[] = []

  const highs = swings.filter((s) => s.type === "high")
  const lows = swings.filter((s) => s.type === "low")

  let lastHigh: SwingPoint | null = null
  let lastLow: SwingPoint | null = null
  let trend: Direction | null = null

  for (let i = 0; i < candles.length; i++) {
    const c = candles[i]

    // Update the most recent confirmed swings up to this candle.
    const ph = highs.filter((s) => s.index < i).pop() ?? null
    const pl = lows.filter((s) => s.index < i).pop() ?? null
    if (ph) lastHigh = ph
    if (pl) lastLow = pl

    // Bullish BOS: close above last swing high while not already proven bullish
    if (lastHigh && c.close > lastHigh.price) {
      if (trend !== "bullish" || c.close > lastHigh.price) {
        const alreadyLogged = events.some(
          (e) => e.brokenSwingPrice === lastHigh!.price && e.direction === "bullish",
        )
        if (!alreadyLogged) {
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
    }

    // Bearish BOS: close below last swing low
    if (lastLow && c.close < lastLow.price) {
      const alreadyLogged = events.some(
        (e) => e.brokenSwingPrice === lastLow!.price && e.direction === "bearish",
      )
      if (!alreadyLogged) {
        events.push({
          index: i,
          time: c.time,
          price: c.close,
          direction: "bearish",
          brokenSwingPrice: lastLow.price,
        })
        trend = "bearish"
      }
    }
  }

  return events
}
