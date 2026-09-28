"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header, SeverityBadge, RiskBadge } from "@/components/ui";
import { api, type Incident } from "@/lib/api";
import {
  ShieldAlert,
  AlertTriangle,
  GitBranch,
  Video,
  Clock,
  Filter,
  RefreshCw,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");

  const fetchIncidents = () => {
    setLoading(true);
    api<Incident[]>("/api/incidents?limit=50")
      .then(setIncidents)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const filteredIncidents = incidents.filter((inc) => {
    if (filterSeverity === "ALL") return true;
    if (filterSeverity === "CRITICAL") return inc.severity === "CRITICAL";
    if (filterSeverity === "HIGH") return inc.severity === "HIGH";
    if (filterSeverity === "OPEN") return inc.status === "OPEN" || inc.status === "IN_PROGRESS";
    return true;
  });

  const criticalCount = incidents.filter((i) => i.severity === "CRITICAL").length;
  const highCount = incidents.filter((i) => i.severity === "HIGH").length;
  const openCount = incidents.filter((i) => i.status !== "RESOLVED").length;

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-red-500/15 text-red-400 border border-red-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                Active Tactical Command
              </span>
              <span className="text-slate-500 text-xs font-mono">• Nashik–Trimbakeshwar Sectors</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Incident Command & Evidence Lineage
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Every safety incident correlates ground camera optical feeds, social reports, and Bayesian evidence fusion with mandatory officer authorization.
            </p>
          </div>

          <button
            onClick={fetchIncidents}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl border border-slate-700 transition-all self-start md:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5 text-orange-400" /> Refresh Feed
          </button>
        </div>

        {/* Filter & Metric Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-2.5 rounded-2xl">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 ml-2" />
            <span className="text-xs font-mono text-slate-400 font-bold uppercase mr-1">Triage Filter:</span>
            {["ALL", "CRITICAL", "HIGH", "OPEN"].map((f) => (
              <button
                key={f}
                onClick={() => setFilterSeverity(f)}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                  filterSeverity === f
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs font-mono pr-2">
            <span className="text-slate-400">
              Total: <strong className="text-white">{incidents.length}</strong>
            </span>
            <span className="text-red-400">
              Critical: <strong>{criticalCount}</strong>
            </span>
            <span className="text-orange-400">
              High: <strong>{highCount}</strong>
            </span>
            <span className="text-emerald-400">
              Open: <strong>{openCount}</strong>
            </span>
          </div>
        </div>

        {/* Incidents Grid */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-mono text-xs">
            Loading active incident records...
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/40 text-slate-500 font-mono text-xs">
            No incidents matching current filter. All sectors operating within normal baseline limits.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIncidents.map((inc) => (
              <Link
                key={inc.id}
                href={`/incidents/${inc.id}`}
                className="p-4 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/90 hover:border-orange-500/40 transition-all flex flex-col justify-between group shadow-lg space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded border border-orange-500/20">
                      {inc.incident_code || "INC-2027"}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <SeverityBadge severity={inc.severity || "HIGH"} />
                      <SeverityBadge severity={inc.status || "OPEN"} />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">
                      {inc.incident_type} Incident
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Location: <strong className="text-slate-200">{inc.location_name || "Ramkund Sector"}</strong>
                    </p>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/70">
                    {inc.description || "Ground pattern threshold exceeded. Multi-camera correlation active."}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <RiskBadge score={inc.risk_score || 72} />
                  <span className="text-[11px] font-bold text-slate-400 group-hover:text-orange-400 flex items-center gap-1 font-mono">
                    <span>Inspect DAG Graph</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
