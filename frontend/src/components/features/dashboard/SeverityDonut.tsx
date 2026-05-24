import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { KPIMetrics } from '@/types'

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#f85149',
  high: '#f0883e',
  medium: '#d29922',
  low: '#3fb950',
  info: '#8b949e',
}

const SEVERITY_LABELS: Record<string, string> = {
  critical: 'Kritik',
  high: 'Yüksek',
  medium: 'Orta',
  low: 'Düşük',
  info: 'Bilgi',
}

interface Props {
  kpi: KPIMetrics | null
  isLoading: boolean
}

export function SeverityDonut({ kpi, isLoading }: Props) {
  if (isLoading) {
    return <div className="rounded-lg border border-border bg-card p-4 h-64 animate-pulse"><div className="h-4 w-24 bg-muted rounded mb-4" /><div className="h-48 bg-muted rounded-full w-48 mx-auto" /></div>
  }

  const sevData = kpi?.alerts_by_severity
  const entries = sevData ? Object.entries(sevData).filter(([, v]) => v > 0) : []
  const data = entries.map(([key, value]) => ({ name: SEVERITY_LABELS[key] ?? key, value, color: SEVERITY_COLORS[key] ?? '#8b949e' }))

  if (data.length === 0) {
    return <ChartShell title="Önem Dağılımı"><p className="text-xs text-muted-foreground text-center py-12">Uyarı bulunamadı.</p></ChartShell>
  }

  return (
    <ChartShell title="Önem Dağılımı">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)', fontSize: 12 }}
            formatter={(val: number, name: string) => [`${val} uyarı`, name]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-3 flex-wrap mt-1">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
            {d.name} ({d.value})
          </div>
        ))}
      </div>
    </ChartShell>
  )
}

function ChartShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-xs font-semibold mb-3">{title}</h3>
      {children}
    </div>
  )
}
