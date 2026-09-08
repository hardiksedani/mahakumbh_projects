"use client";

import { Header } from "@/components/ui";

const EMERGENCY = [
  { name: "Kumbh Medical Centre", lat: 19.992, lng: 73.785, phone: "108" },
  { name: "District Hospital Nashik", lat: 19.997, lng: 73.780, phone: "0253-2312345" },
  { name: "Police Control Room", lat: 19.994, lng: 73.786, phone: "100" },
  { name: "Fire Station Panchvati", lat: 20.008, lng: 73.792, phone: "101" },
];

const SHELTERS = [
  { name: "Shelter Alpha", capacity: 2000, lat: 19.989, lng: 73.781 },
  { name: "Shelter Beta", capacity: 1500, lat: 19.985, lng: 73.778 },
  { name: "Shelter Gamma", capacity: 3000, lat: 19.997, lng: 73.790 },
];

const INSTRUCTIONS = [
  "Stay calm and follow volunteer directions.",
  "Move with the crowd flow — do not push against it.",
  "If separated from family, go to nearest Lost & Found booth.",
  "In case of fire, move away from smoke and alert nearest volunteer.",
  "Emergency helpline: 112 (Unified Emergency Number)",
];

export default function OfflinePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-[800px] mx-auto p-4">
        <div className="card mb-4 border border-yellow-500/30 bg-yellow-500/5">
          <h1 className="text-lg font-bold text-yellow-400">Offline Safety Mode</h1>
          <p className="text-sm text-gray-400 mt-1">
            Critical safety information cached locally. Available without internet connection (PWA).
          </p>
        </div>

        <section className="card mb-4">
          <h2 className="font-semibold text-sm mb-3 text-red-400">Emergency Contacts & Locations</h2>
          <div className="space-y-2">
            {EMERGENCY.map((e) => (
              <div key={e.name} className="p-2 rounded bg-white/5 text-sm flex justify-between">
                <span>{e.name}</span>
                <span className="text-gray-400">{e.phone}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card mb-4">
          <h2 className="font-semibold text-sm mb-3 text-blue-400">Shelters</h2>
          {SHELTERS.map((s) => (
            <div key={s.name} className="p-2 rounded bg-white/5 text-sm mb-2">
              {s.name} — Capacity: {s.capacity}
            </div>
          ))}
        </section>

        <section className="card">
          <h2 className="font-semibold text-sm mb-3 text-emerald-400">Official Safety Instructions</h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
            {INSTRUCTIONS.map((i) => <li key={i}>{i}</li>)}
          </ul>
        </section>
      </main>
    </div>
  );
}
