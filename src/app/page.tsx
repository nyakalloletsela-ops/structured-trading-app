'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function TradingDashboard() {
  const [signals, setSignals] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🧠 store previous signals for comparison
  const prevSignalsRef = useRef<any>({});

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

  // 🧠 detect changes per symbol
  const enrichedSignals = signalList.map((s: any) => {
    const prev = prevSignalsRef.current[s.symbol];

    const changed =
      prev && prev.signal?.type !== s.signal?.type;

    return {
      ...s,
      isNew: !prev,
      changed,
    };
  });

  // 🧠 update ref AFTER render
  useEffect(() => {
    if (!signalList.length) return;

    const map: any = {};
    for (const s of signalList) {
      map[s.symbol] = s;
    }
    prevSignalsRef.current = map;
  }, [signalList]);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">

      {/* HEADER */}
      <header className="border-b border-slate-800 bg-slate-900/50 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-transparent bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text">
            Trading Terminal
          </h1>
          <p className="text-xs text-slate-400">Live Signal Engine</p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
          <span className="text-xs">
            {loading ? 'Syncing...' : 'LIVE'}
          </span>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-6">

        {/* SIGNALS */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">

          <h2 className="text-indigo-400 font-semibold mb-4">
            Live Signals
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            {enrichedSignals.map((item: any, i: number) => (
              <div
                key={i}
                className={`border rounded-lg p-4 bg-slate-950 ${
                  item.changed ? 'border-yellow-500' : 'border-slate-800'
                }`}
              >

                {/* SYMBOL */}
                <div className="flex justify-between">
                  <span className="font-bold">{item.symbol}</span>

                  {/* STATUS BADGES */}
                  <div className="flex gap-2">
                    {item.isNew && (
                      <span className="text-xs text-green-400">
                        NEW
                      </span>
                    )}

                    {item.changed && (
                      <span className="text-xs text-yellow-400">
                        UPDATED
                      </span>
                    )}
                  </div>
                </div>

                {/* SIGNAL */}
                <div className="mt-2 text-sm">
                  <p>Type: {item.signal?.type}</p>
                  <p>Bias: {item.signal?.bias}</p>
                  <p>Score: {item.signal?.score}</p>
                </div>

              </div>
            ))}

          </div>
        </div>

      </main>
    </div>
  );
}