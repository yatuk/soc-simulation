import { cn } from '@/lib/utils'
import type { Severity } from '@/types'

const icons: Record<Severity, string> = {
  critical: '■',
  high: '▲',
  medium: '●',
  low: '▬',
  info: '○',
}

const labels: Record<Severity, string> = {
  critical: 'Kritik',
  high: 'Yüksek',
  medium: 'Orta',
  low: 'Düşük',
  info: 'Bilgi',
}

interface SeverityPillProps {
  severity: Severity
  className?: string
}

export function SeverityPill({ severity, className }: SeverityPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        'border',
        severity === 'critical' && 'bg-severity-critical/10 border-severity-critical/30 text-severity-critical',
        severity === 'high'     && 'bg-severity-high/10     border-severity-high/30     text-severity-high',
        severity === 'medium'   && 'bg-severity-medium/10   border-severity-medium/30   text-severity-medium',
        severity === 'low'      && 'bg-severity-low/10      border-severity-low/30      text-severity-low',
        severity === 'info'     && 'bg-severity-info/10     border-severity-info/30     text-severity-info',
        className
      )}
      role="status"
      aria-label={`Önem seviyesi: ${labels[severity]}`}
    >
      <span aria-hidden="true">{icons[severity]}</span>
      {labels[severity]}
    </span>
  )
}
