'use client'

import React from 'react'
import { useTradingStore } from '@/store/trading'

interface MarketDataDisplayProps {
  symbol: string
}

export const MarketDataDisplay: React.FC<MarketDataDisplayProps> = ({ symbol }) => {
  const { marketData } = useTradingStore()
  const data = marketData[symbol]

  if (!data) {
    return (
      <div className="trading-card p-4">
        <p className="text-neutral">Loading market data...</p>
      </div>
    )
  }

  return (
    <div className="trading-card p-4 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-neutral">{symbol}</span>
        <span className="text-xl font-bold">{data.price.toFixed(2)}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-neutral">Bid</p>
          <p className="font-mono">{data.bid.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-neutral">Ask</p>
          <p className="font-mono">{data.ask.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-neutral">Open</p>
          <p className="font-mono">{data.open.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-neutral">High</p>
          <p className="font-mono text-buy">{data.high.toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
}
