"use client";

import { useState } from "react";
import { UserCheck, Search, ShieldAlert, Send, MapPin, Camera, Bell, CheckCircle2, UserX } from "lucide-react";

export type MissingPerson = {
  id: string;
  name: string;
  age: number;
  hometown: string;
  clothing: string;
  contactPhone: string;
  reportedAt: string;
  status: "SEARCHING" | "LOCATED" | "REUNITED";
  lastSeenLocation: string;
  matchCamera?: string;
  matchConfidence?: number;
  matchTimestamp?: string;
  photoUrl?: string;
};

const INITIAL_MISSING: MissingPerson[] = [
  {
    id: "LP-1082",
    name: "Aarav Sharma",
    age: 7,
    hometown: "Varanasi",
    clothing: "Red jacket, black trousers, yellow cap",
    contactPhone: "+91 98765 43210",
    reportedAt: "15 mins ago",
    status: "LOCATED",
    lastSeenLocation: "Sector 3 Pandal",
    matchCamera: "CAM-04 (Ram Kund North Gate)",
    matchConfidence: 94,
    matchTimestamp: "2 mins ago",
  },
  {
    id: "LP-1083",
    name: "Savitri Devi",
    age: 68,
    hometown: "Nagpur",
    clothing: "Blue Saree with floral print, silver bangles",
    contactPhone: "+91 94221 88900",
    reportedAt: "40 mins ago",
    status: "SEARCHING",
    lastSeenLocation: "Kalaram Temple Gate 2",
  },
];

export function LostPersonRadar() {
  const [people, setPeople] = useState<MissingPerson[]>(INITIAL_MISSING);
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "REGISTER">("ACTIVE");
  const [alertSent, setAlertSent] = useState<string | null>(null);

  // Registration Form State
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [hometown, setHometown] = useState("");
  const [clothing, setClothing] = useState("");
  const [phone, setPhone] = useState("");
  const [lastLocation, setLastLocation] = useState("Ram Kund Ghat");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !clothing || !phone) return;

    const newPerson: MissingPerson = {
      id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      age: parseInt(age) || 0,
      hometown: hometown || "Unknown",
      clothing,
      contactPhone: phone,
      reportedAt: "Just now",
      status: "SEARCHING",
      lastSeenLocation: lastLocation,
    };

    setPeople([newPerson, ...people]);
    setActiveTab("ACTIVE");
    // Reset Form
    setName(""); setAge(""); setHometown(""); setClothing(""); setPhone("");
  };

  const handleDispatchOfficer = (id: string, name: string, camera: string) => {
    setAlertSent(`🚨 Emergency Patrol Alert sent to nearest officer at ${camera} for ${name}`);
    setTimeout(() => setAlertSent(null), 5000);
  };

  const handlePublishWhatsApp = (id: string, name: string) => {
    setAlertSent(`📲 WhatsApp Channel & Social Alert published for ${name}`);
    setTimeout(() => setAlertSent(null), 5000);
  };

  const handleMarkReunited = (id: string) => {
    setPeople(people.map(p => p.id === id ? { ...p, status: "REUNITED" } : p));
  };

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-slate-100 flex items-center gap-2">
              AI Lost & Found Pilgrim Finder
              <span className="badge-saffron">Topic #10 Social & Vision Radar</span>
            </h2>
            <p className="text-xs text-slate-400">
              Facial & Visual Attribute Recognition replacing noisy loudspeaker announcements
            </p>
          </div>
        </div>

        <div className="flex bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab("ACTIVE")}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === "ACTIVE" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Active Search ({people.length})
          </button>
          <button
            onClick={() => setActiveTab("REGISTER")}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === "REGISTER" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            + Register Missing
          </button>
        </div>
      </div>

      {alertSent && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs flex items-center gap-2 animate-bounce">
          <Bell className="w-4 h-4 text-emerald-400" />
          <span>{alertSent}</span>
        </div>
      )}

      {activeTab === "ACTIVE" ? (
        <div className="space-y-3">
          {people.map((person) => (
            <div
              key={person.id}
              className={`p-3.5 rounded-xl border transition-all ${
                person.status === "LOCATED"
                  ? "bg-amber-500/10 border-amber-500/40"
                  : person.status === "REUNITED"
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-slate-900/60 border-slate-800"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-orange-400">{person.id}</span>
                    <h3 className="font-bold text-sm text-slate-100">{person.name}</h3>
                    <span className="text-xs text-slate-400">({person.age} yrs • {person.hometown})</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    <span className="text-slate-400 font-medium">Clothing: </span>
                    {person.clothing}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-400" /> Last seen: {person.lastSeenLocation} ({person.reportedAt})
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {person.status === "LOCATED" && (
                    <span className="badge-yellow animate-pulse">
                      <Camera className="w-3 h-3" /> AI DETECTED ({person.matchConfidence}%)
                    </span>
                  )}
                  {person.status === "REUNITED" && (
                    <span className="badge-green">
                      <CheckCircle2 className="w-3 h-3" /> REUNITED
                    </span>
                  )}
                  {person.status === "SEARCHING" && (
                    <span className="badge-orange">
                      <Search className="w-3 h-3 animate-spin" /> SCANNING CCTVs
                    </span>
                  )}
                </div>
              </div>

              {/* AI Detection Match Banner */}
              {person.matchCamera && person.status === "LOCATED" && (
                <div className="mt-3 p-2.5 rounded-lg bg-slate-950/80 border border-amber-500/30 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span className="text-amber-200 font-semibold">
                      Spotted by {person.matchCamera} — {person.matchTimestamp}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDispatchOfficer(person.id, person.name, person.matchCamera!)}
                      className="px-2.5 py-1 rounded bg-orange-500 hover:bg-orange-600 text-white font-medium flex items-center gap-1 transition-colors"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" /> Dispatch Police
                    </button>
                    <button
                      onClick={() => handlePublishWhatsApp(person.id, person.name)}
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" /> Social/WhatsApp Alert
                    </button>
                    <button
                      onClick={() => handleMarkReunited(person.id)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
                    >
                      Mark Reunited
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <form onSubmit={handleRegister} className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Pilgrim Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-orange-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Age & Hometown</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-orange-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Hometown (e.g. Kanpur)"
                  value={hometown}
                  onChange={(e) => setHometown(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-orange-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Clothing & Visual Attributes (Crucial for AI Vision) *</label>
            <input
              type="text"
              required
              placeholder="e.g. Red sweater, dark jeans, carrying green bag"
              value={clothing}
              onChange={(e) => setClothing(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-orange-500 outline-none"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Family Contact Phone *</label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-orange-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Last Seen Location</label>
              <select
                value={lastLocation}
                onChange={(e) => setLastLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-orange-500 outline-none"
              >
                <option value="Ram Kund Ghat">Ram Kund Ghat</option>
                <option value="Kapila Ghat">Kapila Ghat</option>
                <option value="Kalaram Temple Gate 2">Kalaram Temple Gate 2</option>
                <option value="Trimbakeshwar Temple Entrance">Trimbakeshwar Temple Entrance</option>
                <option value="Sector 4 Sleeping Pandal">Sector 4 Sleeping Pandal</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg text-xs tracking-wide transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
          >
            <Camera className="w-4 h-4" /> Start AI Vision CCTV Scan Across All Sectors
          </button>
        </form>
      )}
    </div>
  );
}
