import { NextResponse } from 'next/server'
import type { Candle } from '@/types'

const generateMockCandles = (symbol: string, timeframe: string): Candle[] => {
  const candles: Candle[] = []
  let price = symbol === 'XAUUSD' ? 2050 : 5500
  const now = Date.now()
  const intervals = {
    'H1': 3600000,
    'H4': 14400000,
    'D': 86400000,
    'W': 604800000,
  }
  const interval = (intervals as any)[timeframe] || 3600000
  const count = timeframe === 'W' ? 52 : 100

  for (let i = count; i >= 0; i--) {
    const change = (Math.random() - 0.5) * 20
    const open = price
    const close = price + change
    const high = Math.max(open, close) + Math.random() * 10
    const low = Math.min(open, close) - Math.random() * 10
    
    candles.push({
      timestamp: now - i * interval,
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 1000000),
    })
    
    price = close
  }

  return candles
}

export async function GET(
  request: Request,
  { params }: { params: { symbol: string; timeframe: string } }
) {
  try {
    const symbol = params.symbol.toUpperCase()
    const timeframe = params.timeframe.toUpperCase()
    
    if (!['XAUUSD', 'US500'].includes(symbol)) {
      return NextResponse.json(
        { error: 'Invalid symbol' },
        { status: 400 }
      )
    }

    if (!['H1', 'H4', 'D', 'W'].includes(timeframe)) {
      return NextResponse.json(
        { error: 'Invalid timeframe' },
        { status: 400 }
      )
    }

    const candles = generateMockCandles(symbol, timeframe)
    return NextResponse.json({ symbol, timeframe, candles })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch candles' },
      { status: 500 }
    )
  }
}
