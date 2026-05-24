import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAlertStore } from '@/store'
import { SkeletonTable } from '@/components/ui/skeleton-card'
import { SeverityPill } from '@/components/ui/severity-pill'
import { StatusPill } from '@/components/ui/status-pill'
import { EmptyState } from '@/components/ui/empty-state'
import { AlertTriangle } from 'lucide-react'
import type { Severity } from '@/types'

export default function Alerts() {
  const { data: alerts, isLoading, load } = useAlertStore()
  const [sevFilter, setSevFilter] = useState<Severity | 'all'>('all')

  useEffect(() => { load() }, [load])

  const filtered = sevFilter === 'all' ? alerts : alerts.filter((a) => a.severity === sevFilter)

  if (isLoading) return <div className="p-6"><SkeletonTable rows={8} /></div>

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <h2 className="text-sm font-semibold mr-2">Filtre:</h2>
        {(['all', 'critical', 'high', 'medium', 'low'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSevFilter(s)}
            className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${sevFilter === s ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border text-muted-foreground hover:bg-accent'}`}
            aria-pressed={sevFilter === s}
          >
            {s === 'all' ? 'Tümü' : <SeverityPill severity={s} className="border-0 bg-transparent p-0" />}
          </button>
        ))}
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} uyarı</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<AlertTriangle className="w-8 h-8" />} title="Hiç uyarı yok" description="Ya gerçekten sakin bir gün, ya da SIEM'iniz ölmüş." />
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Uyarı</th>
                <th className="text-left px-3 py-2 font-medium">Önem</th>
                <th className="text-left px-3 py-2 font-medium">Durum</th>
                <th className="text-left px-3 py-2 font-medium hidden md:table-cell">Kaynak</th>
                <th className="text-left px-3 py-2 font-medium hidden lg:table-cell">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.alert_id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2">
                    <Link to={`/alerts/${a.alert_id}`} className="hover:text-primary transition-colors font-medium">
                      {a.title}
                    </Link>
                    <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{a.alert_id}</div>
                  </td>
                  <td className="px-3 py-2"><SeverityPill severity={a.severity} /></td>
                  <td className="px-3 py-2"><StatusPill status={a.status} /></td>
                  <td className="px-3 py-2 text-muted-foreground hidden md:table-cell">{a.source}</td>
                  <td className="px-3 py-2 text-muted-foreground font-mono text-[10px] hidden lg:table-cell">
                    {new Date(a.detected_at).toLocaleDateString('tr-TR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
