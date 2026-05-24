import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useKPIStore, useIncidentStore } from '@/store'
import { SkeletonCard } from '@/components/ui/skeleton-card'
import { SeverityPill } from '@/components/ui/severity-pill'
import { StatusPill } from '@/components/ui/status-pill'
import { AlertTriangle, FileSearch, Clock, Activity } from 'lucide-react'

export default function Overview() {
  const { data: kpi, isLoading: kpiLoading, load: loadKPI } = useKPIStore()
  const { data: incidents, isLoading: incLoading, load: loadInc } = useIncidentStore()

  useEffect(() => { loadKPI(); loadInc() }, [loadKPI, loadInc])

  if (kpiLoading || incLoading) {
    return (
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI icon={AlertTriangle} label="Açık Uyarı" value={kpi?.open_alerts ?? 0} sub={`${kpi?.critical_alerts ?? 0} kritik`} />
        <KPI icon={FileSearch} label="Aktif Olay" value={kpi?.active_incidents ?? 0} sub={`${kpi?.total_incidents ?? 0} toplam`} />
        <KPI icon={Clock} label="MTTD" value={`${Math.round((kpi?.mttd_seconds ?? 0) / 60)} dk`} sub="Tespit süresi" />
        <KPI icon={Activity} label="MTTR" value={`${Math.round((kpi?.mttr_seconds ?? 0) / 60)} dk`} sub="Yanıt süresi" />
      </div>

      {/* Recent Incidents */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Son Olaylar</h2>
          <Link to="/incidents" className="text-xs text-primary hover:underline">Tümü</Link>
        </div>
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-3 py-2 font-medium">ID</th>
                <th className="text-left px-3 py-2 font-medium">Başlık</th>
                <th className="text-left px-3 py-2 font-medium">Önem</th>
                <th className="text-left px-3 py-2 font-medium">Durum</th>
                <th className="text-left px-3 py-2 font-medium hidden md:table-cell">Atanan</th>
              </tr>
            </thead>
            <tbody>
              {(incidents ?? []).slice(0, 5).map((inc) => (
                <tr key={inc.incident_id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2 font-mono text-[10px]">{inc.incident_id}</td>
                  <td className="px-3 py-2">
                    <Link to={`/incidents/${inc.incident_id}`} className="hover:text-primary transition-colors">
                      {inc.title}
                    </Link>
                  </td>
                  <td className="px-3 py-2"><SeverityPill severity={inc.severity} /></td>
                  <td className="px-3 py-2"><StatusPill status={inc.status} /></td>
                  <td className="px-3 py-2 text-muted-foreground hidden md:table-cell">{inc.assignee ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function KPI({ icon: Icon, label, value, sub }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; sub: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <Icon className="w-4 h-4" aria-hidden="true" />
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>
    </div>
  )
}
