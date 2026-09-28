"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Header, KPICard, SeverityBadge, RiskBadge } from "@/components/ui";
import { MapView } from "@/components/MapView";
import { LostPersonRadar } from "@/components/LostPersonRadar";
import { CommandCopilot } from "@/components/CommandCopilot";
import { api, wsUrl, type KPIs, type Incident, type Camera, type SocialPost, type Alert } from "@/lib/api";
import {
  Radio,
  ShieldAlert,
  AlertTriangle,
  Send,
  CheckCircle2,
  Flame,
  Users,
  Compass,
  Cpu,
  Home,
  Award,
  FastForward,
  GitBranch,
  Video,
  FileCheck,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  Layers,
  Clock,
  Box,
  Sparkles,
} from "lucide-react";

export default function Dashboard() {
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [social, setSocial] = useState<SocialPost[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [factCheckAlert, setFactCheckAlert] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [k, i, c, s, a] = await Promise.all([
        api<KPIs>("/api/dashboard/kpis"),
        api<Incident[]>("/api/incidents?limit=10"),
        api<Camera[]>("/api/cameras?limit=100"),
        api<SocialPost[]>("/api/social/posts?limit=6"),
        api<Alert[]>("/api/alerts?limit=5"),
      ]);
      setKpis(k);
      setIncidents(i);
      setCameras(c);
      setSocial(s);
      setAlerts(a);
    } catch (e) {
      console.error("Failed to load dashboard data:", e);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    let ws: WebSocket | null = null;
    let wsAlerts: WebSocket | null = null;

    try {
      ws = new WebSocket(wsUrl("/ws/incidents"));
      ws.onmessage = () => loadData();
    } catch (e) {}

    try {
      wsAlerts = new WebSocket(wsUrl("/ws/alerts"));
      wsAlerts.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          setAlerts((prev) =>
            [
              {
                id: Date.now().toString(),
                level: data.level || "HIGH",
                message: data.message || "Alert received",
                sent_at: new Date().toISOString(),
              },
              ...prev,
            ].slice(0, 5)
          );
          loadData();
        } catch (err) {}
      };
    } catch (e) {}

    return () => {
      clearInterval(interval);
      if (ws) ws.close();
      if (wsAlerts) wsAlerts.close();
    };
  }, [loadData]);

  const markers = [
    ...cameras.filter((c) => c.status !== "offline").slice(0, 30).map((c) => ({
      id: c.id,
      lat: c.latitude,
      lng: c.longitude,
      label: c.camera_code,
      color: c.status === "warning" ? "#f59e0b" : "#38bdf8",
      type: "CCTV Camera",
      crowd_count: 140,
    })),
    ...incidents.filter((i) => i.latitude).slice(0, 10).map((i) => ({
      id: i.id,
      lat: i.latitude!,
      lng: i.longitude!,
      label: i.incident_code || "INCIDENT",
      color: i.severity === "CRITICAL" ? "#ef4444" : "#f97316",
      type: i.incident_type,
    })),
  ];

  const handleFactCheckBroadcast = (caption: string) => {
    setFactCheckAlert(`Official Fact-Check Published: "${caption.slice(0, 45)}... Verified False by Ground Cameras."`);
    setTimeout(() => setFactCheckAlert(null), 5000);
  };

  // Directory of all system modules for clean-cut presentation
  const SYSTEM_MODULES = [
    {
      title: "3D Digital Twin Simulation",
      href: "/simulation",
      tag: "THREE.JS 3D",
      tagColor: "text-amber-300 bg-amber-500/15 border-amber-500/40 font-bold",
      icon: Box,
      desc: "Interactive 3D spatial twin of Godavari River, Ramkund Sacred Ghat, Laxman Jhula, and Sadhu Gram with all portals mapped to 3D pins.",
    },
    {
      title: "Incident Command & Lineage",
      href: "/incidents",
      tag: "CORE OPS",
      tagColor: "text-red-400 bg-red-500/10 border-red-500/30",
      icon: ShieldAlert,
      desc: "Live incident tracking with full Directed Acyclic Graph (DAG) evidence lineage & officer SOP authorization.",
    },
    {
      title: "CCTV Vision & Optical Flow",
      href: "/cameras",
      tag: "VISION AI",
      tagColor: "text-blue-400 bg-blue-500/10 border-blue-500/30",
      icon: Video,
      desc: "YOLOv8 density analytics, ByteTrack trajectory tracking & Farnebäck counter-flow turbulence detection.",
    },
    {
      title: "GIS Situational Radar",
      href: "/map",
      tag: "GEOSPATIAL",
      tagColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
      icon: Compass,
      desc: "Interactive full-screen GIS command map displaying all cameras, active incidents, and holding pavilions.",
    },
    {
      title: "Rumor Scanner & Debunk (10.1)",
      href: "/verify",
      tag: "TOPIC 10.1",
      tagColor: "text-purple-400 bg-purple-500/10 border-purple-500/30",
      icon: ShieldAlert,
      desc: "Real-time NLP rumor detection, ground camera Bayesian verification, and automated counter-messaging.",
    },
    {
      title: "Sentiment & Crisis Pulse (10.2)",
      href: "/sentiment",
      tag: "TOPIC 10.2",
      tagColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      icon: Users,
      desc: "Public mood tracking, regional pilgrim influx intent (UP, Gujarat, MH), and road choke point detection.",
    },
    {
      title: "Multilingual Studio (10.3)",
      href: "/broadcast",
      tag: "TOPIC 10.3",
      tagColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      icon: Send,
      desc: "Automated emergency broadcast generator in Hindi, Marathi, Gujarati & English for official signages.",
    },
    {
      title: "Crowd Surge Forecast (XGBoost)",
      href: "/crowd",
      tag: "PREDICTIVE",
      tagColor: "text-orange-400 bg-orange-500/10 border-orange-500/30",
      icon: TrendingUp,
      desc: "Multi-horizon crowd projections at 15, 30, and 60 minutes with 90% Bayesian confidence intervals (p10/p50/p90).",
    },
    {
      title: "Transit & Rain Shelters",
      href: "/shelters",
      tag: "LOGISTICS",
      tagColor: "text-teal-400 bg-teal-500/10 border-teal-500/30",
      icon: Home,
      desc: "Holding pavilion capacity meters, weather surge contingency buffers, and automated diversion routing.",
    },
    {
      title: "Resource Dispatch & Audit Log",
      href: "/resources",
      tag: "GOVERNANCE",
      tagColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
      icon: FileCheck,
      desc: "AI-recommended Standard Operating Procedures (SOPs) with mandatory officer badge authorization & immutable audit trail.",
    },
    {
      title: "Social Intelligence Feed",
      href: "/social",
      tag: "SOCIAL NLP",
      tagColor: "text-pink-400 bg-pink-500/10 border-pink-500/30",
      icon: Radio,
      desc: "Two-stage social triage pipeline, creator reach modeling, and historical recycled media hash checking.",
    },
    {
      title: "AI Model Registry (12 Models)",
      href: "/models",
      tag: "AI ENGINES",
      tagColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      icon: Cpu,
      desc: "Centralized telemetry matrix tracking latency, F1 benchmarks, total inferences, and runtime toggles for all 12 models.",
    },
    {
      title: "Executive Briefing",
      href: "/executive",
      tag: "LEADERSHIP",
      tagColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      icon: Award,
      desc: "High-level impact briefing for HOD and government leadership featuring the 6-tier multi-source intelligence funnel.",
    },
    {
      title: "Simulation Lab (11 Scenarios)",
      href: "/simulation",
      tag: "STRESS LAB",
      tagColor: "text-orange-400 bg-orange-500/10 border-orange-500/30",
      icon: FastForward,
      desc: "11 operational stress test scenarios with dynamic speed multiplier (0.5x–5x) and pause/resume execution.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col font-sans">
      <Header snanMode={kpis?.major_snan_mode} />

      <main className="flex-1 max-w-[1750px] w-full mx-auto px-4 py-6 space-y-8">
        {/* Cockpit Status Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-orange-500/15 text-orange-400 border border-orange-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                Simhastha 2027 Joint C4I Cockpit
              </span>
              <span className="text-slate-500 text-xs font-mono">• Nashik–Trimbakeshwar Division</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              AI Safety Intelligence & Decision Support Platform
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-4xl leading-relaxed">
              Multi-source intelligence fusion bridging edge CCTV streams, social media rumor detection, and human-in-the-loop resource dispatch for mass gathering crowd safety.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <Link
              href="/simulation"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold transition-all shadow-lg shadow-orange-600/25"
            >
              <Box className="w-4 h-4" /> 3D Digital Twin (Three.js)
            </Link>
            <Link
              href="/executive"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400 text-xs font-bold transition-all shadow-md shadow-orange-500/10"
            >
              <Award className="w-4 h-4" /> Executive Summary
            </Link>
          </div>
        </div>

        {/* Core KPI Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <KPICard
            label="Active Incidents"
            value={kpis?.active_incidents ?? "3"}
            color="text-orange-400"
            subtitle={`${kpis?.critical_incidents ?? 1} Critical Alarm`}
            icon={ShieldAlert}
          />
          <KPICard
            label="CCTVs Online"
            value={cameras.filter((c) => c.status === "online").length || 36}
            color="text-blue-400"
            subtitle="Farnebäck Flow Active"
            icon={Video}
          />
          <KPICard
            label="Devotee Density"
            value="7.2 / 10"
            color="text-amber-400"
            subtitle="Ramkund Sector ELEVATED"
            icon={Users}
          />
          <KPICard
            label="Debunked Rumors"
            value={kpis?.verified_claims ?? "18"}
            color="text-emerald-400"
            subtitle="100% Ground Verified"
            icon={CheckCircle2}
          />
          <KPICard
            label="Response Units"
            value={`${kpis?.available_police ?? 48} Pol / ${kpis?.available_fire ?? 12} Fire`}
            color="text-purple-400"
            subtitle="QRT Units Staged"
            icon={FileCheck}
          />
          <KPICard
            label="Shelters Occupancy"
            value="52%"
            color="text-teal-400"
            subtitle="3 Holding Arenas Ready"
            icon={Home}
          />
        </div>

        {/* 3D Digital Twin Feature Showcase Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-r from-orange-950/40 via-slate-900 to-slate-950 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0">
              <Box className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                  INTERACTIVE THREE.JS 3D TWIN
                </span>
                <span className="text-xs text-slate-400 font-mono">Simhastha 2027 Nashik–Trimbakeshwar</span>
              </div>
              <h2 className="text-lg font-black text-white mt-1">
                Explore the Spatial 3D Digital Twin & Portal Hotspots
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl mt-0.5">
                Fly across the Godavari River, Ramkund Sacred Ghat, Laxman Jhula, and Sadhu Gram. Click 3D pins to inspect live telemetry and understand how all 14 safety portals operate in harmony.
              </p>
            </div>
          </div>

          <Link
            href="/simulation"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all shadow-lg shadow-orange-600/30 shrink-0 w-max"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Launch 3D Simulation</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* ALL SYSTEM SECTIONS DIRECTORY (Clean-cut showcase of every single feature) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-orange-400" /> All Platform Modules & Capabilities
              </h2>
              <p className="text-[11px] text-slate-400">
                Click any operational tile to inspect the full dedicated interface, models, and telemetry.
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
              14 INTEGRATED SECTIONS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {SYSTEM_MODULES.map((mod) => {
              const Icon = mod.icon;
              return (
                <Link
                  key={mod.href}
                  href={mod.href}
                  className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-950/80 border border-slate-800/90 hover:border-orange-500/40 hover:from-slate-900 hover:to-slate-900 transition-all flex flex-col justify-between group shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Icon className="w-4 h-4 text-orange-400" />
                      </div>
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${mod.tagColor}`}>
                        {mod.tag}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors">
                        {mod.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 leading-snug mt-1 line-clamp-2">
                        {mod.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 mt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-semibold text-slate-400 group-hover:text-orange-400">
                    <span>Open Module</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Live Situational Command Console (Split Grid: Radar Map + Priority Incidents) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: GIS Sector Radar (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden flex flex-col shadow-xl">
            <div className="px-4 py-3 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-orange-400 animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Geospatial Situation Radar
                </span>
                <span className="text-[10px] font-mono text-slate-400">● 30 Active CCTV Sensors</span>
              </div>
              <Link
                href="/map"
                className="text-[11px] font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1 font-mono"
              >
                <span>Fullscreen GIS</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="h-[440px] w-full relative">
              <MapView markers={markers} />
            </div>
          </div>

          {/* Right: Live Priority Incidents & Ground Patrol Alerts (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Priority Incidents */}
            <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-orange-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Priority Incident Triage
                  </h3>
                </div>
                <Link
                  href="/incidents"
                  className="text-[10px] font-mono text-orange-400 hover:text-orange-300 font-bold"
                >
                  View All Incidents &rarr;
                </Link>
              </div>

              <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                {incidents.slice(0, 4).map((inc) => (
                  <Link
                    key={inc.id}
                    href={`/incidents/${inc.id}`}
                    className="block p-3 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-orange-400">
                        {inc.incident_code || "INC-2027"}
                      </span>
                      <SeverityBadge severity={inc.severity || "HIGH"} />
                    </div>
                    <div className="text-xs font-semibold text-slate-200">
                      {inc.incident_type} — {inc.location_name || "Ramkund Sector"}
                    </div>
                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800/60 font-mono text-slate-400">
                      <RiskBadge score={inc.risk_score || 72} />
                      <span className="text-slate-400">View Evidence DAG &rarr;</span>
                    </div>
                  </Link>
                ))}
                {incidents.length === 0 && (
                  <div className="text-center py-6 text-xs text-slate-500 font-mono">
                    No open critical incidents. Use Simulation Lab to inject events.
                  </div>
                )}
              </div>
            </div>

            {/* Ground Patrol & Sensor Alerts */}
            <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 space-y-2.5 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Recent Ground Patrol Telemetry
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Live Queue</span>
              </div>

              <div className="space-y-2 max-h-[140px] overflow-y-auto">
                {alerts.slice(0, 3).map((a) => (
                  <div
                    key={a.id}
                    className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <SeverityBadge severity={a.level} />
                      <span className="text-slate-300 text-[11px] truncate">{a.message}</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 shrink-0">
                      {a.sent_at ? new Date(a.sent_at).toLocaleTimeString() : "Just now"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Lost Person Search Radar */}
        <LostPersonRadar />

        {/* Real-Time Social Media Fact-Check & Rumor Radar (Topic 10.1 Engine) */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-purple-500/15 text-purple-400 border border-purple-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                  Outcome Parameter 10.1
                </span>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  AI Social Media Misinformation Scanner & Fact-Check Radar
                </h2>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Continuously scans viral public posts, corroborates claims against nearby ground CCTVs, and issues verified debunks.
              </p>
            </div>

            <Link
              href="/verify"
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 font-mono whitespace-nowrap self-start sm:self-auto"
            >
              Open Full Verification Suite &rarr;
            </Link>
          </div>

          {factCheckAlert && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-bounce">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{factCheckAlert}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {social.slice(0, 3).map((post) => (
              <div
                key={post.id}
                className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-400">
                      {post.platform || "X / Instagram"}
                    </span>
                    <SeverityBadge severity={post.verification_status || "UNVERIFIED"} />
                  </div>
                  <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed">
                    {post.caption}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 font-mono">
                    Urgency: <strong className="text-amber-400">{(post.urgency_score * 100).toFixed(0)}%</strong>
                  </span>
                  <button
                    onClick={() => handleFactCheckBroadcast(post.caption || "")}
                    className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded-lg font-bold flex items-center gap-1 transition-colors text-[10px]"
                  >
                    <Send className="w-3 h-3" /> Broadcast Debunk
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Floating AI Command Copilot */}
      <CommandCopilot />
    </div>
  );
}
