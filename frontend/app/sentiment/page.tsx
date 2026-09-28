"use client";

import { useEffect, useState, useCallback } from "react";
import { Header, SeverityBadge } from "@/components/ui";
import { api, type SentimentPulse, type EmergingCrisisItem } from "@/lib/api";
import {
  Smile, Frown, AlertOctagon, TrendingUp, MapPin,
  RefreshCw, CheckCircle2, Send, ShieldAlert, Users, Compass, BarChart3
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

export default function SentimentPage() {
  const [data, setData] = useState<SentimentPulse | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [resolvedCrises, setResolvedCrises] = useState<Record<string, string>>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<SentimentPulse>("/api/social/sentiment");
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleDispatchAction = (crisis: EmergingCrisisItem) => {
    setResolvedCrises(prev => ({ ...prev, [crisis.id]: "DISPATCHED_TO_PATROL" }));
    setActionNotice(`⚡ Administrative Action Deployed: "${crisis.suggested_action}"`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  const bd = data?.breakdown;

  return (
    <div className="min-h-screen pb-16 space-y-4">
      <Header />

      <main className="max-w-[1700px] mx-auto px-4 space-y-5">
        {/* Banner Header */}
        <div className="card bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge-saffron">Outcome Parameter 10.2</span>
              <span className="text-xs font-mono text-slate-400">Algorithmic Trend Analysis Engine</span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-100 mt-1 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-orange-400" />
              Real-Time Social Media Sentiment & Emerging Crisis Pulse
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Gauges crowd mood, clusters citizen complaint spikes before physical choke points occur, and tracks regional pilgrim influx intent.
            </p>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Scanning Streams..." : "Refresh Social Scan"}
          </button>
        </div>

        {actionNotice && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Top Metric Cards: Mood Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="card text-center border-l-4 border-l-emerald-500">
            <div className="flex items-center justify-center gap-1 text-emerald-400 text-xs font-bold mb-1">
              <Smile className="w-4 h-4" /> Peaceful / Positive
            </div>
            <div className="text-2xl font-black text-slate-100">{bd?.positive ?? 43.5}%</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Devotional sentiment, smooth darshan</div>
          </div>

          <div className="card text-center border-l-4 border-l-blue-500">
            <div className="flex items-center justify-center gap-1 text-blue-400 text-xs font-bold mb-1">
              <Compass className="w-4 h-4" /> Neutral / Informational
            </div>
            <div className="text-2xl font-black text-slate-100">{bd?.neutral ?? 31.0}%</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Travel inquiries, schedule queries</div>
          </div>

          <div className="card text-center border-l-4 border-l-amber-500">
            <div className="flex items-center justify-center gap-1 text-amber-400 text-xs font-bold mb-1">
              <Frown className="w-4 h-4" /> Agitated / Impatient
            </div>
            <div className="text-2xl font-black text-slate-100">{bd?.agitated ?? 13.5}%</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Traffic slowdowns, queue complaints</div>
          </div>

          <div className="card text-center border-l-4 border-l-red-500">
            <div className="flex items-center justify-center gap-1 text-red-400 text-xs font-bold mb-1">
              <AlertOctagon className="w-4 h-4" /> Panicked / Fearful
            </div>
            <div className="text-2xl font-black text-red-400">{bd?.panicked ?? 7.0}%</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Viral rumor anxiety, smoke alarms</div>
          </div>

          <div className="card text-center border-l-4 border-l-purple-500">
            <div className="flex items-center justify-center gap-1 text-purple-400 text-xs font-bold mb-1">
              <Users className="w-4 h-4" /> Total Analyzed
            </div>
            <div className="text-2xl font-black text-slate-100">{bd?.total_analyzed?.toLocaleString() ?? "1,420"}</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Live Posts & Threads / hr</div>
          </div>
        </div>

        {/* Middle Section: Emerging Crises + 24H Sentiment Timeline */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Emerging Crisis Radar */}
          <div className="lg:col-span-2 card space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div>
                <h2 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-orange-400" />
                  Emerging Ground Crises Detected from Social Listening
                </h2>
                <p className="text-[11px] text-slate-400">
                  NLP clusters citizen complaints to pinpoint infrastructure, road, and crowd pressure points.
                </p>
              </div>
              <span className="badge-orange">Real-Time Sensor Fusion</span>
            </div>

            <div className="space-y-2.5">
              {data?.emerging_crises.map((crisis) => {
                const isDispatched = resolvedCrises[crisis.id];
                return (
                  <div
                    key={crisis.id}
                    className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-orange-500/30 transition-all flex flex-col md:flex-row justify-between gap-3 items-start md:items-center"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold bg-slate-950 px-2 py-0.5 rounded text-orange-400 border border-slate-800">
                          {crisis.id}
                        </span>
                        <SeverityBadge severity={crisis.severity} />
                        <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-400" /> {crisis.location}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">({crisis.first_reported})</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-100">{crisis.title}</p>
                      <p className="text-[11px] text-slate-400">
                        <span className="text-amber-400 font-medium">Recommended Action:</span> {crisis.suggested_action}
                      </p>
                    </div>

                    <div className="flex md:flex-col items-end gap-1.5 shrink-0 w-full md:w-auto justify-between md:justify-end">
                      <span className="text-[11px] font-mono text-slate-400">
                        🔥 {crisis.report_count} Social Complaints
                      </span>
                      {isDispatched ? (
                        <span className="badge-green text-[10px]">
                          <CheckCircle2 className="w-3 h-3" /> Dispatched
                        </span>
                      ) : (
                        <button
                          onClick={() => handleDispatchAction(crisis)}
                          className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium text-[11px] flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition-all"
                        >
                          <Send className="w-3 h-3" /> Deploy Protocol
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 24-Hour Sentiment Timeline Chart */}
          <div className="card space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  24-Hour Public Mood Timeline
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">LIVE TREND</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 mb-2">
                Hourly sentiment curves (Positive vs Neutral vs Negative).
              </p>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.timeline || []} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "11px" }}
                    />
                    <Area type="monotone" dataKey="positive" stroke="#10b981" fillOpacity={1} fill="url(#colorPositive)" />
                    <Area type="monotone" dataKey="negative" stroke="#ef4444" fillOpacity={1} fill="url(#colorNegative)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Positive / Devotional</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-red-500" /> Friction / Complaints</span>
            </div>
          </div>
        </div>

        {/* Bottom Section: Regional Influx Intent Radar */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div>
              <h2 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Compass className="w-4 h-4 text-purple-400" />
                Regional Pilgrim Influx Intent (Inter-State Travel Analytics)
              </h2>
              <p className="text-[11px] text-slate-400">
                Measures geo-tagged travel intent, train/bus hashtag volume, and regional sentiment to help transport authorities plan capacity.
              </p>
            </div>
            <span className="badge-saffron">Transit Intelligence</span>
          </div>

          <div className="grid md:grid-cols-5 gap-3">
            {data?.regional_influx.map((reg) => (
              <div
                key={reg.state}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-slate-100">{reg.state}</span>
                  <span className="text-xs font-black text-purple-400 font-mono">{reg.share_pct}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-500 to-purple-500 h-full" style={{ width: `${reg.share_pct * 2}%` }} />
                </div>
                <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">{reg.dominant_intent}</p>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Est. Flow:</span>
                  <span className="font-bold text-emerald-400">{reg.estimated_pilgrims}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
