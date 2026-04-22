import { useState, useEffect } from 'react';

export default function GatewaySignals() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/gateway')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setSignals(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-[#0b0f1a] border border-white/10 rounded-lg overflow-hidden mb-6">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 bg-white/2">
        <h3 className="text-white text-sm font-medium tracking-tight">
          Gateway Health + Golden Signals
        </h3>
      </div>

      {/* Signals List */}
      <div className="p-4 space-y-3 font-mono">
        {loading ? (
          <div className="text-slate-600 text-xs animate-pulse">Loading...</div>
        ) : error ? (
          <div className="text-red-500 text-xs">{error}</div>
        ) : (
          signals.map((signal, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs">
              <span className="text-slate-500">{signal.label}</span>
              <span
                className="font-bold"
                style={{ color: signal.color }}
              >
                {signal.value}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};