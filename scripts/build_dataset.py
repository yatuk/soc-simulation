#!/usr/bin/env python3
"""
SOC Dataset Builder — Deterministic pipeline orchestrator.
v2.0.5: scaled to 2000 alerts, 30 incidents, 60-day span.

Usage:
    python scripts/build_dataset.py --seed 42 --out data/normalized/
    python scripts/build_dataset.py --seed 42 --target-alerts 500 --limit-incidents 5
"""
import argparse, json, random, sys
from datetime import datetime, timedelta
from pathlib import Path
from collections import defaultdict

sys.path.insert(0, str(Path(__file__).parent))

from _data import (USERS, ASSETS, MALICIOUS_DOMAINS, MALICIOUS_IPS, BENIGN_IPS, GEO_LOCATIONS,
                   MITRE_TECHNIQUES, ALERT_SOURCES, BASE_TIME, WINDOW_DAYS, stable_hash)
from pseudonymize import make_alert_id, make_incident_id, make_run_id

# ── Parse args ──────────────────────────────────────────────
def parse_args():
    p = argparse.ArgumentParser(description="SOC Dataset Builder v2.0.5")
    p.add_argument("--seed", type=int, default=42)
    p.add_argument("--out", type=str, default="data/normalized/")
    p.add_argument("--target-alerts", type=int, default=2000)
    p.add_argument("--limit-incidents", type=int, default=0)
    return p.parse_args()

# ── Helpers ─────────────────────────────────────────────────
def _ts(base, offset=0):
    return (base + timedelta(minutes=offset)).isoformat()

def _pick_user():
    return random.choice(USERS)

def _pick_asset(uid=""):
    owned = [a for a in ASSETS if a["owner_user_id"] == uid]
    return random.choice(owned) if owned else random.choice(ASSETS)

# ── Noise alert generator ───────────────────────────────────
NOISE_TEMPLATES = [
    # VPN/MFA false positives (40%)
    {"title":"VPN Çıkış Noktasından Giriş","source":"idp_auth","severity":"low","mitre":[],"desc":"Bilinen VPN çıkış noktasından giriş tespit edildi. False positive."},
    {"title":"MFA Push İsteği — Normal Kullanım","source":"idp_auth","severity":"info","mitre":[],"desc":"Kullanıcı MFA push isteğini onayladı. Normal çalışma saatleri içinde, bilinen konumdan."},
    {"title":"İmkansız Seyahat — VPN","source":"idp_auth","severity":"low","mitre":["T1078"],"desc":"VPN kullanımı nedeniyle coğrafi uyumsuzluk. Beyaz listede."},
    {"title":"Çoklu Oturum Açma","source":"idp_auth","severity":"info","mitre":[],"desc":"Kullanıcı birden fazla cihazdan oturum açtı. Normal pattern."},
    # Vulnerability scanner / pentest (20%)
    {"title":"Ağ Taraması Tespit Edildi — Yetkili","source":"ids_signature","severity":"medium","mitre":[],"desc":"Dahili pentest ekibinin planlı taraması. Önceden bildirildi."},
    {"title":"Port Tarama Aktivitesi","source":"firewall","severity":"low","mitre":[],"desc":"Düşük hacimli port tarama. Yetkili güvenlik testi."},
    # Failed login retry (15%)
    {"title":"Başarısız Giriş Denemesi","source":"idp_auth","severity":"low","mitre":[],"desc":"Kullanıcı şifresini yanlış girdi. 3 deneme sonrası başarılı."},
    {"title":"Hesap Kilitlendi — Şifre Hatası","source":"idp_auth","severity":"low","mitre":[],"desc":"Art arda başarısız girişler nedeniyle hesap geçici kilitlendi."},
    # Geofencing (10%)
    {"title":"Yeni Ülkeden Giriş — Seyahat","source":"idp_auth","severity":"low","mitre":[],"desc":"Kullanıcı seyahat ettiği ülkeden giriş yaptı. Takvimle uyumlu."},
    {"title":"Bilinen Konumdan Gece Girişi","source":"idp_auth","severity":"low","mitre":[],"desc":"Kullanıcı gece geç saatte giriş yaptı. Proje teslimi nedeniyle."},
    # DLP false positive (10%)
    {"title":"Harici Dosya Paylaşımı — Yetkili","source":"dlp_engine","severity":"low","mitre":[],"desc":"Kullanıcı iş amaçlı harici paylaşım yaptı. Yetkili."},
    {"title":"Toplu Dosya İndirme","source":"m365_audit","severity":"info","mitre":[],"desc":"Kullanıcı proje dosyalarını toplu indirdi. Normal aktivite."},
    # Anomalous time (5%)
    {"title":"Anormal Saatte Erişim","source":"idp_auth","severity":"low","mitre":[],"desc":"Kullanıcı normal çalışma saati dışında erişti. Onaylı."},
    {"title":"Hafta Sonu Admin Girişi","source":"admin_audit","severity":"low","mitre":[],"desc":"BT yöneticisi hafta sonu bakım çalışması yaptı."},
]

