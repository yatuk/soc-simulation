import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Alert } from '@/types'
import { ChartShell } from '@/components/ui/chart-shell'

const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'] as const
const SEVERITY_FILL: Record<string, string> = {
  critical: '#f85149',
  high: '#f0883e',
  medium: '#d29922',
  low: '#3fb950',
}

interface Props {
  alerts: Alert[]
  isLoading: boolean
}

export function AlertVolumeChart({ alerts, isLoading }: Props) {
  const chartData = useMemo(() => {
    const byDay: Record<string, Record<string, number>> = {}
    alerts.forEach((a) => {
      const day = a.detected_at.slice(0, 10)
      if (!byDay[day]) byDay[day] = { critical: 0, high: 0, medium: 0, low: 0 }
      byDay[day][a.severity] = (byDay[day][a.severity] || 0) + 1
    })
    return Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([date, sev]) => ({
        date: date.slice(5),
        ...sev,
      }))
  }, [alerts])

  if (isLoading) {
    return <div className="rounded-lg border border-border bg-card p-4 h-64 animate-pulse"><div className="h-4 w-32 bg-muted rounded mb-4" /><div className="h-48 bg-muted rounded" /></div>
  }

  if (chartData.length === 0) {
    return <ChartShell title="Uyarı Hacmi (7 Gün)"><p className="text-xs text-muted-foreground text-center py-12">Henüz yeterli veri yok.</p></ChartShell>
  }

  return (
    <ChartShell title="Uyarı Hacmi (7 Gün)">
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData} margin={{ top: 4, right: 0, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)', fontSize: 12 }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          {SEVERITY_ORDER.map((sev) => (
            <Area key={sev} type="monotone" dataKey={sev} stackId="1" stroke={SEVERITY_FILL[sev]} fill={SEVERITY_FILL[sev]} fillOpacity={0.15} strokeWidth={1.5} name={sev} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </ChartShell>
  )
}
