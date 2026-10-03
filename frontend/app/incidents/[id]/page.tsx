"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Header, SeverityBadge, RiskBadge } from "@/components/ui";
import { backendRequest } from "@/lib/api";
import {
  ShieldAlert,
  Compass,
  CheckCircle2,
  XCircle,
  FileCheck,
  Video,
  Eye,
  GitBranch,
  Layers,
  ArrowRight,
  UserCheck,
} from "lucide-react";

interface GraphNode {
  id: string;
  type: string;
  label: string;
  status: string;
  confidence?: number;
  data: Record<string, any>;
}

interface GraphEdge {
  source: string;
  target: string;
  relation: string;
  color?: string;
}

export default function IncidentDetail() {
  const params = useParams();
  const [inc, setInc] = useState<any | null>(null);
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; edges: GraphEdge[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [officerBadge, setOfficerBadge] = useState("MH-NSK-POL-4412");
  const [officerName, setOfficerName] = useState("DySP R. K. Shinde");
  const [decisionRecorded, setDecisionRecorded] = useState<string | null>(null);

  const fetchIncidentAndGraph = async () => {
    if (!params.id) {
      setError("No incident was selected.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const incidentId = encodeURIComponent(String(params.id));
      const incData = await backendRequest<any>(`/api/incidents/${incidentId}`);
      setInc(incData);

      const gData = await backendRequest<{ graph?: { nodes: GraphNode[]; edges: GraphEdge[] } }>(`/api/v1/incidents/${incidentId}/graph`);
      if (gData.graph) {
        setGraphData(gData.graph);
      }
    } catch {
      setError("Incident details are unavailable because the demo backend is offline. No decision can be recorded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidentAndGraph();
  }, [params.id]);

  const handleConfirmAction = async (decision: "APPROVED" | "REJECTED") => {
    try {
      await backendRequest("/api/v1/dispatch/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action_id: `ACT-SOP-${inc?.id?.slice(0, 6)}`,
          incident_id: inc?.id,
          officer_badge_id: officerBadge,
          officer_name: officerName,
          decision: decision,
          assigned_unit: "QRT-Sector-4-Alpha",
          notes: `Action ${decision} on Incident ${inc?.incident_code}.`,
        }),
      });
      setDecisionRecorded(decision);
      fetchIncidentAndGraph();
    } catch {
      setError("The decision could not be recorded. Check the demo backend before retrying.");
    }
  };

  if (loading || !inc) {
    return (
      <div className="min-h-screen bg-[#070A11] text-slate-100 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center text-sm text-slate-400">
          {loading ? "Loading incident telemetry and evidence…" : <p role="alert">{error || "Incident not found."}</p>}
          {!loading && (
            <div className="flex gap-3">
              <button onClick={fetchIncidentAndGraph} className="rounded-lg border border-slate-600 px-4 py-2 text-slate-100">Retry</button>
              <Link href="/incidents" className="rounded-lg bg-orange-600 px-4 py-2 text-white">Back to incidents</Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 space-y-6">
        {error && <p role="alert" className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">{error}</p>}
        {/* Incident Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge-saffron flex items-center gap-1 font-mono">
                <GitBranch className="w-3.5 h-3.5" /> {inc.incident_code || "INC-2027-LIVE"}
              </span>
              <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                DEMO / SIMULATED DATA
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-1">
              {inc.incident_type} Incident at {inc.location_name || "Ramkund Sector"}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified ground multi-camera corroboration with Bayesian confidence scoring.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <SeverityBadge severity={inc.severity || "HIGH"} />
            <SeverityBadge severity={inc.status || "OPEN"} />
            <RiskBadge score={inc.risk_score || 72} />
          </div>
        </div>

        {/* Visual Evidence Lineage DAG Graph */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-orange-400" /> Multi-Source Decision & Evidence Lineage Graph (DAG)
            </h2>
            <span className="text-xs font-mono text-slate-400">
              Lineage: Report → Optical Ingestion → Bayesian Fusion → Risk Score → Officer SOP
            </span>
          </div>

          {/* Graph Nodes Canvas */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 overflow-x-auto">
            <div className="min-w-[850px] flex items-center justify-between gap-4 py-4">
              {/* Step 1: Ingested Report Node */}
              <div className="w-56 p-3 bg-slate-900 rounded-xl border border-slate-700 shadow-lg space-y-1 shrink-0">
                <div className="text-[10px] text-amber-400 font-mono font-bold">1. REPORT / SOURCE</div>
                <div className="text-xs font-bold text-white truncate">{inc.description || inc.title}</div>
                <div className="text-[10px] text-slate-400">Source: Mobile / Social Stream</div>
              </div>

              <ArrowRight className="w-5 h-5 text-slate-600 shrink-0" />

              {/* Step 2: Ground Camera Sensors */}
              <div className="w-56 p-3 bg-slate-900 rounded-xl border border-blue-500/40 shadow-lg space-y-1 shrink-0">
                <div className="text-[10px] text-blue-400 font-mono font-bold">2. SENSOR PROXIMITY</div>
                <div className="text-xs font-bold text-white">CAM-782 & CAM-RK-01</div>
                <div className="text-[10px] text-slate-400">Distance Decay: d &lt; 0.35 km</div>
              </div>

              <ArrowRight className="w-5 h-5 text-slate-600 shrink-0" />

              {/* Step 3: Bayesian Cross-Camera Fusion */}
              <div className="w-56 p-3 bg-slate-900 rounded-xl border border-purple-500/40 shadow-lg space-y-1 shrink-0">
                <div className="text-[10px] text-purple-400 font-mono font-bold">3. BAYESIAN FUSION</div>
                <div className="text-xs font-bold text-emerald-400">Confidence: {(inc.confidence ? inc.confidence * 100 : 92).toFixed(0)}%</div>
                <div className="text-[10px] text-slate-400">Formula: 1 - ∏(1 - wᵢ · Cᵢ)</div>
              </div>

              <ArrowRight className="w-5 h-5 text-slate-600 shrink-0" />

              {/* Step 4: Causal Risk Assessment */}
              <div className="w-56 p-3 bg-slate-900 rounded-xl border border-orange-500/40 shadow-lg space-y-1 shrink-0">
                <div className="text-[10px] text-orange-400 font-mono font-bold">4. 10-FACTOR RISK</div>
                <div className="text-xs font-bold text-white">Score: {inc.risk_score || 78}/100</div>
                <div className="text-[10px] text-red-400 font-bold">Level: {inc.severity || "ORANGE"}</div>
              </div>

              <ArrowRight className="w-5 h-5 text-slate-600 shrink-0" />

              {/* Step 5: Recommended Action */}
              <div className="w-56 p-3 bg-slate-900 rounded-xl border border-emerald-500/40 shadow-lg space-y-1 shrink-0">
                <div className="text-[10px] text-emerald-400 font-mono font-bold">5. OFFICER SOP</div>
                <div className="text-xs font-bold text-white">Deploy QRT 4 + Divert Gate</div>
                <div className="text-[10px] text-slate-400">Pending Badge Confirmation</div>
              </div>
            </div>
          </div>
        </div>

        {/* Structured Evidence Matrix Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ground Camera Evidence */}
          <div className="card space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Video className="w-4 h-4 text-blue-400" /> Ground Camera Evidence Matrix
            </h2>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400">Corroborating Cameras:</span>
                <span className="font-bold text-white font-mono">2 / 2 Near Sector</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400">Fused Bayesian Confidence:</span>
                <span className="font-bold text-emerald-400 font-mono">92.4%</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400">Recycled Media Match:</span>
                <span className="font-bold text-emerald-400 font-mono">NO ARCHIVE MATCH (Current Event)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Official Status:</span>
                <span className="font-bold text-slate-200 font-mono">NO CONTRADICTION</span>
              </div>
            </div>
          </div>

          {/* Human-in-the-Loop Officer Confirmation Action */}
          <div className="card space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-orange-400" /> Human-in-the-Loop SOP Dispatch Authorization
            </h2>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Authorizing Officer:</label>
                  <input
                    type="text"
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 px-2.5 py-1.5 rounded text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Badge ID:</label>
                  <input
                    type="text"
                    value={officerBadge}
                    onChange={(e) => setOfficerBadge(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 px-2.5 py-1.5 rounded text-xs text-orange-400 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-1">
                <div className="font-bold text-white">Recommended SOP Action:</div>
                <div className="text-slate-300">
                  Deploy Quick Response Team 4 with automated Ghat PA announcement chime.
                </div>
              </div>

              {decisionRecorded ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    Decision {decisionRecorded} by Officer {officerName} ({officerBadge}). Logged to immutable audit trail.
                  </span>
                </div>
              ) : (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleConfirmAction("APPROVED")}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Authorize & Dispatch SOP
                  </button>
                  <button
                    onClick={() => handleConfirmAction("REJECTED")}
                    className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg border border-slate-700 transition-all flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" /> Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