def generate_noise_alerts(target=1800):
    """Generate background noise / false positive alerts."""
    alerts = []
    for i in range(target):
        tpl = random.choice(NOISE_TEMPLATES)
        user = _pick_user()
        day_offset = random.randint(0, WINDOW_DAYS - 1)
        hour = random.choices([(9,17),(17,24),(0,6),(6,9)], weights=[50,15,5,10])[0]
        hour = random.randint(hour[0], hour[1] - 1) if hour[1] > hour[0] else random.randint(0, 6)
        ts = BASE_TIME + timedelta(days=day_offset, hours=hour, minutes=random.randint(0, 59))
        ip = random.choice(BENIGN_IPS) if random.random() < 0.8 else random.choice(MALICIOUS_IPS)
        alerts.append({
            "alert_id": f"ALR-NOISE-{i+1:05d}",
            "incident_id": None,
            "title": tpl["title"],
            "description": tpl["desc"],
            "severity": tpl["severity"],
            "confidence": random.randint(20, 55),
            "source": tpl["source"],
            "status": "resolved",
            "affected_user_id": user["user_id"],
            "affected_asset_id": _pick_asset(user["user_id"])["asset_id"],
            "source_ip": ip,
            "mitre_technique_ids": tpl["mitre"],
            "evidence_event_ids": [],
            "evidence_summary": f"Noise alert — {tpl['source']} event. False positive olarak işaretlendi.",
            "recommended_actions": ["Otomatik kapatıldı"],
            "playbook_run_id": None,
            "detected_at": _ts(ts),
            "resolved_at": _ts(ts, random.randint(5, 60)),
        })
    return alerts

# ── TP solo alerts ──────────────────────────────────────────
def generate_tp_solo_alerts(count=50):
    """Individual true positives not linked to incidents."""
    templates = [
        {"title":"Şüpheli PowerShell Komutu","source":"edr_telemetry","severity":"medium","mitre":["T1059.001"]},
        {"title":"Bilinmeyen Binary İndirildi","source":"proxy","severity":"medium","mitre":["T1071.001"]},
        {"title":"Anormal DNS Sorgusu","source":"dns_logs","severity":"medium","mitre":["T1572"]},
        {"title":"Yetkisiz Registry Değişikliği","source":"edr_telemetry","severity":"medium","mitre":["T1547.001"]},
        {"title":"Şüpheli Service Oluşturma","source":"edr_telemetry","severity":"high","mitre":["T1543.003"]},
        {"title":"Base64 Encoded Command","source":"edr_telemetry","severity":"high","mitre":["T1059.001"]},
        {"title":"Anormal Outbound Bağlantı","source":"firewall","severity":"medium","mitre":["T1071.001"]},
        {"title":"Bilinmeyen Sertifika","source":"cert_authority","severity":"low","mitre":[]},
    ]
    alerts = []
    for i in range(count):
        tpl = random.choice(templates)
        user = _pick_user()
        day = random.randint(0, WINDOW_DAYS - 1)
        ts = BASE_TIME + timedelta(days=day, hours=random.randint(8, 18), minutes=random.randint(0, 59))
        alerts.append({
            "alert_id": f"ALR-TP-{i+1:04d}",
            "incident_id": None,
            "title": tpl["title"],
            "description": f"Bireysel true positive. {tpl['source']} kaynağından tespit edildi.",
            "severity": tpl["severity"],
            "confidence": random.randint(60, 85),
            "source": tpl["source"],
            "status": random.choice(["new","acknowledged"]),
            "affected_user_id": user["user_id"],
            "affected_asset_id": _pick_asset(user["user_id"])["asset_id"],
            "source_ip": random.choice(MALICIOUS_IPS),
            "mitre_technique_ids": tpl["mitre"],
            "evidence_event_ids": [],
            "evidence_summary": f"Bağımsız true positive alert.",
            "recommended_actions": ["Manuel inceleme önerilir"],
            "playbook_run_id": None,
            "detected_at": _ts(ts),
            "resolved_at": None,
        })
    return alerts

