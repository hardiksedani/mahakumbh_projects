"use client";

import { useEffect, useState } from "react";
import { Header, SeverityBadge, RiskBadge } from "@/components/ui";
import { api, type Incident } from "@/lib/api";

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  useEffect(() => {
    api<Incident[]>("/api/incidents?limit=50").then(setIncidents).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-[1200px] mx-auto p-4">
        <h1 className="text-xl font-bold mb-4">Incidents</h1>
        <div className="space-y-2">
          {incidents.map((inc) => (
            <a key={inc.id} href={`/incidents/${inc.id}`} className="card block hover:bg-white/5">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-mono text-orange-400">{inc.incident_code}</span>
                  <span className="ml-3">{inc.incident_type}</span>
                  <span className="ml-3 text-gray-400">{inc.location_name}</span>
                </div>
                <div className="flex gap-2">
                  <SeverityBadge severity={inc.severity} />
                  <SeverityBadge severity={inc.status} />
                  <RiskBadge score={inc.risk_score} />
                </div>
              </div>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
