import React from 'react';
import { motion } from 'motion/react';
import { MapPin, RefreshCw, Radio, Share2, ShieldCheck, Zap } from 'lucide-react';

interface LabLocation {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  x: number;
  y: number;
}

export const RegionalMap: React.FC<{ language: string }> = ({ language }) => {
  const labs: LabLocation[] = [
    { id: 'ksa', name: 'Riyadh Reference Lab', country: 'Saudi Arabia', lat: 24.7136, lng: 46.6753, x: 53.3, y: 50.9 },
    { id: 'egypt', name: 'Cairo Central Hub', country: 'Egypt', lat: 30.0444, lng: 31.2357, x: 22.4, y: 33.2 },
    { id: 'uae', name: 'Abu Dhabi Genomics Hub', country: 'UAE', lat: 24.4539, lng: 54.3773, x: 68.7, y: 51.8 },
  ];

  return (
    <div className="bg-[#141820] border border-slate-800 rounded-xl p-6 relative overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            {language === 'ar' ? 'البث المباشر للمزامنة الإقليمية' : 'REGIONAL LIVE SYNC TOPOLOGY'}
          </h3>
          <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase tracking-widest font-bold">
            Real-time data replication across Mena clinical nodes
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-900/50 px-2 py-1 rounded border border-slate-800">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] text-emerald-400 font-bold font-mono">ENCRYPTED TUNNEL ACTIVE</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative aspect-[21/9] w-full bg-[#0a0d14] rounded-lg border border-slate-800/50 overflow-hidden inner-shadow-lg">
        {/* Stylized Grid Lines */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#4f46e5_0%,transparent_80%)] opacity-10" />
        </div>

        {/* Data Transfer Lines (Animated) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
          <motion.path
            d="M 22.4% 33.2% Q 37.8% 30% 53.3% 50.9%"
            stroke="url(#lineGradient)"
            strokeWidth="1"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          <motion.path
            d="M 53.3% 50.9% Q 61% 51% 68.7% 51.8%"
            stroke="url(#lineGradient)"
            strokeWidth="1"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <motion.path
            d="M 22.4% 33.2% Q 45% 45% 68.7% 51.8%"
            stroke="url(#lineGradient)"
            strokeWidth="1"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>

        {/* Markers */}
        {labs.map((lab) => (
          <motion.div
            key={lab.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{ left: `${lab.x}%`, top: `${lab.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group"
          >
            {/* Status Radar Wave */}
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping scale-[2]" />
            <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-pulse scale-[3]" />
            
            {/* Pin */}
            <div className="relative bg-black border-2 border-emerald-500 rounded-full p-1.5 shadow-[0_0_15px_rgba(16,185,129,0.5)] cursor-pointer hover:scale-110 transition-transform">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            </div>

            {/* Label Tooltip */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-[#0f172a] border border-slate-700 p-2 rounded shadow-2xl min-w-[140px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[8px] font-bold text-emerald-400 font-mono tracking-tighter uppercase whitespace-nowrap">Node #{lab.id.toUpperCase()}</span>
                <span className="text-[8px] text-slate-500 font-mono">LAT: {lab.lat}</span>
              </div>
              <h4 className="text-[10px] font-bold text-white leading-none mb-1">{lab.name}</h4>
              <div className="flex items-center gap-2 mt-2 pt-1 border-t border-slate-800">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-1">
                    <Zap className="w-2 h-2 text-amber-400" />
                    <span className="text-[8px] text-slate-400">SYNC LOAD: 2ms</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-2 h-2 text-emerald-400" />
                    <span className="text-[8px] text-slate-400">STATUS: VERIFIED</span>
                  </div>
                </div>
                <div className="bg-emerald-500/10 p-1 rounded">
                  <RefreshCw className="w-2 h-2 text-emerald-400 animate-spin-slow" />
                </div>
              </div>
            </div>

            {/* Simple Label (Persistent) */}
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-300 font-mono tracking-tighter whitespace-nowrap bg-slate-900/80 px-1.5 py-0.5 rounded backdrop-blur-sm border border-slate-800">
              {lab.country}
            </span>
          </motion.div>
        ))}

        {/* Global Statistics Floating Overlay */}
        <div className="absolute right-4 bottom-4 bg-[#0a0d14]/90 border border-slate-800 p-3 rounded-lg backdrop-blur-sm hidden md:block">
          <div className="space-y-3">
            <div>
              <span className="text-[8px] text-slate-500 font-bold block mb-1">AGGREGATE SYNC VELOCITY</span>
              <div className="flex items-end gap-2">
                <div className="text-xl font-bold text-white font-mono leading-none">12.4 GB/s</div>
                <div className="text-[9px] text-emerald-400 flex items-center gap-0.5 mb-0.5">
                  <TrendingUp className="w-3 h-3" />
                  +4.2%
                </div>
              </div>
            </div>
            <div className="h-px bg-slate-800" />
            <div className="flex items-center gap-4">
              <div>
                <span className="text-[8px] text-slate-500 font-bold block mb-0.5 uppercase">L7 Firewall</span>
                <span className="text-[10px] text-emerald-400 font-mono">ACTIVE</span>
              </div>
              <div>
                <span className="text-[8px] text-slate-500 font-bold block mb-0.5 uppercase">Relay Nodes</span>
                <span className="text-[10px] text-white font-mono">3 / 3</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend Footer */}
      <div className="mt-4 flex flex-wrap items-center gap-6 border-t border-slate-800/50 pt-4 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="text-[10px] text-slate-400 font-medium">B-3 Node Operational (Verified)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.8)]" />
          <span className="text-[10px] text-slate-400 font-medium">Live IQ Replication Stream</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-3 h-3 text-emerald-400" />
          <span className="text-[10px] text-slate-400 font-medium">Regional HQ Facility</span>
        </div>
        <div className="ml-auto">
          <button className="flex items-center gap-1.5 text-[9px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-tighter">
            <Share2 className="w-3 h-3" />
            Expand Global Graph
          </button>
        </div>
      </div>
    </div>
  );
};

const TrendingUp = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
);
