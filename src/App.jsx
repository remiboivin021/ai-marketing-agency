import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Settings, 
  Database, 
  ShieldCheck, 
  Activity, 
  Server, 
  Zap,
  ChevronRight
} from 'lucide-react';
import AgentNetworkGraph from './components/AgentNetworkGraph';
import GatewaySignals from './components/GatewaySignals';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Swarm Monitor' },
    { id: 'rag', icon: <Database size={20} />, label: 'RAG Knowledge' },
    { id: 'config', icon: <Settings size={20} />, label: 'Agent Config' },
    { id: 'security', icon: <ShieldCheck size={20} />, label: 'Security' },
  ];

  return (
    <div className="flex h-screen bg-[#020617] text-slate-300 font-sans overflow-hidden">
      
      {/* --- SIDEBAR DE NAVIGATION GAUCHE --- */}
      <aside className="w-16 hover:w-64 flex flex-col bg-[#0b0f1a] border-r border-white/5 transition-all duration-300 group z-50">
        <div className="p-4 flex items-center justify-center group-hover:justify-start gap-4 mb-8">
          <div className="bg-cyan-500 p-1.5 rounded-lg shrink-0">
            <Zap size={20} className="text-white" />
          </div>
          <span className="font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            OPS_OS v4.2
          </span>
        </div>

        <nav className="flex-1 px-2 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center p-3 rounded-xl transition-all ${
                activeTab === item.id 
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
              }`}
            >
              <div className="shrink-0">{item.icon}</div>
              <span className="ml-4 font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-xs uppercase tracking-widest">
                {item.label}
              </span>
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-[8px] text-slate-600 font-mono">ENCRYPTION: ACTIVE</p>
        </div>
      </aside>

      {/* --- ZONE DE CONTENU PRINCIPALE --- */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* HEADER TOP BAR */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#020617]/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">System</span>
            <ChevronRight size={12} className="text-slate-700" />
            <span className="text-xs text-white font-mono uppercase tracking-widest">
              {menuItems.find(i => i.id === activeTab)?.label}
            </span>
          </div>

          <div className="flex gap-6">
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-mono text-slate-400 uppercase">Fleet: Nominal</span>
            </div>
          </div>
        </header>

        {/* CONTENT RENDERER */}
        <div className="flex-1 overflow-hidden p-6">
          {activeTab === 'dashboard' && (
            <div className="h-full grid grid-cols-12 gap-6">
              {/* Gauche : Gateway & Audit */}
              <aside className="col-span-3 flex flex-col gap-6 overflow-y-auto pr-2">
                <GatewaySignals />
                <div className="bg-[#0b0f1a] border border-white/10 rounded-lg p-4 font-mono">
                  <h3 className="text-white text-[11px] uppercase mb-4 opacity-50">Security Audit</h3>
                  <div className="text-[9px] space-y-1 text-slate-600">
                    <p>[ 16:40:02 ] SCAN_NOMINAL</p>
                    <p>[ 16:40:05 ] GATEWAY_ENCRYPTED</p>
                  </div>
                </div>
              </aside>

              {/* Centre : Le Visualiseur */}
              <section className="col-span-9 bg-[#0b0f1a] border border-white/10 rounded-xl overflow-hidden relative shadow-2xl">
                <AgentNetworkGraph />
              </section>
            </div>
          )}

          {activeTab === 'rag' && (
            <div className="h-full bg-[#0b0f1a] border border-white/10 rounded-xl p-8 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-xl font-bold text-white font-mono mb-4">RAG_KNOWLEDGE_BASE</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="h-32 bg-white/5 rounded border border-white/10 p-4 border-dashed flex items-center justify-center text-slate-500 text-xs uppercase">
                  Drag & Drop Vector DB File
                </div>
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="h-full bg-[#0b0f1a] border border-white/10 rounded-xl p-8 animate-in fade-in">
              <h2 className="text-xl font-bold text-white font-mono mb-4">AGENT_SYSTEM_PROMPTS</h2>
              <p className="text-slate-500 text-xs">Sélectionnez un agent pour modifier ses paramètres globaux.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;