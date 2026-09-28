"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/ui";
import { api, wsUrl } from "@/lib/api";
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

interface ScenarioItem {
  id: string;
  title: string;
  category: string;
  description: string;
}

const INJECT_BUTTONS = [
  { label: "1. Inject Thermal Fire", path: "/api/simulation/inject-fire", color: "bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30" },
  { label: "2. Inject Crowd Surge", path: "/api/simulation/inject-crowd", color: "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border-orange-500/30" },
  { label: "3. Inject Stampede Rumor", path: "/api/simulation/inject-misinformation", color: "bg-pink-500/20 text-pink-400 hover:bg-pink-500/30 border-pink-500/30" },
  { label: "4. Inject Recycled Video", path: "/api/simulation/inject-recycled-video", color: "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border-amber-500/30" },
  { label: "5. Inject Bridge Bottleneck", path: "/api/simulation/inject-crowd", color: "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border-purple-500/30" },
  { label: "6. Inject Shelter Overflow", path: "/api/simulation/inject-shelter-overflow", color: "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-emerald-500/30" },
  { label: "7. Inject Social Geotag Claim", path: "/api/simulation/inject-social-claim", color: "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-blue-500/30" },
];

export default function SimulationPage() {
  const [status, setStatus] = useState<SimStatus | null>(null);
  const [scenarios, setScenarios] = useState<ScenarioItem[]>([]);
  const [selectedScenario, setSelectedScenario] = useState("MAJOR_SNAN_CANONICAL");
  const [speed, setSpeed] = useState<number>(1.0);
  const [log, setLog] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    try {
      const s = await api<SimStatus>("/api/simulation/status");
      setStatus(s);
      if (s.speed_multiplier) setSpeed(s.speed_multiplier);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    refresh();
    fetch("http://localhost:8000/api/simulation/scenarios")
      .then((r) => r.json())
      .then((data) => {
        if (data.scenarios) setScenarios(data.scenarios);
      })
      .catch(console.error);

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
    await api(path, { method: "POST" });
    setLog((prev) => [`Manual Trigger: ${path.split("/").pop()}`, ...prev].slice(0, 30));
    refresh();
  };

  const handleSetSpeed = async (mult: number) => {
    setSpeed(mult);
    await fetch(`http://localhost:8000/api/simulation/speed?multiplier=${mult}`, { method: "POST" });
    refresh();
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
              Simhastha Kumbh Multi-Scenario Simulation Lab
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              11 distinct operational stress scenarios with live speed multiplier, pause/resume, and real-time WebSocket telemetry.
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
                className={`px-2.5 py-1 rounded-lg font-mono font-bold transition-all ${
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
                  <span>Simhastha Nashik 3D Digital Twin & Spatial Portal Navigator</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    INTERACTIVE THREE.JS
                  </span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  Real-time 3D simulation of Godavari River, Ramkund Sacred Ghat, Laxman Jhula, Sadhu Gram, and Tapovan with interactive portal hotspots.
                </p>
              </div>
            </div>
          </div>

          <KumbhDigitalTwin3D />
        </section>

        {/* Master Control Card */}
        <div className="card space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleAction("/api/simulation/start")}
                disabled={status?.running && !status?.paused}
                className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-600/20 transition-all"
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
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-all"
                >
                  <Pause className="w-3.5 h-3.5" /> Pause
                </button>
              )}

              <button
                onClick={() => handleAction("/api/simulation/reset")}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Timeline
              </button>
            </div>

            {/* Scenario Selector Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 whitespace-nowrap">Active Scenario:</span>
              <select
                value={selectedScenario}
                onChange={(e) => setSelectedScenario(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-orange-400 font-semibold rounded-xl px-3 py-2 outline-none"
              >
                {scenarios.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.title}
                  </option>
                ))}
              </select>
            </div>
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
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-400" /> Interactive Event Injections (Pitch & Demo)
            </h2>
            <span className="text-xs font-mono text-slate-400">Trigger live multi-source AI handling</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {INJECT_BUTTONS.map((btn) => (
              <button
                key={btn.path}
                onClick={() => handleAction(btn.path)}
                className={`p-3 rounded-xl border text-xs font-semibold transition-all text-left flex items-center justify-between shadow-sm ${btn.color}`}
              >
                <span>{btn.label}</span>
                <Zap className="w-3.5 h-3.5 shrink-0 opacity-80" />
              </button>
            ))}
          </div>
        </div>

        {/* Live Simulation Event Log */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" /> Real-time Simulation Event Telemetry Log
            </h2>
            <span className="text-xs font-mono text-slate-400">{log.length} Events Logged</span>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs space-y-1.5 max-h-[300px] overflow-y-auto">
            {log.length === 0 ? (
              <p className="text-slate-500 text-center py-4">
                No events logged yet. Click &apos;Start Simulation&apos; or trigger an injection button above.
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
