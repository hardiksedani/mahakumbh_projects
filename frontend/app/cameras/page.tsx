"use client";

import { useEffect, useState } from "react";
import { Header, SeverityBadge } from "@/components/ui";
import { api, type Camera } from "@/lib/api";

export default function CamerasPage() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const q = filter === "all" ? "" : `?status=${filter}`;
    api<Camera[]>(`/api/cameras${q}`).then(setCameras).catch(console.error);
  }, [filter]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-[1200px] mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Camera Monitor</h1>
          <div className="flex gap-2">
            {["all", "online", "warning", "offline"].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded text-sm capitalize ${filter === f ? "bg-orange-500/20 text-orange-400" : "bg-white/5 text-gray-400"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {cameras.slice(0, 30).map((c) => (
            <div key={c.id} className="card">
              <div className="aspect-video bg-black/50 rounded-lg mb-2 flex items-center justify-center text-gray-500 text-xs">
                {c.stream_type === "simulated" ? "Simulated Feed" : c.stream_type.toUpperCase()}
              </div>
              <div className="flex justify-between">
                <span className="font-mono text-sm">{c.camera_code}</span>
                <SeverityBadge severity={c.status === "online" ? "INFO" : c.status === "warning" ? "WARNING" : "CRITICAL"} />
              </div>
              <div className="text-xs text-gray-400 mt-1">{c.latitude.toFixed(4)}, {c.longitude.toFixed(4)}</div>
            </div>
          ))}
        </div>
        <p className="text-gray-500 text-sm mt-4">Showing {Math.min(30, cameras.length)} of {cameras.length} cameras</p>
      </main>
    </div>
  );
}
