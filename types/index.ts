export interface MarketData {
  symbol: string
  price: number
  bid: number
  ask: number
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface Candle {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface Signal {
  id: string
  symbol: string
  type: 'BUY' | 'SELL' | 'NO_TRADE'
  price: number
  timestamp: number
  score: number
  confidence: number
  reason: string
}

export interface OrderBlock {
  timestamp: number
  price: number
  type: 'bullish' | 'bearish'
  size: number
}

export interface FVG {
  timestamp: number
  topPrice: number
  bottomPrice: number
  type: 'bullish' | 'bearish'
}

export interface BOS {
  timestamp: number
  price: number
  type: 'bullish' | 'bearish'
}

export interface CHoCH {
  timestamp: number
  price: number
  type: 'bullish' | 'bearish'
}

export interface LiquiditySweep {
  timestamp: number
  price: number
  type: 'bullish' | 'bearish'
  volume: number
}

export interface TradeJournal {
  id: string
  symbol: string
  entryPrice: number
  entryTime: number
  exitPrice?: number
  exitTime?: number
  type: 'BUY' | 'SELL'
  size: number
  pnl?: number
}
