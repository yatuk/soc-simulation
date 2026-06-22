import { useMemo } from 'react'
import { PieChart, Pie, SunburstChart, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { KPIMetrics } from '@/types'
import { ChartShell } from '@/components/ui/chart-shell'
import { useTranslation } from '@/i18n'

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#f85149',
  high: '#f0883e',
  medium: '#d29922',
  low: '#3fb950',
  info: '#8b949e',
}

const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low', 'info'] as const

interface Props {
  kpi: KPIMetrics | null
  isLoading: boolean
}

export function SeverityDonut({ kpi, isLoading }: Props) {
  const { t } = useTranslation()

  const data = useMemo(() => {
    if (!kpi?.alerts_by_severity) return []
    return SEVERITY_ORDER
      .filter((k) => (kpi.alerts_by_severity[k] ?? 0) > 0)
      .map((k) => ({
        name: k,
        value: kpi.alerts_by_severity[k],
        fill: SEVERITY_COLORS[k] ?? '#8b949e',
        children: [{ name: `${k}_open`, value: Math.round((kpi.alerts_by_severity[k] ?? 0) * 0.3), fill: SEVERITY_COLORS[k] ?? '#8b949e' }],
      }))
  }, [kpi])

  if (isLoading) {
    return <div className="rounded-lg border border-border bg-card p-4 h-64 animate-pulse"><div className="h-4 w-24 bg-muted rounded mb-4" /><div className="h-48 bg-muted rounded-full w-48 mx-auto" /></div>
  }

  if (data.length === 0) {
    return <ChartShell title={t('dashboard.severityDist')}><p className="text-xs text-muted-foreground text-center py-12">{t('dashboard.noData')}</p></ChartShell>
  }

  return (
    <ChartShell title={t('dashboard.severityDist')}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Sunburst: hierarchical severity distribution */}
        <div className="overflow-hidden rounded-lg bg-muted/10 p-2">
          <ResponsiveContainer width="100%" height={220}>
            <SunburstChart data={{ name: 'root', children: data }}>
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)', fontSize: 12 }}
                formatter={(val, name) => [`${val} ${t('alerts.title').toLowerCase()}`, String(name)]}
              />
            </SunburstChart>
          </ResponsiveContainer>
        </div>

        {/* Donut: traditional pie for quick comparison */}
        <div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={data.map(({ children: _, ...d }) => d)} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2} dataKey="value" stroke="none">
                {data.map((d) => (
                  <Cell key={d.name} fill={d.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)', fontSize: 12 }}
                formatter={(val, name) => [`${val} ${t('alerts.title').toLowerCase()}`, String(name)]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 flex-wrap mt-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.fill }} />
            {d.name} ({d.value})
          </div>
        ))}
      </div>
    </ChartShell>
  )
}
