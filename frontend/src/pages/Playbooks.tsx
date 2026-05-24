import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { usePlaybookDefStore, usePlaybookRunStore } from '@/store'
import { SkeletonTable } from '@/components/ui/skeleton-card'
import { StatusPill } from '@/components/ui/status-pill'
import { Play } from 'lucide-react'

export default function Playbooks() {
  const { data: definitions, isLoading: dLoading, load: loadDef } = usePlaybookDefStore()
  const { data: runs, isLoading: rLoading, load: loadRuns } = usePlaybookRunStore()

  useEffect(() => { loadDef(); loadRuns() }, [loadDef, loadRuns])

  if (dLoading || rLoading) return <div className="p-6"><SkeletonTable rows={4} /></div>

  return (
    <div className="p-6 space-y-6">
      <section>
        <h2 className="text-sm font-semibold mb-3">Playbook Tanımları</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {definitions.map((pb) => (
            <Link
              key={pb.playbook_id}
              to={`/playbooks/${pb.playbook_id}`}
              className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-accent transition-all"
            >
              <Play className="w-4 h-4 text-primary mt-0.5 shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <div className="text-sm font-medium">{pb.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{pb.description}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{pb.category}</span>
                  <span className="text-[10px] text-muted-foreground">{pb.steps.length} adım</span>
                  <span className="text-[10px] text-muted-foreground">{pb.estimated_duration_seconds}s</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold mb-3">Çalıştırma Geçmişi</h2>
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Run ID</th>
                <th className="text-left px-3 py-2 font-medium">Playbook</th>
                <th className="text-left px-3 py-2 font-medium">Olay</th>
                <th className="text-left px-3 py-2 font-medium">Durum</th>
                <th className="text-left px-3 py-2 font-medium hidden md:table-cell">Süre</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r) => {
                const def = definitions.find((d) => d.playbook_id === r.playbook_id)
                return (
                  <tr key={r.run_id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-3 py-2 font-mono text-[10px]">{r.run_id}</td>
                    <td className="px-3 py-2">{def?.name ?? r.playbook_id}</td>
                    <td className="px-3 py-2 font-mono text-[10px]">
                      <Link to={`/incidents/${r.incident_id}`} className="text-primary hover:underline">{r.incident_id}</Link>
                    </td>
                    <td className="px-3 py-2"><StatusPill status={r.status} /></td>
                    <td className="px-3 py-2 text-muted-foreground hidden md:table-cell">{r.duration_seconds}s</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
