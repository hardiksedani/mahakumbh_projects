# KumbhRakshak 2.0: Official Implementation Plan

## Domain / Subject Area
**Topic #10: Role of Social Media in Organizing and Managing Mahakumbh**

---

### **Executive Summary & Scope**
This Implementation Plan details the end-to-end technical engineering, architectural design, algorithmic models, database schemas, and administrative workflows for **KumbhRakshak 2.0**. The platform addresses the critical dual nature of Social Media at humanity's largest mass gathering (over 15 to 20 crore devotees):
1. **Mitigating Social Media as a Hazard:** Preventing viral fake news, false stampede claims, and misleading temple closure rumors from sparking fatal crowd panics.
2. **Leveraging Social Media as a Sensor & Broadcast Hub:** Converting geolocated citizen chatter into real-time operational telemetry for crowd flow, infrastructure bottlenecks, and automated multilingual public safety communication.

The implementation strictly satisfies the three mandated Outcome Parameters (**10.1, 10.2, and 10.3**).

---

## 1. Outcome Parameter Breakdown

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│              TOPIC #10: SOCIAL MEDIA IN MAHAKUMBH MANAGEMENT & SAFETY            │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │
     ┌───────────────────────────────────┼───────────────────────────────────┐
     ▼                                   ▼                                   ▼
┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐
│  OUTCOME PARAMETER 10.1 │ │  OUTCOME PARAMETER 10.2 │ │  OUTCOME PARAMETER 10.3 │
│  • AI Rumor Detection   │ │  • Sentiment Tracking   │ │  • Multilingual AI      │
│  • CCTV Cross-Check     │ │  • Emerging Crises      │ │    Broadcast Studio     │
│  • Panic Trigger Index  │ │  • Transit Influx Intent│ │  • HI / MR / GU / EN    │
│  • Automated Debunks    │ │  • 24h Trend Recharts   │ │  • X / WA / Instagram   │
└─────────────────────────┘ └─────────────────────────┘ └─────────────────────────┘
```

### Parameter 10.1: AI-Powered Misinformation & Rumor Detection System
* **Objective:** Real-time scanning of social media platforms (X/Twitter, Instagram Reels, WhatsApp channels) to identify and flag panic-inducing rumors before crowd stampedes occur.
* **Core Mechanisms:**
  - **NLP Semantic Claim Extraction:** Ingests raw caption/transcript text and extracts the core claim entity triple: `(Event_Type, Location, Severity)`.
  - **Ground Truth Sensor Cross-Referencing:** Identifies municipal CCTV cameras within a 2 km radial geofence around the reported location and evaluates optical flow and crowd density over the preceding 5 minutes.
  - **Panic Trigger Index (0–100):** A quantitative risk metric assessing the rumor's linguistic urgency, casualty claims, and viral sharing velocity.
  - **Automated Multilingual Counter-Messaging:** Automatically generates authoritative official fact-checks in Hindi, Marathi, Gujarati, and English citing verified camera IDs to extinguish rumors across public channels.

### Parameter 10.2: Real-Time Sentiment Tracking & Emerging Crisis Pulse
* **Objective:** Gauge the collective psychological state of pilgrims, cluster citizen complaints to detect emerging ground crises before physical bottlenecks form, and forecast regional travel influx.
* **Core Mechanisms:**
  - **5-State Public Mood Distribution:** Classifies incoming posts into Peaceful/Positive (43.5%), Neutral/Informational (31.0%), Agitated/Impatient (13.5%), Panicked/Fearful (7.0%), and Frustrated (5.0%).
  - **Emerging Ground Crises Clustering:** Clusters citizen reports regarding arterial traffic chokes (e.g., Trimbak Road Gate 4), drinking water shortages (Sector 9), and barricade bottlenecks (Ram Kund steps), enabling 1-click administrative dispatch.
  - **Regional Pilgrim Influx Intent Radar:** Analyzes geo-tagged travel-intent chatter from source states (Uttar Pradesh 34%, Gujarat 26.5%, Maharashtra 21.5%, Madhya Pradesh 11%, Rajasthan & Bihar 7%) to assist transit authorities in scheduling rolling stock.
  - **24-Hour Diurnal Sentiment Recharts Area Chart:** Visualizes sentiment volatility across major bathing cycles.

### Parameter 10.3: Automated Multilingual Official Content Studio
* **Objective:** Automated generative AI studio enabling municipal and police authorities to disseminate timely, verified, and multilingual advisories across official channels.
* **Core Mechanisms:**
  - **Operational Topic Presets:** Traffic Diversions, Shahi Snan Holy Bath Schedules, Ghat Capacity Warnings, and Emergency Weather/Safety Advisories.
  - **Native 4-Language Output:** Full contextual generation in **हिन्दी (Hindi)**, **मराठी (Marathi)**, **ગુજરાતી (Gujarati)**, and **English**.
  - **Channel-Optimized Formatting:**
    - **X (Twitter):** 280-character alerts with official hashtags (`#KumbhMela2026`, `#KumbhTraffic`).
    - **WhatsApp Community Bulletin:** Formatted announcements with emergency helplines (`108`/`100`) and verified status.
    - **Instagram Advisory Story:** Clean advisory copy formatted for municipal graphic overlays.
  - **1-Click Broadcast Action:** Instant clipboard copy and simulated push to official public broadcasting APIs.

---

