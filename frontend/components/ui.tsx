"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";
import {
  Activity, Award, BarChart3, Box, ChevronDown, Compass, Cpu, FileCheck,
  Home, MapPin, Radio, Send, ShieldAlert, TrendingUp, Users, Video,
} from "lucide-react";

type NavItem = { href: string; label: string; description: string; icon: LucideIcon };
type NavGroup = { title: string; description: string; items: NavItem[] };

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Explore",
    description: "Understand the places and facilities",
    items: [
      { href: "/", label: "Overview", description: "Start here and see how the platform works", icon: BarChart3 },
      { href: "/simulation", label: "3D place guide", description: "Explore Nashik and Trimbakeshwar", icon: Box },
      { href: "/map", label: "Area map", description: "View locations and spatial context", icon: Compass },
      { href: "/shelters", label: "Shelters", description: "Inspect holding and rest facilities", icon: Home },
    ],
  },
  {
    title: "Monitor",
    description: "Review signals before taking action",
    items: [
      { href: "/cameras", label: "Camera vision", description: "Inspect video-based observations", icon: Video },
      { href: "/crowd", label: "Crowd forecast", description: "Review crowd-pressure projections", icon: TrendingUp },
      { href: "/social", label: "Public reports", description: "See incoming public signals", icon: Radio },
      { href: "/verify", label: "Claim verification", description: "Check evidence behind a claim", icon: FileCheck },
      { href: "/sentiment", label: "Sentiment pulse", description: "Understand public concerns", icon: Users },
    ],
  },
  {
    title: "Respond",
    description: "Coordinate and communicate",
    items: [
      { href: "/incidents", label: "Incidents", description: "Triage and track an event", icon: ShieldAlert },
      { href: "/resources", label: "Resources", description: "Review response teams and assignments", icon: Activity },
      { href: "/broadcast", label: "Broadcast studio", description: "Draft multilingual advisories", icon: Send },
    ],
  },
  {
    title: "Understand",
    description: "See the technology and summary",
    items: [
      { href: "/models", label: "AI models", description: "Review model roles and status", icon: Cpu },
      { href: "/executive", label: "Executive brief", description: "See the project-wide summary", icon: Award },
    ],
  },
];

export const NAV_SECTIONS = NAV_GROUPS.flatMap((group) => group.items);

