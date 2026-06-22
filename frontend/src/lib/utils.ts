import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Alert } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Alert Risk Score ────────────────────────────────────────
const SEVERITY_WEIGHT: Record<string, number> = {
  critical: 40, high: 30, medium: 20, low: 10, info: 5,
}

/**
 * Composite risk score 0-100 based on severity, confidence, MITRE technique count, and evidence depth.
 * Formula: severity_weight(0-40) + confidence/4(0-25) + mitre_count*4(0-20) + evidence_count*3(0-15)
 */
export function computeRiskScore(alert: Alert): number {
  const sev = SEVERITY_WEIGHT[alert.severity] ?? 10
  const conf = Math.min(25, Math.round((alert.confidence / 100) * 25))
  const mitre = Math.min(20, alert.mitre_technique_ids.length * 4)
  const evidence = Math.min(15, alert.evidence_event_ids.length * 3)
  return Math.min(100, sev + conf + mitre + evidence)
}

export function riskScoreColor(score: number): string {
  if (score >= 75) return '#f85149'
  if (score >= 50) return '#f0883e'
  if (score >= 25) return '#d29922'
  return '#3fb950'
}

// ── IOC Defanging ───────────────────────────────────────────
const DEFANG_MAP: Record<string, (v: string) => string> = {
  url:    (v) => v.replace(/^https?:\/\//i, 'hxxp://').replace(/\./g, '[.]'),
  domain: (v) => v.replace(/\./g, '[.]'),
  ip:     (v) => v.replace(/\./g, '[.]'),
  email:  (v) => v.replace('@', '[@]').replace(/\./g, '[.]'),
  hash:   (v) => v,
}

export function defang(value: string, type: string): string {
  const fn = DEFANG_MAP[type]
  return fn ? fn(value) : value
}
