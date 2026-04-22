import { 
    BrainCircuit 
} from 'lucide-react';

export default function NavBar() {
  return (
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
  )
}