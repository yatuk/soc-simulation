# Incident Senaryoları

Bu dosya, projedeki 9 incident senaryosunu eğitsel açıdan açıklar. Her senaryo gerçek bir attack pattern'e dayanır — sadece veriler kurgusaldır.

---

## İçindekiler

1. ["Pazartesi 14:00" — Phishing → Account Compromise → Mailbox Exfil](#1-pazartesi-1400)
2. ["MailSyncPro" — OAuth Consent Phishing → Token Abuse](#2-mailsyncpro)
3. ["15 Push" — MFA Fatigue → Session Hijacking](#3-15-push)
4. ["Password123" — Password Spray → Email Exfiltration](#4-password123)
5. ["Havale" — BEC → Wire Fraud](#5-havale)
6. ["CV.exe" — Malware Infection → C2 Beaconing](#6-cvexe)
7. ["Yeni Cihaz" — New Device Anomaly → Admin Role](#7-yeni-cihaz)
8. ["Herkese Açık" — Cloud Share → Data Exfil](#8-herkese-açık)
9. ["VPN" — Impossible Travel → False Positive](#9-vpn)

---

## 1. "Pazartesi 14:00"

**Tip:** True Positive  
**Severity:** Critical  
**MITRE:** T1566.002 → T1078 → T1098 → T1114.002  
**Tactics:** Initial Access → Credential Access → Persistence → Collection

### Hikaye

10 Mayıs 2026 sabahı, Finans departmanından Ayşe Demir gelen kutusunda "Acil: Hesap Doğrulama Gerekli" konulu bir e-posta buldu. BT departmanından geliyormuş gibi görünüyordu. Sahte Microsoft 365 giriş sayfasına kimlik bilgilerini girdikten 55 dakika sonra, Romanya merkezli bir IP'den hesabına erişildi.

Saldırgan ilk iş olarak tüm gelen e-postaları harici adrese yönlendiren bir inbox rule oluşturdu — klasik kalıcılık hamlesi.

### Alert Chain

1. **09:00** — Email gateway: `anadolu-giris-dogrula.example.tk` adresinden oltalama e-postası teslim edildi
2. **09:05** — Web proxy: Kullanıcı kimlik avı sayfasına tıkladı
3. **09:07** — Credential submission to phishing page
4. **10:00** — IdP: Romanya IP'sinden (`198.51.100.45`) başarılı giriş — imkansız seyahat alarmı
5. **10:30** — M365 audit: Harici adrese yönlendirme kuralı oluşturuldu

### Response

- Hesap kilitleme: 10:35
- Inbox rule temizleme: 10:36
- Parola sıfırlama + MFA zorlama: 10:38
- MTTC (Mean Time To Containment): 38 dakika

### Neden Klasik?

- Microsoft DART raporlarına göre en yaygın bulut hesap compromise pattern'i
- Inbox rule'lar otomatik silinmez — hesap kilitlense bile rule aktif kalır
- "External forward" engeli tenant policy meselesi, kullanıcı kontrolünde değil
- Kullanıcı eğitimi tek başına yeterli değil — bu mail gerçekten iyi hazırlanmıştı

---

## 2. "MailSyncPro"

**Tip:** True Positive  
**Severity:** High  
**MITRE:** T1566.002 → T1528 → T1114.002  
**Tactics:** Initial Access → Credential Access → Collection

### Hikaye

11 Mayıs 2026'da BT Sistem Yöneticisi Mehmet Kaya, "MailSyncPro — E-posta Yedekleme Aracı" adlı bir uygulamanın OAuth onay isteğini kabul etti. Uygulama, `Mail.ReadWrite` ve `offline_access` izinleri istiyordu — yani posta kutusuna sınırsız erişim.

Onaydan sonra saldırgan, Rusya IP'sinden (`203.0.113.180`) OAuth token kullanarak 200'den fazla e-postayı okudu. OAuth token'lar session gibi görünmez — MFA'yı atlarlar.

### Alert Chain

1. E-posta: OAuth onay isteği e-postası alındı
2. IdP: "MailSyncPro" uygulamasına `Mail.ReadWrite` izni verildi
3. M365 audit: 12 batch halinde toplu e-posta okuma (Rusya IP)

### Response

- Uygulama izni iptal edildi
- Tüm OAuth token'ları geçersiz kılındı
- Tenant genelinde OAuth onay politikaları sıkılaştırıldı

---

## 3. "15 Push"

**Tip:** True Positive  
**Severity:** Critical  
**MITRE:** T1556 → T1078 → T1098.001  
**Tactics:** Credential Access → Defense Evasion → Persistence

### Hikaye

12 Mayıs 2026 akşamı, Yazılım departmanından Elif Yılmaz'ın telefonuna art arda MFA onay bildirimleri gelmeye başladı. 15. denemede, muhtemelen "bildirimleri susturmak için" onay verdi.

Saldırgan Çin IP'sinden (`198.51.100.91`) hesaba giriş yaptı ve 8 dakika içinde GlobalAdmin rolü atadı. MFA fatigue, teknik değil psikolojik bir saldırıdır.

### Alert Chain

1. IdP: 15 MFA push isteği, 30 dakika içinde, aynı IP'den
2. IdP: MFA onayı alındı (fatigue success)
3. IdP: Çin IP'den başarılı giriş
4. Admin audit: Kullanıcıya GlobalAdmin rolü atandı

### Response

- Rol geri alındı
- Tüm oturumlar sonlandırıldı
- MFA politikası: push yerine number-matching geçildi

---

## 4. "Password123"

**Tip:** True Positive  
**Severity:** High  
**MITRE:** T1110.003 → T1078 → T1114.002  
**Tactics:** Credential Access → Defense Evasion → Collection

### Hikaye

13 Mayıs 2026'da Nijerya IP'sinden (`203.0.113.195`) 6 farklı hesaba "Password123" ve "Anadolu2024" ile giriş denemesi yapıldı. Satış Müdürü Mustafa Arslan'ın hesabı başarıyla ele geçirildi.

Saldırgan posta kutusunda "fatura", "havale", "sözleşme" araması yaptı ve PST dışa aktarımı başlattı. Parola püskürtme, kaba kuvvetin sessiz kuzenidir.

### Alert Chain

1. IdP: 6 hesaba başarısız giriş (tek IP, aynı parola)
2. IdP: Mustafa Arslan hesabına başarılı giriş
3. M365 audit: Posta kutusu araması ("fatura", "havale")
4. M365 audit: PST dışa aktarımı başlatıldı

---

## 5. "Havale"

**Tip:** True Positive  
**Severity:** Critical  
**MITRE:** T1566.002 → T1078 → T1098 → T1114.002  
**Tactics:** Initial Access → Defense Evasion → Persistence → Collection

### Hikaye

14 Mayıs 2026'da Muhasebe Müdürü Fatma Şahin, "Fatura Ödeme Sistemi Güncellemesi" konulu bir oltalama e-postası aldı. Brezilya IP'sinden hesabına erişen saldırgan, önce "dolandırıcılık" kelimesini içeren e-postaları silen bir kural oluşturdu — böylece güvenlik ekibinin uyarıları kullanıcıya ulaşamayacaktı.

Ardından 3 tedarikçiye "banka hesap numaramız değişti" içerikli sahte e-postalar gönderdi. Hedef IBAN: Litvanya. Olay, tedarikçilerden birinin telefonla teyit istemesi üzerine ortaya çıktı.

### Alert Chain

1. Email gateway: Finans temalı oltalama e-postası (`fatura-odeme-sistemi.example.cf`)
2. IdP: Brezilya IP'sinden başarılı giriş (`198.51.100.54`)
3. M365 audit: "dolandırıcılık" içeren e-postaları silen kural
4. Email gateway: Tedarikçilere sahte havale talebi gönderildi

---

## 6. "CV.exe"

**Tip:** True Positive  
**Severity:** Critical  
**MITRE:** T1566.001 → T1059.005 → T1547.001 → T1071.001  
**Tactics:** Initial Access → Execution → Persistence → Command and Control

### Hikaye

15 Mayıs 2026'da İK Uzmanı Zeynep Çelik, "İş Başvurusu - CV ve Referans Mektubu" konulu bir .docm dosyasını açtı. Belge "içeriği görüntülemek için makroları etkinleştirin" diyordu. Makro etkinleştirildi.

WINWORD.EXE'den PowerShell spawn edildi, Temp klasörüne `guncelleme.exe` bırakıldı, Registry Run anahtarına kalıcılık eklendi. Ardından `cdn-guncelleme.example.cf` adresine her 10 dakikada bir HTTPS beacon gitmeye başladı.

### Alert Chain

1. Email gateway: Zararlı .docm eki teslim edildi
2. EDR: WINWORD.EXE → powershell.exe spawn
3. EDR: `C:\Users\...\Temp\guncelleme.exe` dosya yazma
4. EDR: Registry Run key kalıcılığı
5. EDR: 10 C2 beacon (`cdn-guncelleme.example.cf`)

### Response

- Uç nokta izole edildi
- C2 domain'i tüm ortamda engellendi
- Aynı IOC'ler diğer endpoint'lerde tarandı
- Adli bilişim için memory dump alındı

---

## 7. "Yeni Cihaz"

**Tip:** True Positive  
**Severity:** High  
**MITRE:** T1078.004 → T1098.001  
**Tactics:** Defense Evasion → Persistence

### Hikaye

16 Mayıs 2026'da CFO Ahmet Yıldız'ın hesabına İzmir'de kayıtlı görünen ama daha önce hiç kullanılmamış bir cihazla giriş yapıldı. Giriş IP'si Nijerya olarak görünüyordu. 10 dakika sonra hesaba Exchange Administrator rolü atandı.

### Alert Chain

1. IdP: Yeni cihaz kaydı (`IZM-WS-001`)
2. IdP: Nijerya IP'sinden başarılı giriş
3. Admin audit: Exchange Administrator rolü atandı

---

## 8. "Herkese Açık"

**Tip:** True Positive  
**Severity:** High  
**MITRE:** T1567.002  
**Tactics:** Exfiltration

### Hikaye

17 Mayıs 2026'da DevOps Mühendisi Deniz Aydın, OneDrive'da 5 hassas dosya için "herkes erişebilir" bağlantıları oluşturdu. Paylaşılanlar: müşteri listesi, veritabanı yedeği, kullanıcı parolaları CSV'si, sözleşmeler ve maaş bordro dosyası.

Hollanda IP'sinden bu dosyalara erişildi ve 3 tanesi indirildi. Kullanıcı "departman içi paylaşım yaparken yanlışlıkla herkes seçeneğini işaretlediğini" söyledi.

### Alert Chain

1. M365 audit: 5 dosya için "herkes" paylaşım bağlantısı
2. M365 audit: Hollanda IP'sinden dosya indirme (`192.0.2.100`)

---

## 9. "VPN"

**Tip:** False Positive  
**Severity:** Low  
**MITRE:** T1078  
**Tactics:** Defense Evasion

### Hikaye

18 Mayıs 2026'da Bölge Müdürü Burak Polat için imkansız seyahat alarmı tetiklendi: 5 dakika içinde İstanbul ve Amsterdam'dan giriş. Amsterdam IP'si (`192.0.2.100`) bilinen bir kurumsal VPN çıkış noktasıydı. Kullanıcı VPN ile çalışıyordu.

Alert false positive olarak kapatıldı. VPN çıkış IP'leri SIEM whitelist'ine eklendi.

### Eğitim Değeri

Her imkansız seyahat alarmı saldırı değildir. VPN, proxy, mobil ağ geçişleri false positive üretir. İyi bir SOC analisti, alarmın kaynağını araştırmadan önce kullanıcının bağlamını (VPN kullanıyor mu? Seyahat ediyor mu? Yeni cihaz mı?) kontrol eder.

---

## Bir Sonraki Adım

Bu senaryoları gerçek bir SOC analisti gibi araştırmak istersen:

- Sigma kurallarını incele: `/detections` sayfası
- IOC'leri filtrele: `/iocs` sayfası
- MITRE coverage matrix'te tactic'leri gez: `/mitre` sayfası
- Kill chain timeline'ı takip et: herhangi bir incident'ın `/incidents/:id` detayı
