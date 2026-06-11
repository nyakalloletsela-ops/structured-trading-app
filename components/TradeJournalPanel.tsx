'use client'

import React from 'react'
import { useTradingStore } from '@/store/trading'

export const TradeJournalPanel: React.FC = () => {
  const { trades } = useTradingStore()

  const stats = {
    totalTrades: trades.length,
    winningTrades: trades.filter(t => (t.pnl || 0) > 0).length,
    totalPnL: trades.reduce((sum, t) => sum + (t.pnl || 0), 0),
  }

  const winRate = stats.totalTrades > 0 ? (stats.winningTrades / stats.totalTrades) * 100 : 0

  return (
    <div className="trading-card p-4 space-y-4">
      <h2 className="text-lg font-bold">Trading Journal</h2>
      
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-trading-bg p-2 rounded">
          <p className="text-neutral text-xs">Total Trades</p>
          <p className="text-lg font-bold">{stats.totalTrades}</p>
        </div>
        <div className="bg-trading-bg p-2 rounded">
          <p className="text-neutral text-xs">Win Rate</p>
          <p className="text-lg font-bold text-buy">{winRate.toFixed(1)}%</p>
        </div>
        <div className="bg-trading-bg p-2 rounded">
          <p className="text-neutral text-xs">Total P&L</p>
          <p className={`text-lg font-bold ${stats.totalPnL >= 0 ? 'text-buy' : 'text-sell'}`}>
            ${stats.totalPnL.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {trades.length === 0 ? (
          <p className="text-neutral text-sm">No trades yet</p>
        ) : (
          trades.slice(0, 5).map((trade) => (
            <div key={trade.id} className="bg-trading-bg p-2 rounded text-sm flex justify-between">
              <span className={trade.type === 'BUY' ? 'text-buy' : 'text-sell'}>
                {trade.type}
              </span>
              <span className="font-mono">${(trade.pnl || 0).toFixed(2)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
