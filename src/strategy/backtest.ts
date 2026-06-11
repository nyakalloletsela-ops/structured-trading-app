import type { Candle, Symbol, BacktestResult, BacktestTrade, Direction } from "@/types"
import { analyzeStructure } from "./structure"
import { averageRange } from "./swings"
import { INSTRUMENTS } from "@/lib/instruments"

export interface BacktestConfig {
  symbol: Symbol
  riskReward: number // target reward multiple
  slAtrMultiple: number
  startingEquity: number
  riskPerTrade: number // fraction, e.g. 0.01
}

const DEFAULT_CONFIG: Omit<BacktestConfig, "symbol"> = {
  riskReward: 2,
  slAtrMultiple: 1.5,
  startingEquity: 10000,
  riskPerTrade: 0.01,
}

/**
 * Event-driven backtest: walk forward through H4 candles, and whenever a BOS
 * confirms structure in the current trend direction, enter on the close and
 * simulate the trade bar-by-bar until SL or TP is hit.
 */
export function runBacktest(
  candles: Candle[],
  config: Partial<BacktestConfig> & { symbol: Symbol },
): BacktestResult {
  const cfg: BacktestConfig = { ...DEFAULT_CONFIG, ...config }
  const cValue = INSTRUMENTS[cfg.symbol].contractValuePerPoint
  const trades: BacktestTrade[] = []
  const equityCurve: { time: number; equity: number }[] = []

  let equity = cfg.startingEquity
  let peak = equity
  let maxDrawdown = 0

  const warmup = 60
  let i = warmup
  while (i < candles.length - 1) {
    const window = candles.slice(0, i + 1)
    const analysis = analyzeStructure(window, "H4")
    const lastBos = analysis.bos[analysis.bos.length - 1]

    // Only act on a BOS that just occurred on the current candle.
    if (lastBos && lastBos.index === i) {
      const direction: Direction = lastBos.direction
      const atr = averageRange(window, 14)
      const entry = candles[i].close
      const slDist = atr * cfg.slAtrMultiple
      const stopLoss = direction === "bullish" ? entry - slDist : entry + slDist
      const takeProfit =
        direction === "bullish"
          ? entry + slDist * cfg.riskReward
          : entry - slDist * cfg.riskReward

      const result = simulateTrade(candles, i + 1, direction, entry, stopLoss, takeProfit)
      if (result) {
        const riskAmount = equity * cfg.riskPerTrade
        const stopDistance = Math.abs(entry - stopLoss)
        const size = stopDistance > 0 ? riskAmount / (stopDistance * cValue) : 0
        const pnl =
          (direction === "bullish" ? result.exit - entry : entry - result.exit) *
          size *
          cValue

        equity += pnl
        peak = Math.max(peak, equity)
        maxDrawdown = Math.max(maxDrawdown, peak - equity)

        trades.push({
          entryTime: candles[i].time,
          exitTime: result.exitTime,
          direction,
          entry,
          exit: result.exit,
          stopLoss,
          takeProfit,
          outcome: pnl >= 0 ? "win" : "loss",
          pnl: Math.round(pnl * 100) / 100,
        })
        equityCurve.push({ time: result.exitTime, equity: Math.round(equity * 100) / 100 })

        // Skip ahead to exit to avoid overlapping trades.
        i = result.exitIndex + 1
        continue
      }
    }
    i++
  }

  const wins = trades.filter((t) => t.outcome === "win").length
  const losses = trades.length - wins
  const grossProfit = trades.filter((t) => t.pnl > 0).reduce((a, t) => a + t.pnl, 0)
  const grossLoss = Math.abs(trades.filter((t) => t.pnl < 0).reduce((a, t) => a + t.pnl, 0))

  return {
    symbol: cfg.symbol,
    trades,
    totalTrades: trades.length,
    wins,
    losses,
    winRate: trades.length ? Math.round((wins / trades.length) * 1000) / 10 : 0,
    netPnl: Math.round((equity - cfg.startingEquity) * 100) / 100,
    profitFactor:
      grossLoss > 0 ? Math.round((grossProfit / grossLoss) * 100) / 100 : grossProfit > 0 ? 99 : 0,
    maxDrawdown: Math.round(maxDrawdown * 100) / 100,
    equityCurve,
  }
}

function simulateTrade(
  candles: Candle[],
  from: number,
  direction: Direction,
  entry: number,
  stopLoss: number,
  takeProfit: number,
): { exit: number; exitTime: number; exitIndex: number } | null {
  for (let i = from; i < candles.length; i++) {
    const c = candles[i]
    if (direction === "bullish") {
      if (c.low <= stopLoss) return { exit: stopLoss, exitTime: c.time, exitIndex: i }
      if (c.high >= takeProfit) return { exit: takeProfit, exitTime: c.time, exitIndex: i }
    } else {
      if (c.high >= stopLoss) return { exit: stopLoss, exitTime: c.time, exitIndex: i }
      if (c.low <= takeProfit) return { exit: takeProfit, exitTime: c.time, exitIndex: i }
    }
  }
  return null
}
