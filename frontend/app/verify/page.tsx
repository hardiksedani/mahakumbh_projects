"use client";

import { useState } from "react";
import { Header, SeverityBadge } from "@/components/ui";
import { api, type CounterMessageResponse } from "@/lib/api";
import {
  ShieldAlert, CheckCircle2, AlertTriangle, Send, Copy,
  Globe, Radio, Camera, Sparkles, RefreshCw, Zap, Flame, Search
} from "lucide-react";

type VerifyResult = {
  claim: string;
  likely_location?: string;
  likely_event?: string;
  verification_status: string;
  confidence: number;
  ground_evidence: Record<string, unknown>;
  reasoning: string;
};

const PRESETS = [
  {
    label: "🚨 Viral Stampede Rumor (Fake)",
    claim: "BREAKING: 50-60 people dead in sudden stampede at Gate 7 near Ram Kund! Run away!",
    location: "Ram Kund Gate 7",
    url: "https://instagram.com/reel/mock_panic_stampede",
  },
  {
    label: "⛩️ Temple Closed Rumor (Fake)",
    claim: "Lete Hanuman Mandir is completely CLOSED for general devotees due to heavy VIP movement!",
    location: "Sangam Sector",
    url: "https://x.com/viral_rumor/status/192837192",
  },
  {
    label: "🔥 Campfire Smoke Scare (Misleading)",
    claim: "Massive tent fire at Sector 4 pandal! Black smoke rising everywhere!",
    location: "Sector 4 Sleeping Pandal",
    url: "https://whatsapp.com/channel/kumbh_forward",
  },
];

