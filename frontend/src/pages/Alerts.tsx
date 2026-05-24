import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAlertStore } from '@/store'
import { SkeletonTable } from '@/components/ui/skeleton-card'
import { SeverityPill } from '@/components/ui/severity-pill'
import { StatusPill } from '@/components/ui/status-pill'
import { EmptyState } from '@/components/ui/empty-state'
import { AlertFilters, type AlertFilterState } from '@/components/features/alerts/AlertFilters'
import { AlertTriangle } from 'lucide-react'

export default function Alerts() {
  const { data: alerts, isLoading, load } = useAlertStore()
  const [filters, setFilters] = useState<AlertFilterState>({ severity: 'all', status: 'all', source: 'all', search: '' })

  useEffect(() => { load() }, [load])

  const sources = useMemo(() => [...new Set(alerts.map((a) => a.source))].sort(), [alerts])

  const updateFilters = (partial: Partial<AlertFilterState>) => setFilters((f) => ({ ...f, ...partial }))

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      if (filters.severity !== 'all' && a.severity !== filters.severity) return false
      if (filters.status !== 'all' && a.status !== filters.status) return false
      if (filters.source !== 'all' && a.source !== filters.source) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        const haystack = [a.title, a.description, a.source, a.source_ip ?? '', a.alert_id].join(' ').toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [alerts, filters])

  if (isLoading) return <div className="p-6"><SkeletonTable rows={12} /></div>

  return (
    <div className="p-6 space-y-4">
      <AlertFilters filters={filters} onChange={updateFilters} sources={sources} totalCount={alerts.length} filteredCount={filtered.length} />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<AlertTriangle className="w-8 h-8" />}
          title={alerts.length === 0 ? 'Hiç uyarı yok' : 'Eşleşen uyarı bulunamadı'}
          description={alerts.length === 0 ? 'Ya gerçekten sakin bir gün, ya da SIEM\'iniz ölmüş.' : 'Filtreleri değiştirmeyi deneyin.'}
        />
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-3 py-2 font-medium w-[30%]">Uyarı</th>
                <th className="text-left px-3 py-2 font-medium">Önem</th>
                <th className="text-left px-3 py-2 font-medium">Durum</th>
                <th className="text-left px-3 py-2 font-medium hidden md:table-cell">Kaynak</th>
                <th className="text-left px-3 py-2 font-medium hidden lg:table-cell">IP</th>
                <th className="text-left px-3 py-2 font-medium hidden xl:table-cell">Tarih</th>
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
                  <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground hidden lg:table-cell">{a.source_ip ?? '—'}</td>
                  <td className="px-3 py-2 text-muted-foreground font-mono text-[10px] hidden xl:table-cell">
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
