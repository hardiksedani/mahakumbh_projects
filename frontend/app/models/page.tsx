"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/ui";
import { Cpu, CheckCircle2, AlertTriangle, Activity, Zap, RefreshCw, Sliders, Shield, Layers } from "lucide-react";

interface ModelRecord {
  name: string;
  purpose: string;
  provider: string;
  version: string;
  threshold: number;
  input_type: string;
  enabled: boolean;
  status: string;
  avg_latency_ms: number;
  last_loaded: string | null;
  performance_notes: string;
  total_inferences: number;
  confidence_benchmark: number;
}

export default function ModelsPage() {
  const [models, setModels] = useState<ModelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/v1/models");
      const data = await res.json();
      if (data.models) {
        setModels(data.models);
      }
    } catch (err) {
      console.error("Failed to load models:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleToggle = async (modelName: string, currentEnabled: boolean) => {
    try {
      setToggling(modelName);
      const res = await fetch(`http://localhost:8000/api/v1/models/${encodeURIComponent(modelName)}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !currentEnabled }),
      });
      if (res.ok) {
        setModels((prev) =>
          prev.map((m) =>
            m.name === modelName ? { ...m, enabled: !currentEnabled, status: !currentEnabled ? "ACTIVE" : "DISABLED" } : m
          )
        );
      }
    } catch (err) {
      console.error("Failed to toggle model:", err);
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge-saffron flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" /> AI Architecture Layer
              </span>
              <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                DEMO / SIMULATED BENCHMARK DATA
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-1">
              AI Model Registry & Telemetry Matrix
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              12 Independent Specialized AI Models for Simhastha Kumbh Mela 2027 Command Operations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchModels}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Telemetry
            </button>
            <div className="text-right">
              <div className="text-xs font-mono text-emerald-400 font-bold">12 / 12 MODELS HEALTHY</div>
              <div className="text-[10px] text-slate-400">Mean Pipeline Latency: 16.2 ms</div>
            </div>
          </div>
        </div>

        {/* Pipeline Architecture Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="card border-l-4 border-l-blue-500 space-y-1">
            <div className="text-xs text-slate-400 font-medium">Vision & Sensor Ingestion</div>
            <div className="text-lg font-bold text-white">4 Computer Vision Models</div>
            <div className="text-[11px] text-slate-400">YOLOv8, ByteTrack, Farnebäck Flow, HSV Heat</div>
          </div>
          <div className="card border-l-4 border-l-purple-500 space-y-1">
            <div className="text-xs text-slate-400 font-medium">Social NLP & Truth Engine</div>
            <div className="text-lg font-bold text-white">3 Language & Fact Models</div>
            <div className="text-[11px] text-slate-400">IndicBERT Triage, MiniLM Embeddings, Hash Archive</div>
          </div>
          <div className="card border-l-4 border-l-amber-500 space-y-1">
            <div className="text-xs text-slate-400 font-medium">Correlation & Forecasting</div>
            <div className="text-lg font-bold text-white">3 Predictive Systems</div>
            <div className="text-[11px] text-slate-400">Bayesian Fusion, XGBoost 60m, Causal Risk 10-Factor</div>
          </div>
          <div className="card border-l-4 border-l-emerald-500 space-y-1">
            <div className="text-xs text-slate-400 font-medium">Human-in-the-Loop Decision</div>
            <div className="text-lg font-bold text-white">2 Decision & Speech AI</div>
            <div className="text-[11px] text-slate-400">LLM SOP Generator, Multilingual Speech Synthesizer</div>
          </div>
        </div>

        {/* Model Cards Grid */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-mono text-sm">
            Loading AI Model Registry telemetry...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {models.map((model) => (
              <div
                key={model.name}
                className={`card relative overflow-hidden transition-all border ${
                  model.enabled ? "border-slate-800 hover:border-slate-700 bg-slate-900/60" : "border-red-900/30 bg-slate-950/40 opacity-70"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">{model.name}</h3>
                    <div className="text-[11px] text-orange-400 font-mono mt-0.5">{model.provider}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                      model.enabled
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {model.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">{model.purpose}</p>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 mb-3">
                  <div>
                    <span className="text-slate-500 block">Latency:</span>
                    <span className="text-slate-200 font-bold">{model.avg_latency_ms} ms</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Benchmark:</span>
                    <span className="text-emerald-400 font-bold">{(model.confidence_benchmark * 100).toFixed(0)}% mAP/F1</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Threshold:</span>
                    <span className="text-slate-200">{model.threshold}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Total Inferences:</span>
                    <span className="text-amber-400">{model.total_inferences.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-400 truncate max-w-[180px]">{model.input_type}</span>
                  <button
                    onClick={() => handleToggle(model.name, model.enabled)}
                    disabled={toggling === model.name}
                    className={`px-3 py-1 rounded text-[11px] font-semibold transition-all ${
                      model.enabled
                        ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                        : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
                    }`}
                  >
                    {toggling === model.name ? "Updating..." : model.enabled ? "Disable Model" : "Enable Model"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
