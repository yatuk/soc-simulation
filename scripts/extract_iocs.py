"""
IOC extraction from data/iocs/ source files + scenario-generated IOCs.
Produces canonical IOC entities per Phase 1 DATA_MODEL.md.
"""
import random
from pathlib import Path
from _data import MALICIOUS_DOMAINS, MALICIOUS_IPS, BASE_TIME
from pseudonymize import make_ioc_id


def extract_iocs(project_root: Path, alerts: list[dict]) -> list[dict]:
    """Extract IOCs from source files and enrich with alert references."""
    iocs: dict[str, dict] = {}  # deduplicate by value

    # 1. IOCs from malicious domains list
    for domain in MALICIOUS_DOMAINS:
        iocs[domain] = {
            "ioc_id": make_ioc_id("domain", domain),
            "type": "domain",
            "value": domain,
            "label": _label_from_value(domain, "domain"),
            "severity": _severity_from_value(domain),
            "confidence": random.randint(75, 95),
            "threat_score": random.randint(70, 95),
            "tags": _tags_from_value(domain, "domain"),
            "description": f"Oltalama veya C2 domain'i. SOC simülasyonu için kurgusal.",
            "source": "malicious_domain_feed",
            "related_alert_ids": [],
            "first_seen": (BASE_TIME).isoformat(),
            "last_seen": (BASE_TIME).isoformat(),
        }

    # 2. IOCs from malicious IPs list
    for ip in MALICIOUS_IPS:
        iocs[ip] = {
            "ioc_id": make_ioc_id("ip", ip),
            "type": "ip",
            "value": ip,
            "label": _label_from_value(ip, "ip"),
            "severity": "high",
            "confidence": random.randint(70, 90),
            "threat_score": random.randint(65, 90),
            "tags": _tags_from_value(ip, "ip"),
            "description": f"Saldırgan IP adresi. SOC simülasyonu için kurgusal (TEST-NET/IPv4).",
            "source": "malicious_ip_feed",
            "related_alert_ids": [],
            "first_seen": (BASE_TIME).isoformat(),
            "last_seen": (BASE_TIME).isoformat(),
        }

    # 3. IOCs from source files (data/iocs/)
    ioc_dir = project_root / "data" / "iocs"
    for src_file in ["malicious_domains.txt", "malicious_ips.txt"]:
        fp = ioc_dir / src_file
        if not fp.exists():
            continue
        ioc_type = "domain" if "domain" in src_file else "ip"
        for line in fp.read_text(encoding="utf-8").splitlines():
            value = line.strip()
            if not value or value.startswith("#"):
                continue
            if value not in iocs:
                iocs[value] = {
                    "ioc_id": make_ioc_id(ioc_type, value),
                    "type": ioc_type,
                    "value": value,
                    "label": _label_from_value(value, ioc_type),
                    "severity": random.choice(["high", "medium"]),
                    "confidence": random.randint(60, 85),
                    "threat_score": random.randint(50, 80),
                    "tags": _tags_from_value(value, ioc_type),
                    "description": f"Harici tehdit istihbaratı feed'inden.",
                    "source": "external_feed",
                    "related_alert_ids": [],
                    "first_seen": (BASE_TIME).isoformat(),
                    "last_seen": (BASE_TIME).isoformat(),
                }

    # 4. Add malware hash IOC
    malware_hash = "a1b2c3d4e5f6789012345678901234567890abcd"
    iocs[malware_hash] = {
        "ioc_id": make_ioc_id("hash", malware_hash),
        "type": "hash",
        "value": malware_hash,
        "label": "Zararlı yazılım hash'i (SHA256)",
        "severity": "critical",
        "confidence": 95,
        "threat_score": 92,
        "tags": ["malware", "sha256", "c2"],
        "description": f"guncelleme.exe payload SHA256 hash'i. C2 beacon iletişimi yapan zararlı yazılım.",
        "source": "pipeline_extract",
        "related_alert_ids": [],
        "first_seen": (BASE_TIME).isoformat(),
        "last_seen": (BASE_TIME).isoformat(),
    }

    # 5. Link IOCs to alerts
    for alert in alerts:
        ip = alert.get("source_ip")
        if ip and ip in iocs:
            if alert["alert_id"] not in iocs[ip]["related_alert_ids"]:
                iocs[ip]["related_alert_ids"].append(alert["alert_id"])

    return list(iocs.values())


def _label_from_value(value: str, ioc_type: str) -> str:
    keywords = {
        "giris": "Oltalama giriş sayfası", "finans": "Finans teması oltalama",
        "microsoft": "Microsoft sahte domain", "sharepoint": "SharePoint sahte domain",
        "outlook": "Outlook sahte domain", "fatura": "Fatura sahte domain",
        "cdn": "C2 beacon domain", "guncelleme": "C2 beacon domain",
        "yonetim": "Sahte yönetim portalı", "ik-": "İK sahte domain",
    }
    for kw, label in keywords.items():
        if kw in value:
            return label
    return f"Şüpheli {ioc_type}"


def _severity_from_value(value: str) -> str:
    if any(kw in value for kw in ["cdn", "guncelleme", "fatura"]):
        return "critical"
    if any(kw in value for kw in ["giris", "microsoft", "outlook"]):
        return "high"
    return "medium"


def _tags_from_value(value: str, ioc_type: str) -> list[str]:
    tags = []
    if ioc_type == "domain":
        if any(kw in value for kw in ["giris", "finans", "microsoft", "outlook", "sharepoint"]):
            tags.append("phishing")
        if any(kw in value for kw in ["cdn", "guncelleme"]):
            tags.append("c2")
        if "fatura" in value:
            tags.append("bec")
    elif ioc_type == "ip":
        tags.append("attacker")
    return tags
