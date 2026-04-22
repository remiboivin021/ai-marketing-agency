import React, { useRef, useEffect, useState } from 'react';
import { 
  Activity, Server, ShieldAlert, Zap, 
  Terminal, Power, RefreshCw, AlertTriangle, 
  Cpu, HardDrive, BrainCircuit 
} from 'lucide-react';

import AgentNetworkGraph from './AgentNetworkGraph';
import GatewaySignals from './GatewaySignals';

export default function AgentCockpit() {
  const activeAgents = 12;

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-300 font-sans p-6 selection:bg-cyan-900/50 selection:text-cyan-100">
      
      {/* HEADER / TOPBAR */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#222834]">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-cyan-400" />
            MISSION CONTROL CENTER
          </h1>
          {/* <p className="text-xs text-slate-500 font-mono mt-1">v2.4.0 // COCKPIT MODE // PROVENANCE: CASTELLAR, FR</p> */}
        </div>
        <div className="flex items-center gap-4 text-sm font-mono">
          <div className="flex items-center gap-2 px-3 py-1 rounded bg-emerald-950/30 border border-emerald-900/50">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-emerald-400">GATEWAY: ONLINE</span>
          </div>
          <span className="text-slate-500">|</span>
          <span>198ms</span>
        </div>
      </div>

      {/* OPENCLAW WARNING BANNER */}
      {/* <div className="bg-rose-950/30 border border-rose-900/50 rounded-md p-3 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <span className="text-sm text-rose-200">
            <strong className="text-rose-400">OpenClaw state integrity warning</strong> — Found 221 orphan transcript file(s) in system
          </span>
        </div>
        <button className="px-3 py-1 bg-rose-900/50 hover:bg-rose-800/50 text-rose-200 text-xs font-mono rounded border border-rose-700/50 transition-colors">
          Run Doctor Fix
        </button>
      </div> */}

      {/* 1. THE HUD (Heads-Up Display) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <HudCard title="Fleet Status" value="Nominal" icon={Activity} color="text-emerald-400" />
        <HudCard title="Active Swarm" value={`${activeAgents} / 50`} icon={Server} color="text-cyan-400" />
        <HudCard title="Throughput" value="842 req/s" icon={Zap} color="text-amber-400" />
        <HudCard title="System Load" value="76%" icon={Cpu} color="text-rose-400" />
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. LE GRAPHE RÉSEAU D'ORDINATEURS (Prend 2 colonnes) --- REMPLACE LE SESSION ROUTER --- */}
        <div className="lg:col-span-2 bg-[#131720] border border-[#222834] rounded-lg flex flex-col min-h-[400px]">
          <div className="p-4 border-b border-[#222834] flex justify-between items-center bg-[#181c26] rounded-t-lg">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-cyan-500" />
              Swarm Topology Visualizer
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span>SCAN ACTIVE</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
            </div>
          </div>
          
          <div className="flex-1">
            {/* Intégration du composant Graph */}
            <AgentNetworkGraph agentCount={activeAgents} />
          </div>
        </div>

        {/* RIGHT COLUMN (Actions & Security) */}
        <div className="flex flex-col gap-6">
          
          {/* 4. COMMANDES DE VOL (Quick Actions) */}
          <div className="bg-[#131720] border border-[#222834] rounded-lg p-4">
            <h2 className="text-sm font-semibold text-white mb-4">Command Override</h2>
            <div className="grid grid-cols-2 gap-3">
              <ActionButton label="Spawn Agent" icon={Zap} bg="bg-cyan-950/30 text-cyan-400 border-cyan-900/50" hover="hover:bg-cyan-900/50" />
              <ActionButton label="Reboot GW" icon={RefreshCw} bg="bg-amber-950/30 text-amber-400 border-amber-900/50" hover="hover:bg-amber-900/50" />
              <ActionButton label="Purge Logs" icon={HardDrive} bg="bg-slate-800/50 text-slate-300 border-slate-700/50" hover="hover:bg-slate-700" />
              <ActionButton label="Kill Switch" icon={Power} bg="bg-rose-950/30 text-rose-400 border-rose-900/50" hover="hover:bg-rose-900/50" />
            </div>
          </div>

<GatewaySignals />
          {/* 3. PANNEAU DE VERROUILLAGE (Security & Audit) */}
          <div className="bg-[#131720] border border-[#222834] rounded-lg p-4 flex-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-500" />
                Security & Audit
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/50 border border-emerald-900 text-emerald-400">SECURE</span>
            </div>
            
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between p-2 rounded bg-[#0b0e14]">
                <span className="text-slate-400">Audit events (24h)</span>
                <span className="text-white">21</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-[#0b0e14]">
                <span className="text-slate-400">Login failures</span>
                <span className="text-rose-400 font-bold">6</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-[#0b0e14]">
                <span className="text-slate-400">Webhooks fired</span>
                <span className="text-white">1,042</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}