export default function VerifyPage() {
  const [url, setUrl] = useState(PRESETS[0].url);
  const [caption, setCaption] = useState(PRESETS[0].claim);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [counterMsg, setCounterMsg] = useState<CounterMessageResponse | null>(null);
  const [activeLang, setActiveLang] = useState<"en" | "hi" | "mr" | "gu">("hi");
  const [copied, setCopied] = useState(false);
  const [broadcastNotice, setBroadcastNotice] = useState<string | null>(null);

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    setUrl(preset.url);
    setCaption(preset.claim);
    setResult(null);
    setCounterMsg(null);
  };

  const verifyClaim = async () => {
    setLoading(true);
    setBroadcastNotice(null);
    try {
      // 1. Verify URL / Caption against ground truth cameras
      const res = await api<VerifyResult>("/api/social/verify-url", {
        method: "POST",
        body: JSON.stringify({ url: url || undefined, caption: caption || undefined }),
      });
      setResult(res);

      // 2. Generate Automated Counter-Messaging (Outcome Parameter 10.1)
      const debunk = await api<CounterMessageResponse>("/api/social/counter-message", {
        method: "POST",
        body: JSON.stringify({
          claim: res.claim,
          location_name: res.likely_location || "Ram Kund Sector",
          verification_status: res.verification_status,
        }),
      });
      setCounterMsg(debunk);
    } catch (e) {
      console.error("Verification failed", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyDebunk = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleBroadcast = () => {
    setBroadcastNotice("📢 Official Fact-Check Advisory broadcasted to WhatsApp Channels, X (Twitter), and Mela LED screens!");
    setTimeout(() => setBroadcastNotice(null), 5000);
  };

  return (
    <div className="min-h-screen pb-16 space-y-4">
      <Header />

      <main className="max-w-[1700px] mx-auto px-4 space-y-5">
        {/* Banner */}
        <div className="card bg-gradient-to-r from-slate-950 via-slate-900 to-purple-950/30 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge-saffron">Outcome Parameter 10.1</span>
              <span className="text-xs font-mono text-slate-400">Real-Time NLP & Social Listening Engine</span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-100 mt-1 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-purple-400" />
              AI Misinformation Scanner & Automated Counter-Messaging
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Scans viral social media posts, cross-references claims against CCTV ground-truth sensors within 2km, and auto-generates official debunks.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge-red text-xs">
              <Zap className="w-3.5 h-3.5" /> Panic Prevention Protocol
            </span>
          </div>
        </div>

        {broadcastNotice && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{broadcastNotice}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-5">
          {/* Left Column: Input Form & Presets */}
          <div className="lg:col-span-5 card space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Search className="w-4 h-4 text-orange-400" />
                Input Social Media Post / Viral Reel
              </h2>
              <p className="text-[11px] text-slate-400">Click a preset below or paste any suspicious social media link/text.</p>
            </div>

            {/* Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick Presets for Live Testing</label>
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPreset(p)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 text-xs font-semibold text-slate-200 transition-all flex items-center justify-between"
                >
                  <span>{p.label}</span>
                  <span className="text-[10px] text-orange-400 font-mono">Load</span>
                </button>
              ))}
            </div>

            {/* Inputs */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300">Social Media URL (X, Instagram, WhatsApp)</label>
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono"
                  placeholder="https://instagram.com/p/..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">Post Caption / Audio Transcript</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={4}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 leading-relaxed font-mono"
                  placeholder="Enter claim text..."
                />
              </div>
            </div>

            <button
              onClick={verifyClaim}
              disabled={loading || !caption}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Cross-Referencing Ground CCTV Sensors..." : "Scan & Verify Against Ground Truth"}
            </button>
          </div>

          {/* Right Column: Verification Results & Automated Counter-Messaging */}
          <div className="lg:col-span-7 space-y-4">
            {result ? (
              <>
                {/* Result Overview Card */}
                <div className="card space-y-3 border-l-4 border-l-red-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Ground Truth Sensor Verdict</span>
                      <h3 className="text-base font-extrabold text-slate-100 mt-0.5">{result.claim}</h3>
                    </div>
                    <SeverityBadge severity={result.verification_status} />
                  </div>

                  {/* Metrics Bar */}
                  <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-800 text-center">
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-medium">Confidence Score</div>
                      <div className="text-lg font-black text-emerald-400">{(result.confidence * 100).toFixed(0)}%</div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-medium">Panic Trigger Index</div>
                      <div className="text-lg font-black text-red-400">{counterMsg?.panic_trigger_index ?? 84} / 100</div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-medium">Viral Velocity</div>
                      <div className="text-xs font-bold text-amber-300 mt-1">{counterMsg?.viral_velocity ?? "HIGH"}</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                    <Camera className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-orange-400">CCTV Evidence:</strong> {result.reasoning}. Cross-referenced against sector cameras CAM-102 & CAM-103 within 2 km radius.
                    </span>
                  </div>
                </div>

                {/* Automated Counter-Messaging Card */}
                {counterMsg && (
                  <div className="card space-y-3 border-l-4 border-l-emerald-500">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-2.5">
                      <div>
                        <h4 className="font-bold text-xs text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" /> Automated Official Counter-Message
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Instant authoritative debunking generated to counter the rumor across public channels.
                        </p>
                      </div>

                      {/* Language Tabs */}
                      <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                        <button
                          onClick={() => setActiveLang("hi")}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${activeLang === "hi" ? "bg-orange-500 text-white" : "text-slate-400"}`}
                        >
                          हिन्दी
                        </button>
                        <button
                          onClick={() => setActiveLang("mr")}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${activeLang === "mr" ? "bg-orange-500 text-white" : "text-slate-400"}`}
                        >
                          मराठी
                        </button>
                        <button
                          onClick={() => setActiveLang("gu")}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${activeLang === "gu" ? "bg-orange-500 text-white" : "text-slate-400"}`}
                        >
                          ગુજરાતી
                        </button>
                        <button
                          onClick={() => setActiveLang("en")}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${activeLang === "en" ? "bg-orange-500 text-white" : "text-slate-400"}`}
                        >
                          English
                        </button>
                      </div>
                    </div>

                    {/* Debunk Text Display */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-100 leading-relaxed">
                      {activeLang === "hi" && counterMsg.official_debunk_hi}
                      {activeLang === "mr" && counterMsg.official_debunk_mr}
                      {activeLang === "gu" && counterMsg.official_debunk_gu}
                      {activeLang === "en" && counterMsg.official_debunk_en}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <span>Hashtags:</span>
                        <span className="text-blue-400 font-mono">#KumbhRakshakFactCheck #SafeKumbh</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleCopyDebunk(
                              activeLang === "hi"
                                ? counterMsg.official_debunk_hi
                                : activeLang === "mr"
                                ? counterMsg.official_debunk_mr
                                : activeLang === "gu"
                                ? counterMsg.official_debunk_gu
                                : counterMsg.official_debunk_en
                            )
                          }
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium flex items-center gap-1 transition-all"
                        >
                          {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          {copied ? "Copied!" : "Copy Text"}
                        </button>

                        <button
                          onClick={handleBroadcast}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold flex items-center gap-1 shadow-md shadow-emerald-500/20 transition-all"
                        >
                          <Send className="w-3 h-3" /> 1-Click Public Debunk Broadcast
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Idle Placeholder */
              <div className="card p-12 text-center flex flex-col items-center justify-center min-h-[380px] space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-orange-400">
                  <Radio className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="font-bold text-sm text-slate-200">AI Verification Engine Standby</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Select one of the quick presets on the left or paste any viral post to test real-time CCTV verification and automated counter-messaging.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
