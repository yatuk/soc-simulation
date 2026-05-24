# SOC Console — Veri Modeli

> Faz 1 çıktısı. Tüm entity'lerin canonical TypeScript interface'leri.  
> Brief'e uygun: Türkçe UI metinleri, İngilizce kod/değişken adları.

---

## Severity & Status Enums

```ts
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'

export type IncidentStatus = 'open' | 'investigating' | 'contained' | 'closed'

export type PlaybookRunStatus = 'pending' | 'running' | 'waiting_approval' | 'completed' | 'failed'

export type IOCType = 'url' | 'domain' | 'ip' | 'hash' | 'email'

export type AssetType = 'workstation' | 'laptop' | 'server' | 'mobile' | 'network' | 'other'
```

---

## Alert

```ts
export interface Alert {
  alert_id: string                    // "ALR-0001-001"
  incident_id: string | null          // null = henüz incident'a bağlanmamış
  title: string                       // "Oltalama Bağlantısına Tıklandı"
  description: string                 // Human-readable hypothesis
  severity: Severity
  confidence: number                  // 0-100
  source: string                      // "email_gateway" | "idp_auth" | "endpoint_edr" | ...
  status: 'new' | 'acknowledged' | 'resolved'

  // Entity relations
  affected_user_id: string
  affected_asset_id: string | null
  source_ip: string | null

  // MITRE
  mitre_technique_ids: string[]       // ["T1566.002", "T1078"]

  // Evidence
  evidence_event_ids: string[]        // Raw event ID'leri
  evidence_summary: string            // Özet metin

  // Response
  recommended_actions: string[]       // ["Parolayı sıfırla", "Oturumları sonlandır"]
  playbook_run_id: string | null      // Çalıştırılan SOAR playbook'u

  // Timestamps
  detected_at: string                 // ISO 8601
  resolved_at: string | null
}
```

---

## Incident

```ts
export interface Incident {
  incident_id: string                 // "CASE-2026-0001"
  title: string
  severity: Severity
  status: IncidentStatus

  // Narrative (Türkçe, 2-3 paragraflık olay özeti)
  summary: string
  narrative: string                   // Detaylı hikaye

  // Assignment
  assignee: string | null             // Analist adı veya null
  affected_user_ids: string[]
  affected_asset_ids: string[]

  // MITRE kill chain
  mitre_technique_ids: string[]

  // Timeline steps (kill chain visualization)
  kill_chain_steps: KillChainStep[]

  // Relations
  alert_ids: string[]                 // Bağlı alert'ler
  playbook_run_ids: string[]          // Çalıştırılan playbook'lar

  // Timestamps
  created_at: string
  updated_at: string
  resolved_at: string | null
}

export interface KillChainStep {
  step_id: string
  tactic: string                      // "Initial Access", "Execution", …
  technique_id: string                // MITRE ID
  description: string                 // Bu adımda ne oldu
  alert_id: string | null             // İlgili alert
  timestamp: string
  status: 'completed' | 'in_progress' | 'pending'
}
```

---

## IOC (Unified — tek `value` field)

```ts
export interface IOC {
  ioc_id: string
  type: IOCType                       // 'url' | 'domain' | 'ip' | 'hash' | 'email'
  value: string                       // ← tek canonical field (eski value/indicator/domain karmaşası bitti)
  label: string                       // "Oltalama domain", "C2 IP" gibi insan-okunur
  severity: Severity
  confidence: number                  // 0-100
  threat_score: number                // 0-100 (confidence + severity'den türetilmiş)
  tags: string[]
  description: string

  // Source tracking
  source: string                      // "phishing_feed", "pipeline_extract", "manual"
  related_alert_ids: string[]

  // Defanged display için frontend'de defang() helper kullanılır
  // Örn: "hxxp://anadolu-giris-dogrula[.]example[.]tk"

  // Timestamps
  first_seen: string
  last_seen: string
}
```

---

## Asset (Endpoint / Device)

```ts
export interface Asset {
  asset_id: string                    // "DEV-001"
  hostname: string                    // "IST-WS-001"
  type: AssetType
  os: string                          // "Windows 11 Pro"
  owner_user_id: string               // Kullanıcı ID
  location: string                    // "İstanbul"

  // EDR state
  risk_score: number                  // 0-100
  isolation_status: 'normal' | 'isolated' | 'pending_isolation'
  open_alert_count: number

  // Recent activity
  recent_processes: ProcessEvent[]
  recent_network_connections: NetworkConnection[]

  // Timestamps
  first_seen: string
  last_seen: string
}

export interface ProcessEvent {
  process_name: string                // "powershell.exe"
  pid: number
  parent_process_name: string | null  // "WINWORD.EXE"
  command_line: string | null
  file_hash: string | null
  is_suspicious: boolean
  timestamp: string
}

export interface NetworkConnection {
  domain: string | null
  dst_ip: string | null
  port: number | null
  protocol: string                    // "TCP", "UDP"
  is_suspicious: boolean
  timestamp: string
}
```

---

## User

```ts
export interface User {
  user_id: string                     // email hash'ten: "usr-a1b2c3d4"
  email: string                       // "ayse.demir@anadolufinans.example.tr"
  display_name: string                // "Ayşe Demir"
  department: string                  // "Finans"
  title: string                       // "Finans Analisti"
  role: 'viewer' | 'analyst' | 'admin'

  risk_score: number                  // 0-100
  risk_factors: RiskFactor[]

  // Activity summary
  event_count: number
  alert_count: number
  asset_ids: string[]                 // Kullanıcının cihazları

  first_seen: string
  last_seen: string
}

export interface RiskFactor {
  rule: string                        // "phishing_target"
  points: number                      // 20
  description: string                 // "Oltalama e-postası aldı"
}
```

