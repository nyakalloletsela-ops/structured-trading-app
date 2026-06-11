import type {
  Candle,
  Timeframe,
  StructureAnalysis,
  TradeSignal,
  SignalFactor,
  SignalType,
  Direction,
  Symbol,
} from "@/types"
import { analyzeStructure } from "./structure"
import { activeOrderBlocks } from "./orderBlocks"
import { activeFVGs } from "./fvg"
import { averageRange } from "./swings"
import { INSTRUMENTS } from "@/lib/instruments"

export interface MultiTimeframeInput {
  symbol: Symbol
  W: Candle[]
  D: Candle[]
  H4: Candle[]
}

// Relative weights for each scoring factor (sum used for normalization).
const WEIGHTS = {
  weeklyTrend: 25,
  dailyTrend: 20,
  h4Trend: 15,
  h4Choch: 10,
  orderBlock: 12,
  fvg: 8,
  liquidity: 10,
}

const dirSign = (d: Direction | "ranging" | "neutral"): number =>
  d === "bullish" ? 1 : d === "bearish" ? -1 : 0

/**
 * The signal engine performs top-down multi-timeframe analysis and scores a
 * set of weighted confluence factors. The signed sum determines directional
 * bias; the absolute confidence determines BUY / SELL / NO_TRADE.
 */
export function generateSignal(input: MultiTimeframeInput): TradeSignal {
  const wAnalysis = analyzeStructure(input.W, "W")
  const dAnalysis = analyzeStructure(input.D, "D")
  const h4Analysis = analyzeStructure(input.H4, "H4")

  const factors = scoreFactors(wAnalysis, dAnalysis, h4Analysis)

  // Net signed score in range [-1, 1] weighted by factor weights.
  const totalWeight = factors.reduce((acc, f) => acc + f.weight, 0)
  const weightedSum = factors.reduce((acc, f) => acc + f.weight * f.score, 0)
  const net = totalWeight > 0 ? weightedSum / totalWeight : 0

  const confidence = Math.round(Math.abs(net) * 100)
  const bias: Direction | "neutral" =
    net > 0.12 ? "bullish" : net < -0.12 ? "bearish" : "neutral"

  let type: SignalType = "NO_TRADE"
  if (bias === "bullish" && confidence >= 45) type = "BUY"
  else if (bias === "bearish" && confidence >= 45) type = "SELL"

  const lastH4 = input.H4[input.H4.length - 1]
  const price = lastH4.close
  const levels = computeLevels(input.symbol, input.H4, h4Analysis, bias, price)

  const timeframeAnalysis: Record<Timeframe, StructureAnalysis> = {
    W: wAnalysis,
    D: dAnalysis,
    H4: h4Analysis,
  }

  return {
    symbol: input.symbol,
    type,
    bias,
    score: confidence,
    entry: levels.entry,
    stopLoss: levels.stopLoss,
    takeProfit: levels.takeProfit,
    riskReward: levels.riskReward,
    factors,
    timeframeAnalysis,
    price,
    createdAt: new Date().toISOString(),
  }
}

function scoreFactors(
  w: StructureAnalysis,
  d: StructureAnalysis,
  h4: StructureAnalysis,
): SignalFactor[] {
  const factors: SignalFactor[] = []

  factors.push({
    name: "Weekly Trend",
    weight: WEIGHTS.weeklyTrend,
    score: dirSign(w.trend),
    detail: `Weekly structure is ${w.trend}`,
  })
  factors.push({
    name: "Daily Trend",
    weight: WEIGHTS.dailyTrend,
    score: dirSign(d.trend),
    detail: `Daily structure is ${d.trend}`,
  })
  factors.push({
    name: "H4 Trend",
    weight: WEIGHTS.h4Trend,
    score: dirSign(h4.trend),
    detail: `H4 structure is ${h4.trend}`,
  })

  // Recent H4 CHoCH adds momentum in its direction.
  const lastChoch = h4.choch[h4.choch.length - 1]
  factors.push({
    name: "H4 CHoCH",
    weight: WEIGHTS.h4Choch,
    score: lastChoch ? dirSign(lastChoch.direction) : 0,
    detail: lastChoch
      ? `Recent ${lastChoch.direction} change of character on H4`
      : "No recent change of character",
  })

  // Nearest active order block bias.
  const obs = activeOrderBlocks(h4.orderBlocks)
  const ob = obs[0]
  factors.push({
    name: "Order Block",
    weight: WEIGHTS.orderBlock,
    score: ob ? dirSign(ob.direction) : 0,
    detail: ob
      ? `Unmitigated ${ob.direction} order block in play`
      : "No active order block",
  })

  // Nearest active FVG bias.
  const fvgs = activeFVGs(h4.fvgs)
  const fvg = fvgs[0]
  factors.push({
    name: "Fair Value Gap",
    weight: WEIGHTS.fvg,
    score: fvg ? dirSign(fvg.direction) : 0,
    detail: fvg ? `Unfilled ${fvg.direction} FVG present` : "No active FVG",
  })

  // Most recent liquidity sweep implies reversal toward the opposite side.
  const sweep = h4.liquiditySweeps[h4.liquiditySweeps.length - 1]
  const sweepScore = sweep ? (sweep.type === "buy_side" ? -1 : 1) : 0
  factors.push({
    name: "Liquidity Sweep",
    weight: WEIGHTS.liquidity,
    score: sweepScore,
    detail: sweep
      ? `${sweep.type === "buy_side" ? "Buy-side" : "Sell-side"} liquidity swept — reversal pressure`
      : "No recent liquidity sweep",
  })

  return factors
}

function computeLevels(
  symbol: Symbol,
  h4: Candle[],
  analysis: StructureAnalysis,
  bias: Direction | "neutral",
  price: number,
) {
  const cfg = INSTRUMENTS[symbol]
  const atr = averageRange(h4, 14)
  const digits = cfg.digits

  if (bias === "neutral") {
    return { entry: round(price, digits), stopLoss: 0, takeProfit: 0, riskReward: 0 }
  }

  const slDistance = atr * 1.5
  const tpDistance = slDistance * 2 // default 1:2 R:R

  let entry = price
  let stopLoss: number
  let takeProfit: number

  if (bias === "bullish") {
    // Prefer the nearest bullish OB low for the stop if available.
    const ob = activeOrderBlocks(analysis.orderBlocks).find((b) => b.direction === "bullish")
    stopLoss = ob ? Math.min(ob.bottom, price - slDistance) : price - slDistance
    takeProfit = price + tpDistance
  } else {
    const ob = activeOrderBlocks(analysis.orderBlocks).find((b) => b.direction === "bearish")
    stopLoss = ob ? Math.max(ob.top, price + slDistance) : price + slDistance
    takeProfit = price - tpDistance
  }

  const risk = Math.abs(entry - stopLoss)
  const reward = Math.abs(takeProfit - entry)
  const riskReward = risk > 0 ? reward / risk : 0

  return {
    entry: round(entry, digits),
    stopLoss: round(stopLoss, digits),
    takeProfit: round(takeProfit, digits),
    riskReward: Math.round(riskReward * 100) / 100,
  }
}

function round(value: number, digits: number): number {
  const f = Math.pow(10, digits)
  return Math.round(value * f) / f
}
