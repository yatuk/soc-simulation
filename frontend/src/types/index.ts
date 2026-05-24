// ── AI Summary ─────────────────────────────────────────────
export interface AiSummaryData {
  verdict: string
  confidence: number
  summary: string
  related_techniques?: string[]
  next_steps: string[]
}

// ── Enums ──────────────────────────────────────────────────
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'
export type IncidentStatus = 'open' | 'investigating' | 'contained' | 'closed'
export type PlaybookRunStatus = 'pending' | 'running' | 'waiting_approval' | 'completed' | 'failed'
export type IOCType = 'url' | 'domain' | 'ip' | 'hash' | 'email'
export type AssetType = 'workstation' | 'laptop' | 'server' | 'mobile' | 'other'

// ── Alert ──────────────────────────────────────────────────
export interface Alert {
  alert_id: string
  incident_id: string | null
  title: string
  description: string
  severity: Severity
  confidence: number
  source: string
  status: 'new' | 'acknowledged' | 'resolved'
  affected_user_id: string
  affected_asset_id: string | null
  source_ip: string | null
  mitre_technique_ids: string[]
  evidence_event_ids: string[]
  evidence_summary: string
  recommended_actions: string[]
  playbook_run_id: string | null
  detected_at: string
  resolved_at: string | null
}

// ── Incident ───────────────────────────────────────────────
export interface Incident {
  incident_id: string
  title: string
  severity: Severity
  status: IncidentStatus
  summary: string
  narrative: string
  assignee: string | null
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
  tactic: string
  technique_id: string
  description: string
  alert_id: string | null
  timestamp: string
  status: 'completed' | 'in_progress' | 'pending'
}

// ── IOC ────────────────────────────────────────────────────
export interface IOC {
  ioc_id: string
  type: IOCType
  value: string
  label: string
  severity: Severity
  confidence: number
  threat_score: number
  tags: string[]
  description: string
  source: string
  related_alert_ids: string[]
  first_seen: string
  last_seen: string
}

// ── Asset (Endpoint) ───────────────────────────────────────
export interface Asset {
  asset_id: string
  hostname: string
  type: AssetType
  os: string
  owner_user_id: string
  location: string
  risk_score: number
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

// ── User ───────────────────────────────────────────────────
export interface User {
  user_id: string
  email: string
  display_name: string
  department: string
  title: string
  role: 'viewer' | 'analyst' | 'admin'
  risk_score: number
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

// ── Playbook ───────────────────────────────────────────────
export interface PlaybookDefinition {
  playbook_id: string
  name: string
  category: string
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

export interface PlaybookStepResult {
  step_id: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  started_at: string | null
  finished_at: string | null
  output: string | null
}

// ── Detection Rule ─────────────────────────────────────────
export interface DetectionRule {
  rule_id: string
  name: string
  description: string
  severity: Severity
  source: string
  sigma_rule: string
  mitre_technique_ids: string[]
  enabled: boolean
  alert_count_14d: number
  false_positive_rate: number
  author: string
  created_at: string
  updated_at: string
  tags: string[]
}

// ── MITRE Coverage ─────────────────────────────────────────
export interface MitreCoverage {
  tactics: MitreTactic[]
  techniques: MitreTechnique[]
  summary: MitreCoverageSummary
}

export interface MitreTactic {
  tactic_id: string
  name: string
  short_name: string
  order: number
  technique_count: number
}

export interface MitreTechnique {
  technique_id: string
  name: string
  tactic_id: string
  alert_count: number
  incident_ids: string[]
  is_covered: boolean
}

export interface MitreCoverageSummary {
  total_techniques: number
  covered_techniques: number
  coverage_percent: number
  total_observations: number
}

// ── KPI ────────────────────────────────────────────────────
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

export interface TimeSeriesPoint {
  date: string
  count: number
}

// ── Settings ───────────────────────────────────────────────
export interface Settings {
  theme: 'dark' | 'light' | 'system'
  sidebarExpanded: boolean
  tableDensity: 'compact' | 'normal' | 'comfortable'
}
