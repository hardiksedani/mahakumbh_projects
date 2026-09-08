import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KumbhRakshak — AI Kumbh Safety Command Centre",
  description: "AI-Powered Kumbh Safety, Incident Detection & Decision Support Platform",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#FF9933",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
