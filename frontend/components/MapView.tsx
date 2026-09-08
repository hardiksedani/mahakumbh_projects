"use client";

import { useEffect, useRef, useState } from "react";
import { CameraVisionModal } from "@/components/CameraVisionModal";

type Marker = { id: string; lat: number; lng: number; label: string; color?: string; type?: string; crowd_count?: number };

export function MapView({ markers, center = [73.7898, 19.9975] }: { markers: Marker[]; center?: [number, number] }) {
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapRef = useRef<any>(null);

  const [selectedCamera, setSelectedCamera] = useState<any | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    if (token) {
      import("mapbox-gl").then((mapboxgl) => {
        mapboxgl.default.accessToken = token;
        if (mapRef.current) mapRef.current.remove();
        const map = new mapboxgl.default.Map({
          container: ref.current!,
          style: "mapbox://styles/mapbox/dark-v11",
          center: center,
          zoom: 13,
        });
        mapRef.current = map;
        map.on("load", () => {
          markers.forEach((m) => {
            const el = document.createElement("div");
            el.className = "w-3.5 h-3.5 rounded-full border-2 border-white cursor-pointer hover:scale-125 transition-transform shadow-lg";
            el.style.backgroundColor = m.color || "#FF9933";
            el.onclick = () => {
              setSelectedCamera({ id: m.id, camera_code: m.label, location_name: m.type, status: "online", crowd_count: m.crowd_count });
            };
            new mapboxgl.default.Marker(el).setLngLat([m.lng, m.lat]).setPopup(
              new mapboxgl.default.Popup().setHTML(`<strong>${m.label}</strong><br/>${m.type || ""}`)
            ).addTo(map);
          });
        });
      });
    } else if (canvasRef.current) {
      // High-tech Canvas Radar Renderer fallback
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let animationFrameId: number;
      let angle = 0;

      const render = () => {
        const width = (canvas.width = canvas.parentElement?.clientWidth || 800);
        const height = (canvas.height = canvas.parentElement?.clientHeight || 450);

        // Dark Background Grid
        ctx.fillStyle = "#090D16";
        ctx.fillRect(0, 0, width, height);

        // Radar Concentric Circles
        ctx.strokeStyle = "rgba(51, 65, 85, 0.4)";
        ctx.lineWidth = 1;
        const centerX = width / 2;
        const centerY = height / 2;
        const maxRadius = Math.max(width, height) / 2;

        for (let r = 50; r < maxRadius; r += 60) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Crosshairs
        ctx.beginPath();
        ctx.moveTo(centerX, 0); ctx.lineTo(centerX, height);
        ctx.moveTo(0, centerY); ctx.lineTo(width, centerY);
        ctx.stroke();

        // Sector Zones Highlight
        ctx.fillStyle = "rgba(249, 115, 22, 0.06)";
        ctx.beginPath();
        ctx.arc(centerX - 80, centerY - 40, 110, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(249, 115, 22, 0.3)";
        ctx.stroke();

        ctx.fillStyle = "rgba(16, 185, 129, 0.06)";
        ctx.beginPath();
        ctx.arc(centerX + 120, centerY + 50, 90, 0, Math.PI * 2);
        ctx.fill();

        // Sector Text Labels
        ctx.fillStyle = "#F97316";
        ctx.font = "bold 11px sans-serif";
        ctx.fillText("SECTOR 1: RAM KUND (88% CAPACITY)", centerX - 160, centerY - 140);
        ctx.fillStyle = "#10B981";
        ctx.fillText("SECTOR 3: KAPILA GHAT (42% CAPACITY)", centerX + 60, centerY + 130);

        // Sweep Radar Line
        angle += 0.015;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, maxRadius, angle, angle + 0.25);
        ctx.closePath();
        const sweepGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
        sweepGrad.addColorStop(0, "rgba(249, 115, 22, 0.25)");
        sweepGrad.addColorStop(1, "rgba(249, 115, 22, 0.0)");
        ctx.fillStyle = sweepGrad;
        ctx.fill();

        // Render Markers
        markers.slice(0, 24).forEach((m, idx) => {
          const x = centerX + Math.cos(idx * 0.8) * (80 + (idx % 4) * 55);
          const y = centerY + Math.sin(idx * 0.8) * (60 + (idx % 3) * 45);

          // Pulsing Glow
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fillStyle = m.color || "#3B82F6";
          ctx.fill();
          ctx.strokeStyle = "#FFFFFF";
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Label
          ctx.fillStyle = "#CBD5E1";
          ctx.font = "10px sans-serif";
          ctx.fillText(m.label, x + 8, y + 3);
        });

        animationFrameId = requestAnimationFrame(render);
      };

      render();
      return () => cancelAnimationFrame(animationFrameId);
    }
  }, [markers, center]);

  return (
    <div ref={ref} className="relative w-full h-full min-h-[420px] rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
      <canvas
        ref={canvasRef}
        onClick={(e) => {
          // Click simulation for demo modal inspect
          const randomMarker = markers[Math.floor(Math.random() * markers.length)];
          if (randomMarker) {
            setSelectedCamera({
              id: randomMarker.id,
              camera_code: randomMarker.label,
              location_name: "Ram Kund Main Sector",
              status: "online",
              crowd_count: 148,
            });
          }
        }}
        className="w-full h-full cursor-pointer"
      />

      <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-center gap-2 pointer-events-none">
        <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
        <span>Canvas Situation Radar • Click anywhere to inspect AI CCTV Stream</span>
      </div>

      {selectedCamera && (
        <CameraVisionModal
          camera={selectedCamera}
          onClose={() => setSelectedCamera(null)}
        />
      )}
    </div>
  );
}

