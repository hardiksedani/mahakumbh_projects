"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Header, SeverityBadge, RiskBadge } from "@/components/ui";
import { api, type Incident, type ResponseUnit } from "@/lib/api";

export default function IncidentDetail() {
  const params = useParams();
  const [inc, setInc] = useState<Incident | null>(null);
  const [units, setUnits] = useState<ResponseUnit[]>([]);
  const [rec, setRec] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (!params.id) return;
    api<Incident>(`/api/incidents/${params.id}`).then((i) => {
      setInc(i);
      if (i.latitude && i.longitude) {
        api<ResponseUnit[]>(`/api/response-units/nearest?lat=${i.latitude}&lng=${i.longitude}&limit=5`).then(setUnits);
      }
    }).catch(console.error);
  }, [params.id]);

  const getRecommendation = async () => {
    if (!inc) return;
    const r = await api<{ recommendation: Record<string, unknown> }>("/api/dispatch/recommend", {
      method: "POST", body: JSON.stringify({ incident_id: inc.id }),
    });
    setRec(r.recommendation);
    setInc({ ...inc, ai_recommendation: r.recommendation });
  };

  if (!inc) return <div className="p-8 text-center text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-[1200px] mx-auto p-4 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold font-mono text-orange-400">{inc.incident_code}</h1>
            <p className="text-gray-400">{inc.incident_type} at {inc.location_name || "Unknown location"}</p>
          </div>
          <div className="flex gap-2">
            <SeverityBadge severity={inc.severity} />
            <SeverityBadge severity={inc.status} />
            <RiskBadge score={inc.risk_score} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="card">
            <h2 className="font-semibold mb-2">Ground Evidence</h2>
            <pre className="text-xs text-gray-400 overflow-auto max-h-48">{JSON.stringify(inc.evidence_summary, null, 2)}</pre>
          </div>
          <div className="card">
            <h2 className="font-semibold mb-2">Nearest Response Units</h2>
            {units.map((u) => (
              <div key={u.id} className="flex justify-between text-sm py-1 border-b border-white/5">
                <span>{u.name} ({u.unit_type})</span>
                <span className="text-gray-400">{u.distance_km?.toFixed(1)} km</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-orange-400">AI Decision Support</h2>
            <button onClick={getRecommendation} className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded text-sm hover:bg-orange-500/30">
              Generate Recommendation
            </button>
          </div>
          {(rec || inc.ai_recommendation)?.recommended_actions ? (
            <div>
              <p className="text-sm text-gray-300 mb-2">{(rec || inc.ai_recommendation).reasoning_summary as string}</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                {((rec || inc.ai_recommendation).recommended_actions as string[]).map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Click to generate AI recommendation based on structured evidence.</p>
          )}
        </div>
      </main>
    </div>
  );
}
