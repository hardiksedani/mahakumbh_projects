"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/ui";
import {
  ShieldCheck,
  TrendingDown,
  Clock,
  Radio,
  FileCheck,
  AlertCircle,
  Download,
  Award,
  Layers,
  Users,
  Compass,
} from "lucide-react";

export default function ExecutiveBriefingPage() {
  const [dataLoaded, setDataLoaded] = useState(true);

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 flex flex-col print:bg-white print:text-black">
      <Header />

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-8 space-y-6">
        {/* Executive Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-orange-950/40 border border-orange-500/30 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Compass className="w-64 h-64 text-orange-500" />
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="badge-saffron flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> High-Level Executive Dashboard
                </span>
                <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded">
                  DEMO / SIMULATED BENCHMARK DATA
                </span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white">
                KUMBHRAKSHAK: Decision Intelligence Brief
              </h1>
              <p className="text-sm text-slate-300 mt-1 max-w-3xl">
                Simhastha Kumbh Mela 2027 — Nashik–Trimbakeshwar. Prototype Command & Control intelligence layer demonstrating multi-source AI fusion, evidence-grounded rumor debunking, and human-in-the-loop dispatch triage.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-600/30 transition-all print:hidden"
              >
                <Download className="w-4 h-4" /> Export Executive PDF
              </button>
            </div>
          </div>
        </div>

        {/* Core Impact Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card border-l-4 border-l-emerald-500 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Devotee Footfall Monitored</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-white">2.45M</div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1">
              <span>● Real-time density within safe limits</span>
            </div>
          </div>

          <div className="card border-l-4 border-l-orange-500 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Panic Rumors Debunked</span>
              <ShieldCheck className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-3xl font-black text-orange-400">18 / 18</div>
            <div className="text-[11px] text-slate-400">100% corroborated via ground cameras</div>
          </div>

          <div className="card border-l-4 border-l-blue-500 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Mean Verification Latency</span>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-black text-blue-400">1.42s</div>
            <div className="text-[11px] text-slate-400">Across 12 multi-source AI models</div>
          </div>

          <div className="card border-l-4 border-l-purple-500 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Officer SOP Approvals</span>
              <FileCheck className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-black text-purple-400">100%</div>
            <div className="text-[11px] text-slate-400">Zero autonomous lethal or police actions</div>
          </div>
        </div>

        {/* Intelligence Funnel & Architecture Value Proposition */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Intelligence Funnel */}
          <div className="card lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-orange-400" /> Multi-Source Intelligence Funnel
              </h2>
              <span className="text-xs font-mono text-slate-400">Ingestion → Ground Truth Filter</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-400 text-[10px]">1. UNSTRUCTURED INGESTION</div>
                  <div className="font-bold text-slate-200">Social Media & Citizen Mobile Stream</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-amber-400">142,500 posts/hr</div>
                  <div className="text-[10px] text-slate-500">Instagram, X, Audio Desks</div>
                </div>
              </div>

              <div className="text-center text-slate-500 text-xs">▼ Stage 1: Cheap Keyword & Geofence Filter (92% Reduction)</div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-400 text-[10px]">2. NLP CLAIM EXTRACTION</div>
                  <div className="font-bold text-slate-200">IndicBERT Threat & Incident Clustering</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-blue-400">1,240 actionable claims</div>
                  <div className="text-[10px] text-slate-500">Categorized by Ghat & Hazard</div>
                </div>
              </div>

              <div className="text-center text-slate-500 text-xs">▼ Stage 2: Distance-Decayed Bayesian Ground Camera Corroboration</div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-400 text-[10px]">3. VERIFIED EVIDENCE MATRIX</div>
                  <div className="font-bold text-slate-200">Cross-Sensor Fusion & Recycled Media Check</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-emerald-400">14 Verified Incidents</div>
                  <div className="text-[10px] text-slate-500">No False Stampede Alarms</div>
                </div>
              </div>

              <div className="text-center text-slate-500 text-xs">▼ Human-in-the-Loop Officer Gate</div>

              <div className="bg-orange-950/30 p-3 rounded-xl border border-orange-500/40 flex items-center justify-between">
                <div>
                  <div className="text-orange-400 text-[10px] font-bold">4. DISPATCHED ACTION & ADVISORY</div>
                  <div className="font-bold text-white">Commander Confirmed SOP Dispatch</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-orange-400">100% Logged with Badge ID</div>
                  <div className="text-[10px] text-slate-400">Auditable Governance Record</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sector Risk & Preparedness */}
          <div className="card space-y-4">
            <h2 className="text-base font-bold text-white">Sector Operational Readiness</h2>
            
            <div className="space-y-3">
              {[
                { sector: "Ram Kund Main Ghat", density: "76%", risk: "ORANGE", status: "Active Diversion to Laxman Jhula" },
                { sector: "Panchvati Pilgrimage Corridor", density: "54%", risk: "YELLOW", status: "Steady Flow" },
                { sector: "Sadhu Gram Sector 14", density: "38%", risk: "GREEN", status: "Campfire Monitored" },
                { sector: "Laxman Jhula Pedestrian Bridge", density: "62%", risk: "YELLOW", status: "Counter-Flow Mitigated" },
                { sector: "Nashik Road Station Transit Hub", density: "45%", risk: "GREEN", status: "Train Arrival Handled" },
              ].map((s) => (
                <div key={s.sector} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{s.sector}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        s.risk === "ORANGE"
                          ? "bg-orange-500/20 text-orange-400"
                          : s.risk === "YELLOW"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {s.risk}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Capacity: {s.density}</span>
                    <span className="text-[10px] text-slate-500">{s.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ethical AI & Governance Principles */}
        <div className="card bg-slate-900/60 border border-slate-800 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Platform Governance & Ethical AI Guardrails
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <div className="font-bold text-white mb-1">1. Non-Accusatory Debunking</div>
              <p className="text-slate-400 leading-relaxed">
                Claims are never labeled as malicious fraud or criminal intent. Outdated media is flagged as <span className="font-mono text-amber-400">POSSIBLE_REUSED_CONTENT</span> with factual historical comparisons.
              </p>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <div className="font-bold text-white mb-1">2. Mandatory Officer-in-the-Loop</div>
              <p className="text-slate-400 leading-relaxed">
                No autonomous dispatch or public broadcast occurs without verified officer badge authentication and audit trail logging.
              </p>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <div className="font-bold text-white mb-1">3. Transparent Data Provenance</div>
              <p className="text-slate-400 leading-relaxed">
                All feeds, test streams, and benchmark stats are explicitly demarcated with simulated telemetry provenance banners.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
