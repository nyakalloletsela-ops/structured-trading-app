import type { Candle, Timeframe, StructureAnalysis, Direction } from "@/types"
import { detectSwings } from "./swings"
import { detectBOS } from "./bos"
import { detectCHoCH } from "./choch"
import { detectFVG } from "./fvg"
import { detectLiquiditySweeps } from "./liquidity"
import { detectOrderBlocks } from "./orderBlocks"

/**
 * Run the full Smart Money Concepts analysis on a single timeframe's candles
 * and derive the prevailing trend from the latest BOS/CHoCH events.
 */
export function analyzeStructure(candles: Candle[], timeframe: Timeframe): StructureAnalysis {
  const swings = detectSwings(candles, timeframe === "H4" ? 2 : 2)
  const bos = detectBOS(candles, swings)
  const choch = detectCHoCH(candles, swings)
  const fvgs = detectFVG(candles)
  const liquiditySweeps = detectLiquiditySweeps(candles, swings)
  const orderBlocks = detectOrderBlocks(candles, bos)

  const trend = deriveTrend(bos, choch)

  return {
    timeframe,
    trend,
    swings,
    bos,
    choch,
    orderBlocks,
    fvgs,
    liquiditySweeps,
  }
}

/**
 * Trend is the direction of the most recent structural event. A CHoCH that is
 * more recent than the last BOS flips the bias; otherwise BOS confirms it.
 */
function deriveTrend(
  bos: StructureAnalysis["bos"],
  choch: StructureAnalysis["choch"],
): Direction | "ranging" {
  const lastBos = bos[bos.length - 1]
  const lastChoch = choch[choch.length - 1]

  if (!lastBos && !lastChoch) return "ranging"
  if (lastBos && !lastChoch) return lastBos.direction
  if (lastChoch && !lastBos) return lastChoch.direction

  return lastChoch!.index >= lastBos!.index ? lastChoch!.direction : lastBos!.direction
}
