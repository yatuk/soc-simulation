"""
Shared constants for the SOC dataset pipeline.
All entities are COMPLETELY FICTIONAL — Turkish company ecosystem.
Seed-based reproducibility.
"""
import hashlib
from datetime import datetime, timedelta

# ── Time window ──────────────────────────────────────────────
BASE_TIME = datetime(2026, 5, 10, 0, 0, 0)  # fixed anchor for reproducibility
WINDOW_DAYS = 14

# ── Fictional company ────────────────────────────────────────
PRIMARY_COMPANY = {
    "name": "Anadolu Finans Holding",
    "domain": "anadolufinans.example.tr",
    "sector": "Finance",
}

# ── Fictional users ──────────────────────────────────────────
USERS = [
    {"user_id": "usr-a1b2c3d4", "email": "ayse.demir@anadolufinans.example.tr",  "display_name": "Ayşe Demir",   "department": "Finans",           "title": "Finans Analisti",         "role": "analyst"},
    {"user_id": "usr-b2c3d4e5", "email": "mehmet.kaya@anadolufinans.example.tr", "display_name": "Mehmet Kaya",   "department": "BT",                "title": "Sistem Yöneticisi",       "role": "admin"},
    {"user_id": "usr-c3d4e5f6", "email": "elif.yilmaz@anadolufinans.example.tr", "display_name": "Elif Yılmaz",   "department": "Yazılım",           "title": "Kıdemli Geliştirici",     "role": "analyst"},
    {"user_id": "usr-d4e5f6a7", "email": "mustafa.arslan@anadolufinans.example.tr", "display_name": "Mustafa Arslan", "department": "Satış",           "title": "Satış Müdürü",            "role": "viewer"},
    {"user_id": "usr-e5f6a7b8", "email": "zeynep.celik@anadolufinans.example.tr", "display_name": "Zeynep Çelik",  "department": "İK",                "title": "İK Uzmanı",               "role": "viewer"},
    {"user_id": "usr-f6a7b8c9", "email": "ali.ozturk@anadolufinans.example.tr",   "display_name": "Ali Öztürk",    "department": "Pazarlama",          "title": "Pazarlama Direktörü",     "role": "viewer"},
    {"user_id": "usr-a7b8c9d0", "email": "fatma.sahin@anadolufinans.example.tr",  "display_name": "Fatma Şahin",   "department": "Finans",             "title": "Muhasebe Müdürü",         "role": "analyst"},
    {"user_id": "usr-b8c9d0e1", "email": "ahmet.yildiz@anadolufinans.example.tr", "display_name": "Ahmet Yıldız",  "department": "Yönetim",            "title": "CFO",                     "role": "admin"},
    {"user_id": "usr-c9d0e1f2", "email": "selin.aksoy@anadolufinans.example.tr",  "display_name": "Selin Aksoy",   "department": "Hukuk",              "title": "Hukuk Danışmanı",         "role": "viewer"},
    {"user_id": "usr-d0e1f2a3", "email": "emre.korkmaz@anadolufinans.example.tr", "display_name": "Emre Korkmaz",  "department": "BT",                 "title": "Siber Güvenlik Analisti", "role": "analyst"},
    {"user_id": "usr-e1f2a3b4", "email": "deniz.aydin@anadolufinans.example.tr",  "display_name": "Deniz Aydın",   "department": "Yazılım",            "title": "DevOps Mühendisi",        "role": "analyst"},
    {"user_id": "usr-f2a3b4c5", "email": "burak.polat@anadolufinans.example.tr",  "display_name": "Burak Polat",   "department": "Satış",              "title": "Bölge Müdürü",            "role": "viewer"},
    {"user_id": "usr-a3b4c5d6", "email": "ceren.erdogan@anadolufinans.example.tr","display_name": "Ceren Erdoğan", "department": "Risk",               "title": "Risk Analisti",           "role": "analyst"},
    {"user_id": "usr-b4c5d6e7", "email": "oguz.tekin@anadolufinans.example.tr",   "display_name": "Oğuz Tekin",    "department": "Operasyon",          "title": "Operasyon Müdürü",        "role": "viewer"},
    {"user_id": "usr-c5d6e7f8", "email": "gulsen.dogan@anadolufinans.example.tr", "display_name": "Gülşen Doğan",  "department": "Müşteri Hizmetleri", "title": "Müşteri İlişkileri Yön.", "role": "viewer"},
]

