import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SimulationContextBanner } from "@/components/SimulationContextBanner";

export const metadata: Metadata = {
  title: "KumbhRakshak — AI Kumbh Safety Command Centre",
  description: "AI-Powered Kumbh Safety, Incident Detection & Decision Support Platform",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#176B70",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body><SimulationContextBanner />{children}</body>
    </html>
  );
}
