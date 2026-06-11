import { NextResponse } from 'next/server'
import { generateSignal } from '@/src/strategy/signalEngine'
import type { Candle } from '@/types'

// Mock candle data
const generateMockCandles = (symbol: string): Candle[] => {
  const candles: Candle[] = []
  let price = symbol === 'XAUUSD' ? 2050 : 5500
  const now = Date.now()

  for (let i = 50; i >= 0; i--) {
    const change = (Math.random() - 0.5) * 10
    const open = price
    const close = price + change
    const high = Math.max(open, close) + Math.random() * 5
    const low = Math.min(open, close) - Math.random() * 5
    
    candles.push({
      timestamp: now - i * 3600000,
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

export async function GET(request: Request, { params }: { params: { symbol: string } }) {
  try {
    const symbol = params.symbol.toUpperCase()
    
    if (!['XAUUSD', 'US500'].includes(symbol)) {
      return NextResponse.json(
        { error: 'Invalid symbol' },
        { status: 400 }
      )
    }

    const candles = generateMockCandles(symbol)
    const lastCandle = candles[candles.length - 1]
    const signal = generateSignal(candles, lastCandle.close)

    return NextResponse.json(signal)
  } catch (error) {
    console.error('Signal generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate signal' },
      { status: 500 }
    )
  }
}
