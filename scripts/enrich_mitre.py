"""
MITRE ATT&CK enrichment — builds the coverage matrix
from alerts and incidents.
"""
from collections import defaultdict
from _data import MITRE_TECHNIQUES, MITRE_TACTICS


def build_mitre_coverage(alerts: list[dict], incidents: list[dict]) -> dict:
    """Build MITRE coverage matrix from alert and incident technique IDs."""

    # Count technique usage across alerts
    technique_alert_counts: dict[str, int] = defaultdict(int)
    technique_incident_ids: dict[str, set[str]] = defaultdict(set)

    for alert in alerts:
        for tid in alert.get("mitre_technique_ids", []):
            technique_alert_counts[tid] += 1
            if alert.get("incident_id"):
                technique_incident_ids[tid].add(alert["incident_id"])

    # Also count from incident-level technique IDs
    for inc in incidents:
        for tid in inc.get("mitre_technique_ids", []):
            technique_incident_ids[tid].add(inc["incident_id"])

    # Build technique list
    all_technique_ids = set(list(MITRE_TECHNIQUES.keys()) + list(technique_alert_counts.keys()))
    techniques = []
    for tid in sorted(all_technique_ids):
        info = MITRE_TECHNIQUES.get(tid, {"name": tid, "tactic": "Unknown"})
        techniques.append({
            "technique_id": tid,
            "name": info["name"],
            "tactic_id": _tactic_name_to_id(info["tactic"]),
            "alert_count": technique_alert_counts.get(tid, 0),
            "incident_ids": sorted(technique_incident_ids.get(tid, set())),
            "is_covered": technique_alert_counts.get(tid, 0) > 0,
        })

    # Tactic-level stats
    tactic_tech_counts = defaultdict(int)
    for t in techniques:
        if t["is_covered"]:
            tactic_tech_counts[t["tactic_id"]] += 1

    tactics = []
    for mt in MITRE_TACTICS:
        tid = mt["tactic_id"]
        tactics.append({
            "tactic_id": tid,
            "name": mt["name"],
            "short_name": mt["short_name"],
            "order": mt["order"],
            "technique_count": tactic_tech_counts.get(tid, 0),
        })

    total_techniques = len(techniques)
    covered = sum(1 for t in techniques if t["is_covered"])
    total_obs = sum(t["alert_count"] for t in techniques)

    return {
        "tactics": tactics,
        "techniques": techniques,
        "summary": {
            "total_techniques": total_techniques,
            "covered_techniques": covered,
            "coverage_percent": round(covered / total_techniques * 100, 1) if total_techniques else 0,
            "total_observations": total_obs,
        },
    }


def _tactic_name_to_id(name: str) -> str:
    mapping = {
        "Initial Access": "TA0001",
        "Execution": "TA0002",
        "Persistence": "TA0003",
        "Privilege Escalation": "TA0004",
        "Defense Evasion": "TA0005",
        "Credential Access": "TA0006",
        "Discovery": "TA0007",
        "Lateral Movement": "TA0008",
        "Collection": "TA0009",
        "Exfiltration": "TA0010",
        "Command and Control": "TA0011",
    }
    return mapping.get(name, "TA0000")
