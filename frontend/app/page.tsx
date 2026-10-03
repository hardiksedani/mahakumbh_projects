"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Box, CheckCircle2, Clock3, Compass, Radio, ShieldAlert, Users, Video, Home, FileCheck } from "lucide-react";
import { Header, KPICard, NAV_GROUPS, RiskBadge, SeverityBadge } from "@/components/ui";
import { MapView } from "@/components/MapView";
import { LostPersonRadar } from "@/components/LostPersonRadar";
import { CommandCopilot } from "@/components/CommandCopilot";
import { api, wsUrl, type KPIs, type Incident, type Camera, type SocialPost, type Alert } from "@/lib/api";

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
      setKpis(k); setIncidents(i); setCameras(c); setSocial(s); setAlerts(a);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    let incidentSocket: WebSocket | null = null;
    let alertSocket: WebSocket | null = null;
    try { incidentSocket = new WebSocket(wsUrl("/ws/incidents")); incidentSocket.onmessage = () => loadData(); } catch {}
    try {
      alertSocket = new WebSocket(wsUrl("/ws/alerts"));
      alertSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setAlerts((previous) => [{ id: Date.now().toString(), level: data.level || "HIGH", message: data.message || "Alert received", sent_at: new Date().toISOString() }, ...previous].slice(0, 5));
          loadData();
        } catch {}
      };
    } catch {}
    return () => { clearInterval(interval); incidentSocket?.close(); alertSocket?.close(); };
  }, [loadData]);

  const markers = [
    ...cameras.filter((camera) => camera.status !== "offline").slice(0, 30).map((camera) => ({
      id: camera.id, lat: camera.latitude, lng: camera.longitude, label: camera.camera_code,
      color: camera.status === "warning" ? "#ba7b2a" : "#176b70", type: "Camera",
    })),
    ...incidents.filter((incident) => incident.latitude).slice(0, 10).map((incident) => ({
      id: incident.id, lat: incident.latitude!, lng: incident.longitude!, label: incident.incident_code || "Incident",
      color: incident.severity === "CRITICAL" ? "#b83f38" : "#ac572d", type: incident.incident_type,
    })),
  ];

  const previewFactCheck = (caption: string) => {
    setFactCheckAlert(`Demo response preview for: “${caption.slice(0, 55)}${caption.length > 55 ? "…" : ""}”`);
    window.setTimeout(() => setFactCheckAlert(null), 5000);
  };

  return <div className="min-h-screen bg-[#e6eeea] text-[#18343c]">
    <Header snanMode={kpis?.major_snan_mode} />
    <main className="mx-auto max-w-[1750px] space-y-9 px-4 py-7 md:px-6 md:py-9">
      <section className="overflow-hidden rounded-[28px] border border-[#315f60] bg-[#123b40] shadow-[0_18px_45px_rgba(12,52,56,.16)]">
        <div className="grid gap-7 p-6 md:p-9 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,.65fr)] lg:items-center">
          <div>
            <span className="inline-flex rounded-full border border-[#b2875d] bg-[#4b3e32] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#ffe1ba]">A guide to the 2027 Kumbh safety prototype</span>
            <h1 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-[#f5f8f5] md:text-4xl">Understand the place. See the situation. Find the right response.</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#d8e8e1]">KumbhRakshak brings the Nashik–Trimbakeshwar place guide, monitoring signals and response tools together. Start with the 3D guide to understand where a feature applies, then open the relevant portal.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/simulation" className="inline-flex items-center gap-2 rounded-xl bg-[#e5aa67] px-5 py-3 text-sm font-bold text-[#173b40] transition-colors hover:bg-[#f3bf81]"><Box className="h-4 w-4" />Explore the 3D guide</Link>
              <Link href="#features" className="inline-flex items-center gap-2 rounded-xl border border-[#9ec5b9] bg-transparent px-5 py-3 text-sm font-bold text-[#f5f8f5] hover:bg-[#27565b]">Find a feature <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
          <div className="rounded-2xl border border-[#e8d6b9] bg-[#fff8eb] p-5">
            <h2 className="text-lg font-bold text-[#19323d]">How to use this platform</h2>
            <ol className="mt-4 space-y-4">
              {[
                ["01", "Explore", "Locate a ghat, area or example facility in the 3D guide."],
                ["02", "Monitor", "Open the matching map, camera, crowd or public-report view."],
                ["03", "Respond", "Review an incident, available resources and a proposed advisory."],
              ].map(([number, title, description]) => <li key={number} className="flex gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-xs font-extrabold text-[#176b70]">{number}</span><span><strong className="block text-sm text-[#19323d]">{title}</strong><span className="text-sm text-[#526874]">{description}</span></span></li>)}
            </ol>
            <p className="mt-5 border-t border-[#d7e8e0] pt-4 text-xs leading-relaxed text-[#617783]">This is a demonstration. Scene geometry, some location pins and operational data are illustrative—not an approved emergency map.</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="snapshot-title">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2"><div><h2 id="snapshot-title" className="text-xl font-bold">Situation at a glance</h2><p className="mt-1 text-sm text-[#526874]">Sample indicators show what operators could review together.</p></div><span className="rounded-full border border-[#eac9ae] bg-[#fff5ed] px-3 py-1 text-xs font-bold text-[#925026]">Demo / simulated data</span></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <KPICard label="Active incidents" value={kpis?.active_incidents ?? "—"} subtitle={`${kpis?.critical_incidents ?? 0} marked critical`} icon={ShieldAlert} />
          <KPICard label="Cameras online" value={cameras.filter((camera) => camera.status === "online").length || "—"} subtitle="In the current data set" icon={Video} />
          <KPICard label="Crowd status" value="Review forecast" subtitle="See area-level projections" icon={Users} />
          <KPICard label="Reviewed claims" value={kpis?.verified_claims ?? "—"} subtitle="Open evidence before sharing" icon={CheckCircle2} />
          <KPICard label="Response teams" value={`${kpis?.available_police ?? "—"} police · ${kpis?.available_fire ?? "—"} fire`} subtitle="Availability in the demo" icon={FileCheck} />
          <KPICard label="Shelters" value="View capacity" subtitle="Check each listed location" icon={Home} />
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(340px,.55fr)]" aria-label="Map and latest incidents">
        <div className="overflow-hidden rounded-2xl border border-[#d8e5e0] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2ebe7] px-5 py-4"><div><h2 className="text-lg font-bold">Places and signals</h2><p className="text-sm text-[#526874]">Explore the area before opening a detailed portal.</p></div><Link href="/map" className="inline-flex items-center gap-2 text-sm font-bold text-[#176b70] hover:underline"><Compass className="h-4 w-4" />Open area map</Link></div>
          <div className="h-[440px]"><MapView markers={markers} /></div>
        </div>
        <div className="space-y-5">
          <div className="rounded-2xl border border-[#d8e5e0] bg-white p-5">
            <div className="mb-4 flex items-start justify-between gap-3"><div><h2 className="text-lg font-bold">Incident review</h2><p className="text-sm text-[#526874]">See what needs an operator’s attention.</p></div><Link href="/incidents" className="shrink-0 text-sm font-bold text-[#176b70] hover:underline">View all</Link></div>
            <div className="space-y-2">
              {incidents.slice(0, 4).map((incident) => <Link key={incident.id} href={`/incidents/${incident.id}`} className="block rounded-xl border border-[#e0eae5] p-3 transition-colors hover:bg-[#f5faf7]"><div className="flex items-center justify-between gap-2"><span className="text-sm font-bold text-[#19323d]">{incident.incident_code || "Incident"}</span><SeverityBadge severity={incident.severity || "HIGH"} /></div><p className="mt-1 text-sm text-[#526874]">{incident.incident_type} · {incident.location_name || "Location pending"}</p><div className="mt-2"><RiskBadge score={incident.risk_score || 0} /></div></Link>)}
              {incidents.length === 0 && <p className="rounded-xl bg-[#f5faf7] p-4 text-sm text-[#526874]">No incidents are available in the current view. Open the simulation to explore example events.</p>}
            </div>
          </div>
          <div className="rounded-2xl border border-[#d8e5e0] bg-white p-5"><div className="mb-3 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-[#ac572d]" /><h2 className="text-base font-bold">Recent alerts</h2></div><div className="space-y-2">{alerts.slice(0, 3).map((alert) => <div key={alert.id} className="flex items-start gap-2 rounded-lg bg-[#f7faf9] p-3"><SeverityBadge severity={alert.level} /><span className="min-w-0 text-sm text-[#526874]">{alert.message}</span></div>)}{alerts.length === 0 && <p className="text-sm text-[#526874]">No alerts in the current view.</p>}</div><Link href="/incidents" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[#176b70] hover:underline"><Clock3 className="h-4 w-4" />Review incident history</Link></div>
        </div>
      </section>

      <section id="features" className="scroll-mt-36" aria-labelledby="features-title"><div className="mb-5"><span className="text-xs font-bold uppercase tracking-[.14em] text-[#ac572d]">Feature guide</span><h2 id="features-title" className="mt-1 text-2xl font-bold">Find the right feature for your task</h2><p className="mt-1 max-w-2xl text-sm text-[#526874]">Every existing portal is here. Choose what you want to do; each link explains what you will find inside.</p></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{NAV_GROUPS.map((group) => <div key={group.title} className="rounded-2xl border border-[#d8e5e0] bg-white p-5"><h3 className="text-lg font-bold text-[#19323d]">{group.title}</h3><p className="mb-4 text-sm text-[#526874]">{group.description}</p><div className="space-y-1">{group.items.map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} className="group flex gap-3 rounded-xl px-2 py-3 hover:bg-[#f1f7f4]"><Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#176b70]" /><span><span className="block text-sm font-bold text-[#19323d] group-hover:text-[#10545a]">{item.label}</span><span className="block text-sm leading-snug text-[#526874]">{item.description}</span></span></Link>; })}</div></div>)}</div></section>

      <section aria-label="Lost person search"><LostPersonRadar /></section>

      <section className="rounded-2xl border border-[#d8e5e0] bg-white p-5" aria-labelledby="reports-title"><div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><Radio className="h-5 w-5 text-[#176b70]" /><h2 id="reports-title" className="text-lg font-bold">Public-report review</h2></div><p className="mt-1 text-sm text-[#526874]">Inspect a claim and its evidence before any public response.</p></div><Link href="/verify" className="text-sm font-bold text-[#176b70] hover:underline">Open verification portal</Link></div>{factCheckAlert && <p role="status" className="mb-4 rounded-xl border border-[#b6dfca] bg-[#e9f7f0] p-3 text-sm text-[#176b4c]">{factCheckAlert}</p>}<div className="grid gap-3 md:grid-cols-3">{social.slice(0, 3).map((post) => <article key={post.id} className="flex flex-col justify-between rounded-xl border border-[#e0eae5] bg-[#fafcfb] p-4"><div><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-semibold text-[#526874]">{post.platform || "Public report"}</span><SeverityBadge severity={post.verification_status || "UNVERIFIED"} /></div><p className="mt-3 line-clamp-4 text-sm leading-relaxed text-[#19323d]">{post.caption}</p></div><button onClick={() => previewFactCheck(post.caption || "")} className="mt-4 w-full rounded-lg border border-[#bcd6cd] bg-white px-3 py-2 text-sm font-bold text-[#10545a] hover:bg-[#eff6f3]">Preview a demo response</button></article>)}{social.length === 0 && <p className="text-sm text-[#526874]">No public reports are available in this view.</p>}</div></section>
    </main>
    <CommandCopilot />
  </div>;
}
