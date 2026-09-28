"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  ShieldAlert,
  Flame,
  Radio,
  Video,
  Compass,
  Cpu,
  Home,
  Users,
  Award,
  Send,
  GitBranch,
  BarChart3,
  FileCheck,
  CheckCircle2,
  TrendingUp,
  Box,
} from "lucide-react";

// All 14 core operational portals permanently visible on all screens
export const NAV_SECTIONS = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/simulation", label: "3D Simulation (Three.js)", icon: Box, highlight: true },
  { href: "/incidents", label: "Incidents", icon: ShieldAlert },
  { href: "/cameras", label: "CCTV Vision", icon: Video },
  { href: "/map", label: "GIS Radar", icon: Compass },
  { href: "/verify", label: "Rumor Scanner (10.1)", icon: ShieldAlert },
  { href: "/sentiment", label: "Sentiment Pulse (10.2)", icon: Users },
  { href: "/broadcast", label: "Broadcast Studio (10.3)", icon: Send },
  { href: "/crowd", label: "Crowd Forecast", icon: TrendingUp },
  { href: "/shelters", label: "Shelters", icon: Home },
  { href: "/resources", label: "Resource Dispatch", icon: FileCheck },
  { href: "/social", label: "Social Feed", icon: Radio },
  { href: "/models", label: "AI Models (12)", icon: Cpu },
  { href: "/executive", label: "Executive Brief", icon: Award },
];

export function Header({ snanMode }: { snanMode?: boolean }) {
  const path = usePathname();

  return (
    <header className="border-b border-slate-800/80 bg-[#070A12]/98 backdrop-blur-xl sticky top-0 z-50 shadow-xl">
      {/* Top Protocol & Provenance Bar */}
      <div className="bg-slate-950/90 border-b border-slate-800/60 px-4 py-1.5 text-[11px] font-mono flex items-center justify-between text-slate-400">
        <div className="flex items-center gap-3">
          <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            DEMO / SIMULATED DATA
          </span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline text-slate-300 font-medium">
            Simhastha Kumbh Mela 2027 — Nashik–Trimbakeshwar AI Command Platform
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            12 AI ENGINES ONLINE
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> C4I WS: LIVE
          </span>
        </div>
      </div>

      {/* Main Branding Bar */}
      <div className="max-w-[1850px] mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 via-amber-600 to-red-600 flex items-center justify-center font-black text-lg text-white shadow-lg shadow-orange-500/20 border border-orange-400/40 group-hover:scale-105 transition-transform">
            K
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base tracking-tight text-white group-hover:text-orange-400 transition-colors">
                KUMBHRAKSHAK
              </h1>
              <span className="bg-orange-500/15 text-orange-400 border border-orange-500/30 text-[10px] font-mono px-2 py-0.5 rounded-md font-bold">
                AI C4I COMMAND
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Simhastha Kumbh 2027 — Nashik–Trimbakeshwar Joint Safety Platform
            </p>
          </div>
        </Link>

        {snanMode && (
          <span className="badge-red animate-bounce text-[10px] font-bold flex items-center gap-1.5 px-3 py-1 shadow-lg shadow-red-500/20">
            <Flame className="w-3.5 h-3.5 text-red-400" /> MAJOR SHAHI SNAN ALERT ACTIVE
          </span>
        )}

        <div className="text-right hidden lg:block font-mono text-[11px]">
          <div className="text-slate-300 font-bold">ALL 14 PORTALS LIVE</div>
          <div className="text-slate-500 text-[10px]">Zero Menus • Direct 1-Click Access</div>
        </div>
      </div>

      {/* PERMANENT ACTIVE PORTALS NAVIGATION BAR (Always visible on all screens, no 3-lines menu!) */}
      <div className="w-full bg-[#050810] border-t border-slate-800/80 px-4 py-1.5">
        <div className="max-w-[1850px] mx-auto flex items-center gap-1.5 overflow-x-auto scrollbar-thin pb-0.5">
          <span className="text-[10px] font-mono text-orange-400 font-bold uppercase tracking-wider px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg shrink-0 flex items-center gap-1">
            <span>PORTALS:</span>
          </span>

          {NAV_SECTIONS.map((n: any) => {
            const Icon = n.icon;
            const isActive = path === n.href;
            const isHighlight = n.highlight && !isActive;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0",
                  isActive
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/50 shadow-md shadow-orange-500/10 font-bold"
                    : isHighlight
                    ? "bg-gradient-to-r from-orange-500/15 to-amber-500/15 border border-orange-500/40 text-amber-300 hover:text-white hover:border-orange-400 shadow-sm"
                    : "bg-slate-900/60 border border-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700"
                )}
              >
                <Icon className={clsx("w-3.5 h-3.5", isActive ? "text-orange-400" : isHighlight ? "text-amber-400" : "text-slate-400")} />
                <span>{n.label}</span>
                {isHighlight && (
                  <span className="text-[9px] font-mono bg-orange-500/30 text-orange-300 px-1 py-0.2 rounded font-bold">
                    3D
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}

export function KPICard({
  label,
  value,
  color = "text-white",
  subtitle,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  color?: string;
  subtitle?: string;
  icon?: any;
}) {
  return (
    <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium tracking-wide">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-slate-500" />}
      </div>
      <div className="my-1.5">
        <div className={clsx("text-2xl lg:text-3xl font-black tracking-tight font-mono", color)}>{value}</div>
      </div>
      {subtitle && <div className="text-[11px] text-slate-400 font-mono truncate">{subtitle}</div>}
    </div>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    CRITICAL: "bg-red-500/20 text-red-400 border-red-500/40",
    HIGH: "bg-orange-500/20 text-orange-400 border-orange-500/40",
    WARNING: "bg-amber-500/20 text-amber-400 border-amber-500/40",
    INFO: "bg-blue-500/20 text-blue-400 border-blue-500/40",
    OPEN: "bg-orange-500/20 text-orange-400 border-orange-500/40",
    IN_PROGRESS: "bg-blue-500/20 text-blue-400 border-blue-500/40",
    RESOLVED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
    VERIFIED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
    LIKELY: "bg-amber-500/20 text-amber-400 border-amber-500/40",
    UNVERIFIED: "bg-orange-500/20 text-orange-400 border-orange-500/40",
    CONTRADICTED: "bg-red-500/20 text-red-400 border-red-500/40",
    UNDER_INVESTIGATION: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
    POSSIBLE_REUSED_CONTENT: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  };
  const cls = map[severity] || "bg-slate-800 text-slate-300 border-slate-700";
  return (
    <span className={clsx("px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border tracking-wider", cls)}>
      {severity}
    </span>
  );
}

export function RiskBadge({ score }: { score: number }) {
  if (score >= 75) {
    return (
      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40">
        RISK: RED ({score.toFixed(0)})
      </span>
    );
  }
  if (score >= 50) {
    return (
      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-orange-500/20 text-orange-400 border border-orange-500/40">
        RISK: ORANGE ({score.toFixed(0)})
      </span>
    );
  }
  if (score >= 25) {
    return (
      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
        RISK: YELLOW ({score.toFixed(0)})
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
      RISK: GREEN ({score.toFixed(0)})
    </span>
  );
}
