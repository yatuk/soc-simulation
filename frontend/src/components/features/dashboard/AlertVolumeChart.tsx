import { useMemo } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Alert, TimeSeriesPoint } from '@/types'
import { ChartShell } from '@/components/ui/chart-shell'
import { useTranslation } from '@/i18n'

const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'] as const
const SEVERITY_FILL: Record<string, string> = {
  critical: '#f85149',
  high: '#f0883e',
  medium: '#d29922',
  low: '#3fb950',
}

interface Props {
  alerts: Alert[]
  kpiData: TimeSeriesPoint[]
  days: number
  isLoading: boolean
}

export function AlertVolumeChart({ alerts, kpiData, days, isLoading }: Props) {
  const { t } = useTranslation()

  const chartData = useMemo(() => {
    if (days <= 7 && alerts.length > 0) {
      // Short ranges: use raw alerts with severity stacking
      const byDay: Record<string, Record<string, number>> = {}
      alerts.forEach((a) => {
        const key = days === 1 ? a.detected_at.slice(0, 13) : a.detected_at.slice(0, 10)
        if (!byDay[key]) byDay[key] = { critical: 0, high: 0, medium: 0, low: 0 }
        const sev = a.severity as keyof typeof SEVERITY_FILL
        if (byDay[key][sev] !== undefined) byDay[key][sev]++
      })
      return Object.entries(byDay)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-days === 1 ? -24 : -days)
        .map(([date, sev]) => ({
          date: days === 1 ? date.slice(11, 16) : date.slice(5),
          ...sev,
        }))
    }
    // Long ranges: use pre-aggregated kpi data (no severity breakdown)
    return kpiData.slice(-days).map((d) => ({
      date: d.date.slice(5),
      total: d.count,
    }))
  }, [alerts, kpiData, days])

  const showStack = days <= 7 && alerts.length > 0

  if (isLoading) {
    return <div className="rounded-lg border border-border bg-card p-4 h-64 animate-pulse"><div className="h-4 w-32 bg-muted rounded mb-4" /><div className="h-48 bg-muted rounded" /></div>
  }

  if (chartData.length === 0) {
    return <ChartShell title={t('dashboard.alertVolume')}><p className="text-xs text-muted-foreground text-center py-12">{t('dashboard.noData')}</p></ChartShell>
  }

  return (
    <ChartShell title={t('dashboard.alertVolume')}>
      <ResponsiveContainer width="100%" height={200}>
        {showStack ? (
          <AreaChart data={chartData} margin={{ top: 4, right: 0, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)', fontSize: 12 }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            {SEVERITY_ORDER.map((sev) => (
              <Area key={sev} type="monotone" dataKey={sev} stackId="1" stroke={SEVERITY_FILL[sev]} fill={SEVERITY_FILL[sev]} fillOpacity={0.15} strokeWidth={1.5} name={sev} />
            ))}
          </AreaChart>
        ) : (
          <BarChart data={chartData} margin={{ top: 4, right: 0, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)', fontSize: 12 }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </ChartShell>
  )
}
