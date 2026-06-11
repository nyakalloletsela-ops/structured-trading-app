// Core domain types for the structured trading platform

export type Symbol = "XAUUSD" | "US500"

export type Timeframe = "W" | "D" | "H4"

export type Direction = "bullish" | "bearish"

export type SignalType = "BUY" | "SELL" | "NO_TRADE"

export interface Candle {
  time: number // unix ms
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface SwingPoint {
  index: number
  time: number
  price: number
  type: "high" | "low"
}

// Break of Structure
export interface BOSEvent {
  index: number
  time: number
  price: number
  direction: Direction
  brokenSwingPrice: number
}

// Change of Character
export interface CHoCHEvent {
  index: number
  time: number
  price: number
  direction: Direction
  brokenSwingPrice: number
}

// Order Block
export interface OrderBlock {
  startIndex: number
  endIndex: number
  time: number
  top: number
  bottom: number
  direction: Direction
  mitigated: boolean
}

// Fair Value Gap
export interface FairValueGap {
  index: number
  time: number
  top: number
  bottom: number
  direction: Direction
  filled: boolean
}

// Liquidity sweep
export interface LiquiditySweep {
  index: number
  time: number
  price: number
  type: "buy_side" | "sell_side"
  sweptLevel: number
}

export interface StructureAnalysis {
  timeframe: Timeframe
  trend: Direction | "ranging"
  swings: SwingPoint[]
  bos: BOSEvent[]
  choch: CHoCHEvent[]
  orderBlocks: OrderBlock[]
  fvgs: FairValueGap[]
  liquiditySweeps: LiquiditySweep[]
}

export interface SignalFactor {
  name: string
  weight: number
  score: number // -1..1, signed toward direction
  detail: string
}

export interface TradeSignal {
  id?: string
  symbol: Symbol
  type: SignalType
  bias: Direction | "neutral"
  score: number // 0..100 confidence
  entry: number
  stopLoss: number
  takeProfit: number
  riskReward: number
  factors: SignalFactor[]
  timeframeAnalysis: Record<Timeframe, StructureAnalysis>
  createdAt: string
  price: number
}

export interface MarketQuote {
  symbol: Symbol
  price: number
  change: number
  changePercent: number
  high: number
  low: number
  updatedAt: number
}

// Risk management
export interface RiskParams {
  accountBalance: number
  riskPercent: number
  entry: number
  stopLoss: number
  takeProfit: number
  symbol: Symbol
}

export interface RiskResult {
  riskAmount: number
  stopDistance: number
  positionSize: number
  units: number
  potentialProfit: number
  riskReward: number
}

// Journal
export interface JournalEntry {
  id: string
  symbol: Symbol
  direction: Direction
  entry: number
  exit: number | null
  stopLoss: number
  takeProfit: number
  size: number
  pnl: number | null
  status: "open" | "closed"
  notes: string
  createdAt: string
  closedAt: string | null
}

// Backtesting
export interface BacktestTrade {
  entryTime: number
  exitTime: number
  direction: Direction
  entry: number
  exit: number
  stopLoss: number
  takeProfit: number
  outcome: "win" | "loss"
  pnl: number
}

export interface BacktestResult {
  symbol: Symbol
  trades: BacktestTrade[]
  totalTrades: number
  wins: number
  losses: number
  winRate: number
  netPnl: number
  profitFactor: number
  maxDrawdown: number
  equityCurve: { time: number; equity: number }[]
}