# ── Fictional assets (endpoints) ─────────────────────────────
ASSETS = [
    {"asset_id": "AST-001", "hostname": "IST-WS-001",     "type": "workstation", "os": "Windows 11 Pro",       "owner_user_id": "usr-a1b2c3d4", "location": "İstanbul"},
    {"asset_id": "AST-002", "hostname": "IST-WS-002",     "type": "workstation", "os": "Windows 11 Pro",       "owner_user_id": "usr-b2c3d4e5", "location": "İstanbul"},
    {"asset_id": "AST-003", "hostname": "ANK-LT-001",     "type": "laptop",      "os": "macOS 14 Sonoma",       "owner_user_id": "usr-c3d4e5f6", "location": "Ankara"},
    {"asset_id": "AST-004", "hostname": "IST-WS-003",     "type": "workstation", "os": "Windows 11 Pro",       "owner_user_id": "usr-d4e5f6a7", "location": "İstanbul"},
    {"asset_id": "AST-005", "hostname": "IST-WS-004",     "type": "workstation", "os": "Windows 11 Pro",       "owner_user_id": "usr-e5f6a7b8", "location": "İstanbul"},
    {"asset_id": "AST-006", "hostname": "IZM-LT-001",     "type": "laptop",      "os": "macOS 14 Sonoma",       "owner_user_id": "usr-f6a7b8c9", "location": "İzmir"},
    {"asset_id": "AST-007", "hostname": "IST-WS-005",     "type": "workstation", "os": "Windows 11 Pro",       "owner_user_id": "usr-a7b8c9d0", "location": "İstanbul"},
    {"asset_id": "AST-008", "hostname": "IST-EXC-001",    "type": "workstation", "os": "Windows 11 Pro",       "owner_user_id": "usr-b8c9d0e1", "location": "İstanbul"},
    {"asset_id": "AST-009", "hostname": "ANK-LT-002",     "type": "laptop",      "os": "macOS 14 Sonoma",       "owner_user_id": "usr-c9d0e1f2", "location": "Ankara"},
    {"asset_id": "AST-010", "hostname": "IST-SEC-001",    "type": "workstation", "os": "Windows 11 Pro",       "owner_user_id": "usr-d0e1f2a3", "location": "İstanbul"},
    {"asset_id": "AST-011", "hostname": "IST-DEV-001",    "type": "workstation", "os": "Ubuntu 22.04 LTS",      "owner_user_id": "usr-e1f2a3b4", "location": "İstanbul"},
    {"asset_id": "AST-012", "hostname": "BRS-WS-001",     "type": "workstation", "os": "Windows 11 Pro",       "owner_user_id": "usr-f2a3b4c5", "location": "Bursa"},
    {"asset_id": "AST-013", "hostname": "IST-WS-006",     "type": "workstation", "os": "Windows 11 Pro",       "owner_user_id": "usr-a3b4c5d6", "location": "İstanbul"},
    {"asset_id": "AST-014", "hostname": "IST-WS-007",     "type": "workstation", "os": "Windows 11 Pro",       "owner_user_id": "usr-b4c5d6e7", "location": "İstanbul"},
    {"asset_id": "AST-015", "hostname": "IST-WS-008",     "type": "workstation", "os": "Windows 11 Pro",       "owner_user_id": "usr-c5d6e7f8", "location": "İstanbul"},
    {"asset_id": "AST-016", "hostname": "IST-DC-001",     "type": "server",      "os": "Windows Server 2022",   "owner_user_id": "usr-b2c3d4e5", "location": "İstanbul DC"},
    {"asset_id": "AST-017", "hostname": "IST-MAIL-001",   "type": "server",      "os": "Windows Server 2022",   "owner_user_id": "usr-b2c3d4e5", "location": "İstanbul DC"},
    {"asset_id": "AST-018", "hostname": "IST-WEB-001",    "type": "server",      "os": "Ubuntu 22.04 LTS",      "owner_user_id": "usr-b2c3d4e5", "location": "İstanbul DC"},
    {"asset_id": "AST-019", "hostname": "ANK-VDI-001",    "type": "laptop",      "os": "Windows 11 Enterprise", "owner_user_id": "usr-b2c3d4e5", "location": "Ankara DC"},
    {"asset_id": "AST-020", "hostname": "IST-MOB-001",    "type": "mobile",      "os": "iOS 17",                "owner_user_id": "usr-b8c9d0e1", "location": "İstanbul"},
    {"asset_id": "AST-021", "hostname": "IST-MOB-002",    "type": "mobile",      "os": "Android 14",            "owner_user_id": "usr-d4e5f6a7", "location": "İstanbul"},
    {"asset_id": "AST-022", "hostname": "IZM-WS-001",     "type": "workstation", "os": "Windows 10 Pro",       "owner_user_id": "usr-b2c3d4e5", "location": "İzmir"},
    {"asset_id": "AST-023", "hostname": "ANT-LT-001",     "type": "laptop",      "os": "Windows 11 Pro",       "owner_user_id": "usr-f2a3b4c5", "location": "Antalya"},
    {"asset_id": "AST-024", "hostname": "IST-KIOSK-001",  "type": "other",       "os": "Windows 10 LTSC",       "owner_user_id": "usr-b2c3d4e5", "location": "İstanbul Şube"},
    {"asset_id": "AST-025", "hostname": "IST-PRINT-001",  "type": "other",       "os": "Embedded Linux",        "owner_user_id": "usr-b2c3d4e5", "location": "İstanbul"},
]

