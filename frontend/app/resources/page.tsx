"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/ui";
import { Shield, CheckCircle2, XCircle, Clock, FileCheck, RefreshCw, UserCheck, AlertTriangle } from "lucide-react";

interface DispatchRecommendation {
  incident_id: string;
  incident_title: string;
  severity: string;
  risk_score: number;
  ai_reasoning: string;
  recommended_actions: {
    action_id: string;
    title: string;
    target: string;
    priority: string;
    estimated_eta_mins: number;
  }[];
  requires_human_officer_approval: boolean;
}

interface AuditRecord {
  id?: string;
  action_id: string;
  incident_id: string;
  officer_badge_id: string;
  officer_name: string;
  decision: string;
  assigned_unit: string;
  timestamp: string;
  status: string;
  notes?: string;
}

export default function ResourcesPage() {
  const [recommendations, setRecommendations] = useState<DispatchRecommendation[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [officerBadge, setOfficerBadge] = useState("MH-NSK-POL-4412");
  const [officerName, setOfficerName] = useState("DySP R. K. Shinde");
  const [submittingAction, setSubmittingAction] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recRes, auditRes] = await Promise.all([
        fetch("http://localhost:8000/api/v1/dispatch/recommendations"),
        fetch("http://localhost:8000/api/v1/dispatch/audit-trail"),
      ]);
      const recData = await recRes.json();
      const auditData = await auditRes.json();
      if (recData.recommendations) setRecommendations(recData.recommendations);
      if (auditData.audit_trail) setAuditTrail(auditData.audit_trail);
    } catch (err) {
      console.error("Failed to load dispatch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDecision = async (
    actionId: string,
    incidentId: string,
    decision: "APPROVED" | "REJECTED" | "OVERRIDDEN",
    unit: string
  ) => {
    try {
      setSubmittingAction(actionId);
      const res = await fetch("http://localhost:8000/api/v1/dispatch/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action_id: actionId,
          incident_id: incidentId,
          officer_badge_id: officerBadge,
          officer_name: officerName,
          decision: decision,
          assigned_unit: unit,
          notes: `Action ${decision.toLowerCase()} by duty officer.`,
        }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Failed to record officer decision:", err);
    } finally {
      setSubmittingAction(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge-saffron flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Human-in-the-Loop Command
              </span>
              <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                DEMO / SIMULATED DATA
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-1">
              Resource Dispatch & Officer SOP Approvals
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              AI evaluates multi-source ground evidence and proposes SOP actions. Officers maintain final authority with immutable audit logging.
            </p>
          </div>

          {/* Officer Duty Credentials Bar */}
          <div className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl flex items-center gap-3 text-xs">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>Duty Officer:</span>
                <input
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-xs text-slate-200"
                />
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                <span>Badge:</span>
                <input
                  type="text"
                  value={officerBadge}
                  onChange={(e) => setOfficerBadge(e.target.value)}
                  className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-[10px] text-orange-400 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Recommendations Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" /> Pending AI Dispatch Recommendations
            </h2>
            <span className="text-xs font-mono text-slate-400">
              {recommendations.length} Pending Officer Decision
            </span>
          </div>

          {recommendations.length === 0 ? (
            <div className="card p-8 text-center text-slate-400 font-mono text-xs">
              No pending dispatch recommendations. All active incidents have been handled or no critical surges detected.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {recommendations.map((rec) => (
                <div key={rec.incident_id} className="card border border-slate-800 bg-slate-900/60 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">{rec.incident_title}</h3>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Severity: <span className="font-bold text-orange-400">{rec.severity}</span> | Risk Score:{" "}
                        <span className="font-bold text-red-400">{rec.risk_score}/100</span>
                      </div>
                    </div>
                    <span className="badge-red text-[10px]">REQUIRES OFFICER CONFIRMATION</span>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                    <span className="text-slate-500 font-semibold block text-[10px] mb-0.5">AI EVIDENCE REASONING:</span>
                    {rec.ai_reasoning}
                  </p>

                  <div className="space-y-2 pt-1">
                    <div className="text-xs font-bold text-slate-400">Proposed Standard Operating Procedures (SOPs):</div>
                    {rec.recommended_actions.map((act) => (
                      <div
                        key={act.action_id}
                        className="p-3 bg-slate-950 rounded-xl border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-bold text-white">{act.title}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>Target: {act.target}</span>
                            <span>●</span>
                            <span>ETA: ~{act.estimated_eta_mins} mins</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleDecision(act.action_id, rec.incident_id, "APPROVED", act.target)}
                            disabled={submittingAction === act.action_id}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all text-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleDecision(act.action_id, rec.incident_id, "REJECTED", act.target)}
                            disabled={submittingAction === act.action_id}
                            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg border border-slate-700 transition-all text-xs"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Immutable Decision Audit Trail */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" /> Immutable Dispatch Decision Audit Log
            </h2>
            <span className="text-xs font-mono text-slate-400">Total Logged: {auditTrail.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Officer Name / Badge</th>
                  <th className="py-2.5 px-3">Action ID</th>
                  <th className="py-2.5 px-3">Decision</th>
                  <th className="py-2.5 px-3">Assigned Unit</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {auditTrail.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-slate-500">
                      No decisions logged yet. Approving or rejecting an SOP above logs an immutable record here.
                    </td>
                  </tr>
                ) : (
                  auditTrail.map((entry, idx) => (
                    <tr key={entry.id || idx} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 text-slate-400">
                        {entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString() : "Just now"}
                      </td>
                      <td className="py-2.5 px-3 text-slate-200">
                        {entry.officer_name} ({entry.officer_badge_id})
                      </td>
                      <td className="py-2.5 px-3 text-amber-400">{entry.action_id}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            entry.decision === "APPROVED"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {entry.decision}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{entry.assigned_unit}</td>
                      <td className="py-2.5 px-3 text-slate-400">{entry.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
