"""
Shared constants for the SOC dataset pipeline.
All entities are COMPLETELY FICTIONAL — Turkish company ecosystem.
Seed-based reproducibility.
"""
import hashlib
from datetime import datetime, timedelta

# Time window — 60 days
BASE_TIME = datetime(2026, 3, 25, 0, 0, 0)
WINDOW_DAYS = 60

PRIMARY_COMPANY = {"name": "Anadolu Finans Holding", "domain": "anadolufinans.example.tr", "sector": "Finance"}

# ── Expanded users (85) ─────────────────────────────────────
FIRST_NAMES = ["Ayşe","Mehmet","Elif","Mustafa","Zeynep","Ali","Fatma","Ahmet","Selin","Emre","Deniz","Burak","Ceren","Oğuz","Gülşen","Cem","Derya","Kemal","Leyla","Murat","Nalan","Orhan","Pınar","Serkan","Tuğba","Uğur","Vildan","Yusuf","Zehra","Barış","Cansu","Doğan","Ebru","Fırat","Gizem","Hakan","Işıl","Kaan","Lale","Mert","Nergis","Onur","Sema","Tarık","Umut","Volkan","Yasemin","Berk","Damla","Efe","Funda","Gökhan","Hande","İpek","İsmail","Kadir","Leman","Merve","Nuri","Özge","Pelin","Rıza","Sarp","Tuğçe","Ulaş","Bahar","Can","Dilek","Ender","Feray","Güven","Hülya","İbrahim","Jale","Koray","Levent","Melis","Nazlı","Osman","Peri","Remzi","Sevgi","Tolga","Ümit"]
LAST_NAMES = ["Demir","Kaya","Yılmaz","Arslan","Çelik","Öztürk","Şahin","Aksoy","Korkmaz","Aydın","Polat","Erdoğan","Tekin","Doğan","Güneş","Özdemir","Yıldırım","Koç","Kara","Eren","Çetin","Kurt","Özkan","Şen","Acar","Bulut","Tunç","Kaplan","Yalçın","Güler","Aslan","Taş","Ateş","Balcı","Candan","Duran","Ersoy","Genç","Hoş","Işık","Karaca","Mutlu","Okan","Peker","Savaş","Türkmen","Uysal","Yaman"]
DEPARTMENTS = {"IT":15,"Finans":10,"Yazılım":20,"Satış":15,"İK":5,"Pazarlama":4,"Yönetim":3,"Hukuk":2,"Risk":3,"Operasyon":5,"Müşteri Hizmetleri":3}
TITLES = {"analyst":["Analist","Kıdemli Analist","Uzman"],"admin":["Sistem Yöneticisi","Güvenlik Mühendisi","Ağ Yöneticisi"],"viewer":["Uzman","Müdür","Direktör","Koordinatör"]}
CITIES = ["İstanbul","Ankara","İzmir","Bursa","Antalya"]

def generate_users(count=85):
    users = []
    for i in range(min(count, len(FIRST_NAMES))):
        dept = list(DEPARTMENTS.keys())[i % len(DEPARTMENTS)]
        role = "admin" if i < 8 else "analyst" if i < 35 else "viewer"
        fn = FIRST_NAMES[i]; ln = LAST_NAMES[i % len(LAST_NAMES)]
        uid = f"usr-{hashlib.sha256(f'{fn}{ln}'.encode()).hexdigest()[:8]}"
        email = f"{fn.lower().replace('ş','s').replace('ç','c').replace('ğ','g').replace('ı','i').replace('ö','o').replace('ü','u')}.{ln.lower().replace('ş','s').replace('ç','c').replace('ğ','g').replace('ı','i').replace('ö','o').replace('ü','u')}@anadolufinans.example.tr"
        users.append({"user_id":uid,"email":email,"display_name":f"{fn} {ln}","department":dept,"title":f"{dept} {TITLES[role][i%len(TITLES[role])]}","role":role})
    return users

def generate_assets(count=140):
    assets = []
    types = {"workstation":70,"laptop":30,"server":15,"mobile":20,"other":5}
    hosts = {"workstation":"WS","laptop":"LT","server":"SRV","mobile":"MOB","other":"PRN"}
    idx = 0
    for atype, cnt in types.items():
        for _ in range(cnt):
            idx += 1
            city = CITIES[idx % len(CITIES)]
            h = hosts[atype]
            aid = f"AST-{idx:04d}"
            hostname = f"{city[:3].upper()}-{h}-{idx:03d}"
            os = "Windows 11 Pro" if atype in ("workstation","laptop") else "Windows Server 2022" if atype=="server" else "iOS 17" if "MOB" in h else "Ubuntu 22.04 LTS"
            assets.append({"asset_id":aid,"hostname":hostname,"type":atype,"os":os,"owner_user_id":"","location":city})
    return assets

