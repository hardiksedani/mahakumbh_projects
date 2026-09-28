"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/ui";
import { Users, TrendingUp, AlertTriangle, Clock, RefreshCw, Compass, ArrowRight } from "lucide-react";

interface ForecastRecord {
  zone_id: string;
  horizon_minutes: number;
  predicted_population: number;
  predicted_density: number;
  overflow_risk: number;
  predicted_for: string;
  model_metadata: {
    provider: string;
    confidence_intervals: {
      p10: number;
      p50: number;
      p90: number;
      confidence_level: number;
    };
    surge_velocity_per_min: number;
    recommended_advisory: string;
  };
}

export default function CrowdForecastPage() {
  const [forecasts, setForecasts] = useState<ForecastRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchForecasts = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/predictions/run", { method: "POST" });
      const data = await res.json();
      if (data.predictions) {
        setForecasts(data.predictions);
      }
    } catch (err) {
      console.error("Failed to load forecasts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecasts();
  }, []);

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge-saffron flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Predictive Crowd Safety
              </span>
              <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                DEMO / SIMULATED DATA
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-1">
              Crowd Dynamics & Multi-Horizon Forecasts
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              XGBoost-fitted Diurnal Surge Predictor with 15m, 30m, and 60m Bayesian Confidence Intervals (p10/p50/p90).
            </p>
          </div>

          <button
            onClick={fetchForecasts}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-all w-max"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Recompute 60m Horizons
          </button>
        </div>

        {/* Horizons Cards */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-mono text-sm">
            Computing multi-horizon crowd projections...
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[15, 30, 60].map((horizon) => {
                const f = forecasts.find((item) => item.horizon_minutes === horizon) || {
                  predicted_population: horizon === 15 ? 7400 : horizon === 30 ? 9800 : 13400,
                  predicted_density: horizon === 15 ? 0.62 : horizon === 30 ? 0.74 : 0.88,
                  overflow_risk: horizon === 15 ? 0.12 : horizon === 30 ? 0.42 : 0.78,
                  model_metadata: {
                    confidence_intervals: {
                      p10: horizon === 15 ? 6800 : horizon === 30 ? 8900 : 11800,
                      p50: horizon === 15 ? 7400 : horizon === 30 ? 9800 : 13400,
                      p90: horizon === 15 ? 8100 : horizon === 30 ? 10900 : 15200,
                    },
                    surge_velocity_per_min: 45.2,
                    recommended_advisory:
                      horizon === 60
                        ? "Pre-emptive holding area diversion required at Ramkund intake."
                        : "Crowd flow within operational safe limits.",
                  },
                };

                const isWarning = f.overflow_risk > 0.4;
                const isCritical = f.overflow_risk > 0.7;

                return (
                  <div
                    key={horizon}
                    className={`card border relative overflow-hidden transition-all ${
                      isCritical
                        ? "border-red-500/40 bg-red-950/20"
                        : isWarning
                        ? "border-amber-500/40 bg-amber-950/20"
                        : "border-slate-800 bg-slate-900/60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-orange-400" /> +{horizon} MINUTES HORIZON
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                          isCritical
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : isWarning
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {isCritical ? "HIGH SURGE RISK" : isWarning ? "MODERATE SURGE" : "STABLE FLOW"}
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="text-3xl font-black text-white">
                        {f.model_metadata.confidence_intervals.p50.toLocaleString()}{" "}
                        <span className="text-xs font-normal text-slate-400">devotees</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Est. Density: <span className="font-bold text-slate-200">{(f.predicted_density * 10).toFixed(1)} / 10</span> (
                        {(f.predicted_density * 100).toFixed(0)}% capacity)
                      </div>
                    </div>

                    {/* Confidence Intervals Band */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs font-mono mb-3">
                      <div className="text-[10px] text-slate-400 flex justify-between">
                        <span>Confidence Band (90% CI):</span>
                        <span className="text-amber-400">XGBoost Regressor</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300">
                        <div>
                          <span className="text-slate-500 block text-[9px]">p10 (Lower):</span>
                          <span>{f.model_metadata.confidence_intervals.p10.toLocaleString()}</span>
                        </div>
                        <div className="text-center font-bold text-orange-400">
                          <span className="text-slate-500 block text-[9px]">p50 (Expected):</span>
                          <span>{f.model_metadata.confidence_intervals.p50.toLocaleString()}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-500 block text-[9px]">p90 (Worst):</span>
                          <span>{f.model_metadata.confidence_intervals.p90.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actionable SOP Advisory */}
                    <div className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2">
                      <AlertTriangle
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          isCritical ? "text-red-400" : isWarning ? "text-amber-400" : "text-emerald-400"
                        }`}
                      />
                      <span className="text-[11px] leading-relaxed">{f.model_metadata.recommended_advisory}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Holding Area & Buffer Zones Management */}
            <div className="card space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-orange-400" /> Upstream Holding Areas & Dynamic Buffer Management
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: "Holding Arena Alpha (Tapovan)", capacity: 25000, current: 8400, status: "READY" },
                  { name: "Holding Arena Beta (Panchvati Outer)", capacity: 18000, current: 12200, status: "ACTIVE_BUFFERING" },
                  { name: "Holding Arena Gamma (Nashik Road)", capacity: 35000, current: 9500, status: "READY" },
                ].map((a) => {
                  const pct = Math.round((a.current / a.capacity) * 100);
                  return (
                    <div key={a.name} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-xs font-bold text-slate-200">{a.name}</div>
                          <div className="text-[11px] text-slate-400">
                            {a.current.toLocaleString()} / {a.capacity.toLocaleString()} ({pct}%)
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                          {a.status}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${pct > 80 ? "bg-red-500" : pct > 50 ? "bg-amber-500" : "bg-emerald-500"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
