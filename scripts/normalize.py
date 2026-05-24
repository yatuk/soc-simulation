"""
Normalize module — generates entity profiles, risk scores, KPI metrics,
and benign noise events for the SOC dataset.

Input:  alerts, incidents, iocs (from other pipeline stages)
Output: assets.json, users.json, kpi_metrics.json structures
"""
import random
from collections import defaultdict
from datetime import datetime, timedelta
from _data import (
    USERS, ASSETS, BENIGN_IPS, MALICIOUS_IPS, GEO_LOCATIONS,
    MITRE_TECHNIQUES, BASE_TIME, WINDOW_DAYS,
)


def generate_users(alerts, incidents) -> list[dict]:
    """Build User profiles with risk scores derived from alerts/incidents."""
    user_map = {u["user_id"]: {
        **u,
        "risk_score": 0,
        "risk_factors": [],
        "event_count": random.randint(50, 500),
        "alert_count": 0,
        "asset_ids": [a["asset_id"] for a in ASSETS if a["owner_user_id"] == u["user_id"]],
        "first_seen": (BASE_TIME - timedelta(days=random.randint(30, 365))).isoformat(),
        "last_seen": (BASE_TIME + timedelta(days=random.randint(10, 14))).isoformat(),
    } for u in USERS}

    # Accumulate risk from alerts
    for alert in alerts:
        uid = alert["affected_user_id"]
        if uid in user_map:
            user_map[uid]["alert_count"] += 1

    for incident in incidents:
        for uid in incident["affected_user_ids"]:
            if uid in user_map:
                sev_map = {"critical": 40, "high": 30, "medium": 20, "low": 10}
                pts = sev_map.get(incident["severity"], 5)
                user_map[uid]["risk_score"] = min(100, user_map[uid]["risk_score"] + pts)
                user_map[uid]["risk_factors"].append({
                    "rule": f"incident_{incident['incident_id']}",
                    "points": pts,
                    "description": incident["title"],
                })

    return list(user_map.values())


def generate_assets(alerts, incidents) -> list[dict]:
    """Build Asset (endpoint) profiles with risk scores and recent activity."""
    asset_map = {a["asset_id"]: {
        **a,
        "risk_score": 0,
        "isolation_status": "normal",
        "open_alert_count": 0,
        "recent_processes": _mock_processes(a),
        "recent_network_connections": _mock_connections(a),
        "first_seen": (BASE_TIME - timedelta(days=random.randint(30, 365))).isoformat(),
        "last_seen": (BASE_TIME + timedelta(days=random.randint(10, 14))).isoformat(),
    } for a in ASSETS}

    # Accumulate risk
    for alert in alerts:
        aid = alert["affected_asset_id"]
        if aid and aid in asset_map:
            asset_map[aid]["open_alert_count"] += 1
            sev = alert["severity"]
            pts = {"critical": 25, "high": 15, "medium": 8, "low": 3, "info": 1}
            asset_map[aid]["risk_score"] = min(100, asset_map[aid]["risk_score"] + pts.get(sev, 2))

    for incident in incidents:
        for aid in incident["affected_asset_ids"]:
            if aid in asset_map:
                asset_map[aid]["risk_score"] = min(100, asset_map[aid]["risk_score"] + 20)

    # Mark some as isolated based on risk
    for a in asset_map.values():
        if a["risk_score"] >= 70:
            a["isolation_status"] = "isolated"

    return list(asset_map.values())


def _mock_processes(asset: dict) -> list[dict]:
    """Generate realistic mock process events."""
    procs = [
        {"process_name": "explorer.exe",       "pid": 1000 + hash(asset["asset_id"]) % 4000, "parent_process_name": None,            "command_line": None, "file_hash": None, "is_suspicious": False},
        {"process_name": "outlook.exe",        "pid": 2000 + hash(asset["asset_id"]) % 4000, "parent_process_name": "explorer.exe",   "command_line": r"C:\Program Files\Microsoft Office\Office16\OUTLOOK.EXE", "file_hash": None, "is_suspicious": False},
        {"process_name": "chrome.exe",         "pid": 3000 + hash(asset["asset_id"]) % 4000, "parent_process_name": "explorer.exe",   "command_line": None, "file_hash": None, "is_suspicious": False},
    ]
    ts_base = BASE_TIME + timedelta(days=random.randint(1, 13))
    for i, p in enumerate(procs):
        p["timestamp"] = (ts_base + timedelta(hours=i, minutes=random.randint(0, 59))).isoformat()
    return procs


def _mock_connections(asset: dict) -> list[dict]:
    """Generate realistic mock network connections."""
    domains = ["login.microsoftonline.com", "outlook.office365.com", "teams.microsoft.com", "github.com", "update.microsoft.com"]
    conns = []
    ts_base = BASE_TIME + timedelta(days=random.randint(1, 13))
    for i, dom in enumerate(random.sample(domains, 3)):
        conns.append({
            "domain": dom,
            "dst_ip": random.choice(BENIGN_IPS[:3]),
            "port": random.choice([443, 80, 8080]),
            "protocol": "TCP",
            "is_suspicious": False,
            "timestamp": (ts_base + timedelta(hours=i * 2)).isoformat(),
        })
    return conns


def generate_kpi_metrics(alerts, incidents, users, assets, playbook_runs) -> dict:
    """Build KPI summary for the overview dashboard."""
    sev_counts = defaultdict(int)
    for a in alerts:
        sev_counts[a["severity"]] += 1

    open_alerts = sum(1 for a in alerts if a["status"] != "resolved")
    critical_alerts = sev_counts.get("critical", 0) + sev_counts.get("high", 0)
    active_incidents = sum(1 for i in incidents if i["status"] != "closed")
    isolated_assets = sum(1 for a in assets if a["isolation_status"] == "isolated")
    high_risk_users = sum(1 for u in users if u["risk_score"] >= 60)

    # Generate daily timeseries
    daily_alerts = defaultdict(int)
    daily_risk = defaultdict(int)
    for a in alerts:
        day = a["detected_at"][:10]
        daily_alerts[day] += 1
        w = {"critical": 100, "high": 75, "medium": 50, "low": 25, "info": 5}
        daily_risk[day] += w.get(a["severity"], 5)

    return {
        "generated_at": datetime.now().isoformat(),
        "total_alerts": len(alerts),
        "open_alerts": open_alerts,
        "critical_alerts": critical_alerts,
        "total_incidents": len(incidents),
        "active_incidents": active_incidents,
        "total_assets": len(assets),
        "isolated_assets": isolated_assets,
        "total_users": len(users),
        "high_risk_users": high_risk_users,
        "mttd_seconds": 240,   # mock: 4 min
        "mttr_seconds": 1380,  # mock: 23 min
        "false_positive_rate": 8.3,
        "alerts_by_severity": dict(sev_counts),
        "alert_volume_daily": [{"date": k, "count": v} for k, v in sorted(daily_alerts.items())],
        "event_volume_daily": [{"date": k, "count": v * random.randint(10, 50)} for k, v in sorted(daily_alerts.items())],
        "risk_score_daily": [{"date": k, "count": v} for k, v in sorted(daily_risk.items())],
    }
