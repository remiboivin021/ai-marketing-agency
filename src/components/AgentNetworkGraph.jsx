import React, { useRef, useEffect, useState } from 'react';
import { X, Activity, Database, Shield, Zap, Terminal, ChevronDown, ChevronRight } from 'lucide-react';
import AgentInteraction from './AgentInteraction';

// --- TIMELINE ---
function ActivityTimeline() {
  const points = Array.from({ length: 20 }, (_, i) => ({ x: i * 5, y: 10 + Math.random() * 20 }));
  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="mt-2 h-10 w-full bg-black/40 rounded border border-white/5 relative overflow-hidden">
      <svg className="w-full h-full">
        <path d={pathData} fill="none" stroke="#06b6d4" strokeWidth="1" strokeOpacity="0.5" />
        <path d={`${pathData} L 100 40 L 0 40 Z`} fill="url(#grad)" opacity="0.1" />
        <defs><linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#06b6d4" /><stop offset="100%" stopColor="transparent" /></linearGradient></defs>
      </svg>
      <span className="absolute top-1 left-1 text-[7px] text-slate-500 uppercase tracking-widest">Live Activity Timeline</span>
    </div>
  );
}

// --- SUB-AGENT TELEMETRY ---
function SubAgentTelemetry({ subAgent, theme }) {
  return (
    <div className="bg-[#05070a] border border-cyan-900/30 rounded-lg p-4 font-mono text-[10px] space-y-4 mt-2 animate-in slide-in-from-top duration-300">
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/2 p-2 rounded border border-white/5">
          <div className="text-slate-500 mb-1 flex items-center gap-1"><Zap size={10}/> MEMORY</div>
          <div className="text-cyan-400">{(Math.random() * 128 + 64).toFixed(1)} MB</div>
        </div>
        <div className="bg-white/2 p-2 rounded border border-white/5">
          <div className="text-slate-500 mb-1 flex items-center gap-1"><Activity size={10}/> TOKENS</div>
          <div className="text-amber-500">~{Math.floor(Math.random() * 500 + 200)} tpm</div>
        </div>
      </div>
      <ActivityTimeline />
      <div className="space-y-1">
        <div className="flex justify-between text-[8px] text-slate-500 uppercase">
          <span>Internal Throughput</span>
          <span className="text-cyan-500">{(Math.random() * 5 + 1).toFixed(2)} GB/s</span>
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-cyan-500 animate-pulse" style={{ width: '65%' }}></div>
        </div>
      </div>
      <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-2">
        <button className="py-1.5 bg-rose-950/20 border border-rose-900/40 text-rose-500 rounded text-[9px] hover:bg-rose-900/40 transition-colors">TERMINATE</button>
        <button className="py-1.5 bg-cyan-950/20 border border-cyan-900/40 text-cyan-400 rounded text-[9px] hover:bg-cyan-900/40">DUMP_MEM</button>
        <button className="col-span-2 py-1.5 bg-white/5 border border-white/10 text-slate-400 rounded text-[9px] hover:bg-white/10">ISOLATE_CORE_PROTOCOL</button>
      </div>
    </div>
  );
}

// --- SPAWN MODAL ---
function SpawnModal({ onSpawn, onClose }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#0b0f1a] border border-cyan-800 rounded-xl p-6 w-80 font-mono">
        <div className="flex justify-between items-center mb-4">
          <span className="text-cyan-400 text-[10px] uppercase tracking-widest">Spawn Agent Project</span>
          <X size={14} className="text-slate-500 cursor-pointer" onClick={onClose} />
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-[9px] text-slate-500 uppercase">Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Agent name" className="w-full mt-1 bg-black/40 border border-white/10 rounded px-3 py-2 text-xs text-slate-300 focus:border-cyan-700 outline-none" />
          </div>
          <div>
            <label className="text-[9px] text-slate-500 uppercase">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What this agent does..." rows={2} className="w-full mt-1 bg-black/40 border border-white/10 rounded px-3 py-2 text-xs text-slate-300 focus:border-cyan-700 outline-none resize-none" />
          </div>
          <button onClick={() => { if (!name.trim()) return; onSpawn({ name: name.trim(), description: description.trim() }); }} className="w-full bg-cyan-950/40 border border-cyan-800 text-cyan-400 py-2 rounded text-[10px] uppercase tracking-widest hover:bg-cyan-900/40 transition-colors">Initialize</button>
        </div>
      </div>
    </div>
  );
}