export function Header({ snanMode }: { snanMode?: boolean }) {
  const pathname = usePathname();
  const current = NAV_SECTIONS.find((item) => item.href === pathname)
    ?? (pathname.startsWith("/incidents/") ? NAV_SECTIONS.find((item) => item.href === "/incidents") : undefined);
  const primary = NAV_SECTIONS.filter((item) => ["/", "/simulation", "/incidents", "/map"].includes(item.href));

  return (
    <header className="site-header sticky top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto flex max-w-[1750px] flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-offset-4" aria-label="KumbhRakshak overview">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e5aa67] text-lg font-bold text-[#173b40]">K</span>
          <span className="min-w-0">
            <span className="block text-[11px] font-semibold uppercase tracking-[.14em] text-[#f7c782]"><span className="sm:hidden">Simhastha 2027</span><span className="hidden sm:inline">Simhastha 2027 · Nashik–Trimbakeshwar</span></span>
            <span className="block text-lg font-extrabold tracking-tight text-[#f5f8f5]">KumbhRakshak</span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="site-nav order-3 flex w-full items-center gap-1 overflow-x-auto border-t pt-2 md:order-2 md:w-auto md:border-0 md:pt-0">
          {primary.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}
                className={clsx("inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors", active ? "bg-[#dceee8] text-[#103f44]" : "text-[#d8e8e1] hover:bg-[#27565b] hover:text-white")}
              >
                <Icon className="h-4 w-4" />{item.label}
              </Link>
            );
          })}
        </nav>

        <div className="order-2 flex items-center gap-2 md:order-3">
          {snanMode && <span className="hidden rounded-full border border-[#f0b9a8] bg-[#612e29] px-3 py-1.5 text-xs font-bold text-[#fff1e9] lg:inline-flex">Bathing-day demo</span>}
          <span className="hidden rounded-full border border-[#bd8d61] bg-[#4b3e32] px-3 py-1.5 text-xs font-bold text-[#ffe1ba] lg:inline-flex">Demo data</span>
          <details className="group relative">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-[#89b1a9] bg-[#edf6f1] px-3 py-2 text-sm font-bold text-[#103f44] hover:bg-white [&::-webkit-details-marker]:hidden">
              All features <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
            </summary>
            <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[min(94vw,820px)] max-h-[75vh] overflow-y-auto rounded-2xl border border-[#d5e4de] bg-white p-4 shadow-xl">
              <div className="mb-4 flex items-center gap-2 border-b border-[#e3ece8] pb-3 text-sm text-[#526874]"><MapPin className="h-4 w-4 text-[#176b70]" />Choose a task to find the right feature</div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {NAV_GROUPS.map((group) => (
                  <div key={group.title}>
                    <h2 className="text-sm font-extrabold text-[#19323d]">{group.title}</h2>
                    <p className="mb-2 text-xs text-[#617783]">{group.description}</p>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        return <Link key={item.href} href={item.href} className={clsx("flex gap-2 rounded-lg p-2 hover:bg-[#eff6f3]", current?.href === item.href && "bg-[#e5f2ef]")}>
                          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#176b70]" />
                          <span><span className="block text-sm font-semibold text-[#19323d]">{item.label}</span><span className="block text-xs leading-snug text-[#617783]">{item.description}</span></span>
                        </Link>;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}

export function KPICard({ label, value, color = "text-[#19323d]", subtitle, icon: Icon }: {
  label: string; value: number | string; color?: string; subtitle?: string; icon?: React.ComponentType<{ className?: string }>;
}) {
  return <div className="flex min-h-[130px] flex-col justify-between rounded-2xl border border-[#d8e5e0] bg-white p-4">
    <div className="flex items-start justify-between gap-2"><span className="text-sm font-medium text-[#526874]">{label}</span>{Icon && <Icon className="h-5 w-5 text-[#176b70]" />}</div>
    <div className={clsx("mt-3 text-2xl font-extrabold tracking-tight", color)}>{value}</div>
    {subtitle && <div className="mt-1 text-xs text-[#617783]">{subtitle}</div>}
  </div>;
}

export function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    CRITICAL: "border-[#edc2be] bg-[#fff0ef] text-[#a73c36]", HIGH: "border-[#eac9ae] bg-[#fff0e4] text-[#955025]",
    WARNING: "border-[#ecd7a6] bg-[#fff7e7] text-[#895b18]", INFO: "border-[#bcd6e5] bg-[#eaf4f9] text-[#315e85]",
    OPEN: "border-[#eac9ae] bg-[#fff0e4] text-[#955025]", IN_PROGRESS: "border-[#bcd6e5] bg-[#eaf4f9] text-[#315e85]",
    RESOLVED: "border-[#b6dfca] bg-[#e9f7f0] text-[#176b4c]", VERIFIED: "border-[#b6dfca] bg-[#e9f7f0] text-[#176b4c]",
    LIKELY: "border-[#ecd7a6] bg-[#fff7e7] text-[#895b18]", UNVERIFIED: "border-[#eac9ae] bg-[#fff0e4] text-[#955025]",
    CONTRADICTED: "border-[#edc2be] bg-[#fff0ef] text-[#a73c36]", UNDER_INVESTIGATION: "border-[#ecd7a6] bg-[#fff7e7] text-[#895b18]",
    POSSIBLE_REUSED_CONTENT: "border-[#ecd7a6] bg-[#fff7e7] text-[#895b18]",
  };
  return <span className={clsx("inline-flex rounded-full border px-2.5 py-1 text-xs font-bold", styles[severity] ?? "border-[#d8e5e0] bg-[#f3f7f5] text-[#526874]")}>{severity.replaceAll("_", " ")}</span>;
}

export function RiskBadge({ score }: { score: number }) {
  const style = score >= 75 ? "border-[#edc2be] bg-[#fff0ef] text-[#a73c36]" : score >= 50 ? "border-[#eac9ae] bg-[#fff0e4] text-[#955025]" : score >= 25 ? "border-[#ecd7a6] bg-[#fff7e7] text-[#895b18]" : "border-[#b6dfca] bg-[#e9f7f0] text-[#176b4c]";
  const level = score >= 75 ? "High" : score >= 50 ? "Elevated" : score >= 25 ? "Moderate" : "Low";
  return <span className={clsx("inline-flex rounded-full border px-2.5 py-1 text-xs font-bold", style)}>{level} risk · {score.toFixed(0)}</span>;
}
