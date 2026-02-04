
import React from 'react';
import { MapMarker } from '../types';
import { MapPin, Zap, Info } from 'lucide-react';

interface CoverageMapProps {
  userPos: { lat: number; lng: number } | null;
  markers: MapMarker[];
  explanation: string;
}

const CoverageMap: React.FC<CoverageMapProps> = ({ userPos, markers, explanation }) => {
  // We use an iframe to show the area if no full Map SDK is integrated, 
  // but we enhance it with our custom overlay.
  const mapUrl = userPos 
    ? `https://www.google.com/maps/embed/v1/view?key=${process.env.API_KEY}&center=${userPos.lat},${userPos.lng}&zoom=15&maptype=roadmap`
    : `https://www.google.com/maps/embed/v1/view?key=${process.env.API_KEY}&zoom=2&maptype=roadmap`;

  return (
    <div className="space-y-6">
      <div className="glass p-6 rounded-[40px] overflow-hidden relative">
        <div className="flex items-center justify-between mb-6">
            <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <MapPin className="text-rose-500" />
                    Signal Coverage Map
                </h2>
                <p className="text-slate-400 text-sm">Visualizing internet supply and high-speed zones nearby.</p>
            </div>
            <div className="flex gap-2">
                <div className="flex items-center gap-1 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-bold text-emerald-400">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    High Speed
                </div>
                <div className="flex items-center gap-1 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-bold text-amber-400">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    Medium
                </div>
            </div>
        </div>

        <div className="relative w-full h-[500px] rounded-3xl overflow-hidden border border-slate-700 bg-slate-900">
          {/* Simulated Signal Heatmap Overlay */}
          <div className="absolute inset-0 pointer-events-none z-10 opacity-30">
            <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-emerald-500 blur-[100px] rounded-full animate-pulse" />
            <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-indigo-500 blur-[120px] rounded-full" />
            <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-rose-500 blur-[80px] rounded-full animate-bounce" style={{ animationDuration: '5s' }} />
          </div>

          <iframe
            title="Coverage Map"
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(0.8) contrast(1.2)' }}
            src={mapUrl}
            allowFullScreen
          ></iframe>

          {/* User Location Marker (Simulated Overlay) */}
          {userPos && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                <div className="relative">
                    <div className="w-6 h-6 bg-indigo-500 rounded-full border-4 border-white shadow-lg animate-pulse" />
                    <div className="absolute inset-0 w-6 h-6 bg-indigo-400 rounded-full animate-ping opacity-50" />
                </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 space-y-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-2">Identified Hotspots</h3>
            {markers.length > 0 ? markers.map((m, i) => (
                <div key={i} className="glass p-4 rounded-2xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors group">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:scale-110 transition-transform">
                            {m.type === 'tower' ? <Zap className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                        </div>
                        <div>
                            <div className="text-sm font-bold text-slate-200">{m.title}</div>
                            <div className="text-xs text-slate-400 mt-1">{m.description}</div>
                        </div>
                    </div>
                </div>
            )) : (
                <div className="glass p-8 text-center rounded-2xl text-slate-500 italic text-sm">
                    Detecting nearby infrastructure...
                </div>
            )}
        </div>
        
        <div className="md:col-span-8">
            <div className="glass p-6 rounded-[32px] border-l-4 border-emerald-500 h-full">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Info className="w-5 h-5 text-emerald-400" />
                    Coverage Analysis
                </h3>
                <p className="text-slate-300 leading-relaxed text-sm">
                    {explanation || "Allow location access to see a detailed breakdown of internet supply lines and high-performance zones in your immediate area."}
                </p>
                <div className="mt-6 p-4 bg-slate-800/50 rounded-2xl">
                    <div className="text-xs font-bold text-indigo-400 uppercase mb-2">Network Health Tip</div>
                    <p className="text-xs text-slate-400">
                        Signal strength varies significantly based on elevation and physical obstructions. If you're seeing "Medium" coverage, try moving closer to a window or to a higher floor for a more direct line-of-sight to the nearest tower.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CoverageMap;
