'use client'

import React from 'react'
import { useTradingStore } from '@/store/trading'
import type { Signal } from '@/types'

export const SignalBoard: React.FC = () => {
  const { signals } = useTradingStore()

  const getSignalColor = (signal: Signal) => {
    if (signal.type === 'BUY') return 'signal-badge-buy'
    if (signal.type === 'SELL') return 'signal-badge-sell'
    return 'signal-badge-neutral'
  }

  return (
    <div className="trading-card p-4">
      <h2 className="text-lg font-bold mb-4">Signal History</h2>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {signals.length === 0 ? (
          <p className="text-neutral">No signals yet</p>
        ) : (
          signals.slice(0, 10).map((signal) => (
            <div key={signal.id} className="flex justify-between items-center p-2 bg-trading-bg rounded">
              <div className="flex-1">
                <span className={`signal-badge ${getSignalColor(signal)}`}>
                  {signal.type}
                </span>
                <p className="text-xs text-neutral mt-1">{signal.reason}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono">{signal.price.toFixed(2)}</p>
                <p className="text-xs text-neutral">{(signal.confidence * 100).toFixed(0)}%</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
