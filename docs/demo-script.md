# KumbhRakshak Demo Script

**Setting:** Night before a Major Snan at Nashik–Trimbakeshwar Kumbh Mela.

## Act 1 — Normal Monitoring (T+0)

1. Open the **Dashboard** at http://localhost:3000
2. Show KPIs: active incidents, available units, cameras online
3. Point out the **Live Situation Map** with camera and incident markers
4. Note: system is in normal monitoring mode

## Act 2 — Crowd Pressure Builds (T+2 to T+6)

1. Go to **Simulation** page
2. Click **Start Major Snan**
3. Watch the timeline progress bar and log:
   - Crowd levels rising
   - Transport inflow increasing
   - Social media reports increasing
   - Crowd risk score rising

## Act 3 — Social Intelligence Clustering (T+7)

1. Return to **Dashboard** → Social Intelligence panel
2. Show multiple posts about Gate 7 congestion
3. Explain: embedding-based clustering groups 50 similar posts into ONE incident

## Act 4 — Ground Verification (T+8 to T+12)

1. Simulation injects fire at CAM-782
2. Dashboard shows CRITICAL incident with risk score RED
3. Explain cross-camera correlation:
   - CAM-782: smoke detected
   - Nearby cameras corroborate
   - Combined confidence increases

## Act 5 — AI Decision Support (T+10 to T+13)

1. Open an incident detail page
2. Click dispatch recommend (via API or incident page)
3. Show AI recommendation:
   - Verify fire using nearby camera
   - Dispatch nearest fire unit
   - Deploy police for crowd control
4. Emphasize: **recommendations only** — commander confirms dispatch

## Act 6 — Misinformation Detection (T+14 to T+15)

1. Simulation injects misleading stampede claim
2. Go to **Verify Reel** page
3. Paste caption: "STAMPEDE at Gate 7!! Everyone running!!"
4. Show result: **UNVERIFIED** — no supporting camera evidence
5. Explain: virality ≠ truth; false claims are surfaced for verification

## Act 7 — Recycled Content (Optional)

1. Click **Inject Recycled Video** in Simulation
2. Show post flagged as **POSSIBLE_RECYCLED_CONTENT**

## Act 8 — Resolution (T+16 to T+18)

1. Official alert generated
2. Incident moves to resolved state
3. Risk returns to normal

## Key Talking Points

- **Not just crowd monitoring** — fire, medical, accident, security, infrastructure
- **Ground truth + social intelligence + verification** = unique value
- **Multi-model AI** — YOLO, embeddings, XGBoost, LLM (each for its task)
- **Firebase Firestore** — real-time scalable database
- **Human in the loop** — AI detects, classifies, recommends; authorities decide

## Quick Inject Demo (Without Full Timeline)

Use Simulation inject buttons individually:

| Button | Effect |
|--------|--------|
| Inject Fire | CRITICAL fire incident at CAM-782 |
| Inject Crowd Surge | HIGH crowd events on 3 cameras |
| Inject Misinformation | Unverified stampede social claim |
| Inject Shelter Overflow | Shelter at 95% capacity |

## API Demo Commands

```bash
# Start simulation
curl -X POST http://localhost:8000/api/simulation/start

# Verify a claim
curl -X POST http://localhost:8000/api/social/verify-url \
  -H "Content-Type: application/json" \
  -d '{"caption": "Fire near Gate 7, smoke everywhere"}'

# Dashboard KPIs
curl http://localhost:8000/api/dashboard/kpis
```
