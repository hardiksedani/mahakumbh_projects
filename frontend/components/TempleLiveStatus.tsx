"use client";

import { useState } from "react";
import { Landmark, Clock, Users, Send, CheckCircle2, AlertTriangle } from "lucide-react";

export type TempleStatus = {
  id: string;
  name: string;
  location: string;
  status: "OPEN" | "MODERATE" | "HEAVY" | "CLOSED";
  queueTime: string;
  capacityPct: number;
  lastUpdated: string;
  verifiedBy: string;
};

const INITIAL_TEMPLES: TempleStatus[] = [
  {
    id: "T-1",
    name: "Lete Hanuman Ji Mandir (Sangam Sector)",
    location: "Prayagraj / Nashik Sector 1",
    status: "OPEN",
    queueTime: "15-20 mins",
    capacityPct: 55,
    lastUpdated: "3 mins ago",
    verifiedBy: "Command CCTV + Ground Patrol",
  },
  {
    id: "T-2",
    name: "Ram Kund Main Snan Ghat",
    location: "Nashik Central Ghat Area",
    status: "HEAVY",
    queueTime: "45-60 mins",
    capacityPct: 88,
    lastUpdated: "Just now",
    verifiedBy: "Vision AI Crowd Sensor",
  },
  {
    id: "T-3",
    name: "Kalaram Sansthan Temple",
    location: "Panchavati Sector",
    status: "MODERATE",
    queueTime: "25 mins",
    capacityPct: 62,
    lastUpdated: "5 mins ago",
    verifiedBy: "Temple Patrol Officer",
  },
  {
    id: "T-4",
    name: "Trimbakeshwar Jyotirlinga Mandir",
    location: "Trimbak Range",
    status: "OPEN",
    queueTime: "30 mins",
    capacityPct: 70,
    lastUpdated: "10 mins ago",
    verifiedBy: "Trimbak Sub-Control Desk",
  },
];

export function TempleLiveStatus() {
  const [temples, setTemples] = useState<TempleStatus[]>(INITIAL_TEMPLES);
  const [socialPosted, setSocialPosted] = useState<string | null>(null);

  const handlePostAdvisory = (name: string, status: string, queue: string) => {
    setSocialPosted(`📲 Published Live Social Media Advisory: "${name} is ${status} | Est. Queue: ${queue}"`);
    setTimeout(() => setSocialPosted(null), 5000);
  };

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-slate-100 flex items-center gap-2">
              Temple & Ghat Live Status Tracker
              <span className="badge-saffron">Anti-Rumor Live Feed</span>
            </h2>
            <p className="text-xs text-slate-400">
              Combats false temple closure rumors by broadcasting real-time queue data to WhatsApp & Social Media
            </p>
          </div>
        </div>
      </div>

      {socialPosted && (
        <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{socialPosted}</span>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-3">
        {temples.map((temple) => (
          <div
            key={temple.id}
            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/30 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-100">{temple.name}</h3>
                <p className="text-xs text-slate-400">{temple.location}</p>
              </div>
              <span
                className={
                  temple.status === "OPEN"
                    ? "badge-green"
                    : temple.status === "MODERATE"
                    ? "badge-yellow"
                    : temple.status === "HEAVY"
                    ? "badge-orange"
                    : "badge-red"
                }
              >
                {temple.status === "OPEN" && <CheckCircle2 className="w-3 h-3" />}
                {temple.status === "HEAVY" && <AlertTriangle className="w-3 h-3" />}
                {temple.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 my-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                <Clock className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-[10px] text-slate-400">Wait Time</div>
                  <div className="font-semibold">{temple.queueTime}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                <Users className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="text-[10px] text-slate-400">Crowd Capacity</div>
                  <div className="font-semibold">{temple.capacityPct}% Capacity</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
              <span className="text-[11px] text-slate-400">
                Verified: {temple.lastUpdated}
              </span>
              <button
                onClick={() => handlePostAdvisory(temple.name, temple.status, temple.queueTime)}
                className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-medium flex items-center gap-1 transition-colors"
              >
                <Send className="w-3 h-3" /> Post Social Advisory
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