# ── Malicious domains (clearly fake, .example TLDs) ──────────
MALICIOUS_DOMAINS = [
    "anadolu-giris-dogrula.example.tk",
    "finans-portal-guvenli.example.ml",
    "microsoft-tr-auth.example.cf",
    "sharepoint-dosya-indir.example.ga",
    "onedrive-paylasim.example.tk",
    "outlook-guvenlik.example.ml",
    "fatura-odeme-sistemi.example.cf",
    "ik-maas-guncelleme.example.ga",
    "yonetim-portal.example.tk",
    "cdn-guncelleme.example.cf",
]

# ── Malicious IPs (TEST-NET ranges per RFC 5737) ─────────────
MALICIOUS_IPS = [
    "198.51.100.45",   # TEST-NET-2 (Bükreş/Romanya aktörü)
    "203.0.113.180",   # TEST-NET-3 (Moskova/Rusya aktörü)
    "198.51.100.91",   # TEST-NET-2 (Pekin/Çin aktörü)
    "203.0.113.195",   # TEST-NET-3 (Lagos/Nijerya aktörü)
    "198.51.100.54",   # TEST-NET-2 (São Paulo/Brezilya aktörü)
    "203.0.113.78",    # TEST-NET-3
]

BENIGN_IPS = [
    "10.10.1.50", "10.10.1.51", "10.10.2.100",
    "192.168.1.1", "172.16.0.1",
    "192.0.2.100", "192.0.2.101",
]

