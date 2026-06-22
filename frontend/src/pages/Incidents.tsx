import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useIncidentStore } from '@/store'
import { SkeletonTable } from '@/components/ui/skeleton-card'
import { SeverityPill } from '@/components/ui/severity-pill'
import { PivotLink } from '@/components/ui/pivot-link'
import { StatusPill } from '@/components/ui/status-pill'
import { EmptyState } from '@/components/ui/empty-state'
import { FileSearch } from 'lucide-react'
import type { Severity, IncidentStatus } from '@/types'

export default function Incidents() {
  const { data: incidents, isLoading, load } = useIncidentStore()
  const [sevFilter, setSevFilter] = useState<Severity | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | 'all'>('all')

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => incidents.filter((inc) => {
    if (sevFilter !== 'all' && inc.severity !== sevFilter) return false
    if (statusFilter !== 'all' && inc.status !== statusFilter) return false
    return true
  }), [incidents, sevFilter, statusFilter])

  if (isLoading) return <div className="p-6"><SkeletonTable rows={9} /></div>

  return (
    <div className="p-6 space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground mr-1">Filtre:</span>
        <select value={sevFilter} onChange={(e) => setSevFilter(e.target.value as Severity | 'all')} className="h-7 px-2 rounded-md border border-border bg-card text-xs focus:outline-none" aria-label="Önem">
          <option value="all">Tüm Önem</option>
          <option value="critical">Kritik</option><option value="high">Yüksek</option><option value="medium">Orta</option><option value="low">Düşük</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as IncidentStatus | 'all')} className="h-7 px-2 rounded-md border border-border bg-card text-xs focus:outline-none" aria-label="Durum">
          <option value="all">Tüm Durum</option>
          <option value="open">Açık</option><option value="investigating">İnceleniyor</option><option value="contained">Kontrol Altında</option><option value="closed">Kapatıldı</option>
        </select>
        {(sevFilter !== 'all' || statusFilter !== 'all') && (
          <button onClick={() => { setSevFilter('all'); setStatusFilter('all') }} className="h-7 px-2 rounded-md border border-border text-xs text-muted-foreground hover:bg-accent">Temizle</button>
        )}
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length}/{incidents.length} olay</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<FileSearch className="w-8 h-8" />} title="Eşleşen olay bulunamadı" description="Filtreleri değiştirmeyi deneyin." />
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-xs">
            <thead className="sticky top-0 z-10 bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-3 py-2 font-medium">ID</th>
                <th className="text-left px-3 py-2 font-medium">Başlık</th>
                <th className="text-left px-3 py-2 font-medium">Önem</th>
                <th className="text-left px-3 py-2 font-medium">Durum</th>
                <th className="text-left px-3 py-2 font-medium hidden md:table-cell">Atanan</th>
                <th className="text-left px-3 py-2 font-medium hidden lg:table-cell">MITRE</th>
                <th className="text-left px-3 py-2 font-medium hidden xl:table-cell">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inc) => (
                <tr key={inc.incident_id} className="border-b border-border last:border-0 even:bg-muted/5 hover:bg-muted/30 transition-colors cursor-pointer">
                  <td className="px-3 py-2 font-mono text-xs">{inc.incident_id}</td>
                  <td className="px-3 py-2">
                    <Link to={`/incidents/${inc.incident_id}`} className="hover:text-primary transition-colors font-medium">{inc.title}</Link>
                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{inc.summary}</div>
                  </td>
                  <td className="px-3 py-2"><SeverityPill severity={inc.severity} /></td>
                  <td className="px-3 py-2"><StatusPill status={inc.status} /></td>
                  <td className="px-3 py-2 text-muted-foreground hidden md:table-cell">
                    {inc.assignee ? <PivotLink to={`/alerts?q=${encodeURIComponent(inc.assignee)}`} className="text-xs">{inc.assignee}</PivotLink> : '—'}
                  </td>
                  <td className="px-3 py-2 hidden lg:table-cell">
                    <div className="flex items-center gap-1 flex-wrap">
                      {inc.mitre_technique_ids.slice(0, 3).map((tid) => <span key={tid} className="font-mono text-2xs bg-muted px-1 rounded">{tid}</span>)}
                      {inc.mitre_technique_ids.length > 3 && <span className="text-2xs text-muted-foreground">+{inc.mitre_technique_ids.length - 3}</span>}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground font-mono text-xs hidden xl:table-cell">{new Date(inc.created_at).toLocaleDateString('tr-TR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
