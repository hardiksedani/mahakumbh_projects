"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/ui";
import { wsUrl } from "@/lib/api";
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  Flame,
  Users,
  Radio,
  FileVideo,
  Home,
  AlertTriangle,
  Compass,
  FastForward,
  Layers,
  Sparkles,
  Box,
} from "lucide-react";

const KumbhDigitalTwin3D = dynamic(
  () => import("@/components/KumbhDigitalTwin3D").then((mod) => mod.KumbhDigitalTwin3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[620px] rounded-2xl border border-slate-800 bg-[#070A11] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
        <div className="text-xs font-mono text-slate-400">Loading Simhastha 2027 3D Digital Twin Simulation...</div>
      </div>
    ),
  }
);

type SimStatus = {
  running: boolean;
  paused?: boolean;
  speed_multiplier?: number;
  current_step: number;
  total_steps: number;
  major_snan_mode: boolean;
  message: string;
  event?: string;
  active_scenario?: string;
};

const INJECT_BUTTONS = [
  { label: "1. Inject Thermal Fire", path: "/api/simulation/inject-fire", color: "bg-[#f4d8d2] text-[#852f2b] hover:bg-[#efd0c9] border-[#d9a59b]" },
  { label: "2. Inject Crowd Surge", path: "/api/simulation/inject-crowd", color: "bg-[#f5e2cc] text-[#805017] hover:bg-[#f0d8bb] border-[#dec09b]" },
  { label: "3. Inject Stampede Rumor", path: "/api/simulation/inject-misinformation", color: "bg-[#f2dce8] text-[#7e2f5b] hover:bg-[#eacbdd] border-[#dcb5c9]" },
  { label: "4. Inject Recycled Video", path: "/api/simulation/inject-recycled-video", color: "bg-[#f4e8c8] text-[#73541a] hover:bg-[#eddcad] border-[#d9c48a]" },
  { label: "5. Inject Bridge Bottleneck", path: "/api/simulation/inject-crowd", color: "bg-[#e6dff3] text-[#503a79] hover:bg-[#d9cce9] border-[#c4b4dc]" },
  { label: "6. Inject Shelter Overflow", path: "/api/simulation/inject-shelter-overflow", color: "bg-[#d7ede5] text-[#205f50] hover:bg-[#c8e3d8] border-[#a8d2c2]" },
  { label: "7. Inject Social Geotag Claim", path: "/api/simulation/inject-social-claim", color: "bg-[#dceaf4] text-[#254f73] hover:bg-[#cbdfee] border-[#adcbde]" },
];

