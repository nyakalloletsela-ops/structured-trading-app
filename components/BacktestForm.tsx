'use client'

import React, { useState } from 'react'

interface BacktestFormProps {
  onSubmit: (params: any) => Promise<void>
  isLoading?: boolean
}

export const BacktestForm: React.FC<BacktestFormProps> = ({ onSubmit, isLoading = false }) => {
  const [params, setParams] = useState({
    symbol: 'XAUUSD',
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    initialBalance: 10000,
    riskPercentage: 2,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(params)
  }

  return (
    <form onSubmit={handleSubmit} className="trading-card p-4 space-y-4">
      <h2 className="text-lg font-bold">Backtest Strategy</h2>

      <div>
        <label className="block text-neutral text-sm mb-1">Symbol</label>
        <select
          value={params.symbol}
          onChange={(e) => setParams({ ...params, symbol: e.target.value })}
          className="trading-input w-full"
        >
          <option>XAUUSD</option>
          <option>US500</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-neutral text-sm mb-1">Start Date</label>
          <input
            type="date"
            value={params.startDate}
            onChange={(e) => setParams({ ...params, startDate: e.target.value })}
            className="trading-input w-full"
          />
        </div>
        <div>
          <label className="block text-neutral text-sm mb-1">End Date</label>
          <input
            type="date"
            value={params.endDate}
            onChange={(e) => setParams({ ...params, endDate: e.target.value })}
            className="trading-input w-full"
          />
        </div>
      </div>

      <div>
        <label className="block text-neutral text-sm mb-1">Initial Balance</label>
        <input
          type="number"
          value={params.initialBalance}
          onChange={(e) => setParams({ ...params, initialBalance: parseFloat(e.target.value) })}
          className="trading-input w-full"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full trading-button-primary disabled:opacity-50"
      >
        {isLoading ? 'Running...' : 'Run Backtest'}
      </button>
    </form>
  )
}
