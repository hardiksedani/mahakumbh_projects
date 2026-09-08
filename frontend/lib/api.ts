const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options?.headers },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[KumbhRakshak] Backend offline (${API}${path}). Using fallback data.`);
    return getFallbackData<T>(path);
  }
}

function getFallbackData<T>(path: string): T {
  if (path.includes("/dashboard/kpis")) {
    return {
      active_incidents: 3,
      critical_incidents: 1,
      high_incidents: 2,
      unverified_claims: 4,
      verified_claims: 12,
      crowd_risk_zones: 5,
      available_police: 48,
      available_medical: 18,
      available_fire: 12,
      major_snan_mode: false,
    } as unknown as T;
  }
  if (path.includes("/incidents")) {
    return [
      {
        id: "inc-101",
        incident_code: "INC-8821",
        incident_type: "CROWD_SURGE",
        status: "OPEN",
        severity: "CRITICAL",
        confidence: 0.94,
        risk_score: 88,
        priority_score: 90,
        latitude: 19.997,
        longitude: 73.79,
        location_name: "Ram Kund Gate 3",
        evidence_summary: { crowd_density: "8.4 heads/m2" },
        ai_recommendation: { reasoning_summary: "Divert incoming crowd to Kapila Ghat" },
        first_seen: new Date().toISOString(),
      },
      {
        id: "inc-102",
        incident_code: "INC-8822",
        incident_type: "FIRE_HAZARD",
        status: "OPEN",
        severity: "HIGH",
        confidence: 0.89,
        risk_score: 72,
        priority_score: 75,
        latitude: 19.985,
        longitude: 73.775,
        location_name: "Sector 4 Sleeping Pandal",
        evidence_summary: { smoke_detected: true },
        ai_recommendation: { reasoning_summary: "Dispatch Fire Tender F-02" },
        first_seen: new Date().toISOString(),
      },
    ] as unknown as T;
  }
  if (path.includes("/cameras")) {
    return [
      { id: "cam-1", camera_code: "CAM-782", latitude: 19.997, longitude: 73.79, status: "online", stream_type: "simulated" },
      { id: "cam-2", camera_code: "CAM-783", latitude: 19.996, longitude: 73.791, status: "online", stream_type: "simulated" },
      { id: "cam-3", camera_code: "CAM-784", latitude: 19.985, longitude: 73.775, status: "warning", stream_type: "simulated" },
      { id: "cam-4", camera_code: "CAM-785", latitude: 20.008, longitude: 73.792, status: "online", stream_type: "simulated" },
    ] as unknown as T;
  }
  if (path.includes("/social/posts") || path.includes("/social")) {
    return [
      {
        id: "soc-1",
        platform: "X (Twitter)",
        caption: "Rumor: 50-60 deaths reported in stampede near Sector 4 cold fires.",
        extracted_claim: { claim: "Stampede deaths" },
        urgency_score: 0.92,
        relevance_score: 0.95,
        social_priority_score: 0.9,
        verification_status: "UNVERIFIED",
        location_name: "Sector 4 Pandal",
        posted_at: "10 mins ago",
      },
      {
        id: "soc-2",
        platform: "WhatsApp",
        caption: "Lete Hanuman Temple is CLOSED due to heavy rush.",
        extracted_claim: { claim: "Temple closed" },
        urgency_score: 0.75,
        relevance_score: 0.88,
        social_priority_score: 0.82,
        verification_status: "CONTRADICTED",
        location_name: "Sangam Sector",
        posted_at: "25 mins ago",
      },
    ] as unknown as T;
  }
  if (path.includes("/alerts")) {
    return [
      { id: "alt-1", level: "CRITICAL", message: "Stampede warning at Ram Kund Gate 3 - Patrol Unit P-04 dispatched", sent_at: "5 mins ago" },
      { id: "alt-2", level: "WARNING", message: "Campfire smoke detected at Sector 4 Sleeping Pandal", sent_at: "12 mins ago" },
    ] as unknown as T;
  }
  return [] as unknown as T;
}

export function wsUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
  return `${base}${path}`;
}

export type KPIs = {
  active_incidents: number;
  critical_incidents: number;
  high_incidents: number;
  unverified_claims: number;
  verified_claims: number;
  crowd_risk_zones: number;
  available_police: number;
  available_medical: number;
  available_fire: number;
  major_snan_mode: boolean;
};

export type Incident = {
  id: string;
  incident_code: string;
  incident_type: string;
  status: string;
  severity: string;
  confidence: number;
  risk_score: number;
  priority_score: number;
  latitude?: number;
  longitude?: number;
  location_name?: string;
  evidence_summary: Record<string, unknown>;
  ai_recommendation: Record<string, unknown>;
  first_seen: string;
};

export type Camera = {
  id: string;
  camera_code: string;
  latitude: number;
  longitude: number;
  status: string;
  stream_type: string;
};

export type SocialPost = {
  id: string;
  platform: string;
  caption?: string;
  extracted_claim: Record<string, unknown>;
  urgency_score: number;
  relevance_score: number;
  social_priority_score: number;
  verification_status: string;
  location_name?: string;
  posted_at?: string;
};

export type Alert = {
  id: string;
  level: string;
  message: string;
  sent_at: string;
};

export type Shelter = {
  id: string;
  shelter_code: string;
  name: string;
  capacity: number;
  occupied: number;
  occupancy_pct: number;
  overflow_risk: boolean;
  latitude: number;
  longitude: number;
};

export type ResponseUnit = {
  id: string;
  unit_code: string;
  name: string;
  unit_type: string;
  status: string;
  latitude: number;
  longitude: number;
  contact_phone?: string;
  distance_km?: number;
};