export default function SimulationPage() {
  const [status, setStatus] = useState<SimStatus | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [speed, setSpeed] = useState<number>(1.0);
  const [log, setLog] = useState<string[]>([]);

  const requestSimulation = useCallback(async <T,>(path: string, options?: RequestInit): Promise<T> => {
    const configured = process.env.NEXT_PUBLIC_API_URL;
    const base = configured || (window.location.hostname === "localhost" ? "http://localhost:8000" : "");
    if (!base) throw new Error("Simulation backend is not configured for this deployment.");
    const response = await fetch(`${base}${path}`, { ...options, cache: "no-store" });
    if (!response.ok) throw new Error(`Simulation backend returned ${response.status}.`);
    return response.json() as Promise<T>;
  }, []);

  const refresh = useCallback(async () => {
    try {
      const s = await requestSimulation<SimStatus>("/api/simulation/status");
      setStatus(s);
      setBackendError(null);
      if (s.speed_multiplier) setSpeed(s.speed_multiplier);
    } catch (error) {
      setStatus(null);
      setBackendError(error instanceof Error ? error.message : "Simulation backend is unavailable.");
    }
  }, [requestSimulation]);

  useEffect(() => {
    refresh();
    if (!process.env.NEXT_PUBLIC_API_URL && window.location.hostname !== "localhost") return;
    const ws = new WebSocket(wsUrl("/ws/incidents"));
    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data.type === "SIMULATION_STEP") {
          setLog((prev) => [`[T+${data.step} min] ${data.message} (${data.event})`, ...prev].slice(0, 30));
          refresh();
        }
      } catch (err) {
        console.error(err);
      }
    };
    return () => ws.close();
  }, [refresh]);

  const handleAction = async (path: string) => {
    try {
      await requestSimulation(path, { method: "POST" });
      setBackendError(null);
      setLog((prev) => [`Demo action: ${path.split("/").pop()}`, ...prev].slice(0, 30));
      await refresh();
    } catch (error) {
      setBackendError(error instanceof Error ? error.message : "Simulation action failed.");
    }
  };

  const handleSetSpeed = async (mult: number) => {
    try {
      await requestSimulation(`/api/simulation/speed?multiplier=${mult}`, { method: "POST" });
      setSpeed(mult);
      setBackendError(null);
      await refresh();
    } catch (error) {
      setBackendError(error instanceof Error ? error.message : "Could not change simulation speed.");
    }
  };

  const progress = status ? ((status.current_step + 1) / status.total_steps) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 flex flex-col">
      <Header snanMode={status?.major_snan_mode} />

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge-saffron flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> Simulation Lab
              </span>
              <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                DEMO / SIMULATED ENVIRONMENT
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-1">
              Explore Nashik–Trimbakeshwar in 3D
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Locate the ghats and important areas, understand each project portal, and then try the separate demo event controls.
            </p>
          </div>

          {/* Speed Multiplier Controls */}
          <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-mono text-[10px] px-2 flex items-center gap-1">
              <FastForward className="w-3 h-3" /> SPEED:
            </span>
            {[0.5, 1.0, 2.0, 5.0].map((m) => (
              <button
                key={m}
                onClick={() => handleSetSpeed(m)}
                disabled={!status}
                title={!status ? "Start the demo backend to change timeline speed" : undefined}
                className={`px-2.5 py-1 rounded-lg font-mono font-bold transition-all disabled:cursor-not-allowed disabled:bg-[#dce8e2] disabled:text-[#34565a] ${
                  speed === m
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {m}x
              </button>
            ))}
          </div>
        </div>

        {/* Three.js 3D Digital Twin Centerpiece */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
                <Box className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Interactive place and portal guide</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    INTERACTIVE THREE.JS
                  </span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  Two separate illustrative views: Nashik riverfront and Trimbakeshwar town. Select a marker or use the place list to open its related portal.
                </p>
              </div>
            </div>
          </div>

          <KumbhDigitalTwin3D activeEvent={status?.event} isRunning={status?.running && !status?.paused} />
        </section>

        <p className="text-xs leading-relaxed text-slate-400">Landmarks were checked against Nashik district tourism pages for <a className="font-semibold text-[#17656a] hover:underline" href="https://nashik.gov.in/en/tourist-place/ramkund-nashik/" target="_blank" rel="noreferrer">Ramkund</a>, <a className="font-semibold text-[#17656a] hover:underline" href="https://nashik.gov.in/en/tourist-place/kushavart-tirtha-trimbakeshwar/" target="_blank" rel="noreferrer">Kushavart Tirtha</a>, and <a className="font-semibold text-[#17656a] hover:underline" href="https://nashik.gov.in/en/tourism/places-of-interest/" target="_blank" rel="noreferrer">Trimbakeshwar temple</a>. Geometry, pins, and facility examples are schematic. Do not use this view for real travel, crowd, or emergency decisions.</p>

        {backendError && <div role="status" className="flex items-start gap-3 rounded-xl border border-[#dba849] bg-[#fff1cc] px-4 py-3 text-sm text-[#65451d] shadow-[0_5px_18px_rgba(102,69,29,.08)]"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /><span><strong className="block font-bold">3D place guide is ready</strong>Timeline and event controls are offline. Connect the demo backend to use them.</span></div>}

        {/* Master Control Card */}
        <div className="card sim-master space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleAction("/api/simulation/start")}
                disabled={!status || (status.running && !status.paused)}
                className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-[#dce8e2] disabled:text-[#34565a] disabled:shadow-none text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-600/20 transition-all"
              >
                <Play className="w-3.5 h-3.5" /> Start Simulation
              </button>

              {status?.paused ? (
                <button
                  onClick={() => handleAction("/api/simulation/resume")}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all"
                >
                  <Play className="w-3.5 h-3.5" /> Resume
                </button>
              ) : (
                <button
                  onClick={() => handleAction("/api/simulation/pause")}
                  disabled={!status?.running}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-[#dce8e2] disabled:text-[#34565a] text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-all"
                >
                  <Pause className="w-3.5 h-3.5" /> Pause
                </button>
              )}

              <button
                onClick={() => handleAction("/api/simulation/reset")}
                disabled={!status}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-[#dce8e2] disabled:text-[#34565a] text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Timeline
              </button>
            </div>

            <span className="text-xs text-slate-400">{status ? `${status.total_steps}-step` : "Demo"} timeline · simulated event data</span>
          </div>

          {/* Progress Timeline Stepper */}
          {status && (
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 font-bold">
                  Step {status.current_step + 1} of {status.total_steps}: {status.message}
                </span>
                <span className="text-amber-400">
                  {status.running ? (status.paused ? "PAUSED" : "ACTIVE LIVE STREAM") : "IDLE"} · {speed}x Speed
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 11 Scenario Injections Grid */}
        <div className="space-y-4 rounded-2xl border border-[#b8cfc5] bg-[#dbe9e2] p-5 md:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-400" /> Interactive Event Injections (Pitch & Demo)
            </h2>
            <span className="text-xs font-semibold text-[#34565a]">{status ? "Connected · demo events only" : "Demo event controls require the backend"}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {INJECT_BUTTONS.map((btn) => (
              <button
                key={btn.label}
                onClick={() => handleAction(btn.path)}
                disabled={!status}
                title={!status ? "Start the demo backend to inject an event" : undefined}
                className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between shadow-sm disabled:cursor-not-allowed ${btn.color}`}
              >
                <span>{btn.label}</span>
                <Zap className="w-3.5 h-3.5 shrink-0 opacity-80" />
              </button>
            ))}
          </div>
        </div>

        {/* Live Simulation Event Log */}
        <div className="card sim-telemetry space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" /> Real-time Simulation Event Telemetry Log
            </h2>
            <span className="text-xs font-mono text-slate-400">{log.length} Events Logged</span>
          </div>

          <div className="sim-telemetry-log p-4 rounded-xl border font-mono text-xs space-y-1.5 max-h-[300px] overflow-y-auto">
            {log.length === 0 ? (
              <p className="text-slate-500 text-center py-4">
                {status ? "No events logged yet. Start the simulation or trigger a demo event above." : "Event telemetry requires the demo backend. The 3D place guide above remains available."}
              </p>
            ) : (
              log.map((item, idx) => (
                <div key={idx} className="text-slate-300 border-b border-slate-900/80 pb-1 flex items-start gap-2">
                  <span className="text-orange-400 shrink-0">●</span>
                  <span>{item}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