USERS = generate_users(85)
ASSETS = generate_assets(140)

# ── Expanded malicious entities ─────────────────────────────
MALICIOUS_DOMAINS = [
    "anadolu-giris-dogrula.example.tk","finans-portal-guvenli.example.ml","microsoft-tr-auth.example.cf",
    "sharepoint-dosya-indir.example.ga","onedrive-paylasim.example.tk","outlook-guvenlik.example.ml",
    "fatura-odeme-sistemi.example.cf","ik-maas-guncelleme.example.ga","yonetim-portal.example.tk",
    "cdn-guncelleme.example.cf","bankacilik-guvenlik.example.tk","e-devlet-sorgu.example.ml",
    "apple-verify-tr.example.cf","dropbox-paylas.example.ga","zoom-davet.example.tk",
    "acil-guvenlik.example.ml","dhl-kargo-takip.example.cf","fedex-gonderi.example.ga",
    "linkedin-baglanti.example.tk","twitter-dogrulama.example.ml","instagram-yardim.example.cf",
    "anadolu-cti.example.tk","c2-beacon-tr.example.cf","xmr-pool-tr.example.ga",
    "dns-tunnel.example.tk","evil-cdn.example.cf","phish-kit-tr.example.ga",
    "sifir-giris.example.tk","sms-dogrula.example.ml","kargo-teslim.example.cf",
    "dns-exfil.example.tk","mimikatz-tr.example.cf","kerberos-hash.example.ga",
    "cobalt-c2.example.tk","silver-beacon.example.ml","log4j-tr.example.cf",
    "eternal-blue.example.ga","wanna-cry-tr.example.tk",
]

MALICIOUS_IPS = [
    "198.51.100.45","203.0.113.180","198.51.100.91","203.0.113.195","198.51.100.54","203.0.113.78",
    "198.51.100.12","203.0.113.221","198.51.100.167","203.0.113.89","198.51.100.201","203.0.113.33",
    "198.51.100.76","203.0.113.144","198.51.100.233","203.0.113.56","198.51.100.98","203.0.113.177",
    "198.51.100.145","203.0.113.212","198.51.100.34","203.0.113.68","198.51.100.189","203.0.113.123",
    "198.51.100.210","203.0.113.245","198.51.100.123","203.0.113.199","198.51.100.56","203.0.113.111",
]

BENIGN_IPS = ["10.10.1.50","10.10.1.51","10.10.2.100","10.10.3.25","10.10.4.75","192.168.1.1","172.16.0.1","192.0.2.100","192.0.2.101","10.0.0.1"]

GEO_LOCATIONS = {
    "198.51.100.45":{"city":"Bükreş","country":"Romanya"},"203.0.113.180":{"city":"Moskova","country":"Rusya"},
    "198.51.100.91":{"city":"Pekin","country":"Çin"},"203.0.113.195":{"city":"Lagos","country":"Nijerya"},
    "198.51.100.54":{"city":"São Paulo","country":"Brezilya"},"10.10.1.50":{"city":"İstanbul","country":"Türkiye"},
    "192.0.2.100":{"city":"Amsterdam","country":"Hollanda"},"198.51.100.12":{"city":"Tahran","country":"İran"},
    "203.0.113.221":{"city":"Pyongyang","country":"Kuzey Kore"},"198.51.100.167":{"city":"Hanoi","country":"Vietnam"},
    "203.0.113.33":{"city":"Londra","country":"İngiltere"},"198.51.100.201":{"city":"Berlin","country":"Almanya"},
    "203.0.113.144":{"city":"New York","country":"ABD"},
}

