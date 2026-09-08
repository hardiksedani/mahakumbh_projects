"use client";

import { X, Camera, ShieldAlert, Eye, Users, AlertTriangle } from "lucide-react";

export function CameraVisionModal({
  camera,
  onClose,
}: {
  camera: { id: string; camera_code: string; location_name?: string; status: string; crowd_count?: number };
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl space-y-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="font-mono text-sm font-bold text-orange-400">{camera.camera_code}</span>
            <span className="text-xs text-slate-300">({camera.location_name || "Ram Kund Main Sector"})</span>
            <span className="badge-saffron">YOLO v8 Vision AI Analytics</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Screen Simulation with Bounding Boxes */}
        <div className="relative w-full h-[400px] bg-slate-950 flex items-center justify-center overflow-hidden">
          {/* Background Grid Pattern simulating CCTV Feed */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(#334155 1px, transparent 1px), linear-gradient(to right, #1e293b 1px, transparent 1px)",
              backgroundSize: "20px 20px, 40px 40px",
            }}
          />

          {/* Simulated CCTV Stream Overlay */}
          <div className="absolute top-4 left-4 font-mono text-xs text-emerald-400 bg-black/60 px-2 py-1 rounded border border-emerald-500/40">
            REC ● 1080p 60FPS | AI VISION: ACTIVE
          </div>

          <div className="absolute top-4 right-4 font-mono text-xs text-orange-400 bg-black/60 px-2 py-1 rounded border border-orange-500/40">
            Est. Crowd: {camera.crowd_count ?? 142} heads/m²
          </div>

          {/* YOLO Bounding Box Simulations */}
          <div className="absolute top-1/4 left-1/3 w-32 h-44 border-2 border-emerald-400/80 bg-emerald-500/10 rounded flex flex-col justify-between p-1">
            <span className="font-mono text-[10px] bg-emerald-500 text-black font-bold px-1 rounded w-max">
              Person 98%
            </span>
            <span className="font-mono text-[9px] text-emerald-300 bg-black/70 px-1 rounded">
              Velocity: Normal
            </span>
          </div>

          <div className="absolute bottom-1/4 right-1/3 w-28 h-36 border-2 border-amber-400/80 bg-amber-500/10 rounded flex flex-col justify-between p-1">
            <span className="font-mono text-[10px] bg-amber-500 text-black font-bold px-1 rounded w-max">
              Person 92%
            </span>
            <span className="font-mono text-[9px] text-amber-300 bg-black/70 px-1 rounded">
              Density Spike
            </span>
          </div>

          {/* Smoke/Fire Hazard Warning Box */}
          <div className="absolute top-1/3 right-1/4 w-40 h-24 border-2 border-red-500 bg-red-500/20 rounded flex flex-col justify-between p-1 animate-pulse">
            <span className="font-mono text-[10px] bg-red-600 text-white font-bold px-1 rounded w-max flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Campfire Smoke Alert
            </span>
            <span className="font-mono text-[9px] text-red-200 bg-black/80 px-1 rounded">
              Hazard Risk: HIGH
            </span>
          </div>

          {/* Radar Scanline Effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent opacity-50 animate-radar pointer-events-none" />
        </div>

        {/* Footer Metrics */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-950 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <Users className="w-5 h-5 text-orange-400" />
            <div>
              <div className="text-slate-400">Crowd Density Index</div>
              <div className="font-bold text-slate-100">8.4 / 10 (HIGH)</div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <div>
              <div className="text-slate-400">Stampede Panic Vector</div>
              <div className="font-bold text-emerald-400">LOW (Stable Flow)</div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <Eye className="w-5 h-5 text-blue-400" />
            <div>
              <div className="text-slate-400">Lost Person Radar</div>
              <div className="font-bold text-amber-400">Scanning Active</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