---

## PlaybookRun

```ts
export interface PlaybookDefinition {
  playbook_id: string                 // "PB-PHISHING-01"
  name: string                        // "Oltalama Yanıt"
  category: string                    // "phishing", "account_compromise", "malware"
  description: string
  triggers: string[]                  // ["alert.severity >= high AND alert.mitre includes T1566"]
  requires_approval: boolean
  estimated_duration_seconds: number
  steps: PlaybookStep[]
}

export interface PlaybookStep {
  step_id: string
  order: number
  type: 'enrich' | 'lookup' | 'hunt' | 'action' | 'approval' | 'decision' | 'notify'
  name: string
  description: string
  is_automated: boolean               // true = otomatik çalışır, false = manuel onay
}

export interface PlaybookRun {
  run_id: string                      // "RUN-1001"
  playbook_id: string
  incident_id: string
  status: PlaybookRunStatus

  // Step execution states
  step_results: PlaybookStepResult[]

  // Timestamps
  started_at: string
  finished_at: string | null
  duration_seconds: number | null

  // Analyst notes
  notes: string | null
  triggered_by: string                // "auto" | analist adı
}

export interface PlaybookStepResult {
  step_id: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  started_at: string | null
  finished_at: string | null
  output: string | null               // Human-readable sonuç
}
```

---

## DetectionRule

```ts
export interface DetectionRule {
  rule_id: string                     // "RULE-MAILBOX-001"
  name: string                        // "Harici Posta Kutusu Yönlendirme Kuralı"
  description: string
  severity: Severity
  source: string                      // "m365_audit"
  sigma_rule: string                  // YAML string (ya da formatted text)

  // MITRE
  mitre_technique_ids: string[]

  // Performance
  enabled: boolean
  alert_count_14d: number             // Son 14 günde tetiklenme sayısı
  false_positive_rate: number         // 0-100

  // Metadata
  author: string
  created_at: string
  updated_at: string

  // Tags
  tags: string[]                      // ["phishing", "persistence", "exfiltration"]
}
```

---

## MitreCoverage

```ts
export interface MitreCoverage {
  tactics: MitreTactic[]
  techniques: MitreTechnique[]
  summary: {
    total_techniques: number
    covered_techniques: number
    coverage_percent: number
    total_observations: number
  }
}

export interface MitreTactic {
  tactic_id: string                   // "TA0001"
  name: string                        // "Initial Access"
  short_name: string                  // "initial-access"
  order: number                       // ATT&CK matrix sıralaması
  technique_count: number             // Bu tactic altında cover edilen teknik sayısı
}

export interface MitreTechnique {
  technique_id: string                // "T1566.002"
  name: string                        // "Phishing: Spearphishing Link"
  tactic_id: string                   // "TA0001"
  alert_count: number                 // Bu tekniğe bağlı alert sayısı
  incident_ids: string[]              // Hangi incident'larda görüldü
  is_covered: boolean                 // En az 1 alert var mı?
}
```

---

## KPI Metrics (Dashboard)

```ts
export interface KPIMetrics {
  generated_at: string

  // Counts
  total_alerts: number
  open_alerts: number
  critical_alerts: number
  total_incidents: number
  active_incidents: number
  total_assets: number
  isolated_assets: number
  total_users: number
  high_risk_users: number

  // Response metrics
  mttd_seconds: number                // Mean Time To Detect
  mttr_seconds: number                // Mean Time To Respond
  false_positive_rate: number         // 0-100

  // Severity breakdown
  alerts_by_severity: Record<Severity, number>

  // Time series (last 14 days)
  alert_volume_daily: TimeSeriesPoint[]
  event_volume_daily: TimeSeriesPoint[]
  risk_score_daily: TimeSeriesPoint[]
}

export interface TimeSeriesPoint {
  date: string                        // "2026-05-10"
  count: number
}
```

---

## Veri Boyutları (Target)

| Entity | Hedef Count | Dosya Boyutu (tahmini) |
|---|---|---|
| Alerts | ~60-80 | ~80KB |
| Incidents | ~30-50 | ~60KB |
| IOCs | ~100-200 | ~40KB |
| Assets | ~25 | ~15KB |
| Users | ~15 | ~8KB |
| PlaybookDefinitions | ~5 | ~5KB |
| PlaybookRuns | ~30 | ~15KB |
| DetectionRules | ~10 | ~15KB |
| MitreCoverage | ~50 technique | ~20KB |
| KPIMetrics | 1 | ~5KB |
| **Toplam** | | **~260KB** |

---

## Schema Migrasyon Notları

1. **IOC `value` birleştirmesi:** Eski `indicator`, `domain`, `value` field'ları → tek `value`. Pipeline `build_dataset.py` bu dönüşümü yapacak.
2. **`Case` → `Incident`:** Eski `case_id` → `incident_id`. Brief terminolojisiyle uyumlu.
3. **`Device` → `Asset`:** Eski `device_id` → `asset_id`. Daha genel terim.
4. **JSONL → JSON:** `events.jsonl`, `alerts.jsonl` → artık yok. Tüm çıktılar JSON array.
5. **`Event` entity'si kalkıyor.** Ham event'ler frontend'de gösterilmeyecek. Alert detail içinde `evidence_summary` olarak özetlenmiş halde.
