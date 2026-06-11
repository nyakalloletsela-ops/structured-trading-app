'use client'

import React, { useEffect, useState } from 'react'
import { MarketDataDisplay } from './MarketDataDisplay'
import { SignalBoard } from './SignalBoard'
import { RiskCalculator } from './RiskCalculator'
import { TradeJournalPanel } from './TradeJournalPanel'
import { useTradingStore } from '@/store/trading'

export const Dashboard: React.FC = () => {
  const { selectedSymbol, setSelectedSymbol } = useTradingStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-trading-bg p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Trading Terminal</h1>
        <p className="text-neutral">Professional GOLD & US500 Trading Platform</p>
      </div>

      {/* Symbol Selector */}
      <div className="flex gap-2 mb-6">
        {['XAUUSD', 'US500'].map((symbol) => (
          <button
            key={symbol}
            onClick={() => setSelectedSymbol(symbol)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedSymbol === symbol
                ? 'bg-trading-accent text-black'
                : 'bg-trading-card text-white hover:bg-opacity-80'
            }`}
          >
            {symbol}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Market Data */}
        <div className="md:col-span-1">
          <MarketDataDisplay symbol={selectedSymbol} />
        </div>

        {/* Risk Calculator */}
        <div className="md:col-span-1">
          <RiskCalculator />
        </div>

        {/* Trade Journal */}
        <div className="md:col-span-1 lg:col-span-1">
          <TradeJournalPanel />
        </div>
      </div>

      {/* Signal Board - Full Width */}
      <div className="mb-6">
        <SignalBoard />
      </div>

      {/* Footer Info */}
      <div className="text-center text-neutral text-sm mt-8">
        <p>Ready for live trading • Always use proper risk management</p>
      </div>
    </div>
  )
}
