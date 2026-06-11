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
      } catch {
        setSignals({ signals: [] });
      }

      try {
        const analysisRes = await fetch('/api/analysis');
        const analysisData = await analysisRes.json();
        setAnalysis(analysisData);
      } catch {
        setAnalysis(null);
      }

      setLoading(false);
    }

    fetchBackendData();
    const interval = setInterval(fetchBackendData, 10000);

    return () => clearInterval(interval);
  }, []);

  const signalList = signals?.signals || [];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">

      {/* HEADER */}
      <header className="border-b border-slate-800 bg-slate-900/50 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-transparent bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text">
            Structured Trading Terminal
          </h1>
          <p className="text-xs text-slate-400">Live MT5 Signal Engine</p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
          <span className="text-xs text-slate-300">
            {loading ? 'Syncing...' : 'LIVE'}
          </span>
        </div>
      </header>

      {/* BODY */}
      <main className="p-6 max-w-7xl mx-auto space-y-6">

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400">Total Signals</p>
            <p className="text-2xl font-bold text-indigo-400">
              {signalList.length}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400">Active Engine</p>
            <p className="text-2xl font-bold text-emerald-400">ONLINE</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400">Refresh Rate</p>
            <p className="text-2xl font-bold text-amber-400">10s</p>
          </div>

        </div>

        {/* SIGNAL GRID */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-indigo-400 font-semibold mb-4">Live Signals</h2>

          {loading ? (
            <p className="text-slate-500">Loading market signals...</p>
          ) : signalList.length === 0 ? (
            <p className="text-slate-500">No active setups</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

              {signalList.map((item: any, i: number) => (
                <div
                  key={i}
                  className="border border-slate-800 bg-slate-950 rounded-lg p-4"
                >

                  {/* SYMBOL + TYPE */}
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-white">
                      {item.symbol}
                    </span>

                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        item.signal?.type === 'BUY'
                          ? 'bg-green-500/10 text-green-400'
                          : item.signal?.type === 'SELL'
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {item.signal?.type}
                    </span>
                  </div>

                  {/* DETAILS */}
                  <div className="text-xs text-slate-400 space-y-1">
                    <p>Bias: {item.signal?.bias}</p>
                    <p>Score: {item.signal?.score}</p>
                    <p>Price: {item.signal?.price}</p>
                  </div>

                </div>
              ))}

            </div>
          )}
        </div>

        {/* ANALYSIS PANEL */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-emerald-400 font-semibold mb-3">
            Market Analysis Engine
          </h2>

          <div className="text-xs text-slate-400">
            {analysis ? (
              <pre className="overflow-auto">
                {JSON.stringify(analysis, null, 2)}
              </pre>
            ) : (
              <p>No analysis data available</p>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}