"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { SIMULATION_PLACES, type SimulationPlace } from "@/lib/simulation-places";

export function SimulationContextBanner() {
  const pathname = usePathname();
  const [place, setPlace] = useState<SimulationPlace | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("from") !== "simulation") {
      setPlace(null);
      return;
    }
    setPlace(SIMULATION_PLACES.find((item) => item.id === params.get("place")) ?? null);
  }, [pathname]);

  if (!place || pathname === "/simulation") return null;

  return (
    <div className="border-b border-amber-500/20 bg-[#1c1b22] px-4 py-2.5 text-xs text-slate-200">
      <div className="mx-auto flex max-w-[1850px] flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-amber-400" /><span><strong>Exploring {place.name}</strong> through {place.portalName}. Portal data may be simulated and is not filtered to this exact pin.</span></span>
        <Link href={`/simulation?place=${encodeURIComponent(place.id)}`} className="inline-flex items-center gap-1 font-semibold text-amber-300 hover:underline"><ArrowLeft className="h-3.5 w-3.5" /> Back to 3D place</Link>
      </div>
    </div>
  );
}
