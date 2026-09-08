"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { ShieldCheck, Flame, Radio, Search, Landmark, Bell } from "lucide-react";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/social", label: "Social Intel & Rumor Verification" },
  { href: "/incidents", label: "Incidents" },
  { href: "/cameras", label: "CCTV Vision" },
  { href: "/verify", label: "Verify Reel" },
  { href: "/simulation", label: "Snan Simulator" },
  { href: "/offline", label: "Offline Safety" },
];

export function Header({ snanMode }: { snanMode?: boolean }) {
  const path = usePathname();
  return (
    <header className="border-b border-slate-800 bg-[#0B0F19]/90 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-[1700px] mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 via-amber-600 to-red-700 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-orange-500/20 border border-orange-400/30">
            K
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg tracking-tight text-slate-100">KumbhRakshak 2.0</h1>
              <span className="badge-saffron text-[10px]">Topic #10 Social Intel Hub</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Nashik–Trimbakeshwar & Prayagraj AI Command Centre
            </p>
          </div>

          <span className="ml-3 hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Command Feed
          </span>

          {snanMode && (
            <span className="ml-2 badge-red animate-bounce font-bold tracking-wider">
              <Flame className="w-3.5 h-3.5 text-red-400" /> MAJOR SNAN ALERT ACTIVE
            </span>
          )}
        </div>

        <nav className="hidden lg:flex gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                path === n.href
                  ? "bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-md shadow-orange-500/10"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <div className="text-xs font-semibold text-slate-200">{new Date().toLocaleDateString("en-IN", { weekday: 'short', month: 'short', day: 'numeric' })}</div>
            <div className="text-[10px] text-slate-400 font-mono">2027 NASHIK PREP</div>
          </div>
        </div>
      </div>
    </header>
  );
}

export function KPICard({
  label,
  value,
  color = "text-slate-100",
  subtitle,
}: {
  label: string;
  value: number | string;
  color?: string;
  subtitle?: string;
}) {
  return (
    <div className="card text-center hover:border-orange-500/30 transition-all">
      <div className={clsx("text-2xl font-black tracking-tight", color)}>{value}</div>
      <div className="text-xs text-slate-300 font-medium mt-0.5">{label}</div>
      {subtitle && <div className="text-[10px] text-slate-400 mt-1">{subtitle}</div>}
    </div>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    CRITICAL: "badge-red",
    HIGH: "badge-orange",
    WARNING: "badge-yellow",
    INFO: "badge-green",
    OPEN: "badge-orange",
    RESOLVED: "badge-green",
    VERIFIED: "badge-green",
    UNVERIFIED: "badge-yellow",
    CONTRADICTED: "badge-red",
    LIKELY: "badge-green",
  };
  return <span className={map[severity] || "badge-yellow"}>{severity}</span>;
}

export function RiskBadge({ score }: { score: number }) {
  if (score >= 75) return <span className="badge-red">RED {score.toFixed(0)}</span>;
  if (score >= 50) return <span className="badge-orange">ORANGE {score.toFixed(0)}</span>;
  if (score >= 25) return <span className="badge-yellow">YELLOW {score.toFixed(0)}</span>;
  return <span className="badge-green">GREEN {score.toFixed(0)}</span>;
}

