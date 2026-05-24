# SOC Console — Veri Modeli

> Build edilen `data/normalized/*.json` ile senkronize.  
> Brief'e uygun: Türkçe UI metinleri, İngilizce kod/değişken adları.

---

## Severity & Status Enums

```ts
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'
export type IncidentStatus = 'open' | 'investigating' | 'contained' | 'closed'
export type PlaybookRunStatus = 'pending' | 'running' | 'waiting_approval' | 'completed' | 'failed'
export type IOCType = 'url' | 'domain' | 'ip' | 'hash' | 'email'
export type AssetType = 'workstation' | 'laptop' | 'server' | 'mobile' | 'other'
```

---

## Alert

```ts
export interface Alert {
  alert_id: string                    // "ALR-0001-001"
  incident_id: string | null          // null = henüz bağlanmamış
  title: string                       // "Oltalama Bağlantısına Tıklandı"
  description: string                 // Human-readable hypothesis
  severity: Severity
  confidence: number                  // 0-100
  source: string                      // "email_gateway" | "idp_auth" | "endpoint_edr" | ...
  status: 'new' | 'acknowledged' | 'resolved'
  affected_user_id: string
  affected_asset_id: string | null
  source_ip: string | null
  mitre_technique_ids: string[]       // ["T1566.002", "T1078"]
  evidence_event_ids: string[]
  evidence_summary: string
  recommended_actions: string[]
  playbook_run_id: string | null
  detected_at: string                 // ISO 8601
  resolved_at: string | null
}
```

---

## Incident

```ts
export interface Incident {
  incident_id: string                 // "INC-2026-0001"
  title: string
  severity: Severity
  status: IncidentStatus
  summary: string                     // Tek cümlelik özet
  narrative: string                   // 2-3 paragraf Türkçe hikaye
  assignee: string | null             // "Emre Korkmaz"
  affected_user_ids: string[]
  affected_asset_ids: string[]
  mitre_technique_ids: string[]
  kill_chain_steps: KillChainStep[]
  alert_ids: string[]
  playbook_run_ids: string[]
  created_at: string
  updated_at: string
  resolved_at: string | null
}

export interface KillChainStep {
  step_id: string
  tactic: string                      // "Initial Access", "Execution", ...
  technique_id: string                // "T1566.002"
  description: string                 // Bu adımda ne oldu
  alert_id: string | null
  timestamp: string
  status: 'completed' | 'in_progress' | 'pending'
}
```

---

## IOC (Unified — tek `value` field)

```ts
export interface IOC {
  ioc_id: string                      // "IOC-DOM-a1b2c3d4"
  type: IOCType                       // 'url' | 'domain' | 'ip' | 'hash' | 'email'
  value: string                       // Tek canonical field
  label: string                       // "Oltalama domain", "C2 IP"
  severity: Severity
  confidence: number                  // 0-100
  threat_score: number                // 0-100
  tags: string[]
  description: string
  source: string                      // "phishing_feed", "malicious_ip_feed", ...
  related_alert_ids: string[]
  first_seen: string
  last_seen: string
}
```

Defang kuralı: Frontend'de tüm IOC değerleri `defang(value, type)` ile gösterilir:
- URL: `hxxps://evil[.]com/path`
- Domain: `evil[.]example[.]tr`
- IP: `198[.]51[.]100[.]45`
- Email: `user[@]domain[.]com`
- Hash: olduğu gibi

Copy-to-clipboard defanged versiyonu kopyalar.

---

## Asset (Endpoint)