## 2. System Architecture & Component Mapping

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION TIER                             │
│   Next.js 16.3 (App Router) · React 18 · Tailwind CSS 3 · Lucide Icons  │
│        HTML5 Radar Canvas · Recharts 2.13 · WebSocket Client            │
├─────────────────────────────────────────────────────────────────────────┤
│ • / (Dashboard): Executive Command Center & 3-Pillar Parameter Showcase │
│ • /verify: 10.1 AI Rumor Scanner & Automated Counter-Messaging Studio   │
│ • /sentiment: 10.2 Sentiment Pulse, Emerging Crises & Influx Intent     │
│ • /broadcast: 10.3 Multilingual AI Content Generator (HI/MR/GU/EN)      │
│ • /cameras: 100-Node CCTV Vision Grid & YOLO Video Inspector Modal      │
│ • /simulation: 16-Step Major Snan Digital Drill Simulator               │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ JSON REST + WebSocket (/ws/)
┌────────────────────────────────────▼────────────────────────────────────┐
│                          APPLICATION & API TIER                         │
│       Python 3.12 · FastAPI (ASGI) · Pydantic v2 · Asyncio Loop         │
├─────────────────────────────────────────────────────────────────────────┤
│ • SocialService: Claims extraction, sentiment pulse, multilingual AI    │
│ • VerificationEngine: Geospatial camera correlation, Haversine matching │
│ • VideoEventEngine: FireSmokeDetector, CrowdAnalyticsEngine, Farnebäck  │
│ • SimulationEngine: 16-Step diurnal timeline & crisis injection events  │
│ • WebSocketManager: 4 broadcast channels (incidents, cameras, alerts)   │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                             DATA & CLOUD TIER                           │
│   Google Cloud Firestore (asia-south1 Mumbai) + Standalone Mock Engine  │
├─────────────────────────────────────────────────────────────────────────┤
│ Collections: cameras (100), zones (20), social_posts, incidents, alerts │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema Specifications

### `social_posts` Collection
```json
{
  "id": "soc-9021",
  "platform": "instagram",
  "post_url": "https://instagram.com/p/kumbh_smoke",
  "caption": "Heavy smoke near Sector 4 pandal! People rushing out!",
  "extracted_claim": {
    "claim": "Fire in pandal with crowd running",
    "incident_type": "FIRE",
    "location": { "location_name": "Sector 4 Sleeping Pandal", "confidence": 0.92 },
    "urgency": 0.88,
    "relevance": 0.94
  },
  "verification_status": "CONTRADICTED",
  "social_priority_score": 0.91,
  "posted_at": "2026-09-20T01:30:00Z"
}
```

### `sentiment_pulse` State
```json
{
  "breakdown": {
    "positive": 43.5,
    "neutral": 31.0,
    "agitated": 13.5,
    "panicked": 7.0,
    "frustrated": 5.0,
    "overall_mood": "ELEVATED_VIGILANCE",
    "total_analyzed": 1420
  },
  "emerging_crises": [
    {
      "id": "CRS-101",
      "category": "ROAD_BLOCKED",
      "title": "Severe traffic choke on Trimbak Road approaching Gate 4",
      "location": "Trimbakeshwar Road / Gate 4",
      "report_count": 28,
      "sentiment_score": -0.78,
      "severity": "HIGH",
      "suggested_action": "Divert light vehicles to Ring Road Sector 7",
      "status": "ACTIVE_DISPATCH"
    }
  ],
  "regional_influx": [
    { "state": "Uttar Pradesh", "share_pct": 34.0, "estimated_pilgrims": "4.2 Lakh / Day" },
    { "state": "Gujarat", "share_pct": 26.5, "estimated_pilgrims": "3.1 Lakh / Day" },
    { "state": "Maharashtra", "share_pct": 21.5, "estimated_pilgrims": "2.8 Lakh / Day" }
  ]
}
```

---

## 4. Verification & Testing Protocol

| Test Case | Description | Command / Action | Expected Result |
|---|---|---|---|
| **TC-01** | Frontend TypeScript & Page Generation | `npm run build` in `frontend/` | Exit code 0, 10/10 routes compiled |
| **TC-02** | Backend Python Syntax Verification | `python -m py_compile app/api/social_sim_routes.py` | Exit code 0, no syntax or import errors |
| **TC-03** | Rumor Detection & Debunk Verification | Navigate to `/verify` -> Click Preset -> Scan | Verdict `CONTRADICTED`, 4-language debunks generated |
| **TC-04** | Sentiment & Crisis Pulse Verification | Navigate to `/sentiment` -> Check Area Chart | Recharts renders 24h curve, 4 crises listed |
| **TC-05** | Multilingual Studio Generation | Navigate to `/broadcast` -> Switch to Gujarati/Marathi | 4-language outputs rendered across X/WA/IG |
| **TC-06** | Major Snan Simulation Drill | Navigate to `/simulation` -> Click "Inject Fire" | Incident created, WebSocket step updates log |

---

## 5. Deployment Topology

* **Frontend:** Deployed to **Vercel** with Root Directory set to `frontend`.
* **Backend:** Containerized via Docker / Procfile for deployment on **Render / Railway**.
* **Cloud Database:** Hosted on **Google Cloud Firestore** in region `asia-south1` (Mumbai).
* **Air-Gapped Local Mode:** Native in-memory fallback engine built into `frontend/lib/api.ts` ensures zero-latency performance during live presentations and video demonstrations.
