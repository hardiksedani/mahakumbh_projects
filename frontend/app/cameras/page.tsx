"use client";

import { useEffect, useState } from "react";
import { Header, SeverityBadge } from "@/components/ui";
import { CameraVisionModal } from "@/components/CameraVisionModal";
import { api, type Camera } from "@/lib/api";
import {
  Video,
  Radio,
  Eye,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Filter,
  Users,
} from "lucide-react";

export default function CamerasPage() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<any | null>(null);

  const fetchCameras = () => {
    setLoading(true);
    const q = filter === "all" ? "" : `?status=${filter}`;
    api<Camera[]>(`/api/cameras${q}`)
      .then(setCameras)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCameras();
  }, [filter]);

  const onlineCount = cameras.filter((c) => c.status === "online").length;
  const warningCount = cameras.filter((c) => c.status === "warning").length;

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                Optical Surveillance Grid
              </span>
              <span className="text-slate-500 text-xs font-mono">• Edge Jetson Nodes Active</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              CCTV Vision Intelligence & Optical Flow
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Real-time YOLOv8 head counts, ByteTrack trajectories, and Farnebäck dense optical flow turbulence detection across Godavari river sectors.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={fetchCameras}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl border border-slate-700 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-400" /> Refresh Feeds
            </button>
          </div>
        </div>

        {/* Filter and Telemetry Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-2.5 rounded-2xl">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 ml-2" />
            <span className="text-xs font-mono text-slate-400 font-bold uppercase mr-1">Status Filter:</span>
            {["all", "online", "warning", "offline"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold capitalize transition-all ${
                  filter === f
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs font-mono pr-2">
            <span className="text-slate-400">
              Total Grid: <strong className="text-white">{cameras.length}</strong>
            </span>
            <span className="text-emerald-400">
              Online: <strong>{onlineCount}</strong>
            </span>
            <span className="text-amber-400">
              Warning (Surge): <strong>{warningCount}</strong>
            </span>
          </div>
        </div>

        {/* Cameras Grid */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-mono text-xs">
            Connecting to edge video nodes...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {cameras.slice(0, 32).map((c) => {
              const isWarning = c.status === "warning";
              return (
                <div
                  key={c.id}
                  onClick={() =>
                    setSelectedCamera({
                      id: c.id,
                      camera_code: c.camera_code,
                      location_name: `Sector Lat: ${c.latitude.toFixed(4)}, Lon: ${c.longitude.toFixed(4)}`,
                      status: c.status,
                      crowd_count: isWarning ? 245 : 142,
                    })
                  }
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer group shadow-lg flex flex-col justify-between space-y-3 ${
                    isWarning
                      ? "bg-amber-950/20 border-amber-500/40 hover:border-amber-400"
                      : "bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-slate-800/90 hover:border-blue-500/40"
                  }`}
                >
                  <div className="space-y-2">
                    {/* Simulated Screen Thumbnail */}
                    <div className="relative aspect-video w-full rounded-xl bg-slate-950 overflow-hidden border border-slate-800 flex items-center justify-center">
                      <div className="absolute top-2 left-2 flex items-center gap-1.5 font-mono text-[9px] text-emerald-400 bg-black/70 px-1.5 py-0.5 rounded">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        LIVE ● 1080p
                      </div>

                      <div className="absolute top-2 right-2 font-mono text-[9px] text-slate-400 bg-black/70 px-1.5 py-0.5 rounded">
                        YOLOv8n
                      </div>

                      {/* Video Reticle Effect */}
                      <Video className="w-6 h-6 text-slate-700 group-hover:text-blue-400 group-hover:scale-110 transition-all" />

                      {isWarning && (
                        <div className="absolute inset-0 bg-amber-500/10 border-2 border-amber-500/40 rounded-xl pointer-events-none animate-pulse" />
                      )}

                      <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[10px] font-mono text-slate-300 bg-black/80 px-2 py-1 rounded">
                        <span>Est: {isWarning ? "245/m² (SURGE)" : "142/m²"}</span>
                        <span className="text-orange-400">Flow: {isWarning ? "TURBULENT" : "STABLE"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                        {c.camera_code}
                      </span>
                      <SeverityBadge
                        severity={c.status === "online" ? "INFO" : c.status === "warning" ? "WARNING" : "CRITICAL"}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Inspect Vision Feed</span>
                    <Eye className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Camera AI Vision Modal */}
      {selectedCamera && (
        <CameraVisionModal camera={selectedCamera} onClose={() => setSelectedCamera(null)} />
      )}
    </div>
  );
}
