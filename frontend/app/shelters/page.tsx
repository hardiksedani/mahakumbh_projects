"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/ui";
import { backendRequest } from "@/lib/api";
import { Home, CloudRain, AlertTriangle, CheckCircle, RefreshCw, Users, ShieldAlert } from "lucide-react";

interface Shelter {
  id: string;
  shelter_code?: string;
  name: string;
  location: string;
  capacity: number;
  occupied: number;
  facilities: string[];
  weather_shielding: string;
  diversion_status: string;
  overflow_risk?: boolean;
  occupancy_pct?: number;
}

export default function SheltersPage() {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showingExamples, setShowingExamples] = useState(false);

  const fetchShelters = async () => {
    try {
      setLoading(true);
      const data = await backendRequest<Shelter[]>("/api/shelters");
      if (Array.isArray(data)) {
        const mapped: Shelter[] = data.map((sh: any) => {
          const cap = Number(sh.capacity) || 1000;
          const occ = Number(sh.occupied) || 0;
          const pct = sh.occupancy_pct !== undefined ? Number(sh.occupancy_pct) : Math.round((occ / cap) * 100);
          const isHigh = sh.overflow_risk || pct > 85;

          const defaultFacs = cap > 2000
            ? ["Emergency Medical Post", "Purified Drinking Water", "Devotee Resting Mats", "PA System & Announcement"]
            : ["First Aid Desk", "Drinking Water Kiosk", "Mobile Phone Charging Desk"];

          return {
            id: String(sh.id || Math.random()),
            shelter_code: sh.shelter_code || "SHL",
            name: sh.name || `Devotee Transit Shelter ${sh.shelter_code || ""}`,
            location: sh.location || `Sector ${sh.shelter_code || "Alpha"} (Lat: ${sh.latitude?.toFixed(4) || "19.99"}, Lon: ${sh.longitude?.toFixed(4) || "73.79"})`,
            capacity: cap,
            occupied: occ,
            occupancy_pct: pct,
            overflow_risk: Boolean(sh.overflow_risk),
            facilities: Array.isArray(sh.facilities) && sh.facilities.length > 0 ? sh.facilities : defaultFacs,
            weather_shielding: sh.weather_shielding || (cap > 2000 ? "Waterproof High-Strength Dome (100%)" : "Heavy-Duty All-Weather Canopy"),
            diversion_status: sh.diversion_status || (sh.overflow_risk ? "DIVERTING" : (isHigh ? "HIGH_PRESSURE" : "ACCEPTING")),
          };
        });
        setShelters(mapped);
        setShowingExamples(false);
      }
    } catch {
      setShelters([]);
      setShowingExamples(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShelters();
  }, []);

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 space-y-6">
        {showingExamples && <p role="status" className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">Shelter service is offline. The cards below are fixed examples, not current capacity or facility information.</p>}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge-saffron flex items-center gap-1">
                <Home className="w-3.5 h-3.5" /> Logistics & Devotee Welfare
              </span>
              <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                DEMO / SIMULATED DATA
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-1">
              Rain & Transit Shelters Management
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Live capacity monitoring, weather surge contingency buffers, and automated diversion routing.
            </p>
          </div>

          <button
            onClick={fetchShelters}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-all w-max"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Shelters
          </button>
        </div>

        {/* Rain Advisory Banner */}
        <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <CloudRain className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Example weather contingency scenario</div>
              <div className="text-xs text-slate-400">
                Illustrative rain response workflow. Confirm conditions and shelter status with live sources before action.
              </div>
            </div>
          </div>
          <span className="text-xs font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-lg">
            EXAMPLE OCCUPANCY: 52%
          </span>
        </div>

        {/* Shelters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(shelters.length > 0 ? shelters : showingExamples ? [
            {
              id: "sh-1",
              name: "Sadhu Gram Transit Pavilion Alpha",
              location: "Sadhu Gram Sector 14",
              capacity: 12000,
              occupied: 6400,
              facilities: ["Medical Post", "Drinking Water", "Resting Mats"],
              weather_shielding: "Waterproof Dome (100%)",
              diversion_status: "ACCEPTING",
            },
            {
              id: "sh-2",
              name: "Tapovan High-Capacity Holding Hall",
              location: "Tapovan Entry Point",
              capacity: 25000,
              occupied: 22800,
              facilities: ["First Aid", "Food Desks", "Lost Person Helpdesk"],
              weather_shielding: "Permanent Steel Truss",
              diversion_status: "CAPACITY_NEAR_FULL",
            },
            {
              id: "sh-3",
              name: "Panchvati Covered Devotee Shelter",
              location: "Godavari South Bank",
              capacity: 8000,
              occupied: 3100,
              facilities: ["Drinking Water", "Mobile Charging", "PA Speakers"],
              weather_shielding: "Heavy Duty Tarpaulin",
              diversion_status: "ACCEPTING",
            },
          ] : []).map((sh) => {
            const pct = sh.occupancy_pct !== undefined ? Math.round(sh.occupancy_pct) : Math.round(((sh.occupied || 0) / (sh.capacity || 1)) * 100);
            const isFull = Boolean(sh.overflow_risk) || pct > 85;
            return (
              <div
                key={sh.id}
                className={`card border relative overflow-hidden transition-all ${
                  isFull ? "border-amber-500/40 bg-amber-950/20 shadow-lg shadow-amber-950/20" : "border-slate-800 bg-slate-900/60"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      {sh.name}
                      {sh.shelter_code && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {sh.shelter_code}
                        </span>
                      )}
                    </h3>
                    <div className="text-[11px] text-slate-400 mt-0.5">{sh.location}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                      isFull ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    {isFull ? "HIGH PRESSURE" : "ACCEPTING"}
                  </span>
                </div>

                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Occupancy:</span>
                    <span className="font-bold text-white">
                      {(sh.occupied || 0).toLocaleString()} / {(sh.capacity || 0).toLocaleString()} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${isFull ? "bg-amber-500" : "bg-emerald-500"}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 space-y-1.5 mb-3">
                  <div className="text-slate-400 flex items-center justify-between">
                    <span>Weather Shielding:</span>
                    <span className="text-slate-200 font-medium">{sh.weather_shielding || "Standard All-Weather Canopy"}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(sh.facilities || []).map((fac) => (
                      <span key={fac} className="px-1.5 py-0.5 bg-slate-800/90 text-slate-300 rounded text-[9px] border border-slate-700/50">
                        {fac}
                      </span>
                    ))}
                  </div>
                </div>

                {isFull && (
                  <div className="text-xs text-amber-400 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Auto-diversion: Route influx to nearest sub-capacity holding hall</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {!loading && shelters.length === 0 && !showingExamples && (
          <p className="card text-sm text-slate-400">No shelters were returned by the connected backend.</p>
        )}
      </main>
    </div>
  );
}
