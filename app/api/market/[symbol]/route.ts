import { NextResponse } from 'next/server'
import type { MarketData } from '@/types'

// Mock market data generator
const generateMockMarketData = (symbol: string): MarketData => {
  const basePrice = symbol === 'XAUUSD' ? 2050 : 5500
  const variance = basePrice * 0.01
  const price = basePrice + (Math.random() - 0.5) * variance
  const bid = price - 0.5
  const ask = price + 0.5

  return {
    symbol,
    price,
    bid,
    ask,
    timestamp: Date.now(),
    open: price - (Math.random() - 0.5) * 10,
    high: price + Math.random() * 20,
    low: price - Math.random() * 20,
    close: price,
    volume: Math.floor(Math.random() * 1000000),
  }
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

    const data = generateMockMarketData(symbol)
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    )
  }
}
