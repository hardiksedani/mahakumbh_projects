# KUMBHRAKSHAK: Scalability & High-Throughput Architecture
## Sizing & Distributed Processing for 10 Million+ Peak Day Pilgrims
### Simhastha Kumbh Mela 2027 — Nashik–Trimbakeshwar

---

## 1. Scale Targets & Throughput Budget

During peak Shahi Snan events, the system must process massive concurrent data volumes:

| Metric | Target Peak Volume | Processing Budget | Strategy |
| :--- | :--- | :--- | :--- |
| **Simultaneous Pilgrims** | 10,000,000 devotees | Real-time aggregate count | 12 sector hierarchical rollups |
| **Active Camera Feeds** | 1,200 video streams | 15–30 FPS (36,000 FPS total) | Edge pre-processing + Keyframe sampling |
| **Social Posts Ingested** | 250,000 posts/hour | < 50ms per post | Stage 1 cheap regex filter (92% dropped) |
| **Claim NLP Extraction** | 20,000 claims/hour | < 100ms per claim | IndicBERT ONNX Runtime on GPU |
| **Bayesian Evidence Fusion** | 500 incident queries/sec | < 5ms per fusion | Pre-indexed spatial k-d tree & Haversine |
| **WebSocket Updates** | 50,000 concurrent clients | Sub-second delivery | Redis Pub/Sub cluster + Epoll worker threads |

---

## 2. Distributed Architecture Design

```
   [1,200 Edge Cameras]               [Social APIs / Mobile Portal]
            │                                       │
            ▼                                       ▼
  [Edge Jetson Nodes]                  [API Gateway (Nginx / Envoy)]
  (YOLOv8 + Farnebäck Flow)                         │
            │                                       ▼
            │                         [Apache Kafka Ingestion Queue]
            │                         (Topics: social-raw, citizen-in)
            ▼                                       │
[Kafka: camera-events]                              ▼
            │                         [Worker Fleet: IndicBERT + NLP]
            └─────────────────┬─────────────────────┘
                              ▼
                [Correlation & Bayesian Fusion]
                              │
                              ▼
                 [Redis Cluster Cache / PubSub]
                              │
             ┌────────────────┴────────────────┐
             ▼                                 ▼
   [PostgreSQL / PostGIS]             [FastAPI WebSocket Servers]
  (Audit Trail & Long-term)           (Live Command Consoles)
```

### 2.1 Video Ingestion Optimization: Edge Filtering
Processing 1,200 continuous 4K video feeds centrally would saturate 60 Gbps of bandwidth. KumbhRakshak uses **Edge Pre-Processing**:
- NVIDIA Jetson Orin nodes at the camera poles run YOLOv8n and Farnebäck optical flow locally.
- Only **structured metadata events** (JSON payloads containing bounding box counts, density vectors, and fall indicators) are transmitted to the central server over lightweight MQTT/Kafka.
- Bandwidth requirement drops from **60 Gbps to less than 45 Mbps**.

### 2.2 Social Ingestion: Two-Stage Drop Architecture
- **Stage 1 (Filter):** Rejects irrelevant, spam, or marketing posts using an Aho-Corasick trie matching Nashik geographical keywords in < 1 ms.
- **Stage 2 (Transformer Batching):** Actionable safety posts are micro-batched (batch size = 64) for GPU execution on IndicBERT, achieving **3,500 claims/sec per NVIDIA H100**.

### 2.3 Spatial Indexing & Geospatial Haversine Query
- All active sensors, cameras, and shelters are indexed in an in-memory 2D Spatial K-D Tree.
- Proximity queries ($R \le 2.0\text{ km}$) execute in $O(\log N)$ time, completing in under 0.2 milliseconds.
- High-priority incidents compute Bayesian cross-camera corroboration instantaneously.
