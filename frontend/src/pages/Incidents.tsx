import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useIncidentStore } from '@/store'
import { SkeletonTable } from '@/components/ui/skeleton-card'
import { SeverityPill } from '@/components/ui/severity-pill'
import { StatusPill } from '@/components/ui/status-pill'

export default function Incidents() {
  const { data: incidents, isLoading, load } = useIncidentStore()

  useEffect(() => { load() }, [load])

  if (isLoading) return <div className="p-6"><SkeletonTable rows={9} /></div>

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Olaylar ({incidents.length})</h2>
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
              <th className="text-left px-3 py-2 font-medium hidden lg:table-cell">Uyarı</th>
              <th className="text-left px-3 py-2 font-medium hidden lg:table-cell">Tarih</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((inc) => (
              <tr key={inc.incident_id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-3 py-2 font-mono text-[10px]">{inc.incident_id}</td>
                <td className="px-3 py-2">
                  <Link to={`/incidents/${inc.incident_id}`} className="hover:text-primary transition-colors font-medium">
                    {inc.title}
                  </Link>
                </td>
                <td className="px-3 py-2"><SeverityPill severity={inc.severity} /></td>
                <td className="px-3 py-2"><StatusPill status={inc.status} /></td>
                <td className="px-3 py-2 text-muted-foreground hidden md:table-cell">{inc.assignee ?? '—'}</td>
                <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground hidden lg:table-cell">{inc.alert_ids.length}</td>
                <td className="px-3 py-2 text-muted-foreground font-mono text-[10px] hidden lg:table-cell">
                  {new Date(inc.created_at).toLocaleDateString('tr-TR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
