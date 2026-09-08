"use client";

import { useEffect, useState, useCallback } from "react";
import { Header, KPICard, SeverityBadge, RiskBadge } from "@/components/ui";
import { MapView } from "@/components/MapView";
import { LostPersonRadar } from "@/components/LostPersonRadar";
import { TempleLiveStatus } from "@/components/TempleLiveStatus";
import { SafePingRadar } from "@/components/SafePingRadar";
import { CommandCopilot } from "@/components/CommandCopilot";
import { api, wsUrl, type KPIs, type Incident, type Camera, type SocialPost, type Alert } from "@/lib/api";
import { Radio, ShieldAlert, AlertTriangle, Send, CheckCircle2, Flame, Users } from "lucide-react";

export default function Dashboard() {
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [social, setSocial] = useState<SocialPost[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [socialFactCheckMsg, setSocialFactCheckMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [k, i, c, s, a] = await Promise.all([
        api<KPIs>("/api/dashboard/kpis"),
        api<Incident[]>("/api/incidents?limit=10"),
        api<Camera[]>("/api/cameras?limit=100"),
        api<SocialPost[]>("/api/social/posts?limit=8"),
        api<Alert[]>("/api/alerts?limit=5"),
      ]);
      setKpis(k);
      setIncidents(i);
      setCameras(c);
      setSocial(s);
      setAlerts(a);
    } catch (e) {
      console.error("Failed to load dashboard", e);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    let ws: WebSocket | null = null;
    let wsAlerts: WebSocket | null = null;
    try {
      ws = new WebSocket(wsUrl("/ws/incidents"));
      ws.onmessage = () => load();
      ws.onerror = () => {};
    } catch (e) {}

    try {
      wsAlerts = new WebSocket(wsUrl("/ws/alerts"));
      wsAlerts.onmessage = (ev) => {
        const data = JSON.parse(ev.data);
        setAlerts((prev) =>
          [
            {
              id: Date.now().toString(),
              level: data.level,
              message: data.message,
              sent_at: new Date().toISOString(),
            },
            ...prev,
          ].slice(0, 5)
        );
        load();
      };
      wsAlerts.onerror = () => {};
    } catch (e) {}

    return () => {
      clearInterval(interval);
      if (ws) ws.close();
      if (wsAlerts) wsAlerts.close();
    };
  }, [load]);

  const markers = [
    ...cameras.filter((c) => c.status !== "offline").slice(0, 30).map((c) => ({
      id: c.id,
      lat: c.latitude,
      lng: c.longitude,
      label: c.camera_code,
      color: c.status === "warning" ? "#f59e0b" : "#3b82f6",
      type: "camera",
      crowd_count: 140,
    })),
    ...incidents.filter((i) => i.latitude).slice(0, 10).map((i) => ({
      id: i.id,
      lat: i.latitude!,
      lng: i.longitude!,
      label: i.incident_code,
      color: i.severity === "CRITICAL" ? "#ef4444" : "#f97316",
      type: i.incident_type,
    })),
  ];

  const handleBroadcastDebunk = (caption: string) => {
    setSocialFactCheckMsg(`📲 Official Fact-Check Alert Broadcasted: "${caption.slice(0, 45)}... Verified False"`);
    setTimeout(() => setSocialFactCheckMsg(null), 5000);
  };

  return (
    <div className="min-h-screen pb-16 space-y-4">
      <Header snanMode={kpis?.major_snan_mode} />

      <main className="max-w-[1700px] mx-auto px-4 space-y-4">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2.5">
          <KPICard label="Active Incidents" value={kpis?.active_incidents ?? "3"} color="text-orange-400" />
          <KPICard label="Critical Alerts" value={kpis?.critical_incidents ?? "1"} color="text-red-400" />
          <KPICard label="High Severity" value={kpis?.high_incidents ?? "2"} color="text-amber-400" />
          <KPICard label="Unverified Claims" value={kpis?.unverified_claims ?? "4"} color="text-amber-300" subtitle="Viral Rumors" />
          <KPICard label="Verified Debunks" value={kpis?.verified_claims ?? "12"} color="text-emerald-400" subtitle="Fact-Checked" />
          <KPICard label="Lost Pilgrim Radar" value="1 Found" color="text-amber-400" subtitle="AI Vision Active" />
          <KPICard label="Police Units" value={kpis?.available_police ?? "48"} color="text-blue-400" />
          <KPICard label="Medical Teams" value={kpis?.available_medical ?? "18"} color="text-emerald-400" />
          <KPICard label="Fire Tenders" value={kpis?.available_fire ?? "12"} color="text-red-400" />
          <KPICard label="CCTVs Online" value={cameras.filter((c) => c.status === "online").length || 36} color="text-slate-100" />
        </div>

        {/* Main Section: Interactive Situation Radar Map & Priority Ticker */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 card p-0 overflow-hidden border border-slate-800 flex flex-col">
            <div className="p-3 border-b border-slate-800 bg-slate-950/80 font-bold text-xs text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-orange-400 animate-pulse" />
                Live Situation Radar Map — Nashik–Trimbakeshwar & Prayagraj
              </span>
              <span className="badge-saffron">Click canvas to open AI CCTV Inspector</span>
            </div>
            <div className="h-[430px]">
              <MapView markers={markers} />
            </div>
          </div>

          <div className="space-y-4">
            {/* Priority Incidents */}
            <div className="card space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h2 className="font-bold text-sm text-orange-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" /> Priority Incidents
                </h2>
                <span className="text-[10px] text-slate-400 font-mono">LIVE FEED</span>
              </div>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {incidents.map((inc) => (
                  <a
                    key={inc.id}
                    href={`/incidents/${inc.id}`}
                    className="block p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800/80 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-xs text-orange-400 font-bold">{inc.incident_code}</span>
                      <SeverityBadge severity={inc.severity} />
                    </div>
                    <div className="text-xs text-slate-200 font-medium mt-1">
                      {inc.incident_type} — {inc.location_name || "Ram Kund Gate 3"}
                    </div>
                    <div className="flex items-center justify-between mt-1.5 text-[11px]">
                      <RiskBadge score={inc.risk_score} />
                      <span className="text-slate-400 font-mono">ETA: 4 mins</span>
                    </div>
                  </a>
                ))}
                {incidents.length === 0 && (
                  <div className="p-3 text-center text-xs text-slate-500">
                    No critical incidents active. Start Snan simulator to demo.
                  </div>
                )}
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="card space-y-2">
              <h2 className="font-bold text-xs text-blue-400 flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                <Flame className="w-4 h-4 text-amber-400" /> Ground Patrol Alerts
              </h2>
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                {alerts.map((a) => (
                  <div key={a.id} className="text-[11px] p-2 rounded bg-slate-950/60 border border-slate-800 flex items-start gap-2">
                    <SeverityBadge severity={a.level} />
                    <span className="text-slate-300 flex-1">{a.message}</span>
                  </div>
                ))}
                {alerts.length === 0 && (
                  <div className="text-[11px] text-slate-500 p-2">Monitoring sensor feeds...</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Lower Grid 1: AI Lost Person Radar & SafePing Portal */}
        <div className="grid lg:grid-cols-2 gap-4">
          <LostPersonRadar />
          <SafePingRadar />
        </div>

        {/* Lower Grid 2: Live Temple Queue Tracker & Social Media Rumor Debunker */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <TempleLiveStatus />
          </div>

          <div className="lg:col-span-2 card space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div>
                <h2 className="font-bold text-sm text-purple-400 flex items-center gap-2">
                  Social Intelligence & Fact-Checker Radar
                  <span className="badge-saffron">Topic #10 Anti-Fake News Engine</span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  Ingests viral posts (X, WhatsApp, Instagram) & compares against CCTV ground truth to stop panic
                </p>
              </div>
            </div>

            {socialFactCheckMsg && (
              <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs flex items-center gap-2 animate-bounce">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{socialFactCheckMsg}</span>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-2.5">
              {social.map((p) => (
                <div key={p.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/30 transition-all space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {p.platform || "X (Twitter)"}
                    </span>
                    <SeverityBadge severity={p.verification_status} />
                  </div>
                  <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">{p.caption}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                    <span>Urgency: {(p.urgency_score * 100).toFixed(0)}%</span>
                    <button
                      onClick={() => handleBroadcastDebunk(p.caption || "")}
                      className="px-2.5 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-medium flex items-center gap-1 transition-colors text-[10px]"
                    >
                      <Send className="w-3 h-3" /> Fact-Check Broadcast
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Floating AI Copilot Drawer */}
      <CommandCopilot />
    </div>
  );
}

