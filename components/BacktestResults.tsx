'use client'

import React from 'react'
import type { BacktestResult } from '@/types'

interface BacktestResultsProps {
  results: BacktestResult
}

export const BacktestResults: React.FC<BacktestResultsProps> = ({ results }) => {
  return (
    <div className="trading-card p-4 space-y-4">
      <h2 className="text-lg font-bold">Backtest Results</h2>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-trading-bg p-3 rounded">
          <p className="text-neutral text-xs">Total Trades</p>
          <p className="text-xl font-bold">{results.totalTrades}</p>
        </div>
        <div className="bg-trading-bg p-3 rounded">
          <p className="text-neutral text-xs">Win Rate</p>
          <p className={`text-xl font-bold ${results.winRate > 50 ? 'text-buy' : 'text-sell'}`}>
            {results.winRate.toFixed(1)}%
          </p>
        </div>
        <div className="bg-trading-bg p-3 rounded">
          <p className="text-neutral text-xs">Total Profit</p>
          <p className={`text-xl font-bold ${results.totalProfit >= 0 ? 'text-buy' : 'text-sell'}`}>
            ${results.totalProfit.toFixed(2)}
          </p>
        </div>
        <div className="bg-trading-bg p-3 rounded">
          <p className="text-neutral text-xs">Profit Factor</p>
          <p className="text-xl font-bold">{results.profitFactor.toFixed(2)}</p>
        </div>
        <div className="bg-trading-bg p-3 rounded">
          <p className="text-neutral text-xs">Max Drawdown</p>
          <p className="text-xl font-bold text-sell">{results.maxDrawdown.toFixed(1)}%</p>
        </div>
        <div className="bg-trading-bg p-3 rounded">
          <p className="text-neutral text-xs">Sharpe Ratio</p>
          <p className="text-xl font-bold">{results.sharpeRatio.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-buy bg-opacity-10 p-3 rounded text-sm">
        <p className="text-buy font-semibold">Strategy Performance</p>
        <p className="text-neutral text-xs mt-1">
          {results.winRate > 60 ? '✓ Strong win rate' : '⚠ Moderate win rate'} • Profit factor: {results.profitFactor.toFixed(1)}
        </p>
      </div>
    </div>
  )
}
