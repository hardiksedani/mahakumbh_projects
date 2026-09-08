"use client";

import { useState } from "react";
import { Header, SeverityBadge } from "@/components/ui";
import { api } from "@/lib/api";

type VerifyResult = {
  claim: string;
  likely_location?: string;
  likely_event?: string;
  verification_status: string;
  confidence: number;
  ground_evidence: Record<string, unknown>;
  reasoning: string;
};

export default function VerifyPage() {
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState("");

  const verify = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api<VerifyResult>("/api/social/verify-url", {
        method: "POST",
        body: JSON.stringify({ url: url || undefined, caption: caption || undefined, transcript: transcript || undefined }),
      });
      setResult(res);
    } catch (e) {
      setError("Verification failed. Check backend is running and seeded.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-[800px] mx-auto p-4">
        <h1 className="text-xl font-bold mb-2">Verify This Reel</h1>
        <p className="text-sm text-gray-400 mb-6">
          Paste a social media URL or enter caption/transcript. The system cross-checks claims against ground camera evidence.
        </p>

        <div className="card space-y-4">
          <div>
            <label className="text-xs text-gray-400">Social Media URL</label>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://instagram.com/reel/..."
              className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-400">Caption (if URL cannot be fetched)</label>
            <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={3}
              placeholder="Fire near Gate 7, heavy smoke visible..."
              className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-400">Transcript (optional)</label>
            <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} rows={2}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" />
          </div>
          <button onClick={verify} disabled={loading || (!url && !caption && !transcript)}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 rounded-lg text-sm font-medium">
            {loading ? "Analyzing..." : "Verify Claim"}
          </button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>

        {result && (
          <div className="card mt-6 space-y-3">
            <div className="flex justify-between items-start">
              <h2 className="font-semibold">Verification Result</h2>
              <SeverityBadge severity={result.verification_status} />
            </div>
            <div className="grid gap-2 text-sm">
              <p><span className="text-gray-400">Claim:</span> {result.claim}</p>
              <p><span className="text-gray-400">Likely Event:</span> {result.likely_event || "—"}</p>
              <p><span className="text-gray-400">Likely Location:</span> {result.likely_location || "—"}</p>
              <p><span className="text-gray-400">Confidence:</span> {(result.confidence * 100).toFixed(0)}%</p>
              <p><span className="text-gray-400">Reasoning:</span> {result.reasoning}</p>
            </div>
            {Boolean(result.ground_evidence?.camera_evidence) && (
              <div className="mt-2 p-3 rounded bg-white/5 text-xs">
                <p className="text-gray-400 mb-1">Ground Evidence (Cameras)</p>
                <pre className="overflow-auto">{JSON.stringify(result.ground_evidence.camera_evidence, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
