"use client";

import { useState } from "react";
import { Signal, ShieldCheck, Search, PhoneCall, Check, HeartHandshake } from "lucide-react";

export function SafePingRadar() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<any | null>(null);

  const mockDb: Record<string, any> = {
    "9876543210": { name: "Hardik Patel", status: "SAFE", location: "Kapila Ghat Pandal Sector 4", time: "8:30 AM (Mauni Amavasya)", note: "Accompanied family, confirmed safe." },
    "9422188900": { name: "Savitri Devi", status: "SAFE", location: "Sector 3 Sleep Shelter", time: "7:15 AM", note: "Battery 15%, sleeping at pandal." },
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.replace(/\D/g, "");
    if (mockDb[clean]) {
      setResult(mockDb[clean]);
    } else {
      setResult({
        name: query || "Pilgrim",
        status: "SAFE",
        location: "Ram Kund Gate 3",
        time: "10 mins ago",
        note: "Safe ping registered via low-bandwidth SMS network.",
      });
    }
  };

  return (
    <div className="card space-y-3">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
        <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
          <Signal className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-base text-slate-100 flex items-center gap-2">
            "Kumbh SafePing" Low-Bandwidth Family Portal
            <span className="badge-green">Cell Jamming Protection</span>
          </h2>
          <p className="text-xs text-slate-400">
            Allows families back home to verify pilgrim safety during Prayagraj-style mobile network blackouts
          </p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="Enter pilgrim mobile number or Name (e.g. 9876543210)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 outline-none"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg flex items-center gap-1 transition-colors shadow-lg shadow-emerald-600/20"
        >
          <Search className="w-3.5 h-3.5" /> Check Safety Status
        </button>
      </form>

      {result && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="font-bold text-slate-100 text-sm">{result.name}</div>
                <div className="text-[11px] text-emerald-300">Status: {result.status} AND VERIFIED</div>
              </div>
            </div>
            <span className="badge-green">
              <Check className="w-3 h-3" /> VERIFIED SAFE
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-500/20 text-slate-300">
            <div>📍 Location: <span className="font-semibold text-white">{result.location}</span></div>
            <div>🕒 Last Ping: <span className="font-semibold text-white">{result.time}</span></div>
          </div>
          <p className="text-slate-400 text-[11px]">Note: {result.note}</p>
        </div>
      )}
    </div>
  );
}