# ── IOC generation ──────────────────────────────────────────
def generate_iocs(count=450):
    iocs = []
    # Domains: 200 (reuse pool with suffixes)
    for i in range(count * 45 // 100):
        if i < len(MALICIOUS_DOMAINS):
            d = MALICIOUS_DOMAINS[i]
        else:
            d = f"phish-{stable_hash(f'dom{i}',6)}.example.tk"
        iocs.append({"ioc_id":f"IOC-DOM-{i+1:04d}","type":"domain","value":d,"label":"Oltalama/C2 domain","severity":random.choice(["critical","high","medium"]),"confidence":random.randint(60,95),"threat_score":random.randint(50,95),"tags":["phishing" if any(kw in d for kw in ["giris","microsoft","verify","portal"]) else "c2" if "cdn" in d or "beacon" in d or "c2" in d else random.choice(["phishing","c2","malware"])],"description":f"Kurgusal tehdit domain'i.","source":"threat_intel_feed","related_alert_ids":[],"first_seen":BASE_TIME.isoformat(),"last_seen":(BASE_TIME+timedelta(days=WINDOW_DAYS)).isoformat()})
    # IPs: 100
    for i in range(count * 25 // 100):
        ip = f"{198 if random.random()<0.7 else 203}.51.100.{random.randint(1,254)}" if random.random()<0.5 else f"203.0.113.{random.randint(1,254)}"
        iocs.append({"ioc_id":f"IOC-IP-{i+1:04d}","type":"ip","value":ip,"label":"Saldırgan IP","severity":random.choice(["high","medium"]),"confidence":random.randint(55,90),"threat_score":random.randint(45,90),"tags":["attacker"],"description":"TEST-NET IP (RFC 5737). Kurgusal.","source":"malicious_ip_feed","related_alert_ids":[],"first_seen":BASE_TIME.isoformat(),"last_seen":(BASE_TIME+timedelta(days=WINDOW_DAYS)).isoformat()})
    # Hashes: 80
    for i in range(count * 20 // 100):
        h = stable_hash(f"malware-sample-{i}", 40)
        iocs.append({"ioc_id":f"IOC-HASH-{i+1:04d}","type":"hash","value":h,"label":"Zararlı yazılım hash'i","severity":random.choice(["critical","high"]),"confidence":random.randint(80,98),"threat_score":random.randint(70,98),"tags":["malware"],"description":"Kurgusal malware sample hash.","source":"internal_research","related_alert_ids":[],"first_seen":BASE_TIME.isoformat(),"last_seen":(BASE_TIME+timedelta(days=WINDOW_DAYS)).isoformat()})
    # URLs: 40
    for i in range(count * 8 // 100):
        u = f"hxxps://phish-{stable_hash(f'url{i}',6)}[.]example[.]tk/login"
        iocs.append({"ioc_id":f"IOC-URL-{i+1:04d}","type":"url","value":u,"label":"Oltalama URL'i","severity":random.choice(["high","medium"]),"confidence":random.randint(50,85),"threat_score":random.randint(40,85),"tags":["phishing","url"],"description":"Kurgusal phishing URL'i.","source":"threat_intel_feed","related_alert_ids":[],"first_seen":BASE_TIME.isoformat(),"last_seen":(BASE_TIME+timedelta(days=WINDOW_DAYS)).isoformat()})
    # Emails: 30
    for i in range(count * 7 // 100):
        em = f"saldirgan-{stable_hash(f'em{i}',4)}[@]example[.]tk"
        iocs.append({"ioc_id":f"IOC-EM-{i+1:04d}","type":"email","value":em,"label":"Oltalama gönderici adresi","severity":"medium","confidence":random.randint(40,70),"threat_score":random.randint(30,70),"tags":["phishing","email"],"description":"Kurgusal phishing sender.","source":"threat_intel_feed","related_alert_ids":[],"first_seen":BASE_TIME.isoformat(),"last_seen":(BASE_TIME+timedelta(days=WINDOW_DAYS)).isoformat()})
    return iocs

# ── Detection rules expansion ───────────────────────────────
def generate_detection_rules(count=28):
    rules = []
    base_rules = [
        ("RULE-MAILBOX-FWD","Harici Posta Kutusu Yönlendirme Kuralı","critical","m365_audit",["T1114.002","T1098"]),
        ("RULE-IMPOSSIBLE","İmkansız Seyahat Tespiti","high","idp_auth",["T1078"]),
        ("RULE-MFA-BOMBING","MFA Push Bombardımanı","critical","idp_auth",["T1556"]),
        ("RULE-PW-SPRAY","Parola Püskürtme Tespiti","medium","idp_auth",["T1110.003"]),
        ("RULE-OAUTH-RISKY","Riskli OAuth Uygulama İzni","high","idp_auth",["T1528"]),
        ("RULE-MACRO-EXEC","Office Makro Çalıştırma Zinciri","critical","edr_telemetry",["T1566.001","T1059.005"]),
        ("RULE-C2-BEACON","C2 Beacon İletişimi","critical","edr_telemetry",["T1071.001"]),
        ("RULE-SHARING-BULK","Toplu Dış Paylaşım","high","m365_audit",["T1567.002"]),
        ("RULE-DNS-TUNNEL","Anormal Uzun DNS Query Tespiti","critical","dns_logs",["T1572"]),
        ("RULE-KERBEROAST","Kerberos TGS Request Spike","high","idp_auth",["T1558.003"]),
        ("RULE-WEBSHELL-IIS","IIS Dizininde Şüpheli .aspx Dosyası","critical","ids_signature",["T1505.003"]),
        ("RULE-LSASS-ACCESS","LSASS Process Memory Erişimi","critical","edr_telemetry",["T1003.001"]),
        ("RULE-SMB-LATERAL","Admin Share Üzerinden Binary Transfer","high","edr_telemetry",["T1072"]),
        ("RULE-EGRESS-VOLUME","Anormal Veri Çıkış Hacmi","high","dlp_engine",["T1048.003"]),
        ("RULE-DGA-DOMAIN","DGA Pattern DNS Query","high","dns_logs",["T1071.001"]),
        ("RULE-DISABLE-AV","Antivirüs Servisi Durdurma Girişimi","critical","edr_telemetry",["T1562.001"]),
        ("RULE-RANSOMWARE-EXT","Toplu Dosya Uzantısı Değişimi","critical","edr_telemetry",["T1486"]),
        ("RULE-SCHEDULED-TASK","Şüpheli Zamanlanmış Görev","high","edr_telemetry",["T1053.005"]),
        ("RULE-WMI-PERSIST","WMI Kalıcılığı","high","edr_telemetry",["T1047"]),
        ("RULE-CRYPT-MINING","Kripto Mining Aktivitesi","medium","edr_telemetry",["T1496"]),
        ("RULE-SUPPLY-CHAIN","Şüpheli Paket İndirme","high","proxy",["T1195.002"]),
        ("RULE-ALT-PORT","Standart Olmayan Port Kullanımı","medium","firewall",["T1571"]),
        ("RULE-FILE-EXT-SPOOF","Dosya Uzantısı Aldatmacası","medium","email_gateway",["T1036.005"]),
        ("RULE-SESSION-REPLAY","Session Token Replay","high","idp_auth",["T1539"]),
        ("RULE-ENCODED-PS","Base64 PowerShell Komutu","critical","edr_telemetry",["T1059.001"]),
        ("RULE-CLOUD-MISCONF","Public Cloud Storage Yanlış Yapılandırma","medium","cloud_audit",["T1567.002"]),
        ("RULE-CERT-ANOMALY","Anormal Sertifika İsteği","medium","cert_authority",[]),
        ("RULE-VPN-BRUTE","VPN Brute Force","high","vpn_logs",["T1110.003"]),
    ]
    for i, (rid, name, sev, src, mitre) in enumerate(base_rules[:count]):
        fp = random.uniform(1, 18)
        rules.append({
            "rule_id":rid,"name":name,"description":f"{name} tespit kuralı. {src} kaynağında tetiklenir.",
            "severity":sev,"source":src,"sigma_rule":f"title: {name}\nlogsource:\n  product: {src}\ndetection:\n  keywords: ['suspicious']\n  condition: keywords",
            "mitre_technique_ids":mitre,"enabled":True,"alert_count_14d":random.randint(0,50),
            "false_positive_rate":round(fp,1),"author":"SOC Team",
            "created_at":(BASE_TIME - timedelta(days=90)).isoformat(),
            "updated_at":(BASE_TIME - timedelta(days=random.randint(1,30))).isoformat(),
            "tags":[src,"detection"]
        })
    return rules

# ── Main ────────────────────────────────────────────────────
def main():
    args = parse_args()
    random.seed(args.seed)
    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    print("=" * 60)
    print(f"SOC DATASET BUILDER v2.0.5")
    print(f"  Seed: {args.seed} | Span: {WINDOW_DAYS}gün | Target: {args.target_alerts} alerts")
    print("=" * 60)

    # 1. Generate incident-based alerts (from existing 9 scenarios)
    print("\n[1/6] Incident senaryoları...")
    from generate_incidents import IncidentGenerator
    gen = IncidentGenerator()
    inc_data = gen.generate_all()
    inc_alerts = inc_data["alerts"]
    incidents = inc_data["incidents"]
    playbook_defs = inc_data["playbook_definitions"]
    playbook_runs = inc_data["playbook_runs"]
    print(f"  -> {len(inc_alerts)} scenario alert, {len(incidents)} incident")

    # 2. Noise alerts
    noise_target = args.target_alerts - len(inc_alerts) - 50
    print(f"\n[2/6] {noise_target} noise alert...")
    noise = generate_noise_alerts(noise_target)
    tp_solo = generate_tp_solo_alerts(50)
    all_alerts = inc_alerts + noise + tp_solo
    print(f"  -> {len(noise)} noise + {len(tp_solo)} TP solo -> {len(all_alerts)} total")

    # 3. IOCs
    print(f"\n[3/6] IOC'ler...")
    iocs = generate_iocs(450)
    print(f"  -> {len(iocs)} IOCs")

    # 4. MITRE coverage
    print(f"\n[4/6] MITRE...")
    from enrich_mitre import build_mitre_coverage
    mitre = build_mitre_coverage(all_alerts, incidents)
    print(f"  -> {mitre['summary']['covered_techniques']}/{mitre['summary']['total_techniques']} teknik")

    # 5. Entities
    print(f"\n[5/6] Varlık profilleri...")
    from normalize import generate_users as gen_users, generate_assets as gen_assets, generate_kpi_metrics
    users = gen_users(all_alerts, incidents)
    assets = gen_assets(all_alerts, incidents)
    kpi = generate_kpi_metrics(all_alerts, incidents, users, assets, playbook_runs)
    detection_rules = generate_detection_rules(28)
    print(f"  -> {len(users)} user, {len(assets)} asset, {len(detection_rules)} rule")

    # 6. Save
    print(f"\n[6/6] Kaydediliyor -> {out_dir}")
    def save(data, fn):
        with open(out_dir / fn, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"  [OK] {fn} ({len(data) if isinstance(data, list) else 'obj'})")

    save(all_alerts, "alerts.json")
    save(incidents, "incidents.json")
    save(iocs, "iocs.json")
    save(assets, "assets.json")
    save(users, "users.json")
    save(playbook_defs, "playbook_definitions.json")
    save(playbook_runs, "playbook_runs.json")
    save(detection_rules, "detection_rules.json")
    save(mitre, "mitre_coverage.json")
    save(kpi, "kpi_metrics.json")

    print(f"\n{'=' * 60}")
    print(f"TAMAMLANDI | {len(all_alerts)} alerts | {len(incidents)} incidents | {len(iocs)} IOCs")
    print(f"{'=' * 60}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
