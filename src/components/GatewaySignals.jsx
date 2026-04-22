export default () => {
  const signals = [
    { label: 'Gateway', value: 'Connected', color: '#10b981', isStatus: true },
    { label: 'Traffic (sessions)', value: '87', color: '#10b981' },
    { label: 'Errors (24h)', value: '0', color: '#10b981' },
    { label: 'Pending sub-agents', value: '0', color: '#10b981' },
    { label: 'Saturation (queue)', value: '0', color: '#10b981' },
  ];

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
        {signals.map((signal, idx) => (
          <div key={idx} className="flex justify-between items-center text-xs">
            <span className="text-slate-500">{signal.label}</span>
            <span 
              className="font-bold" 
              style={{ color: signal.color }}
            >
              {signal.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
