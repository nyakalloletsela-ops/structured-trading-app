import { NextResponse } from 'next/server'
import type { BacktestResult } from '@/types'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { symbol, startDate, endDate } = body

    // Mock backtest results
    const result: BacktestResult = {
      totalTrades: Math.floor(Math.random() * 100) + 20,
      winningTrades: Math.floor(Math.random() * 50) + 10,
      losingTrades: Math.floor(Math.random() * 50) + 5,
      winRate: Math.random() * 100,
      totalProfit: Math.random() * 50000 - 10000,
      maxDrawdown: Math.random() * 20,
      profitFactor: Math.random() * 3,
      sharpeRatio: Math.random() * 2,
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: 'Backtest failed' },
      { status: 500 }
    )
  }
}
