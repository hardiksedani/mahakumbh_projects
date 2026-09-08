"use client";

import { useEffect, useState } from "react";
import { Header, SeverityBadge } from "@/components/ui";
import { api, type SocialPost } from "@/lib/api";

export default function SocialPage() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const q = filter ? `?verification_status=${filter}` : "";
    api<SocialPost[]>(`/api/social/posts${q}`).then(setPosts).catch(console.error);
  }, [filter]);

  const fetchMock = async () => {
    await api("/api/social/fetch-mock", { method: "POST" });
    api<SocialPost[]>("/api/social/posts").then(setPosts);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-[1200px] mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Social Intelligence</h1>
          <div className="flex gap-2">
            <button onClick={fetchMock} className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded text-sm">Fetch Mock Feed</button>
            {["", "UNVERIFIED", "VERIFIED", "CONTRADICTED", "LIKELY"].map((f) => (
              <button key={f || "all"} onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded text-sm ${filter === f ? "bg-orange-500/20 text-orange-400" : "bg-white/5 text-gray-400"}`}>
                {f || "All"}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {posts.map((p) => (
            <div key={p.id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-gray-400">{p.platform}</span>
                  <SeverityBadge severity={p.verification_status} />
                </div>
                <span className="text-xs text-gray-500">Priority: {(p.social_priority_score * 100).toFixed(0)}</span>
              </div>
              <p className="mt-2">{p.caption}</p>
              <div className="flex gap-4 mt-2 text-xs text-gray-400">
                <span>Type: {(p.extracted_claim as any)?.incident_type || "—"}</span>
                <span>Urgency: {(p.urgency_score * 100).toFixed(0)}%</span>
                {p.location_name && <span>📍 {p.location_name}</span>}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
