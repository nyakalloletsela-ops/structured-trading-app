'use client';

import React, { useState, useEffect } from 'react';

export default function TradingDashboard() {
  const [signals, setSignals] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBackendData() {
      try {
        const signalsRes = await fetch('/api/signals');
        const signalsData = await signalsRes.json();
        setSignals(signalsData);
      } catch (err) {
        setSignals({ status: 'offline', message: 'Signals engine unreachable' });
      }

      try {
        const analysisRes = await fetch('/api/analysis');
        const analysisData = await analysisRes.json();
        setAnalysis(analysisData);
      } catch (err) {
        setAnalysis({ status: 'offline', message: 'Analysis module unreachable' });
      }

      setLoading(false);
    }

    fetchBackendData();

    const interval = setInterval(fetchBackendData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
            Structured Trading App
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Live MT5 Trading Engine
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
          <span className="text-xs font-mono text-slate-300">
            {loading ? 'Syncing...' : 'Live'}
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <p className="text-xs text-slate-400">Engine</p>
            <p className="text-xl text-indigo-400 font-bold">ACTIVE</p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <p className="text-xs text-slate-400">Data Flow</p>
            <p className="text-xl text-emerald-400 font-bold">MT5 LIVE</p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <p className="text-xs text-slate-400">Refresh</p>
            <p className="text-xl text-amber-400 font-bold">10s</p>
          </div>
        </div>

        {/* Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Signals */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h2 className="text-indigo-400 font-semibold mb-3">Signals Engine</h2>

            <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-xs h-40 overflow-auto">
              {loading ? (
                <span className="text-slate-500">Loading signals...</span>
              ) : (
                <pre>{JSON.stringify(signals, null, 2)}</pre>
              )}
            </div>
          </div>

          {/* Analysis */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h2 className="text-emerald-400 font-semibold mb-3">Market Analysis</h2>

            <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-xs h-40 overflow-auto">
              {loading ? (
                <span className="text-slate-500">Loading analysis...</span>
              ) : (
                <pre>{JSON.stringify(analysis, null, 2)}</pre>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}