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
  if (path.includes("/social/sentiment")) {
    return {
      breakdown: {
        positive: 43.5,
        neutral: 31.0,
        agitated: 13.5,
        panicked: 7.0,
        frustrated: 5.0,
        overall_mood: "ELEVATED_VIGILANCE",
        total_analyzed: 1420,
      },
      emerging_crises: [
        {
          id: "CRS-101",
          category: "ROAD_BLOCKED",
          title: "Heavy traffic choke on Trimbak Road approaching Gate 4",
          location: "Trimbakeshwar Road / Gate 4",
          report_count: 28,
          sentiment_score: -0.78,
          severity: "HIGH",
          first_reported: "14 mins ago",
          suggested_action: "Divert light vehicles to Ring Road Sector 7 & dispatch Traffic Unit 12",
          status: "ACTIVE_DISPATCH",
        },
        {
          id: "CRS-102",
          category: "CHOKE_POINT",
          title: "Devotee compression buildup near Ram Kund Steps",
          location: "Ram Kund Steps (South Gate)",
          report_count: 19,
          sentiment_score: -0.65,
          severity: "HIGH",
          first_reported: "22 mins ago",
          suggested_action: "Open secondary barricades towards Godavari Ghat North",
          status: "VOLUNTEERS_DEPLOYED",
        },
        {
          id: "CRS-103",
          category: "WATER_SHORTAGE",
          title: "Drinking water taps dry at Pilgrim Holding Area C",
          location: "Holding Area C, Sector 9",
          report_count: 14,
          sentiment_score: -0.52,
          severity: "MEDIUM",
          first_reported: "35 mins ago",
          suggested_action: "Route 2 Emergency Water Tankers from Municipal Depot 3",
          status: "RESOLVING",
        },
        {
          id: "CRS-104",
          category: "SANITATION",
          title: "Bio-toilet maintenance requested near Camp 14",
          location: "Sadhu Gram Sector 14",
          report_count: 8,
          sentiment_score: -0.40,
          severity: "LOW",
          first_reported: "50 mins ago",
          suggested_action: "Assign Sanitation Squad Bravo",
          status: "RESOLVED",
        },
      ],
      regional_influx: [
        {
          state: "Uttar Pradesh",
          share_pct: 34.0,
          dominant_intent: "Prayagraj-Nashik Direct Pilgrimage Trains",
          sentiment: "HIGH_ANTICIPATION",
          estimated_pilgrims: "4.2 Lakh / Day",
        },
        {
          state: "Gujarat",
          share_pct: 26.5,
          dominant_intent: "Surat/Ahmedabad Highway Bus Caravans",
          sentiment: "VERY_POSITIVE",
          estimated_pilgrims: "3.1 Lakh / Day",
        },
        {
          state: "Maharashtra",
          share_pct: 21.5,
          dominant_intent: "Intra-state Mumbai/Pune Local Shuttles",
          sentiment: "SATISFIED",
          estimated_pilgrims: "2.8 Lakh / Day",
        },
        {
          state: "Madhya Pradesh",
          share_pct: 11.0,
          dominant_intent: "Indore-Nashik Pilgrim Route",
          sentiment: "MODERATE",
          estimated_pilgrims: "1.4 Lakh / Day",
        },
        {
          state: "Rajasthan & Bihar",
          share_pct: 7.0,
          dominant_intent: "Long-distance special train bookings",
          sentiment: "CONCERNED_ABOUT_CROWD",
          estimated_pilgrims: "0.9 Lakh / Day",
        },
      ],
      timeline: [
        { time: "00:00", positive: 65, neutral: 25, negative: 10 },
        { time: "04:00", positive: 78, neutral: 18, negative: 4 },
        { time: "08:00", positive: 55, neutral: 30, negative: 15 },
        { time: "12:00", positive: 48, neutral: 32, negative: 20 },
        { time: "16:00", positive: 52, neutral: 34, negative: 14 },
        { time: "20:00", positive: 60, neutral: 28, negative: 12 },
      ],
      last_updated: new Date().toISOString(),
    } as unknown as T;
  }
  if (path.includes("/social/counter-message")) {
    return {
      original_claim: "Stampede reported at Gate 7 with casualties",
      verification_status: "CONTRADICTED",
      official_debunk_en: "OFFICIAL FACT-CHECK: Reports alleging stampede at Gate 7 have been VERIFIED FALSE via live CCTV sensors (CAM-102 & CAM-103). Flow is normal. Devotees are requested to rely strictly on official Kumbh alerts.",
      official_debunk_hi: "आधिकारिक तथ्य-जाँच: गेट 7 पर भगदड़ का दावा पूरी तरह भ्रामक और असत्य है। लाइव सीसीटीवी कैमरों द्वारा पुष्टि की गई है कि स्थिति सामान्य और शांतिपूर्ण है। कृपया अफवाहों पर ध्यान न दें।",
      official_debunk_mr: "अधिकृत माहिती तपासणी: गेट ७ येथे चेंगराचेंगरी झाल्याचे वृत्त पूर्णपणे खोटे व निराधार आहे. सीसीटीव्ही नियंत्रण कक्षाद्वारे तपासणी केली असता तेथील गर्दी व वाहतूक सुरळीत आहे.",
      official_debunk_gu: "સત્તાવાર ફેક્ટ-ચેક: ગેટ ૭ પર નાસભાગના અહેવાલો તદ્દન ખોટા છે. સીસીટીવી કેમેરા દ્વારા ચકાસણી કરવામાં આવી છે અને સ્થિતિ શાંતિપૂર્ણ છે. અફવાઓ પર વિશ્વાસ ન કરવો.",
      confidence: 0.95,
      recommended_channels: ["WhatsApp Official Broadcast", "X/Twitter Police Handle", "Public LED Displays", "Ghat PA Loudspeakers"],
      suggested_hashtags: ["#KumbhRakshakFactCheck", "#Mahakumbh2026", "#SafeKumbh", "#NashikPoliceUpdate"],
      panic_trigger_index: 84,
      viral_velocity: "HIGH (340 shares/min)",
    } as unknown as T;
  }
  if (path.includes("/social/generate-multilingual")) {
    return {
      id: "PUB-9201",
      topic: "TRAFFIC_DIVERSION",
      title: "Traffic Diversion Advisory",
      generated_at: new Date().toISOString(),
      verified_stamp: true,
      channels: {
        x_twitter: {
          channel: "X (Twitter)",
          english: "🚨 TRAFFIC UPDATE: Heavy devotee movement towards Ram Kund. Light vehicles diverted via Ring Road Sector 7. Please follow police marshals. #KumbhMela2026 #KumbhTraffic",
          hindi: "🚨 यातायात सूचना: राम कुंड की ओर भारी भीड़ के दृष्टिगत हल्के वाहनों को रिंग रोड सेक्टर 7 की तरफ मोड़ा गया है। कृपया पुलिस निर्देशों का पालन करें। #KumbhMela2026 #KumbhTraffic",
          marathi: "🚨 वाहतूक सूचना: रामकुंडाकडे भाविकांची गर्दी वाढल्यामुळे हलकी वाहने रिंग रोड सेक्टर ७ कडे वळवण्यात आली आहेत. #KumbhMela2026 #KumbhTraffic",
          gujarati: "🚨 ટ્રાફિક અપડેટ: રામ કુંડ તરફ શ્રદ્ધાળુઓની ભીડને લીધે નાના વાહનોને રિંગ રોડ સેક્ટર ૭ તરફ વાળવામાં આવ્યા છે. #KumbhMela2026 #KumbhTraffic",
          hashtags: ["#KumbhMela2026", "#KumbhTraffic"],
        },
        whatsapp: {
          channel: "WhatsApp Community Bulletin",
          english: "*Kumbh Authority Official Bulletin*\n\n🚨 TRAFFIC UPDATE: Heavy devotee movement towards Ram Kund. Light vehicles diverted via Ring Road Sector 7. Follow on-ground marshals.\n\n📍 Helplines: 108 / 100\n🔗 Status: Official Verified",
          hindi: "*कुंभ मेला प्राधिकरण बुलेटिन*\n\n🚨 यातायात सूचना: राम कुंड की ओर भारी भीड़ के दृष्टिगत हल्के वाहनों को रिंग रोड सेक्टर 7 की तरफ मोड़ा गया है।\n\n📍 हेल्पलाइन: 108 / 100\n🔗 आधिकारिक सत्यापित सूचना",
          marathi: "*कुंभमेळा प्राधिकरण बुलेटिन*\n\n🚨 वाहतूक सूचना: रामकुंडाकडे भाविकांची गर्दी वाढल्यामुळे हलकी वाहने रिंग रोड सेक्टर ७ कडे वळवण्यात आली आहेत.\n\n📍 मदत कक्ष: १०८ / १००\n🔗 अधिकृत सत्यापित माहिती",
          gujarati: "*કુંભમેળા સત્તાવાર બુલેટિન*\n\n🚨 ટ્રાફિક અપડેટ: રામ કુંડ તરફ શ્રદ્ધાળુઓની ભીડને લીધે નાના વાહનોને રિંગ રોડ સેક્ટર ૭ તરફ વાળવામાં આવ્યા છે.\n\n📍 હેલ્પલાઇન: ૧૦૮ / ૧૦૦\n🔗 સત્તાવાર પ્રમાણિત માહિતી",
          hashtags: ["#KumbhMela2026", "#KumbhTraffic"],
        },
        instagram: {
          channel: "Instagram Advisory Story",
          english: "🚨 [OFFICIAL UPDATE] Route Diversion Active.\nHeavy movement near Ram Kund. Tap link in bio for interactive live route map.",
          hindi: "🚨 [आधिकारिक सूचना] रूट डायवर्जन लागू।\nराम कुंड की ओर भारी भीड़। लाइव रूट मैप हेतु बायो में दिए लिंक पर क्लिक करें।",
          marathi: "🚨 [अधिकृत सूचना] मार्ग वळवण्यात आला आहे.\nथेट नकाशासाठी बायोमधील लिंक तपासा.",
          gujarati: "🚨 [સત્તાવાર માહિતી] રૂટ ડાયવર્ઝન અમલી.\nલાઇવ નકશા માટે બાયોમાં લિંક તપાસો.",
          hashtags: ["#KumbhMela2026", "#SafeKumbh"],
        },
      },
    } as unknown as T;
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
  title?: string;
  description?: string;
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

// Outcome Parameter 10.1: Counter-Messaging
export type CounterMessageResponse = {
  original_claim: string;
  verification_status: string;
  official_debunk_en: string;
  official_debunk_hi: string;
  official_debunk_mr: string;
  official_debunk_gu: string;
  confidence: number;
  recommended_channels: string[];
  suggested_hashtags: string[];
  panic_trigger_index: number;
  viral_velocity: string;
};

// Outcome Parameter 10.2: Sentiment & Crisis Pulse
export type EmergingCrisisItem = {
  id: string;
  category: string;
  title: string;
  location: string;
  report_count: number;
  sentiment_score: number;
  severity: string;
  first_reported: string;
  suggested_action: string;
  status: string;
};

export type RegionalInfluxItem = {
  state: string;
  share_pct: number;
  dominant_intent: string;
  sentiment: string;
  estimated_pilgrims: string;
};

export type SentimentTimelinePoint = {
  time: string;
  positive: number;
  neutral: number;
  negative: number;
};

export type SentimentPulse = {
  breakdown: {
    positive: number;
    neutral: number;
    agitated: number;
    panicked: number;
    frustrated: number;
    overall_mood: string;
    total_analyzed: number;
  };
  emerging_crises: EmergingCrisisItem[];
  regional_influx: RegionalInfluxItem[];
  timeline: SentimentTimelinePoint[];
  last_updated: string;
};

// Outcome Parameter 10.3: Multilingual Official Broadcast
export type ChannelContent = {
  channel: string;
  english: string;
  hindi: string;
  marathi: string;
  gujarati: string;
  hashtags: string[];
};

export type MultilingualBroadcastResponse = {
  id: string;
  topic: string;
  title: string;
  generated_at: string;
  channels: Record<string, ChannelContent>;
  verified_stamp: boolean;
};


