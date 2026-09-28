"""Incident Graph Generator for KumbhRakshak.
Generates structured Graph Nodes and Edges for visualizing the full lineage:
Claim / Social Post -> Ground Cameras -> Multi-Camera Bayesian Fusion -> Verified Incident -> Multi-Factor Risk Score -> Human-in-the-Loop Dispatch Action.
"""

from typing import Any, Dict, List, Optional


class IncidentGraphGenerator:
    """Produces directed DAG representation of intelligence evidence and decision lineage."""

    @staticmethod
    def build_graph(
        claim: str,
        verification_status: str,
        confidence: float,
        camera_evidence: List[Dict[str, Any]],
        social_evidence: Dict[str, Any],
        recycled_info: Optional[Dict[str, Any]] = None,
        incident_type: Optional[str] = None,
        incident_id: Optional[str] = None,
        risk_score: Optional[float] = None,
        risk_level: Optional[str] = None,
        recommended_actions: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        nodes = []
        edges = []

        # 1. Root Source Node: The Claim / Ingested Report
        claim_id = "node-source-claim"
        nodes.append({
            "id": claim_id,
            "type": "CLAIM_SOURCE",
            "label": f"Report: {(claim or 'Citizen Report')[:35]}...",
            "status": verification_status,
            "confidence": confidence,
            "data": {
                "full_claim": claim,
                "incident_type": incident_type or "GENERAL_SAFETY",
            },
        })

        # 2. Recycled Content Node (if matched)
        if recycled_info and recycled_info.get("is_recycled"):
            recycled_id = "node-recycled-archive"
            archive_data = recycled_info.get("matched_archive", {})
            nodes.append({
                "id": recycled_id,
                "type": "ARCHIVE_MATCH",
                "label": f"Archive Match: {archive_data.get('title', 'Historical Event')}",
                "status": "RECYCLED_CONTENT",
                "data": {
                    "archive_id": archive_data.get("archive_id"),
                    "historical_date": archive_data.get("historical_date"),
                    "advisory": recycled_info.get("advisory_message"),
                },
            })
            edges.append({
                "source": claim_id,
                "target": recycled_id,
                "relation": "FLAGGED_AS_HISTORICAL",
                "color": "#eab308",
            })

        # 3. Ground Camera Nodes & Corroboration Edges
        cam_node_ids = []
        for i, cam in enumerate(camera_evidence[:4]):
            cam_code = cam.get("camera_code", f"CAM-{i+1}")
            cam_id = f"node-cam-{cam_code}"
            cam_node_ids.append(cam_id)
            nodes.append({
                "id": cam_id,
                "type": "CAMERA_SENSOR",
                "label": f"{cam_code} ({cam.get('distance_km', 0.0)}km)",
                "status": "SUPPORTING" if cam.get("supports") else "CONTRADICTING",
                "data": {
                    "camera_code": cam_code,
                    "event_type": cam.get("event_type", "SURVEILLANCE"),
                    "confidence": cam.get("confidence", 0.0),
                    "distance_km": cam.get("distance_km", 0.0),
                },
            })
            edges.append({
                "source": claim_id,
                "target": cam_id,
                "relation": "SPATIAL_PROXIMITY_QUERY",
                "color": "#38bdf8",
            })

        # 4. Bayesian Evidence Fusion Node (if cameras present)
        fusion_id = "node-bayesian-fusion"
        if cam_node_ids:
            nodes.append({
                "id": fusion_id,
                "type": "BAYESIAN_FUSION",
                "label": f"Multi-Camera Fusion ({int(confidence * 100)}%)",
                "status": verification_status,
                "data": {
                    "fusion_method": "Distance-Decayed Bayesian",
                    "fused_confidence": confidence,
                    "sensors_evaluated": len(cam_node_ids),
                },
            })
            for cid in cam_node_ids:
                edges.append({
                    "source": cid,
                    "target": fusion_id,
                    "relation": "DISTANCE_WEIGHTED_INPUT",
                    "color": "#818cf8",
                })

        # 5. Incident Node
        inc_id = f"node-incident-{incident_id or 'eval'}"
        nodes.append({
            "id": inc_id,
            "type": "VERIFIED_INCIDENT",
            "label": f"Incident: {incident_type or 'Crowd Safety'}",
            "status": verification_status,
            "data": {
                "incident_type": incident_type or "CROWD",
                "verification_status": verification_status,
                "verified_at": "now",
            },
        })
        if cam_node_ids:
            edges.append({
                "source": fusion_id,
                "target": inc_id,
                "relation": "EVIDENCE_CORROBORATION",
                "color": "#10b981" if verification_status in ("VERIFIED", "LIKELY") else "#f59e0b",
            })
        else:
            edges.append({
                "source": claim_id,
                "target": inc_id,
                "relation": "DIRECT_CLAIM_EVALUATION",
                "color": "#94a3b8",
            })

        # 6. Risk Scoring Node
        risk_id = "node-risk-score"
        score_val = risk_score if risk_score is not None else (78.0 if verification_status == "VERIFIED" else 42.0)
        level_val = risk_level or ("ORANGE" if score_val > 60 else "YELLOW")
        nodes.append({
            "id": risk_id,
            "type": "RISK_ASSESSMENT",
            "label": f"Risk: {score_val:.0f}/100 ({level_val})",
            "status": level_val,
            "data": {
                "score": score_val,
                "level": level_val,
                "formula": "Multi-Factor Causal Weighting",
            },
        })
        edges.append({
            "source": inc_id,
            "target": risk_id,
            "relation": "RISK_EVALUATION",
            "color": "#f97316" if level_val in ("RED", "ORANGE") else "#22c55e",
        })

        # 7. Decision Support / Action Nodes
        actions = recommended_actions or [
            {
                "action_id": "ACT-1",
                "title": "Dispatch Ghat Quick Response Team",
                "target": "Zone 4 Commander",
                "priority": "HIGH",
            },
            {
                "action_id": "ACT-2",
                "title": "Automated Counter-Advisory Broadcast",
                "target": "Mela PA & Social Channels",
                "priority": "MEDIUM",
            },
        ]

        for i, act in enumerate(actions[:2]):
            act_id = f"node-action-{i+1}"
            nodes.append({
                "id": act_id,
                "type": "DISPATCH_ACTION",
                "label": act.get("title", f"Action {i+1}"),
                "status": "PENDING_HUMAN_CONFIRMATION",
                "data": act,
            })
            edges.append({
                "source": risk_id,
                "target": act_id,
                "relation": "RECOMMENDED_SOP",
                "color": "#a855f7",
            })

        return {
            "nodes": nodes,
            "edges": edges,
            "summary": {
                "total_nodes": len(nodes),
                "total_edges": len(edges),
                "verification_status": verification_status,
                "confidence": confidence,
            },
        }
