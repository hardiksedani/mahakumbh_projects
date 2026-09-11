"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/ui";
import { api, wsUrl } from "@/lib/api";

type SimStatus = {
  running: boolean;
  current_step: number;
  total_steps: number;
  major_snan_mode: boolean;
  message: string;
  event?: string;
};

const INJECT_BUTTONS = [
  { label: "Inject Fire", path: "/api/simulation/inject-fire", color: "bg-red-500/20 text-red-400" },
  { label: "Inject Crowd Surge", path: "/api/simulation/inject-crowd", color: "bg-orange-500/20 text-orange-400" },
  { label: "Inject Social Claim", path: "/api/simulation/inject-social-claim", color: "bg-blue-500/20 text-blue-400" },
  { label: "Inject Misinformation", path: "/api/simulation/inject-misinformation", color: "bg-pink-500/20 text-pink-400" },
  { label: "Inject Recycled Video", path: "/api/simulation/inject-recycled-video", color: "bg-gray-500/20 text-gray-400" },
  { label: "Inject Shelter Overflow", path: "/api/simulation/inject-shelter-overflow", color: "bg-emerald-500/20 text-emerald-400" },
];

export default function SimulationPage() {
  const [status, setStatus] = useState<SimStatus | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    try {
      const s = await api<SimStatus>("/api/simulation/status");
      setStatus(s);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    refresh();
    const ws = new WebSocket(wsUrl("/ws/incidents"));
    ws.onmessage = (ev) => {
      const data = JSON.parse(ev.data);
      if (data.type === "SIMULATION_STEP") {
        setLog((prev) => [`T+${data.step}: ${data.message}`, ...prev].slice(0, 20));
        refresh();
      }
    };
    return () => ws.close();
  }, [refresh]);

  const action = async (path: string) => {
    await api(path, { method: "POST" });
    setLog((prev) => [`Action: ${path.split("/").pop()}`, ...prev].slice(0, 20));
    refresh();
  };

  const progress = status ? ((status.current_step + 1) / status.total_steps) * 100 : 0;

  return (
    <div className="min-h-screen">
      <Header snanMode={status?.major_snan_mode} />
      <main className="max-w-[1000px] mx-auto p-4">
        <h1 className="text-xl font-bold mb-4">Major Snan Simulation Controls</h1>

        <div className="card mb-4">
          <div className="flex gap-3 mb-4">
            <button onClick={() => action("/api/simulation/start")} className="px-4 py-2 bg-orange-500 rounded-lg text-sm font-medium">Start Major Snan</button>
            <button onClick={() => action("/api/simulation/stop")} className="px-4 py-2 bg-white/10 rounded-lg text-sm">Pause</button>
            <button onClick={() => action("/api/simulation/reset")} className="px-4 py-2 bg-white/10 rounded-lg text-sm">Reset</button>
          </div>
          {status && (
            <>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-orange-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-sm">Step {status.current_step + 1}/{status.total_steps}: {status.message}</p>
              <p className="text-xs text-gray-400 mt-1">{status.running ? "Running" : "Stopped"} · Event: {status.event || "—"}</p>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
          {INJECT_BUTTONS.map((b) => (
            <button key={b.path} onClick={() => action(b.path)} className={`px-3 py-2 rounded-lg text-xs ${b.color}`}>
              {b.label}
            </button>
          ))}
        </div>

        <div className="card">
          <h2 className="font-semibold text-sm mb-3">Simulation Log</h2>
          <div className="space-y-1 max-h-[300px] overflow-y-auto font-mono text-xs text-gray-400">
            {log.length === 0 && <p>No events yet. Start the Major Snan simulation.</p>}
            {log.map((l, i) => <p key={i}>{l}</p>)}
          </div>
        </div>
      </main>
    </div>
  );
}
