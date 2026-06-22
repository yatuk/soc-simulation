import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartShell } from '@/components/ui/chart-shell'
import { useTranslation } from '@/i18n'
import type { TimeSeriesPoint } from '@/types'

interface Props {
  data: TimeSeriesPoint[]
  days: number
  isLoading: boolean
}

export function EventVolumeChart({ data, days, isLoading }: Props) {
  const { t } = useTranslation()

  const chartData = useMemo(() => {
    if (!data?.length) return []
    return data.slice(-days).map((d) => ({
      date: d.date.slice(5),
      count: d.count,
    }))
  }, [data, days])

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 h-64 animate-pulse">
        <div className="h-4 w-28 bg-muted rounded mb-4" />
        <div className="h-48 bg-muted rounded" />
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <ChartShell title={t('dashboard.eventVolume')}>
        <p className="text-xs text-muted-foreground text-center py-12">{t('dashboard.noData')}</p>
      </ChartShell>
    )
  }

  return (
    <ChartShell title={t('dashboard.eventVolume')}>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)', fontSize: 12 }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} activeDot={{ r: 3, fill: 'hsl(var(--primary))' }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartShell>
  )
}
