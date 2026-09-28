"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/ui";
import { MapView } from "@/components/MapView";
import { Compass, Eye, ShieldAlert, Home, Layers, Video, RefreshCw } from "lucide-react";

export default function GISMapPage() {
  const [cameras, setCameras] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [showCameras, setShowCameras] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);
  const [showShelters, setShowShelters] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:8000/api/cameras").then((r) => r.json()),
      fetch("http://localhost:8000/api/incidents").then((r) => r.json()),
    ])
      .then(([cams, incs]) => {
        if (Array.isArray(cams)) setCameras(cams);
        if (Array.isArray(incs)) setIncidents(incs);
      })
      .catch(console.error);
  }, []);

  const markers: any[] = [];

  if (showCameras) {
    cameras.forEach((c) => {
      markers.push({
        id: c.id,
        lat: c.latitude || 19.9975,
        lng: c.longitude || 73.7898,
        label: c.camera_code,
        color: "#38bdf8",
        type: "CCTV Camera",
        crowd_count: 140,
      });
    });
  }

  if (showIncidents) {
    incidents.forEach((inc) => {
      markers.push({
        id: inc.id,
        lat: inc.latitude || 19.998,
        lng: inc.longitude || 73.791,
        label: inc.incident_code || "Incident",
        color: inc.severity === "CRITICAL" ? "#ef4444" : "#f59e0b",
        type: inc.incident_type,
      });
    });
  }

  if (showShelters) {
    [
      { id: "sh-1", lat: 19.992, lng: 73.782, label: "Sadhu Gram Shelter Alpha", color: "#10b981", type: "Shelter" },
      { id: "sh-2", lat: 20.005, lng: 73.799, label: "Tapovan Holding Arena", color: "#10b981", type: "Shelter" },
    ].forEach((s) => markers.push(s));
  }

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 md:p-6 flex flex-col gap-4">
        {/* Top Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge-saffron flex items-center gap-1">
                <Compass className="w-3.5 h-3.5" /> Geospatial Command
              </span>
              <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                DEMO / SIMULATED DATA
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-1">
              GIS Sector Radar & Situational Map
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Live multi-layer map of Nashik–Trimbakeshwar Kumbh Mela sectors, camera optical nodes, active incidents, and holding pavilions.
            </p>
          </div>

          {/* Layer Filter Toggles */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setShowCameras(!showCameras)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                showCameras ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "text-slate-400"
              }`}
            >
              <Video className="w-3.5 h-3.5" /> CCTV Cameras ({cameras.length})
            </button>
            <button
              onClick={() => setShowIncidents(!showIncidents)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                showIncidents ? "bg-red-500/20 text-red-400 border border-red-500/30" : "text-slate-400"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" /> Incidents ({incidents.length})
            </button>
            <button
              onClick={() => setShowShelters(!showShelters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                showShelters ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-slate-400"
              }`}
            >
              <Home className="w-3.5 h-3.5" /> Shelters (3)
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 w-full h-[650px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
          <MapView markers={markers} />
        </div>
      </main>
    </div>
  );
}
