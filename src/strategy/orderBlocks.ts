import type { Candle, OrderBlock, BOSEvent } from "@/types"
import { averageRange } from "./swings"

/**
 * Order Blocks: the last opposing candle before an impulsive move that breaks
 * structure.
 *  - Bullish OB: the last down-candle before a strong up-move / bullish BOS.
 *  - Bearish OB: the last up-candle before a strong down-move / bearish BOS.
 * An OB is "mitigated" once price returns to trade through its zone.
 */
export function detectOrderBlocks(candles: Candle[], bos: BOSEvent[]): OrderBlock[] {
  const blocks: OrderBlock[] = []
  const avg = averageRange(candles)

  for (const event of bos) {
    const i = event.index
    if (event.direction === "bullish") {
      // Walk back to the last bearish (down) candle before the break.
      for (let j = i - 1; j >= 0 && j > i - 10; j--) {
        if (candles[j].close < candles[j].open) {
          blocks.push(makeBlock(candles, j, "bullish", avg))
          break
        }
      }
    } else {
      for (let j = i - 1; j >= 0 && j > i - 10; j--) {
        if (candles[j].close > candles[j].open) {
          blocks.push(makeBlock(candles, j, "bearish", avg))
          break
        }
      }
    }
  }

  // De-duplicate by candle index.
  const seen = new Set<number>()
  return blocks.filter((b) => {
    if (seen.has(b.startIndex)) return false
    seen.add(b.startIndex)
    return true
  })
}

function makeBlock(
  candles: Candle[],
  index: number,
  direction: "bullish" | "bearish",
  avg: number,
): OrderBlock {
  const c = candles[index]
  const top = Math.max(c.open, c.close, c.high)
  const bottom = Math.min(c.open, c.close, c.low)
  return {
    startIndex: index,
    endIndex: index,
    time: c.time,
    top,
    bottom,
    direction,
    mitigated: isMitigated(candles, index + 1, top, bottom),
  }
}

function isMitigated(candles: Candle[], from: number, top: number, bottom: number): boolean {
  for (let i = from; i < candles.length; i++) {
    if (candles[i].low <= top && candles[i].high >= bottom) return true
  }
  return false
}

/** Most recent unmitigated order blocks, newest first. */
export function activeOrderBlocks(blocks: OrderBlock[]): OrderBlock[] {
  return blocks.filter((b) => !b.mitigated).reverse()
}
