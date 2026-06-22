import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { MitreCoverage } from '@/types'
import { ChartShell } from '@/components/ui/chart-shell'

const BAR_FILL = '#f0883e'

interface Props {
  mitre: MitreCoverage | null
  isLoading: boolean
}

export function TopMitreBar({ mitre, isLoading }: Props) {
  const top5 = useMemo(() => {
    if (!mitre) return []
    return [...mitre.techniques]
      .filter((t) => t.alert_count > 0)
      .sort((a, b) => b.alert_count - a.alert_count)
      .slice(0, 5)
      .map((t) => ({ name: t.technique_id, label: t.name, count: t.alert_count }))
  }, [mitre])

  if (isLoading) {
    return <div className="rounded-lg border border-border bg-card p-4 h-64 animate-pulse"><div className="h-4 w-32 bg-muted rounded mb-4" /><div className="h-48 bg-muted rounded" /></div>
  }

  if (top5.length === 0) {
    return <ChartShell title="En Çok Görülen MITRE Teknikleri"><p className="text-xs text-muted-foreground text-center py-12">Henüz veri yok.</p></ChartShell>
  }

  return (
    <ChartShell title="En Çok Görülen MITRE Teknikleri">
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={top5} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} allowDecimals={false} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} width={70} />
          <Tooltip
            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)', fontSize: 12 }}
            formatter={(val: number) => [`${val} uyarı`, '']}
            labelFormatter={(label: string) => top5.find((t) => t.name === label)?.label ?? label}
          />
          <Bar dataKey="count" radius={[0, 2, 2, 0]} barSize={14}>
            {top5.map((t, i) => <Cell key={t.name} fill={BAR_FILL} fillOpacity={1 - i * 0.12} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  )
}