```ts
export interface Asset {
  asset_id: string                    // "AST-001"
  hostname: string                    // "IST-WS-001"
  type: AssetType
  os: string
  owner_user_id: string
  location: string
  risk_score: number                  // 0-100
  isolation_status: 'normal' | 'isolated' | 'pending_isolation'
  open_alert_count: number
  recent_processes: ProcessEvent[]
  recent_network_connections: NetworkConnection[]
  first_seen: string
  last_seen: string
}

export interface ProcessEvent {
  process_name: string
  pid: number
  parent_process_name: string | null
  command_line: string | null
  file_hash: string | null
  is_suspicious: boolean
  timestamp: string
}

export interface NetworkConnection {
  domain: string | null
  dst_ip: string | null
  port: number | null
  protocol: string
  is_suspicious: boolean
  timestamp: string
}
```

---

## User

```ts
export interface User {
  user_id: string                     // "usr-a1b2c3d4"
  email: string                       // "ayse.demir@anadolufinans.example.tr"
  display_name: string                // "Ayşe Demir"
  department: string
  title: string
  role: 'viewer' | 'analyst' | 'admin'
  risk_score: number                  // 0-100
  risk_factors: RiskFactor[]
  event_count: number
  alert_count: number
  asset_ids: string[]
  first_seen: string
  last_seen: string
}

export interface RiskFactor {
  rule: string
  points: number
  description: string
}
```

---

## Playbook

```ts
export interface PlaybookDefinition {
  playbook_id: string
  name: string
  category: string                    // "phishing", "account_compromise", ...
  description: string
  triggers: string[]
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
  is_automated: boolean
}

export interface PlaybookRun {
  run_id: string
  playbook_id: string
  incident_id: string
  status: PlaybookRunStatus
  step_results: PlaybookStepResult[]
  started_at: string
  finished_at: string | null
  duration_seconds: number | null
  notes: string | null
  triggered_by: string
}
```

---

## Detection Rule

```ts
export interface DetectionRule {
  rule_id: string                     // "RULE-MAILBOX-FWD"
  name: string                        // "Harici Posta Kutusu Yönlendirme Kuralı"
  description: string                 // Zenginleştirilmiş, ~%30 mizah
  severity: Severity
  source: string
  sigma_rule: string                  // YAML text (genişletilebilir)
  mitre_technique_ids: string[]
  enabled: boolean
  alert_count_14d: number
  false_positive_rate: number
  author: string
  created_at: string
  updated_at: string
  tags: string[]
}
```

---

## MITRE Coverage

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
```

---

## KPI Metrics

```ts
export interface KPIMetrics {
  generated_at: string
  total_alerts: number
  open_alerts: number
  critical_alerts: number
  total_incidents: number
  active_incidents: number
  total_assets: number
  isolated_assets: number
  total_users: number
  high_risk_users: number
  mttd_seconds: number
  mttr_seconds: number
  false_positive_rate: number
  alerts_by_severity: Record<Severity, number>
  alert_volume_daily: TimeSeriesPoint[]
  event_volume_daily: TimeSeriesPoint[]
  risk_score_daily: TimeSeriesPoint[]
}
```

---

## Pseudonymization

Tüm isim, domain, email, IP'ler kurgusal:

- **Şirket:** Anadolu Finans Holding (`anadolufinans.example.tr`) ve 7 bağlı şirket
- **Kullanıcılar:** 15 Türkçe isim (Ayşe Demir, Mehmet Kaya, Elif Yılmaz, ...) — deterministik seed ile `scripts/_data.py`'den üretilir
- **Domain'ler:** `.example.tr`, `.example.tk`, `.example.ml` gibi IANA reserved TLD'ler — phishing ve C2 senaryoları için
- **IP'ler:** RFC 5737 TEST-NET-1/2/3 (`192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24`) — gerçek bir IP'ye trafik göndermez
- **IOC'ler:** Frontend'de `defang()` ile gösterilir (`hxxps://evil[.]example[.]tr`)

Seed sabit (`--seed 42`), her build'de aynı veri üretilir. `--seed 99` farklı risk skorları ve timestamp dağılımı verir.

Tüm veriler `data/normalized/` altında commit'lidir — pipeline çalıştırmadan da frontend çalışır.
