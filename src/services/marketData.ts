import type { Candle, Symbol, Timeframe, MarketQuote } from "@/types"
import { INSTRUMENTS } from "@/lib/instruments"

const TF_MS: Record<Timeframe, number> = {
  H4: 4 * 60 * 60 * 1000,
  D: 24 * 60 * 60 * 1000,
  W: 7 * 24 * 60 * 60 * 1000,
}

const TF_COUNT: Record<Timeframe, number> = {
  H4: 180,
  D: 160,
  W: 120,
}

// Deterministic PRNG (mulberry32) so candles are stable per symbol/timeframe.
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seedFor(symbol: Symbol, tf: Timeframe): number {
  const base = symbol === "XAUUSD" ? 1000 : 2000
  const tfSeed = tf === "W" ? 7 : tf === "D" ? 3 : 1
  return base + tfSeed
}

/**
 * Generate a deterministic but realistic OHLC series using a random walk with
 * trend regimes and volatility clustering. Replace this module with a real
 * data feed (e.g. broker API) without touching the rest of the platform.
 */
export function generateCandles(symbol: Symbol, timeframe: Timeframe): Candle[] {
  const cfg = INSTRUMENTS[symbol]
  const rand = mulberry32(seedFor(symbol, timeframe))
  const count = TF_COUNT[timeframe]
  const step = TF_MS[timeframe]
  const now = Date.now()
  const start = now - count * step

  const candles: Candle[] = []
  let price = cfg.basePrice * (0.9 + rand() * 0.05)
  let trend = (rand() - 0.5) * cfg.volatility * 0.4
  let regime = 0

  for (let i = 0; i < count; i++) {
    // Occasionally switch trend regime to produce BOS/CHoCH structure.
    if (regime <= 0) {
      trend = (rand() - 0.45) * cfg.volatility * 0.6 * cfg.basePrice
      regime = 8 + Math.floor(rand() * 18)
    }
    regime--

    const vol = cfg.basePrice * cfg.volatility * (0.5 + rand())
    const open = price
    const drift = trend + (rand() - 0.5) * vol
    let close = open + drift
    if (close <= 0) close = open * 0.99

    const wickUp = rand() * vol * 0.8
    const wickDown = rand() * vol * 0.8
    const high = Math.max(open, close) + wickUp
    const low = Math.min(open, close) - wickDown
    const volume = Math.round(1000 + rand() * 9000)

    candles.push({
      time: start + i * step,
      open: round(open, cfg.digits),
      high: round(high, cfg.digits),
      low: round(low, cfg.digits),
      close: round(close, cfg.digits),
      volume,
    })
    price = close
  }

  return candles
}

export function buildQuote(symbol: Symbol, h4: Candle[]): MarketQuote {
  const last = h4[h4.length - 1]
  const prev = h4[h4.length - 2] ?? last
  const change = last.close - prev.close
  const changePercent = (change / prev.close) * 100
  // Daily-ish high/low from the last 6 H4 candles (~1 day)
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
