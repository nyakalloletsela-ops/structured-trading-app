'use client';

import React, { useState, useEffect } from 'react';

export default function TradingDashboard() {
  const [signals, setSignals] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Grabs the Railway backend URL you saved in your Vercel settings
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || '';

    async function fetchBackendData() {
      try {
        const signalsRes = await fetch(`${backendUrl}/api/signals`);
        const signalsData = await signalsRes.json();
        setSignals(signalsData);
      } catch (err) {
        setSignals({ status: 'offline', message: 'Could not connect to engine' });
      }

      try {
        const analysisRes = await fetch(`${backendUrl}/api/analysis`);
        const analysisData = await analysisRes.json();
        setAnalysis(analysisData);
      } catch (err) {
        setAnalysis({ status: 'offline', message: 'Analysis module unreachable' });
      }

      setLoading(false);
    }

    fetchBackendData();
    
    // Refresh data every 10 seconds to keep your trading dashboard fresh
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
          <p className="text-xs text-slate-400 mt-0.5">Deployment Engine Status: Active</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
          <span className="text-xs font-mono text-slate-300">
            {loading ? 'Syncing Modules...' : 'Live Engine Connected'}
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* Metric Overview Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Trading Engine</p>
            <p className="text-2xl font-bold mt-1 text-indigo-400">Core Active</p>
          </div>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Database Link</p>
            <p className="text-2xl font-bold mt-1 text-emerald-400">Supabase Connected</p>
          </div>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Refresh Rate</p>
            <p className="text-2xl font-bold mt-1 text-amber-400">Real-time (10s)</p>
          </div>
        </div>

        {/* Subsystem Endpoint Data Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Live Signals Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between min-h-[250px]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-indigo-400">⚡ Signals Engine</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
                  {signals?.status || 'Active'}
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-4">Real-time automated processing rules and execution parameters:</p>
              
              {/* Live Data Feed Window */}
              <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-xs text-slate-300 h-28 overflow-y-auto">
                {loading ? (
                  <span className="text-slate-500">Connecting to Railway engine...</span>
                ) : (
                  <pre>{JSON.stringify(signals, null, 2)}</pre>
                )}
              </div>
            </div>
          </div>

          {/* Live Analysis Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between min-h-[250px]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-emerald-400">📊 Market Analysis</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                  {analysis?.status || 'Active'}
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-4">Automated matrix metrics and trend calculations:</p>
              
              {/* Live Data Feed Window */}
              <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-xs text-slate-300 h-28 overflow-y-auto">
                {loading ? (
                  <span className="text-slate-500">Reading statistical models...</span>
                ) : (
                  <pre>{JSON.stringify(analysis, null, 2)}</pre>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

