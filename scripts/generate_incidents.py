"""
Incident & alert generator — 9 realistic SOC scenarios.
Deterministic — same seed = same data every time.

Produces: alerts, incidents, playbook_runs, playbook_definitions, detection_rules
"""
import random
from datetime import timedelta
from _data import (
    USERS, ASSETS, MALICIOUS_DOMAINS, MALICIOUS_IPS, BENIGN_IPS,
    MITRE_TECHNIQUES, BASE_TIME,
)
from pseudonymize import make_alert_id, make_incident_id, make_run_id


class IncidentGenerator:
    def __init__(self):
        self.alerts: list[dict] = []
        self.incidents: list[dict] = []
        self.playbook_runs: list[dict] = []
        self.playbook_definitions: list[dict] = []
        self.detection_rules: list[dict] = []

    # ── helpers ──────────────────────────────────────────────
    def _ts(self, base, offset_minutes=0):
        return (base + timedelta(minutes=offset_minutes)).isoformat()

    def _user(self, idx):
        return USERS[idx]

    def _asset(self, user_id):
        for a in ASSETS:
            if a["owner_user_id"] == user_id:
                return a
        return ASSETS[0]

    # ── Scenario 1: Phishing → Credential Theft → Mailbox Rule ─
    def scenario_1(self):
        """Oltalama → kimlik bilgisi hırsızlığı → imkansız seyahat → posta kutusu kuralı"""
        inc_id = make_incident_id(1)
        user = self._user(0)  # Ayşe Demir — Finans
        asset = self._asset(user["user_id"])
        start = BASE_TIME + timedelta(days=1)
        alerts = []

        alerts.append({
            "alert_id": make_alert_id(inc_id, 1),
            "incident_id": inc_id,
            "title": "Oltalama Bağlantısına Tıklandı",
            "description": f"{user['display_name']} oltalama e-postasındaki bağlantıya tıkladı ve kimlik bilgilerini zararlı sayfaya girdi. E-posta {MALICIOUS_DOMAINS[0]} domain'inden geldi.",
            "severity": "high",
            "confidence": 85,
            "source": "email_gateway",
            "status": "acknowledged",
            "affected_user_id": user["user_id"],
            "affected_asset_id": asset["asset_id"],
            "source_ip": BENIGN_IPS[0],
            "mitre_technique_ids": ["T1566.002"],
            "evidence_event_ids": [],
            "evidence_summary": f"E-posta {MALICIOUS_DOMAINS[0]} adresinden teslim edildi. Kullanıcı bağlantıya tıkladı ve form doldurdu.",
            "recommended_actions": ["Kullanıcı parolasını sıfırla", "Oturumları sonlandır", "Alan adını engelle"],
            "playbook_run_id": None,
            "detected_at": self._ts(start, 10),
            "resolved_at": None,
        })

        alerts.append({
            "alert_id": make_alert_id(inc_id, 2),
            "incident_id": inc_id,
            "title": "İmkansız Seyahat Tespit Edildi",
            "description": f"{user['display_name']} hesabına 5 dakika içinde İstanbul ve Romanya'dan giriş yapıldı. Coğrafi olarak imkansız.",
            "severity": "high",
            "confidence": 90,
            "source": "idp_auth",
            "status": "acknowledged",
            "affected_user_id": user["user_id"],
            "affected_asset_id": None,
            "source_ip": MALICIOUS_IPS[0],
            "mitre_technique_ids": ["T1078"],
            "evidence_event_ids": [],
            "evidence_summary": f"İstanbul'dan giriş: {self._ts(start, 55)}. Romanya IP ({MALICIOUS_IPS[0]})'den giriş: {self._ts(start, 60)}.",
            "recommended_actions": ["Kullanıcıyla doğrula", "VPN kullanımını kontrol et", "Hesap ele geçirmeyi değerlendir"],
            "playbook_run_id": None,
            "detected_at": self._ts(start, 65),
            "resolved_at": None,
        })

        alerts.append({
            "alert_id": make_alert_id(inc_id, 3),
            "incident_id": inc_id,
            "title": "Şüpheli Posta Kutusu Yönlendirme Kuralı",
            "description": f"{user['display_name']} posta kutusunda tüm e-postaları harici adrese yönlendiren kural oluşturuldu. Veri sızdırma göstergesi.",
            "severity": "critical",
            "confidence": 95,
            "source": "m365_audit",
            "status": "new",
            "affected_user_id": user["user_id"],
            "affected_asset_id": None,
            "source_ip": MALICIOUS_IPS[0],
            "mitre_technique_ids": ["T1098", "T1114.002"],
            "evidence_event_ids": [],
            "evidence_summary": f"Posta kutusu kuralı oluşturuldu. Yönlendirme adresi: saldırgan-kontrol@harici.example.tr. Kural oluşturma zamanı: {self._ts(start, 90)}.",
            "recommended_actions": ["Kuralı kaldır", "Gönderilen e-postaları denetle", "Kullanıcıyı bilgilendir"],
            "playbook_run_id": None,
            "detected_at": self._ts(start, 95),
            "resolved_at": None,
        })

        kill_chain = [
            {"step_id": f"{inc_id}-k1", "tactic": "Initial Access",     "technique_id": "T1566.002", "description": "Oltalama e-postası teslim edildi ve kullanıcı bağlantıya tıkladı", "alert_id": alerts[0]["alert_id"], "timestamp": self._ts(start, 5),  "status": "completed"},
            {"step_id": f"{inc_id}-k2", "tactic": "Credential Access",  "technique_id": "T1078",     "description": "Çalınan kimlik bilgileriyle imkansız seyahat girişi",             "alert_id": alerts[1]["alert_id"], "timestamp": self._ts(start, 60), "status": "completed"},
            {"step_id": f"{inc_id}-k3", "tactic": "Persistence",        "technique_id": "T1098",     "description": "Posta kutusu yönlendirme kuralı ile kalıcılık sağlandı",          "alert_id": alerts[2]["alert_id"], "timestamp": self._ts(start, 90), "status": "completed"},
            {"step_id": f"{inc_id}-k4", "tactic": "Collection",         "technique_id": "T1114.002", "description": "E-postalar harici adrese yönlendiriliyor",                      "alert_id": alerts[2]["alert_id"], "timestamp": self._ts(start, 90), "status": "pending"},
        ]

        incident = {
            "incident_id": inc_id,
            "title": "Oltalama Kaynaklı Hesap Ele Geçirme",
            "severity": "critical",
            "status": "investigating",
            "summary": "Kullanıcı oltalama e-postası aldı, zararlı bağlantıya tıkladı ve kimlik bilgilerini girdi. Saldırgan yabancı IP'den giriş yaparak posta kutusu yönlendirme kuralı oluşturdu.",
            "narrative": (
                f"10 Mayıs 2026 sabahı, {user['display_name']} ({user['department']} departmanı) "
                f"gelen kutusunda 'Acil: Hesap Doğrulama Gerekli' konulu bir e-posta buldu. "
                f"E-posta, kurumsal BT departmanından geliyormuş gibi görünüyordu ve "
                f"{MALICIOUS_DOMAINS[0]} adresine yönlendiren bir bağlantı içeriyordu.\n\n"
                f"Kullanıcı bağlantıya tıkladı ve Office 365 giriş sayfasının birebir kopyasına "
                f"kimlik bilgilerini girdi. 55 dakika sonra saldırgan, Romanya merkezli bir IP'den "
                f"({MALICIOUS_IPS[0]}) hesaba erişti ve otomatik yönlendirme kuralı oluşturdu.\n\n"
                f"Olay, SIEM'deki imkansız seyahat kuralı sayesinde tespit edildi. "
                f"Hesap derhal kilitlendi, oturumlar sonlandırıldı ve posta kutusu kuralları temizlendi. "
                f"Kullanıcıya güvenlik farkındalık eğitimi verildi."
            ),
            "assignee": "Emre Korkmaz",
            "affected_user_ids": [user["user_id"]],
            "affected_asset_ids": [asset["asset_id"]],
            "mitre_technique_ids": ["T1566.002", "T1078", "T1098", "T1114.002"],
            "kill_chain_steps": kill_chain,
            "alert_ids": [a["alert_id"] for a in alerts],
            "playbook_run_ids": [],
            "created_at": self._ts(start),
            "updated_at": self._ts(start, 180),
            "resolved_at": None,
        }

        self.alerts.extend(alerts)
        self.incidents.append(incident)

    # ── Scenario 2: OAuth Consent Phishing ───────────────────
    def scenario_2(self):
        inc_id = make_incident_id(2)
        user = self._user(1)  # Mehmet Kaya — BT Sistem Yöneticisi
        asset = self._asset(user["user_id"])
        start = BASE_TIME + timedelta(days=2)

        alerts = [
            {"alert_id": make_alert_id(inc_id, 1), "incident_id": inc_id,
             "title": "Şüpheli OAuth Uygulama İzni",
             "description": f"{user['display_name']} bilinmeyen 'MailSyncPro' uygulamasına OAuth izni verdi. Uygulama posta kutusu okuma/yazma yetkisi istedi.",
             "severity": "high", "confidence": 70, "source": "idp_auth", "status": "acknowledged",
             "affected_user_id": user["user_id"], "affected_asset_id": asset["asset_id"],
             "source_ip": BENIGN_IPS[0], "mitre_technique_ids": ["T1528"],
             "evidence_event_ids": [], "evidence_summary": f"OAuth konsantı: MailSyncPro. İstenen izinler: Mail.ReadWrite, User.Read,offline_access.",
             "recommended_actions": ["Uygulama iznini iptal et", "Uygulama izinlerini gözden geçir", "Kullanıcıyı bilgilendir"],
             "playbook_run_id": None, "detected_at": self._ts(start, 15), "resolved_at": None,
            },
            {"alert_id": make_alert_id(inc_id, 2), "incident_id": inc_id,
             "title": "OAuth ile Toplu Posta Kutusu Erişimi",
             "description": f"OAuth token aracılığıyla {user['display_name']} posta kutusuna 15 dakikada 200+ okuma isteği yapıldı.",
             "severity": "high", "confidence": 85, "source": "m365_audit", "status": "new",
             "affected_user_id": user["user_id"], "affected_asset_id": None,
             "source_ip": MALICIOUS_IPS[1], "mitre_technique_ids": ["T1114.002"],
             "evidence_event_ids": [], "evidence_summary": f"Kaynak IP: {MALICIOUS_IPS[1]} (Rusya). 12 okuma isteği batch halinde tespit edildi.",
             "recommended_actions": ["OAuth tokenları iptal et", "Erişilen e-postaları denetle", "Uygulamayı engelle"],
             "playbook_run_id": None, "detected_at": self._ts(start, 120), "resolved_at": None,
            },
        ]

        kill_chain = [
            {"step_id": f"{inc_id}-k1", "tactic": "Initial Access", "technique_id": "T1566.002", "description": "OAuth onay isteği e-postası alındı", "alert_id": alerts[0]["alert_id"], "timestamp": self._ts(start), "status": "completed"},
            {"step_id": f"{inc_id}-k2", "tactic": "Credential Access", "technique_id": "T1528", "description": "Kullanıcı zararlı uygulamaya izin verdi", "alert_id": alerts[0]["alert_id"], "timestamp": self._ts(start, 10), "status": "completed"},
            {"step_id": f"{inc_id}-k3", "tactic": "Collection", "technique_id": "T1114.002", "description": "OAuth token ile toplu e-posta erişimi", "alert_id": alerts[1]["alert_id"], "timestamp": self._ts(start, 60), "status": "completed"},
        ]

        incident = {
            "incident_id": inc_id,
            "title": "OAuth Onay Oltalaması - Token Kötüye Kullanımı",
            "severity": "high", "status": "contained",
            "summary": "Kullanıcı zararlı OAuth uygulamasına izin verdi. Saldırgan tokeni kullanarak posta kutusuna erişti ve e-postaları dışarı aktardı.",
            "narrative": (
                f"11 Mayıs 2026'da {user['display_name']}, 'MailSyncPro — E-posta Yedekleme Aracı' "
                f"adlı bir uygulamanın OAuth onay isteğini kabul etti. Uygulama, kurumsal bir "
                f"çözüm gibi görünüyordu ancak Rusya merkezli bir tehdit aktörü tarafından "
                f"kontrol ediliyordu.\n\n"
                f"Onaydan sonra saldırgan, OAuth token'ı kullanarak kullanıcının posta kutusundaki "
                f"tüm e-postaları programatik olarak okudu. Toplamda 200'den fazla e-posta dışarı "
                f"sızdırıldı. Olay, anormal API çağrı hacmi sayesinde tespit edildi.\n\n"
                f"Uygulama izni iptal edildi, OAuth token'ları geçersiz kılındı ve tenant genelinde "
                f"OAuth onay politikaları sıkılaştırıldı."
            ),
            "assignee": "Emre Korkmaz",
            "affected_user_ids": [user["user_id"]],
            "affected_asset_ids": [asset["asset_id"]],
            "mitre_technique_ids": ["T1566.002", "T1528", "T1114.002"],
            "kill_chain_steps": kill_chain,
            "alert_ids": [a["alert_id"] for a in alerts],
            "playbook_run_ids": [],
            "created_at": self._ts(start),
            "updated_at": self._ts(start, 240),
            "resolved_at": None,
        }

        self.alerts.extend(alerts)
        self.incidents.append(incident)

    # ── Scenario 3: MFA Fatigue ──────────────────────────────
    def scenario_3(self):
        inc_id = make_incident_id(3)
        user = self._user(2)  # Elif Yılmaz — Kıdemli Geliştirici
        asset = self._asset(user["user_id"])
        start = BASE_TIME + timedelta(days=3)

        alerts = [
            {"alert_id": make_alert_id(inc_id, 1), "incident_id": inc_id,
             "title": "MFA Push Bombardımanı Tespit Edildi",
             "description": f"{user['display_name']} hesabına 15 MFA push bildirimi gönderildi. Push bombardıman saldırısı göstergesi.",
             "severity": "critical", "confidence": 92, "source": "idp_auth", "status": "acknowledged",
             "affected_user_id": user["user_id"], "affected_asset_id": None,
             "source_ip": MALICIOUS_IPS[2], "mitre_technique_ids": ["T1556"],
             "evidence_event_ids": [], "evidence_summary": f"30 dakikada {MALICIOUS_IPS[2]} (Çin) kaynaklı 15 MFA push isteği.",
             "recommended_actions": ["Kullanıcıyla hemen iletişime geç", "IP'yi engelle", "Oturumları sonlandır"],
             "playbook_run_id": None, "detected_at": self._ts(start, 30), "resolved_at": None,
            },
            {"alert_id": make_alert_id(inc_id, 2), "incident_id": inc_id,
             "title": "MFA Yorgunluğu Sonrası Yetki Yükseltme",
             "description": "MFA bombardımanından hemen sonra hesaba GlobalAdmin rolü atandı.",
             "severity": "critical", "confidence": 88, "source": "admin_audit", "status": "acknowledged",
             "affected_user_id": user["user_id"], "affected_asset_id": None,
             "source_ip": MALICIOUS_IPS[2], "mitre_technique_ids": ["T1098.001"],
             "evidence_event_ids": [], "evidence_summary": f"{self._ts(start, 40)} tarihinde kullanıcıya GlobalAdmin rolü atandı.",
             "recommended_actions": ["Rolü kaldır", "Admin işlemlerini denetle", "Tam olay incelemesi başlat"],
             "playbook_run_id": None, "detected_at": self._ts(start, 45), "resolved_at": None,
            },
        ]

        kill_chain = [
            {"step_id": f"{inc_id}-k1", "tactic": "Credential Access", "technique_id": "T1556", "description": "15 MFA push bombardımanı", "alert_id": alerts[0]["alert_id"], "timestamp": self._ts(start, 15), "status": "completed"},
            {"step_id": f"{inc_id}-k2", "tactic": "Defense Evasion", "technique_id": "T1078", "description": "MFA onayı alındı, hesaba giriş yapıldı", "alert_id": alerts[0]["alert_id"], "timestamp": self._ts(start, 32), "status": "completed"},
            {"step_id": f"{inc_id}-k3", "tactic": "Persistence", "technique_id": "T1098.001", "description": "GlobalAdmin rolü atandı", "alert_id": alerts[1]["alert_id"], "timestamp": self._ts(start, 40), "status": "completed"},
        ]

        incident = {
            "incident_id": inc_id,
            "title": "MFA Yorgunluk Saldırısı - Oturum Ele Geçirme",
            "severity": "critical", "status": "contained",
            "summary": "Saldırgan kullanıcıyı MFA bildirimleriyle bombardıman etti. Onay alınınca admin portalına erişip yetki yükseltti.",
            "narrative": (
                f"12 Mayıs 2026 akşamı, {user['display_name']} telefonuna art arda MFA onay "
                f"bildirimleri gelmeye başladı. 15. denemede, muhtemelen 'yanlışlıkla' veya "
                f"'bildirimleri susturmak için' onay verdi.\n\n"
                f"Saldırgan, Çin merkezli IP ({MALICIOUS_IPS[2]}) üzerinden hesaba giriş yaptı "
                f"ve 8 dakika içinde hesaba GlobalAdmin rolü atadı.\n\n"
                f"SIEM korelasyon kuralı, MFA push hacmindeki anormalliği tespit etti ve alert üretti. "
                f"Rol ataması geri alındı, tüm oturumlar sonlandırıldı ve MFA politikası gözden geçirildi."
            ),
            "assignee": "Deniz Aydın",
            "affected_user_ids": [user["user_id"]],
            "affected_asset_ids": [asset["asset_id"]],
            "mitre_technique_ids": ["T1556", "T1078", "T1098.001"],
            "kill_chain_steps": kill_chain,
            "alert_ids": [a["alert_id"] for a in alerts],
            "playbook_run_ids": [],
            "created_at": self._ts(start),
            "updated_at": self._ts(start, 60),
            "resolved_at": None,
        }

        self.alerts.extend(alerts)
        self.incidents.append(incident)

    # ── Scenario 4: Password Spray ───────────────────────────
    def scenario_4(self):
        inc_id = make_incident_id(4)
        user = self._user(3)  # Mustafa Arslan — Satış Müdürü
        start = BASE_TIME + timedelta(days=4)

        alerts = [
            {"alert_id": make_alert_id(inc_id, 1), "incident_id": inc_id,
             "title": "Parola Püskürtme Saldırısı",
             "description": f"Tek IP'den ({MALICIOUS_IPS[3]}) 6 farklı hesaba başarısız giriş. Parola püskürtme paterni.",
             "severity": "medium", "confidence": 88, "source": "idp_auth", "status": "acknowledged",
             "affected_user_id": user["user_id"], "affected_asset_id": None,
             "source_ip": MALICIOUS_IPS[3], "mitre_technique_ids": ["T1110.003"],
             "evidence_event_ids": [], "evidence_summary": f"6 hesap, aynı IP ({MALICIOUS_IPS[3]}, Nijerya), 'Password123' denemesi.",
             "recommended_actions": ["Kaynak IP'yi engelle", "Etkilenen kullanıcıların parolalarını sıfırla"],
             "playbook_run_id": None, "detected_at": self._ts(start, 10), "resolved_at": None,
            },
            {"alert_id": make_alert_id(inc_id, 2), "incident_id": inc_id,
             "title": "Posta Kutusu Sızdırma",
             "description": f"Başarılı püskürtme girişinden sonra {user['display_name']} posta kutusundan toplu dışa aktarım.",
             "severity": "high", "confidence": 85, "source": "m365_audit", "status": "acknowledged",
             "affected_user_id": user["user_id"], "affected_asset_id": None,
             "source_ip": MALICIOUS_IPS[3], "mitre_technique_ids": ["T1114.002"],
             "evidence_event_ids": [], "evidence_summary": f"Posta kutusunda 'fatura', 'havale', 'sözleşme' anahtar kelimeleriyle arama. PST dışa aktarımı başlatıldı.",
             "recommended_actions": ["Oturumları sonlandır", "Dışa aktarılan verileri denetle", "Yasal bildirim yap"],
             "playbook_run_id": None, "detected_at": self._ts(start, 50), "resolved_at": None,
            },
        ]

        kill_chain = [
            {"step_id": f"{inc_id}-k1", "tactic": "Credential Access", "technique_id": "T1110.003", "description": "6 hesaba parola püskürtme denemesi", "alert_id": alerts[0]["alert_id"], "timestamp": self._ts(start, 6), "status": "completed"},
            {"step_id": f"{inc_id}-k2", "tactic": "Defense Evasion", "technique_id": "T1078", "description": "Püskürtme başarılı, hesaba giriş yapıldı", "alert_id": alerts[0]["alert_id"], "timestamp": self._ts(start, 15), "status": "completed"},
            {"step_id": f"{inc_id}-k3", "tactic": "Collection", "technique_id": "T1114.002", "description": "Posta kutusu arandı ve dışa aktarıldı", "alert_id": alerts[1]["alert_id"], "timestamp": self._ts(start, 45), "status": "pending"},
        ]

        incident = {
            "incident_id": inc_id,
            "title": "Parola Püskürtme - E-posta Sızdırma",
            "severity": "high", "status": "investigating",
            "summary": "Saldırgan parola püskürtme ile satış müdürünün hesabına erişti ve hassas e-postaları dışarı aktardı.",
            "narrative": (
                f"13 Mayıs 2026 sabahı, Nijerya merkezli bir IP adresinden ({MALICIOUS_IPS[3]}) "
                f"6 farklı kurumsal hesaba 'Password123' ve 'Anadolu2024' gibi yaygın parolalarla "
                f"giriş denemesi yapıldı. {user['display_name']} hesabı başarıyla ele geçirildi.\n\n"
                f"Saldırgan, posta kutusunda 'fatura', 'havale' ve 'sözleşme' anahtar kelimeleriyle "
                f"arama yaptı ve PST formatında toplu dışa aktarım başlattı.\n\n"
                f"Olay, SIEM'deki 'Çoklu Başarısız Giriş + Posta Kutusu Aktivitesi' korelasyon "
                f"kuralıyla tespit edildi. Hesap kilitlendi ve parola politikası gözden geçirildi."
            ),
            "assignee": "Emre Korkmaz",
            "affected_user_ids": [user["user_id"], self._user(0)["user_id"], self._user(4)["user_id"], self._user(5)["user_id"], self._user(6)["user_id"], self._user(7)["user_id"]],
            "affected_asset_ids": [],
            "mitre_technique_ids": ["T1110.003", "T1078", "T1114.002"],
            "kill_chain_steps": kill_chain,
            "alert_ids": [a["alert_id"] for a in alerts],
            "playbook_run_ids": [],
            "created_at": self._ts(start),
            "updated_at": self._ts(start, 120),
            "resolved_at": None,
        }

        self.alerts.extend(alerts)
        self.incidents.append(incident)

    # ── Scenario 5: BEC Attack ───────────────────────────────
    def scenario_5(self):
        inc_id = make_incident_id(5)
        user = self._user(6)  # Fatma Şahin — Muhasebe Müdürü
        start = BASE_TIME + timedelta(days=5)

        alerts = [
            {"alert_id": make_alert_id(inc_id, 1), "incident_id": inc_id,
             "title": "Finans Hesabı Ele Geçirme",
             "description": f"Muhasebe müdürü {user['display_name']} hesabına şüpheli konumdan erişildi.",
             "severity": "critical", "confidence": 93, "source": "idp_auth", "status": "acknowledged",
             "affected_user_id": user["user_id"], "affected_asset_id": None,
             "source_ip": MALICIOUS_IPS[4], "mitre_technique_ids": ["T1078", "T1098"],
             "evidence_event_ids": [], "evidence_summary": f"Brezilya IP ({MALICIOUS_IPS[4]})'den giriş. 'dolandırıcılık' içeren e-postaları silen kural oluşturuldu.",
             "recommended_actions": ["Hemen parola sıfırla", "Posta kutusu kurallarını kaldır", "Finans ekibini uyar"],
             "playbook_run_id": None, "detected_at": self._ts(start, 25), "resolved_at": None,
            },
            {"alert_id": make_alert_id(inc_id, 2), "incident_id": inc_id,
             "title": "İş E-postası Ele Geçirme - Havale Dolandırıcılığı",
             "description": f"Ele geçirilen {user['display_name']} hesabından tedarikçilere sahte havale talebi gönderildi.",
             "severity": "critical", "confidence": 96, "source": "email_gateway", "status": "new",
             "affected_user_id": user["user_id"], "affected_asset_id": None,
             "source_ip": MALICIOUS_IPS[4], "mitre_technique_ids": ["T1114.002"],
             "evidence_event_ids": [], "evidence_summary": "3 tedarikçiye 'hesap numarası değişikliği' konulu e-posta gönderildi. Hedef IBAN: Litvanya bankası.",
             "recommended_actions": ["Alıcılarla iletişime geç", "E-postaları geri çağır", "Yasal bildirim ve savcılığa suç duyurusu"],
             "playbook_run_id": None, "detected_at": self._ts(start, 65), "resolved_at": None,
            },
        ]

        kill_chain = [
            {"step_id": f"{inc_id}-k1", "tactic": "Initial Access", "technique_id": "T1566.002", "description": "Finans temalı oltalama e-postası", "alert_id": alerts[0]["alert_id"], "timestamp": self._ts(start), "status": "completed"},
            {"step_id": f"{inc_id}-k2", "tactic": "Defense Evasion", "technique_id": "T1078", "description": "Brezilya IP'den başarılı giriş", "alert_id": alerts[0]["alert_id"], "timestamp": self._ts(start, 10), "status": "completed"},
            {"step_id": f"{inc_id}-k3", "tactic": "Persistence", "technique_id": "T1098", "description": "Anti-forensic posta kutusu kuralı", "alert_id": alerts[0]["alert_id"], "timestamp": self._ts(start, 20), "status": "completed"},
            {"step_id": f"{inc_id}-k4", "tactic": "Collection", "technique_id": "T1114.002", "description": "Tedarikçilere sahte havale e-postası", "alert_id": alerts[1]["alert_id"], "timestamp": self._ts(start, 60), "status": "completed"},
        ]

        incident = {
            "incident_id": inc_id,
            "title": "İş E-postası Ele Geçirme (BEC) - Havale Dolandırıcılığı",
            "severity": "critical", "status": "investigating",
            "summary": "Muhasebe müdürünün hesabı ele geçirildi. Saldırgan tedarikçilere sahte havale talebi gönderdi.",
            "narrative": (
                f"14 Mayıs 2026'da {user['display_name']}, 'Fatura Ödeme Sistemi Güncellemesi' "
                f"konulu bir e-posta aldı ve {MALICIOUS_DOMAINS[6]} domain'indeki sahte portala "
                f"kimlik bilgilerini girdi.\n\n"
                f"Saldırgan, Brezilya IP'si ({MALICIOUS_IPS[4]}) üzerinden hesaba erişti. "
                f"İlk iş olarak 'dolandırıcılık' ve 'şüpheli' kelimelerini içeren e-postaları "
                f"silen bir kural oluşturdu — böylece güvenlik ekibinin uyarıları kullanıcıya ulaşamayacaktı.\n\n"
                f"Ardından 3 tedarikçiye 'banka hesap numaramız değişti' içerikli sahte e-postalar "
                f"gönderdi. Hedef IBAN Litvanya'daki bir banka hesabıydı. Olay, tedarikçilerden "
                f"birinin telefonla teyit istemesi üzerine ortaya çıktı."
            ),
            "assignee": "Ceren Erdoğan",
            "affected_user_ids": [user["user_id"]],
            "affected_asset_ids": [],
            "mitre_technique_ids": ["T1566.002", "T1078", "T1098", "T1114.002"],
            "kill_chain_steps": kill_chain,
            "alert_ids": [a["alert_id"] for a in alerts],
            "playbook_run_ids": [],
            "created_at": self._ts(start),
            "updated_at": self._ts(start, 300),
            "resolved_at": None,
        }

        self.alerts.extend(alerts)
        self.incidents.append(incident)

    # ── Scenario 6: Malware C2 ───────────────────────────────
    def scenario_6(self):
        inc_id = make_incident_id(6)
        user = self._user(4)  # Zeynep Çelik — İK
        asset = self._asset(user["user_id"])
        start = BASE_TIME + timedelta(days=6)

        alerts = [
            {"alert_id": make_alert_id(inc_id, 1), "incident_id": inc_id,
             "title": "Makro Çalıştırma - Zararlı Yazılım Dağıtımı",
             "description": f"{user['display_name']} cihazında Word makrosu PowerShell çalıştırdı ve payload bıraktı.",
             "severity": "critical", "confidence": 90, "source": "endpoint_edr", "status": "acknowledged",
             "affected_user_id": user["user_id"], "affected_asset_id": asset["asset_id"],
             "source_ip": BENIGN_IPS[0], "mitre_technique_ids": ["T1566.001", "T1059.005"],
             "evidence_event_ids": [], "evidence_summary": f"WINWORD.EXE → powershell.exe → C:\\Users\\{user['user_id']}\\AppData\\Local\\Temp\\guncelleme.exe",
             "recommended_actions": ["Uç noktayı izole et", "Ek hash'ini engelle", "Benzer e-postaları tara"],
             "playbook_run_id": None, "detected_at": self._ts(start, 10), "resolved_at": None,
            },
            {"alert_id": make_alert_id(inc_id, 2), "incident_id": inc_id,
             "title": "Zararlı Yazılım Kalıcılığı Sağlandı",
             "description": "Kayıt defteri Run anahtarı ile oturum başlangıcında çalışacak şekilde kalıcılık sağlandı.",
             "severity": "critical", "confidence": 88, "source": "endpoint_edr", "status": "acknowledged",
             "affected_user_id": user["user_id"], "affected_asset_id": asset["asset_id"],
             "source_ip": None, "mitre_technique_ids": ["T1547.001"],
             "evidence_event_ids": [], "evidence_summary": "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\UpdateService eklendi.",
             "recommended_actions": ["Kalıcılığı kaldır", "Tam zararlı yazılım analizi yap", "Yanal hareketi kontrol et"],
             "playbook_run_id": None, "detected_at": self._ts(start, 12), "resolved_at": None,
            },
            {"alert_id": make_alert_id(inc_id, 3), "incident_id": inc_id,
             "title": "Komuta ve Kontrol (C2) Aktivitesi",
             "description": f"Enfekte cihazdan {MALICIOUS_DOMAINS[9]} adresine periyodik beacon bağlantısı tespit edildi.",
             "severity": "critical", "confidence": 94, "source": "endpoint_edr", "status": "new",
             "affected_user_id": user["user_id"], "affected_asset_id": asset["asset_id"],
             "source_ip": MALICIOUS_IPS[5], "mitre_technique_ids": ["T1071.001"],
             "evidence_event_ids": [], "evidence_summary": f"10 dakikada bir {MALICIOUS_DOMAINS[9]} adresine HTTPS beacon. User-Agent anomalisi mevcut.",
             "recommended_actions": ["C2 alan adını engelle", "Uç noktayı izole et", "Ağ adli bilişimi başlat"],
             "playbook_run_id": None, "detected_at": self._ts(start, 60), "resolved_at": None,
            },
        ]

        kill_chain = [
            {"step_id": f"{inc_id}-k1", "tactic": "Initial Access", "technique_id": "T1566.001", "description": "Zararlı ek içeren e-posta teslim edildi", "alert_id": alerts[0]["alert_id"], "timestamp": self._ts(start), "status": "completed"},
            {"step_id": f"{inc_id}-k2", "tactic": "Execution", "technique_id": "T1059.005", "description": "VBA makro PowerShell çalıştırdı", "alert_id": alerts[0]["alert_id"], "timestamp": self._ts(start, 6), "status": "completed"},
            {"step_id": f"{inc_id}-k3", "tactic": "Persistence", "technique_id": "T1547.001", "description": "Registry Run key kalıcılığı", "alert_id": alerts[1]["alert_id"], "timestamp": self._ts(start, 8), "status": "completed"},
            {"step_id": f"{inc_id}-k4", "tactic": "Command and Control", "technique_id": "T1071.001", "description": "C2 beacon iletişimi", "alert_id": alerts[2]["alert_id"], "timestamp": self._ts(start, 15), "status": "pending"},
        ]

        incident = {
            "incident_id": inc_id,
            "title": "Zararlı Yazılım Enfeksiyonu - C2 İletişimi (Simülasyon)",
            "severity": "critical", "status": "investigating",
            "summary": "Kullanıcı VBA makro içeren zararlı eki açtı. Zararlı yazılım kalıcılık sağladı ve C2 iletişimi başlattı.",
            "narrative": (
                f"15 Mayıs 2026'da {user['display_name']}, 'İş Başvurusu - CV ve Referans Mektubu' "
                f"konulu bir e-postadaki .docm ekini açtı. Belge, kullanıcıya 'içeriği görüntülemek "
                f"için makroları etkinleştirin' mesajını gösteriyordu.\n\n"
                f"Makro etkinleştirildiğinde, WINWORD.EXE process'i PowerShell başlattı ve Temp "
                f"klasörüne 'guncelleme.exe' adlı bir payload bıraktı. Bu payload, Registry Run "
                f"anahtarına kendini ekleyerek kalıcılık sağladı ve {MALICIOUS_DOMAINS[9]} "
                f"adresine her 10 dakikada bir HTTPS beacon göndermeye başladı.\n\n"
                f"EDR çözümü, Word'den PowerShell spawn edilmesini tespit ederek SOC ekibini "
                f"uyardı. Uç nokta izole edildi ve adli bilişim süreci başlatıldı."
            ),
            "assignee": "Deniz Aydın",
            "affected_user_ids": [user["user_id"]],
            "affected_asset_ids": [asset["asset_id"]],
            "mitre_technique_ids": ["T1566.001", "T1059.005", "T1547.001", "T1071.001"],
            "kill_chain_steps": kill_chain,
            "alert_ids": [a["alert_id"] for a in alerts],
            "playbook_run_ids": [],
            "created_at": self._ts(start),
            "updated_at": self._ts(start, 180),
            "resolved_at": None,
        }

        self.alerts.extend(alerts)
        self.incidents.append(incident)

    # ── Scenario 7: New Device Anomaly ───────────────────────
    def scenario_7(self):
        inc_id = make_incident_id(7)
        user = self._user(7)  # Ahmet Yıldız — CFO
        start = BASE_TIME + timedelta(days=7)

        alerts = [
            {"alert_id": make_alert_id(inc_id, 1), "incident_id": inc_id,
             "title": "Yeni Cihazdan Riskli Giriş",
             "description": f"CFO {user['display_name']} hesabına Nijerya'dan yeni bir cihazla giriş yapıldı.",
             "severity": "high", "confidence": 75, "source": "idp_auth", "status": "acknowledged",
             "affected_user_id": user["user_id"], "affected_asset_id": "AST-022",  # IZM-WS-001
             "source_ip": MALICIOUS_IPS[3], "mitre_technique_ids": ["T1078.004"],
             "evidence_event_ids": [], "evidence_summary": f"Yeni cihaz: IZM-WS-001. Kayıt zamanı: {self._ts(start)}. IP: {MALICIOUS_IPS[3]} (Nijerya).",
             "recommended_actions": ["Kullanıcıyla doğrula", "Cihazı incele", "Engellemeyi değerlendir"],
             "playbook_run_id": None, "detected_at": self._ts(start, 10), "resolved_at": None,
            },
            {"alert_id": make_alert_id(inc_id, 2), "incident_id": inc_id,
             "title": "Şüpheli Admin Rol Atama",
             "description": "Riskli girişten 10 dakika sonra hesaba Exchange Administrator rolü atandı.",
             "severity": "high", "confidence": 82, "source": "admin_audit", "status": "acknowledged",
             "affected_user_id": user["user_id"], "affected_asset_id": None,
             "source_ip": MALICIOUS_IPS[3], "mitre_technique_ids": ["T1098.001"],
             "evidence_event_ids": [], "evidence_summary": "Exchange Administrator rolü atandı. Ardından mailbox permission değişikliği denemesi.",
             "recommended_actions": ["Rolü kaldır", "Son admin işlemlerini denetle", "Yetkilendirmeyi doğrula"],
             "playbook_run_id": None, "detected_at": self._ts(start, 20), "resolved_at": None,
            },
        ]

        kill_chain = [
            {"step_id": f"{inc_id}-k1", "tactic": "Defense Evasion", "technique_id": "T1078.004", "description": "Bilinmeyen cihazdan CFO hesabına giriş", "alert_id": alerts[0]["alert_id"], "timestamp": self._ts(start, 5), "status": "completed"},
            {"step_id": f"{inc_id}-k2", "tactic": "Persistence", "technique_id": "T1098.001", "description": "Exchange Administrator rolü atandı", "alert_id": alerts[1]["alert_id"], "timestamp": self._ts(start, 15), "status": "completed"},
        ]

        incident = {
            "incident_id": inc_id,
            "title": "Yeni Cihaz Anomalisi - Admin Rol Atama",
            "severity": "high", "status": "contained",
            "summary": "CFO hesabına Nijerya'da yeni bir cihaz kaydedildi ve admin rolü atandı.",
            "narrative": (
                f"16 Mayıs 2026'da, CFO {user['display_name']} hesabına İzmir ofisinde "
                f"kayıtlı görünen ancak daha önce hiç kullanılmamış bir cihazla (IZM-WS-001) "
                f"giriş yapıldı. Giriş IP'si Nijerya ({MALICIOUS_IPS[3]}) olarak görünüyordu.\n\n"
                f"Girişten 10 dakika sonra hesaba Exchange Administrator rolü atandı ve "
                f"diğer yöneticilerin posta kutularına erişim denemesi yapıldı.\n\n"
                f"SIEM'deki 'VIP Kullanıcı Anomalisi' kuralı olayı tespit etti. CFO ile "
                f"telefonda doğrulama yapıldı ve kendisinin böyle bir giriş yapmadığı "
                f"teyit edildi. Rol geri alındı, oturum sonlandırıldı."
            ),
            "assignee": "Ceren Erdoğan",
            "affected_user_ids": [user["user_id"]],
            "affected_asset_ids": ["AST-022"],
            "mitre_technique_ids": ["T1078.004", "T1098.001"],
            "kill_chain_steps": kill_chain,
            "alert_ids": [a["alert_id"] for a in alerts],
            "playbook_run_ids": [],
            "created_at": self._ts(start),
            "updated_at": self._ts(start, 60),
            "resolved_at": None,
        }

        self.alerts.extend(alerts)
        self.incidents.append(incident)

    # ── Scenario 8: Data Exfil Cloud ─────────────────────────
    def scenario_8(self):
        inc_id = make_incident_id(8)
        user = self._user(10)  # Deniz Aydın — DevOps
        asset = self._asset(user["user_id"])
        start = BASE_TIME + timedelta(days=8)

        alerts = [
            {"alert_id": make_alert_id(inc_id, 1), "incident_id": inc_id,
             "title": "Toplu Harici Dosya Paylaşımı",
             "description": f"{user['display_name']} kısa sürede 5 hassas dosya için herkese açık paylaşım bağlantısı oluşturdu.",
             "severity": "high", "confidence": 72, "source": "m365_audit", "status": "acknowledged",
             "affected_user_id": user["user_id"], "affected_asset_id": asset["asset_id"],
             "source_ip": BENIGN_IPS[0], "mitre_technique_ids": ["T1567.002"],
             "evidence_event_ids": [], "evidence_summary": "5 dosya: müşteri-listesi.xlsx, veritabani-backup.sql, kullanici-parolalari.csv, sözleşmeler-2025.zip, maas-bordro.xlsx.",
             "recommended_actions": ["Paylaşılan dosyaları incele", "Bağlantıları iptal et", "Kullanıcıyla doğrula"],
             "playbook_run_id": None, "detected_at": self._ts(start, 55), "resolved_at": None,
            },
            {"alert_id": make_alert_id(inc_id, 2), "incident_id": inc_id,
             "title": "Paylaşılan Dosyalara Harici Erişim",
             "description": "Herkese açık paylaşılan dosyalara Hollanda IP'sinden erişildi.",
             "severity": "high", "confidence": 78, "source": "m365_audit", "status": "new",
             "affected_user_id": user["user_id"], "affected_asset_id": None,
             "source_ip": "192.0.2.100", "mitre_technique_ids": ["T1567.002"],
             "evidence_event_ids": [], "evidence_summary": f"IP: 192.0.2.100 (Hollanda). 3 dosya indirildi: müşteri-listesi.xlsx, veritabani-backup.sql, kullanici-parolalari.csv.",
             "recommended_actions": ["Paylaşımı devre dışı bırak", "Dosya içeriklerini denetle", "DLP incelemesi başlat"],
             "playbook_run_id": None, "detected_at": self._ts(start, 65), "resolved_at": None,
            },
        ]

        incident = {
            "incident_id": inc_id,
            "title": "Bulut Paylaşımı ile Veri Sızdırma",
            "severity": "high", "status": "investigating",
            "summary": "DevOps mühendisi hassas dosyalar için herkese açık paylaşım bağlantıları oluşturdu. Dosyalara harici IP'den erişildi.",
            "narrative": (
                f"17 Mayıs 2026'da {user['display_name']}, OneDrive üzerinde 5 hassas dosya "
                f"için 'herkes erişebilir' bağlantıları oluşturdu. Paylaşılan dosyalar arasında "
                f"müşteri listesi, veritabanı yedeği, kullanıcı parolaları CSV'si, sözleşmeler "
                f"ve maaş bordro dosyası bulunuyordu.\n\n"
                f"Kısa süre sonra Hollanda merkezli bir IP'den bu dosyalara erişildi ve "
                f"3 tanesi indirildi. Olay, DLP alarmı ile tespit edildi.\n\n"
                f"Yapılan incelemede kullanıcının departman içi paylaşım yaparken yanlışlıkla "
                f"'herkes' seçeneğini işaretlediği anlaşıldı. Paylaşım bağlantıları iptal edildi "
                f"ve DLP politikaları gözden geçirildi."
            ),
            "assignee": "Ceren Erdoğan",
            "affected_user_ids": [user["user_id"]],
            "affected_asset_ids": [asset["asset_id"]],
            "mitre_technique_ids": ["T1567.002"],
            "kill_chain_steps": [
                {"step_id": f"{inc_id}-k1", "tactic": "Exfiltration", "technique_id": "T1567.002", "description": "Hassas dosyalar herkese açık paylaşıldı", "alert_id": alerts[0]["alert_id"], "timestamp": self._ts(start, 50), "status": "completed"},
                {"step_id": f"{inc_id}-k2", "tactic": "Exfiltration", "technique_id": "T1567.002", "description": "Harici IP'den dosya indirildi", "alert_id": alerts[1]["alert_id"], "timestamp": self._ts(start, 60), "status": "completed"},
            ],
            "alert_ids": [a["alert_id"] for a in alerts],
            "playbook_run_ids": [],
            "created_at": self._ts(start),
            "updated_at": self._ts(start, 120),
            "resolved_at": None,
        }

        self.alerts.extend(alerts)
        self.incidents.append(incident)

    # ── Scenario 9: False Positive VPN ───────────────────────
    def scenario_9(self):
        inc_id = make_incident_id(9)
        user = self._user(11)  # Burak Polat — Bölge Müdürü
        asset = self._asset(user["user_id"])
        start = BASE_TIME + timedelta(days=9)

        alerts = [
            {"alert_id": make_alert_id(inc_id, 1), "incident_id": inc_id,
             "title": "İmkansız Seyahat (VPN - Yanlış Pozitif)",
             "description": f"{user['display_name']} hesabına 5 dakika içinde İstanbul ve Amsterdam'dan giriş yapıldı. VPN kullanımı doğrulandı.",
             "severity": "low", "confidence": 30, "source": "idp_auth", "status": "resolved",
             "affected_user_id": user["user_id"], "affected_asset_id": asset["asset_id"],
             "source_ip": "192.0.2.100", "mitre_technique_ids": ["T1078"],
             "evidence_event_ids": [], "evidence_summary": "Giriş 1: İstanbul (10.10.1.50). Giriş 2: Amsterdam VPN (192.0.2.100). VPN çıkış noktası bilinen listede.",
             "recommended_actions": ["VPN kullanımını doğrula", "Bilinen VPN çıkış noktalarını beyaz listeye ekle"],
             "playbook_run_id": None, "detected_at": self._ts(start, 10), "resolved_at": self._ts(start, 15),
            },
        ]

        incident = {
            "incident_id": inc_id,
            "title": "Yanlış Pozitif - VPN İmkansız Seyahat",
            "severity": "low", "status": "closed",
            "summary": "Kullanıcının VPN kullanımı nedeniyle imkansız seyahat uyarısı tetiklendi. İnceleme sonrası yanlış pozitif olarak belirlendi.",
            "narrative": (
                f"18 Mayıs 2026'da {user['display_name']} için imkansız seyahat alarmı "
                f"tetiklendi. Kullanıcı 5 dakika içinde İstanbul ve Amsterdam'dan giriş "
                f"yapmış görünüyordu.\n\n"
                f"İncelemede Amsterdam IP'sinin (192.0.2.100) bilinen bir kurumsal VPN "
                f"çıkış noktası olduğu tespit edildi. Kullanıcı VPN bağlantısı üzerinden "
                f"çalışıyordu ve coğrafi uyumsuzluk normaldi.\n\n"
                f"Alert false positive olarak kapatıldı. VPN çıkış IP'leri SIEM whitelist'ine "
                f"eklendi ve benzer false positive'lerin önüne geçildi."
            ),
            "assignee": "Emre Korkmaz",
            "affected_user_ids": [user["user_id"]],
            "affected_asset_ids": [asset["asset_id"]],
            "mitre_technique_ids": ["T1078"],
            "kill_chain_steps": [],
            "alert_ids": [a["alert_id"] for a in alerts],
            "playbook_run_ids": [],
            "created_at": self._ts(start),
            "updated_at": self._ts(start, 30),
            "resolved_at": self._ts(start, 30),
        }

        self.alerts.extend(alerts)
        self.incidents.append(incident)

    # ── Playbook definitions & runs ──────────────────────────
    def generate_playbooks(self):
        definitions = [
            {"playbook_id": "PB-PHISHING-01", "name": "Oltalama Yanıt", "category": "phishing",
             "description": "Oltalama e-postası tespitinde çalışan otomatik yanıt playbook'u",
             "triggers": ["alert.severity >= high AND alert.mitre_technique_ids includes T1566"],
             "requires_approval": False, "estimated_duration_seconds": 120,
             "steps": [
                 {"step_id": "s1", "order": 1, "type": "enrich", "name": "Gönderici Repütasyon Kontrolü", "description": "Email sender domain ve IP'sini threat intel'de sorgula", "is_automated": True},
                 {"step_id": "s2", "order": 2, "type": "action", "name": "E-postayı Karantinaya Al", "description": "Aynı sender'dan gelen tüm e-postaları karantinaya taşı", "is_automated": True},
                 {"step_id": "s3", "order": 3, "type": "action", "name": "Parola Sıfırla", "description": "Etkilenen kullanıcının parolasını zorunlu sıfırla", "is_automated": True},
                 {"step_id": "s4", "order": 4, "type": "notify", "name": "Kullanıcıyı Bilgilendir", "description": "Kullanıcıya güvenlik farkındalık e-postası gönder", "is_automated": True},
                 {"step_id": "s5", "order": 5, "type": "approval", "name": "Kapatma Onayı", "description": "SOC analisti vakayı inceler ve kapatır", "is_automated": False},
             ]},
            {"playbook_id": "PB-ACCOUNT-01", "name": "Hesap Ele Geçirme Yanıtı", "category": "account_compromise",
             "description": "Hesap ele geçirme şüphesinde çalışan müdahale playbook'u",
             "triggers": ["alert.severity >= high AND alert.mitre_technique_ids includes T1078"],
             "requires_approval": False, "estimated_duration_seconds": 180,
             "steps": [
                 {"step_id": "s1", "order": 1, "type": "action", "name": "Oturumları Sonlandır", "description": "Kullanıcının tüm aktif oturumlarını sonlandır", "is_automated": True},
                 {"step_id": "s2", "order": 2, "type": "action", "name": "Parola Sıfırla ve MFA Zorla", "description": "Parolayı sıfırla, MFA'yı yeniden kaydettir", "is_automated": True},
                 {"step_id": "s3", "order": 3, "type": "hunt", "name": "Yanal Hareket Kontrolü", "description": "Aynı IP'den diğer hesaplara erişim denemesi var mı kontrol et", "is_automated": True},
                 {"step_id": "s4", "order": 4, "type": "decision", "name": "İzolasyon Kararı", "description": "Risk skoruna göre kullanıcı cihazını izole et", "is_automated": False},
             ]},
            {"playbook_id": "PB-MALWARE-01", "name": "Zararlı Yazılım İzolasyonu", "category": "malware",
             "description": "Zararlı yazılım tespitinde uç nokta izolasyon ve adli bilişim",
             "triggers": ["alert.source == endpoint_edr AND alert.severity >= high"],
             "requires_approval": True, "estimated_duration_seconds": 300,
             "steps": [
                 {"step_id": "s1", "order": 1, "type": "action", "name": "Uç Noktayı İzole Et", "description": "Cihazı ağdan izole et, sadece SOC VLAN'ına izin ver", "is_automated": True},
                 {"step_id": "s2", "order": 2, "type": "action", "name": "Adli Bilişim Topla", "description": "Memory dump, process list, network connections, autoruns", "is_automated": True},
                 {"step_id": "s3", "order": 3, "type": "action", "name": "IOC'leri Engelle", "description": "Dosya hash'lerini ve C2 domain'lerini tüm ortamda engelle", "is_automated": False},
                 {"step_id": "s4", "order": 4, "type": "hunt", "name": "Benzer Cihazları Tara", "description": "Aynı IOC'leri diğer endpoint'lerde threat hunt", "is_automated": True},
             ]},
            {"playbook_id": "PB-EXFIL-01", "name": "Veri Sızdırma Yanıtı", "category": "data_exfiltration",
             "description": "Veri sızdırma şüphesinde DLP yanıt playbook'u",
             "triggers": ["alert.mitre_technique_ids includes T1567 OR alert.mitre_technique_ids includes T1114"],
             "requires_approval": False, "estimated_duration_seconds": 150,
             "steps": [
                 {"step_id": "s1", "order": 1, "type": "action", "name": "Paylaşımı İptal Et", "description": "Harici paylaşım bağlantılarını ve yönlendirme kurallarını kaldır", "is_automated": True},
                 {"step_id": "s2", "order": 2, "type": "enrich", "name": "Erişim Denetimi", "description": "Hangi dosyalara/maillere erişildi, ne kadar veri sızdı", "is_automated": True},
                 {"step_id": "s3", "order": 3, "type": "notify", "name": "Yasal Bildirim", "description": "Veri koruma görevlisine ve hukuka bildirim hazırla", "is_automated": False},
             ]},
        ]

        self.playbook_definitions = definitions

        # Generate runs for each incident
        for i, inc in enumerate(self.incidents):
            pb = definitions[i % len(definitions)]
            start = BASE_TIME + timedelta(days=9 + i, hours=random.randint(0, 12))
            dur = random.randint(60, 300)
            status = "completed" if i != 0 and i != 3 else "completed"  # all completed for now for simplicity

            step_results = []
            for step in pb["steps"]:
                step_results.append({
                    "step_id": step["step_id"],
                    "status": "completed",
                    "started_at": start.isoformat(),
                    "finished_at": (start + timedelta(seconds=random.randint(10, 60))).isoformat(),
                    "output": f"{step['name']} başarıyla tamamlandı",
                })

            run = {
                "run_id": make_run_id(i + 1),
                "playbook_id": pb["playbook_id"],
                "incident_id": inc["incident_id"],
                "status": status,
                "step_results": step_results,
                "started_at": start.isoformat(),
                "finished_at": (start + timedelta(seconds=dur)).isoformat(),
                "duration_seconds": dur,
                "notes": f"Otomatik {pb['name']} çalıştırıldı." if i != 0 else f"{pb['name']} — kullanıcıya eğitim verildi.",
                "triggered_by": "auto" if i % 2 == 0 else "Emre Korkmaz",
            }
            self.playbook_runs.append(run)

            # Link run to incident
            inc["playbook_run_ids"].append(run["run_id"])

            # Link run to first alert (or all)
            if inc["alert_ids"]:
                for aid in inc["alert_ids"]:
                    for a in self.alerts:
                        if a["alert_id"] == aid:
                            a["playbook_run_id"] = run["run_id"]
                            break

    # ── Detection rules ──────────────────────────────────────
    def generate_detection_rules(self):
        rules = [
            {"rule_id": "RULE-MAILBOX-FWD", "name": "Harici Posta Kutusu Yönlendirme Kuralı",
             "description": "Kullanıcı posta kutusunda harici adrese yönlendirme kuralı oluşturulduğunda tetiklenir.",
             "severity": "critical", "source": "m365_audit", "sigma_rule": "title: External Mailbox Forwarding Rule\ndescription: Detects creation of forwarding rules to external domains\nlogsource:\n  product: m365\n  service: audit\ndetection:\n  keywords: ['New-InboxRule', 'ForwardTo', 'external']\n  condition: keywords",
             "mitre_technique_ids": ["T1114.002", "T1098"],
             "enabled": True, "alert_count_14d": 3, "false_positive_rate": 5.0,
             "author": "SOC Team", "created_at": (BASE_TIME - timedelta(days=90)).isoformat(),
             "updated_at": (BASE_TIME - timedelta(days=30)).isoformat(),
             "tags": ["phishing", "exfiltration", "persistence"]},
            {"rule_id": "RULE-IMPOSSIBLE", "name": "İmkansız Seyahat Tespiti",
             "description": "Aynı kullanıcı için fiziksel olarak imkansız coğrafi konumlardan girişleri tespit eder.",
             "severity": "high", "source": "idp_auth", "sigma_rule": "title: Impossible Travel Detection\ndescription: Login from geographically impossible locations\nlogsource:\n  product: azure_ad\n  service: signins\ndetection:\n  selection:\n    - location_distance > 1000km\n    - time_difference < 30min\n  condition: selection",
             "mitre_technique_ids": ["T1078"],
             "enabled": True, "alert_count_14d": 2, "false_positive_rate": 15.0,
             "author": "SOC Team", "created_at": (BASE_TIME - timedelta(days=180)).isoformat(),
             "updated_at": (BASE_TIME - timedelta(days=30)).isoformat(),
             "tags": ["credential_theft", "geo_anomaly"]},
            {"rule_id": "RULE-MFA-BOMBING", "name": "MFA Push Bombardımanı",
             "description": "Kısa sürede çok sayıda MFA push isteği push bombardıman saldırısını gösterir.",
             "severity": "critical", "source": "idp_auth", "sigma_rule": "title: MFA Push Bombing\ndescription: Multiple MFA push requests in short time\ndetection:\n  timeframe: 10m\n  condition: mfa_push_count > 5",
             "mitre_technique_ids": ["T1556"],
             "enabled": True, "alert_count_14d": 1, "false_positive_rate": 2.0,
             "author": "SOC Team", "created_at": (BASE_TIME - timedelta(days=60)).isoformat(),
             "updated_at": (BASE_TIME - timedelta(days=15)).isoformat(),
             "tags": ["mfa", "credential_access"]},
            {"rule_id": "RULE-PW-SPRAY", "name": "Parola Püskürtme Tespiti",
             "description": "Tek IP'den birden fazla hesaba başarısız giriş denemesi parola püskürtme göstergesidir.",
             "severity": "medium", "source": "idp_auth", "sigma_rule": "title: Password Spray Attack\ndetection:\n  selection:\n    - EventID: 4625\n    - distinct_users > 5\n  timeframe: 5m\n  condition: selection",
             "mitre_technique_ids": ["T1110.003"],
             "enabled": True, "alert_count_14d": 2, "false_positive_rate": 10.0,
             "author": "SOC Team", "created_at": (BASE_TIME - timedelta(days=180)).isoformat(),
             "updated_at": (BASE_TIME - timedelta(days=60)).isoformat(),
             "tags": ["brute_force", "credential_access"]},
            {"rule_id": "RULE-OAUTH-RISKY", "name": "Riskli OAuth Uygulama İzni",
             "description": "Yüksek risk skorlu veya bilinmeyen OAuth uygulamalarına verilen izinleri tespit eder.",
             "severity": "high", "source": "idp_auth", "sigma_rule": "title: Risky OAuth Application Consent\ndetection:\n  selection:\n    - app_risk_score >= 70\n    - permissions includes 'Mail.ReadWrite'\n  condition: selection",
             "mitre_technique_ids": ["T1528"],
             "enabled": True, "alert_count_14d": 1, "false_positive_rate": 8.0,
             "author": "SOC Team", "created_at": (BASE_TIME - timedelta(days=30)).isoformat(),
             "updated_at": (BASE_TIME - timedelta(days=30)).isoformat(),
             "tags": ["oauth", "credential_access"]},
            {"rule_id": "RULE-MACRO-EXEC", "name": "Office Makro Çalıştırma Zinciri",
             "description": "Office uygulamasından PowerShell veya cmd.exe spawn edilmesini tespit eder.",
             "severity": "critical", "source": "endpoint_edr", "sigma_rule": "title: Office Macro Spawns Shell\ndetection:\n  selection:\n    parent: ['WINWORD.EXE', 'EXCEL.EXE']\n    process: ['powershell.exe', 'cmd.exe', 'wscript.exe']\n  condition: selection",
             "mitre_technique_ids": ["T1566.001", "T1059.005"],
             "enabled": True, "alert_count_14d": 1, "false_positive_rate": 3.0,
             "author": "SOC Team", "created_at": (BASE_TIME - timedelta(days=180)).isoformat(),
             "updated_at": (BASE_TIME - timedelta(days=90)).isoformat(),
             "tags": ["malware", "macro", "execution"]},
            {"rule_id": "RULE-C2-BEACON", "name": "C2 Beacon İletişimi",
             "description": "Periyodik dış bağlantılar C2 beacon göstergesi olabilir.",
             "severity": "critical", "source": "endpoint_edr", "sigma_rule": "title: C2 Beacon Detection\ndetection:\n  selection:\n    - connection_interval_seconds: 600\n    - destination_port: 443\n  condition: selection",
             "mitre_technique_ids": ["T1071.001"],
             "enabled": True, "alert_count_14d": 1, "false_positive_rate": 5.0,
             "author": "SOC Team", "created_at": (BASE_TIME - timedelta(days=90)).isoformat(),
             "updated_at": (BASE_TIME - timedelta(days=30)).isoformat(),
             "tags": ["c2", "malware", "command_and_control"]},
            {"rule_id": "RULE-SHARING-BULK", "name": "Toplu Dış Paylaşım",
             "description": "Kısa sürede çok sayıda harici dosya paylaşım bağlantısı oluşturulmasını tespit eder.",
             "severity": "high", "source": "m365_audit", "sigma_rule": "title: Bulk External File Sharing\ndetection:\n  timeframe: 30m\n  condition: sharing_link_count > 3 AND sharing_type == 'anonymous'",
             "mitre_technique_ids": ["T1567.002"],
             "enabled": True, "alert_count_14d": 1, "false_positive_rate": 12.0,
             "author": "SOC Team", "created_at": (BASE_TIME - timedelta(days=45)).isoformat(),
             "updated_at": (BASE_TIME - timedelta(days=45)).isoformat(),
             "tags": ["exfiltration", "dlp"]},
        ]
        self.detection_rules = rules

    # ── Orchestrator ─────────────────────────────────────────
    def generate_all(self):
        self.scenario_1()
        self.scenario_2()
        self.scenario_3()
        self.scenario_4()
        self.scenario_5()
        self.scenario_6()
        self.scenario_7()
        self.scenario_8()
        self.scenario_9()
        self.generate_playbooks()
        self.generate_detection_rules()

        # Update playbook_run_ids in incidents
        for inc in self.incidents:
            for aid in inc["alert_ids"]:
                for a in self.alerts:
                    if a["alert_id"] == aid and a["playbook_run_id"]:
                        if a["playbook_run_id"] not in inc["playbook_run_ids"]:
                            inc["playbook_run_ids"].append(a["playbook_run_id"])

        return {
            "alerts": self.alerts,
            "incidents": self.incidents,
            "playbook_definitions": self.playbook_definitions,
            "playbook_runs": self.playbook_runs,
            "detection_rules": self.detection_rules,
        }