// --- MAIN COMPONENT ---
function AgentNetworkGraph() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedSubAgentId, setSelectedSubAgentId] = useState(null);
  const [showInteraction, setShowInteraction] = useState(false);
  const [filterStatus, setFilterStatus] = useState(['done', 'working', 'alert']);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSpawn, setShowSpawn] = useState(false);

const THEME = { done: '#10b981', working: '#f59e0b', alert: '#ef4444', idle: '#475569' };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = dimensions;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr; canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    let animationFrame;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const time = Date.now() * 0.002;

      // Draw dependency arrows first (behind agents)
      projects.forEach(p => {
        const px = p.x * width, py = p.y * height;
        const dependsOn = p.dependsOn || [];
        
        dependsOn.forEach(depId => {
          const depAgent = projects.find(a => a.id === depId);
          if (!depAgent) return;
          
          const dx = depAgent.x * width, dy = depAgent.y * height;
          
          // Draw arrow line
          ctx.beginPath();
          ctx.moveTo(dx, dy);
          ctx.lineTo(px, py);
          ctx.strokeStyle = '#06b6d444';
          ctx.lineWidth = 2;
          ctx.setLineDash([]);
          ctx.stroke();

          // Draw arrowhead
          const angle = Math.atan2(py - dy, px - dx);
          const arrowLength = 10;
          const arrowAngle = 0.4;
          
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(
            px - arrowLength * Math.cos(angle - arrowAngle),
            py - arrowLength * Math.sin(angle - arrowAngle)
          );
          ctx.lineTo(
            px - arrowLength * Math.cos(angle + arrowAngle),
            py - arrowLength * Math.sin(angle + arrowAngle)
          );
          ctx.closePath();
          ctx.fillStyle = '#06b6d4';
          ctx.fill();

          // Draw "depends on" label
          const midX = (dx + px) / 2;
          const midY = (dy + py) / 2;
          ctx.font = '8px monospace';
          ctx.fillStyle = '#06b6d466';
          ctx.textAlign = 'center';
          ctx.fillText('depends on', midX, midY - 5);
        });
      });

      // Draw agents
      projects.forEach(p => {
        const px = p.x * width, py = p.y * height;
        const isSel = selectedProject?.id === p.id;
        const color = THEME[p.subAgents?.some(s => s.status === 'alert') ? 'alert' : p.subAgents?.some(s => s.status === 'working') ? 'working' : 'done'];
        
        ctx.save();
        ctx.globalAlpha = selectedProject && !isSel ? 0.2 : 1;
        
        if (isSel && p.subAgents) {
          p.subAgents.forEach((s, i) => {
            const angle = (i / p.subAgents.length) * Math.PI * 2 + (time * 0.1);
            const sx = px + Math.cos(angle) * 80, sy = py + Math.sin(angle) * 80;
            ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(sx, sy);
            ctx.strokeStyle = `${THEME[s.status]}44`; ctx.setLineDash([2, 2]); ctx.stroke();
            ctx.beginPath(); ctx.arc(sx, sy, 3, 0, Math.PI * 2); ctx.fillStyle = THEME[s.status]; ctx.fill();
          });
        }

        ctx.beginPath(); ctx.arc(px, py, isSel ? 12 : 8, 0, Math.PI * 2);
        ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
        ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fillStyle = isSel ? '#fff' : color; ctx.fill();
        ctx.font = '10px monospace'; ctx.fillStyle = '#64748b'; ctx.textAlign = 'center';
        ctx.fillText(p.name?.toUpperCase() || '', px, py + 35);
        ctx.restore();
      });
      animationFrame = requestAnimationFrame(draw);
    };
    draw(); return () => cancelAnimationFrame(animationFrame);
  }, [dimensions, selectedProject, projects]);

  return (
    <div ref={containerRef} className="w-full h-full flex bg-[#020617] overflow-hidden">
      <div className="flex-1 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-slate-500 text-xs animate-pulse">Loading...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-slate-600 text-[10px]">No agents. Click "+ Spawn Agent".</span>
          </div>
        ) : (
          <canvas ref={canvasRef} onClick={(e) => {
            const rect = canvasRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left, y = e.clientY - rect.top;
            const found = projects.find(p => Math.sqrt((x - p.x * dimensions.width)**2 + (y - p.y * dimensions.height)**2) < 30);
            setSelectedProject(found || null);
          }} className="w-full h-full cursor-crosshair" />
        )}
        <button onClick={() => setShowSpawn(true)} className="absolute bottom-4 right-4 bg-cyan-950/40 border border-cyan-800 text-cyan-400 px-3 py-1.5 rounded text-[10px] uppercase tracking-widest hover:bg-cyan-900/40">+ Spawn Agent</button>
      </div>

      {showSpawn && (
        <SpawnModal onSpawn={data => {
          const p = { ...data, id: `p${Date.now()}`, x: 0.2 + Math.random() * 0.6, y: 0.2 + Math.random() * 0.6, metrics: { uptime: '—', latency: '—' }, subAgents: [] };
          fetch('/api/agents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) })
            .then(r => r.json()).then(n => { setProjects(prev => [...prev, n]); setSelectedProject(n); setShowSpawn(false); });
        }} onClose={() => setShowSpawn(false)} />
      )}

      {selectedProject && (
        <div className="w-96 bg-[#0b0f1a] border-l border-white/10 p-6 overflow-y-auto animate-in slide-in-from-right">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-white font-bold text-lg uppercase tracking-tighter">{selectedProject.name}</h2>
            <X className="text-slate-500 cursor-pointer" onClick={() => setSelectedProject(null)} />
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-[10px] text-slate-500 uppercase font-mono">Unit Filters</span>
              <div className="flex gap-1">
                {['done', 'working', 'alert'].map(s => (
                  <button key={s} onClick={() => setFilterStatus(prev => prev.includes(s) ? prev.filter(i => i !== s) : [...prev, s])}
                    className="w-4 h-4 rounded-sm border" style={{ borderColor: filterStatus.includes(s) ? THEME[s] : '#334155', backgroundColor: filterStatus.includes(s) ? `${THEME[s]}33` : 'transparent' }}>
                    <div className="w-1.5 h-1.5 mx-auto rounded-full" style={{ backgroundColor: THEME[s] }}></div>
                  </button>
                ))}
              </div>
            </div>

            {selectedProject.subAgents?.filter(s => filterStatus.includes(s.status)).map(sub => (
              <div key={sub.id}>
                <button onClick={() => setSelectedSubAgentId(selectedSubAgentId === sub.id ? null : sub.id)}
                  className={`w-full flex justify-between p-3 rounded border font-mono text-[11px] ${selectedSubAgentId === sub.id ? 'bg-black border-cyan-800' : 'bg-black/40 border-white/5'}`}>
                  <div className="flex items-center gap-2">
                    {selectedSubAgentId === sub.id ? <ChevronDown size={14} className="text-cyan-500"/> : <ChevronRight size={14}/>}
                    <span className={selectedSubAgentId === sub.id ? 'text-cyan-300' : 'text-slate-300'}>{sub.id}</span>
                  </div>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: THEME[sub.status], boxShadow: `0 0 8px ${THEME[sub.status]}` }}></div>
                </button>
                {selectedSubAgentId === sub.id && <SubAgentTelemetry subAgent={sub} theme={THEME} />}
              </div>
            ))}

            {/* Boton d'interaction avec l'agent */}
            <button onClick={() => setShowInteraction(true)}
              className="w-full mt-4 py-3 bg-cyan-950/40 border border-cyan-800 text-cyan-400 rounded-lg text-[10px] uppercase tracking-widest hover:bg-cyan-900/40 transition-colors">
              Interagir avec l'agent
            </button>
          </div>
        </div>
      )}

      {showInteraction && selectedProject && (
        <AgentInteraction agent={selectedProject} onClose={() => setShowInteraction(false)} />
      )}
    </div>
  );
}

export default AgentNetworkGraph;