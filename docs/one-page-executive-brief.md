# KUMBHRAKSHAK — EXECUTIVE ONE-PAGE BRIEF
## AI Safety Intelligence & Decision Support Platform
### Simhastha Kumbh Mela 2027 — Nashik–Trimbakeshwar
**Concept Prototype Evaluation | Topic #10 Social Media & AI in Kumbh Management**

---

### The Problem
During peak bathing days (Shahi Snan) at Nashik–Trimbakeshwar, over **10 million devotees** gather across tight river corridors along the Godavari. Historically, major crowd disasters are triggered by two compounding factors:
1. **Physical Precursors:** Localized counter-flow turbulence at narrow ghat bottlenecks (e.g. Ramkund, Laxman Jhula).
2. **Information Cascades:** Viral, unverified social media rumors (e.g. false bridge collapse or stampede posts) causing sudden mass panic.

Existing command setups treat CCTV monitoring, social media listening, and unit dispatch as completely isolated silos, resulting in 20–45 minute verification delays.

---

### The KumbhRakshak Solution
KumbhRakshak is an integrated, prototype **AI Safety Intelligence Layer** that fuses multi-source streams into a single evidence-backed decision cockpit:

| Ingestion Stream | AI Processing Layer | Operational Safety Output |
| :--- | :--- | :--- |
| **Ground CCTV & Drones** | YOLOv8 + Optical Flow + Thermal HSV | Density heatmaps, counter-flow vectors, campfire vs fire check |
| **Social Streams (X, Insta)** | IndicBERT NLP + Semantic Clustering | Geotagged claim extraction, panic velocity tracking |
| **Citizen Reports** | Mobile safety submission portal | Real-time ground condition reports from devotees |
| **Transit & Shelters** | Railway flow + Rain shelter sensors | Dynamic holding area buffering, weather downpour diversion |

---

### Core Technical Breakthroughs

1. **Distance-Decayed Bayesian Evidence Fusion:**
   $$C_{\text{fused}} = 1 - \prod_{i=1}^{n} \left(1 - w_i \cdot C_i\right) \quad \text{where } w_i = \exp\left(-\frac{d_i}{0.5\text{ km}}\right)$$
   Ground cameras adjacent to a reported incident automatically corroborate or contradict incoming claims in milliseconds.

2. **Factual Recycled Media Debunker:**
   Compares visual hash fingerprints against historical archives (e.g. 2019 Prayagraj, 2021 Haridwar). Circulated historical clips are tagged with non-accusatory contextual advisories (`POSSIBLE_REUSED_CONTENT`).

3. **Multi-Horizon XGBoost Forecasting (15m, 30m, 60m):**
   Projects crowd pressure with 90% confidence bands ($p_{10}, p_{50}, p_{90}$) accounting for diurnal bathing cycles and Shahi Snan surge multipliers.

4. **Human-in-the-Loop Governance & Audit Trail:**
   AI never mobilizes field units autonomously. The system generates Standard Operating Procedures (SOPs) requiring officer badge authorization, logging every decision to an immutable audit record.

---

### Outcome Parameters Fulfillments (Syllabus Topic 10)
- **Outcome Parameter 10.1 (Misinformation & Rumors):** Real-time NLP rumor detection, cross-camera verification, and automated counter-messaging studio in 4 languages (Hindi, Marathi, Gujarati, English).
- **Outcome Parameter 10.2 (Sentiment & Crisis Pulse):** Public mood gauge (peaceful vs anxious), regional arrival tracking (UP, Gujarat, MH), and road choke point detection.
- **Outcome Parameter 10.3 (Multilingual Broadcast):** Official safety advisories, queue wait times, and weather warnings generated for digital signages and social channels.

---

### Pitch Summary (What to Say in 30 Seconds)
> *"Sir, KumbhRakshak is not just a crowd counter or social dashboard. It is an AI decision intelligence system designed specifically for Simhastha Kumbh 2027. When a panic rumor appears online claiming a stampede, KumbhRakshak immediately cross-references ground cameras via Bayesian fusion, proves the flow is normal, and arms the duty officer with a verified counter-advisory in under 2 seconds—stopping panic before it starts."*

---
*Notice: This system operates exclusively in prototype mode on simulated telemetry (`DEMO_MODE=true`, `SIMULATION_MODE=true`).*