MITRE_TECHNIQUES = {
    "T1566.001":{"name":"Oltalama: Hedefli Ek Dosya","tactic":"Initial Access"},
    "T1566.002":{"name":"Oltalama: Hedefli Bağlantı","tactic":"Initial Access"},
    "T1078":{"name":"Geçerli Hesaplar","tactic":"Defense Evasion"},
    "T1078.004":{"name":"Geçerli Hesaplar: Bulut Hesapları","tactic":"Defense Evasion"},
    "T1114.002":{"name":"E-posta Toplama: Uzak E-posta Erişimi","tactic":"Collection"},
    "T1098":{"name":"Hesap Manipülasyonu","tactic":"Persistence"},
    "T1098.001":{"name":"Hesap Manipülasyonu: Ek Bulut Kimlik.","tactic":"Persistence"},
    "T1528":{"name":"Uygulama Erişim Jetonu Çalma","tactic":"Credential Access"},
    "T1556":{"name":"Kimlik Doğrulama Sürecini Değiştirme","tactic":"Credential Access"},
    "T1059.001":{"name":"Komut ve Betik: PowerShell","tactic":"Execution"},
    "T1059.005":{"name":"Komut ve Betik: Visual Basic","tactic":"Execution"},
    "T1547.001":{"name":"Önyükleme/Oturum: Kayıt Defteri Anaht.","tactic":"Persistence"},
    "T1071.001":{"name":"Uygulama Katmanı Protokolü: Web","tactic":"Command and Control"},
    "T1567.002":{"name":"Web Servisi Üzerinden Veri Sızdırma","tactic":"Exfiltration"},
    "T1110.003":{"name":"Kaba Kuvvet: Parola Püskürtme","tactic":"Credential Access"},
    "T1003.001":{"name":"İşletim Sistemi Kimlik Bilgisi Dump","tactic":"Credential Access"},
    "T1053.005":{"name":"Zamanlanmış Görev","tactic":"Execution"},
    "T1486":{"name":"Veri Şifreleme (Fidye)","tactic":"Impact"},
    "T1047":{"name":"Windows Management Instrumentation","tactic":"Execution"},
    "T1558.003":{"name":"Kerberoasting","tactic":"Credential Access"},
    "T1505.003":{"name":"Web Shell","tactic":"Persistence"},
    "T1072":{"name":"Yazılım Dağıtım Araçları","tactic":"Execution"},
    "T1572":{"name":"Protokol Tünelleme","tactic":"Command and Control"},
    "T1496":{"name":"Kaynak Ele Geçirme","tactic":"Impact"},
    "T1539":{"name":"Web Servislerini Çalma","tactic":"Credential Access"},
    "T1195.002":{"name":"Tedarik Zinciri: Derleme Sistemi","tactic":"Initial Access"},
    "T1571":{"name":"Standart Olmayan Port","tactic":"Command and Control"},
    "T1036.005":{"name":"Dosya Uzantılarının Değiştirilmesi","tactic":"Defense Evasion"},
    "T1562.001":{"name":"Araçları Devre Dışı Bırakma","tactic":"Defense Evasion"},
    "T1048.003":{"name":"Alternatif Protokol ile Veri Sızdırma","tactic":"Exfiltration"},
}

MITRE_TACTICS = [
    {"tactic_id":"TA0001","name":"Initial Access","short_name":"initial-access","order":1},
    {"tactic_id":"TA0002","name":"Execution","short_name":"execution","order":2},
    {"tactic_id":"TA0003","name":"Persistence","short_name":"persistence","order":3},
    {"tactic_id":"TA0004","name":"Privilege Escalation","short_name":"privilege-escalation","order":4},
    {"tactic_id":"TA0005","name":"Defense Evasion","short_name":"defense-evasion","order":5},
    {"tactic_id":"TA0006","name":"Credential Access","short_name":"credential-access","order":6},
    {"tactic_id":"TA0007","name":"Discovery","short_name":"discovery","order":7},
    {"tactic_id":"TA0008","name":"Lateral Movement","short_name":"lateral-movement","order":8},
    {"tactic_id":"TA0009","name":"Collection","short_name":"collection","order":9},
    {"tactic_id":"TA0010","name":"Exfiltration","short_name":"exfiltration","order":12},
    {"tactic_id":"TA0011","name":"Command and Control","short_name":"command-and-control","order":10},
    {"tactic_id":"TA0040","name":"Impact","short_name":"impact","order":11},
]

ALERT_SOURCES = ["email_gateway","idp_auth","m365_audit","admin_audit","edr_telemetry","dlp_engine","firewall","proxy","dns_logs","ids_signature","threat_intel_feed","cloud_audit","vpn_logs","cert_authority"]

def stable_hash(value: str, length: int = 8) -> str:
    return hashlib.sha256(value.lower().encode()).hexdigest()[:length]
