import { useMemo } from 'react'
import { AlertTriangle, FileSearch, Clock, Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { KPIMetrics } from '@/types'

interface Props {
  kpi: KPIMetrics | null
  isLoading: boolean
}

export function KpiCards({ kpi, isLoading }: Props) {
  const delta = useMemo(() => {
    if (!kpi) return { alerts: null as number | null, incidents: null as number | null, mttd: null as number | null, mttr: null as number | null }
    const days = kpi.alert_volume_daily
    if (days.length < 2) return { alerts: null, incidents: null, mttd: null, mttr: null }
    const curr = days[days.length - 1].count
    const prev = days[days.length - 2].count
    return { alerts: prev > 0 ? Math.round(((curr - prev) / prev) * 100) : null, incidents: null, mttd: null, mttr: null }
  }, [kpi])

  const cards = [
    { icon: AlertTriangle, label: 'Açık Uyarı', value: kpi?.open_alerts ?? '—', sub: `${kpi?.critical_alerts ?? 0} kritik`, delta: delta.alerts },
    { icon: FileSearch, label: 'Aktif Olay', value: kpi?.active_incidents ?? '—', sub: `${kpi?.total_incidents ?? 0} toplam`, delta: null },
    { icon: Clock, label: 'MTTD', value: kpi ? `${Math.round(kpi.mttd_seconds / 60)} dk` : '—', sub: 'Tespit süresi', delta: null },
    { icon: Activity, label: 'MTTR', value: kpi ? `${Math.round(kpi.mttr_seconds / 60)} dk` : '—', sub: 'Yanıt süresi', delta: null },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map(({ icon: Icon, label, value, sub, delta: d }) => (
        <div key={label} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="text-xs truncate">{label}</span>
          </div>
          <div className="flex items-baseline gap-2">
            {isLoading ? (
              <div className="h-8 w-16 bg-muted rounded animate-pulse" />
            ) : (
              <span className="text-2xl font-bold tabular-nums">{value}</span>
            )}
            {d !== null && (
              <span className={`inline-flex items-center text-[10px] font-medium ${d > 0 ? 'text-severity-critical' : d < 0 ? 'text-severity-low' : 'text-muted-foreground'}`} aria-label={`Değişim: %${d}`}>
                {d > 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : d < 0 ? <TrendingDown className="w-3 h-3 mr-0.5" /> : <Minus className="w-3 h-3 mr-0.5" />}
                {d > 0 ? '↑' : d < 0 ? '↓' : '–'}{Math.abs(d)}%
              </span>
            )}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>
        </div>
      ))}
    </div>
  )
}