GEO_LOCATIONS = {
    "198.51.100.45":  {"city": "Bükreş",    "country": "Romanya"},
    "203.0.113.180":  {"city": "Moskova",   "country": "Rusya"},
    "198.51.100.91":  {"city": "Pekin",     "country": "Çin"},
    "203.0.113.195":  {"city": "Lagos",     "country": "Nijerya"},
    "198.51.100.54":  {"city": "São Paulo", "country": "Brezilya"},
    "10.10.1.50":     {"city": "İstanbul",  "country": "Türkiye"},
    "10.10.1.51":     {"city": "Ankara",    "country": "Türkiye"},
    "192.0.2.100":    {"city": "Amsterdam", "country": "Hollanda"},
}

# ── MITRE ATT&CK techniques ──────────────────────────────────
MITRE_TECHNIQUES = {
    "T1566.001": {"name": "Oltalama: Hedefli Ek Dosya",              "tactic": "Initial Access"},
    "T1566.002": {"name": "Oltalama: Hedefli Bağlantı",             "tactic": "Initial Access"},
    "T1078":     {"name": "Geçerli Hesaplar",                       "tactic": "Defense Evasion"},
    "T1078.004": {"name": "Geçerli Hesaplar: Bulut Hesapları",     "tactic": "Defense Evasion"},
    "T1114.002": {"name": "E-posta Toplama: Uzak E-posta Erişimi",  "tactic": "Collection"},
    "T1098":     {"name": "Hesap Manipülasyonu",                    "tactic": "Persistence"},
    "T1098.001": {"name": "Hesap Manipülasyonu: Ek Bulut Kimlik.",  "tactic": "Persistence"},
    "T1528":     {"name": "Uygulama Erişim Jetonu Çalma",          "tactic": "Credential Access"},
    "T1556":     {"name": "Kimlik Doğrulama Sürecini Değiştirme",  "tactic": "Credential Access"},
    "T1059.001": {"name": "Komut ve Betik: PowerShell",            "tactic": "Execution"},
    "T1059.005": {"name": "Komut ve Betik: Visual Basic",          "tactic": "Execution"},
    "T1547.001": {"name": "Önyükleme/Oturum: Kayıt Defteri Anaht.", "tactic": "Persistence"},
    "T1071.001": {"name": "Uyg. Katmanı Protokolü: Web Protokol.",  "tactic": "Command and Control"},
    "T1567.002": {"name": "Web Servisi Üzerinden Veri Sızdırma",   "tactic": "Exfiltration"},
    "T1110.003": {"name": "Kaba Kuvvet: Parola Püskürtme",        "tactic": "Credential Access"},
}

MITRE_TACTICS = [
    {"tactic_id": "TA0001", "name": "Initial Access",       "short_name": "initial-access",       "order": 1},
    {"tactic_id": "TA0002", "name": "Execution",            "short_name": "execution",            "order": 2},
    {"tactic_id": "TA0003", "name": "Persistence",          "short_name": "persistence",           "order": 3},
    {"tactic_id": "TA0004", "name": "Privilege Escalation", "short_name": "privilege-escalation",  "order": 4},
    {"tactic_id": "TA0005", "name": "Defense Evasion",      "short_name": "defense-evasion",       "order": 5},
    {"tactic_id": "TA0006", "name": "Credential Access",    "short_name": "credential-access",     "order": 6},
    {"tactic_id": "TA0007", "name": "Discovery",            "short_name": "discovery",             "order": 7},
    {"tactic_id": "TA0008", "name": "Lateral Movement",     "short_name": "lateral-movement",      "order": 8},
    {"tactic_id": "TA0009", "name": "Collection",           "short_name": "collection",            "order": 9},
    {"tactic_id": "TA0010", "name": "Exfiltration",         "short_name": "exfiltration",          "order": 12},
    {"tactic_id": "TA0011", "name": "Command and Control",  "short_name": "command-and-control",   "order": 10},
]

# ── Hasher helper ────────────────────────────────────────────
def stable_hash(value: str, length: int = 8) -> str:
    return hashlib.sha256(value.lower().encode()).hexdigest()[:length]
