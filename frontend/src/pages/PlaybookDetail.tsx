import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usePlaybookDefStore, usePlaybookRunStore } from '@/store'
import { SkeletonCard } from '@/components/ui/skeleton-card'
import { StatusPill } from '@/components/ui/status-pill'
import { ArrowLeft, CheckCircle, Circle, Play } from 'lucide-react'

export default function PlaybookDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: definitions, isLoading, load: loadDef } = usePlaybookDefStore()
  const { data: runs, load: loadRuns } = usePlaybookRunStore()

  useEffect(() => {
    if (definitions.length === 0) loadDef()
    if (runs.length === 0) loadRuns()
  }, [definitions.length, runs.length, loadDef, loadRuns])

  if (isLoading) return <div className="p-6"><SkeletonCard /></div>

  const def = definitions.find((d) => d.playbook_id === id)
  if (!def) return <div className="p-6 text-muted-foreground text-center">Playbook bulunamadı. <Link to="/playbooks" className="text-primary hover:underline">Listeye dön</Link></div>

  const relatedRuns = runs.filter((r) => r.playbook_id === id)

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <Link to="/playbooks" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-3 h-3" /> Playbook'lara dön
      </Link>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <Play className="w-4 h-4 text-primary" />
          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{def.category}</span>
        </div>
        <h1 className="text-lg font-bold">{def.name}</h1>
        <p className="text-sm text-muted-foreground mt-2">{def.description}</p>
        <p className="text-xs text-muted-foreground mt-2">Tahmini süre: {def.estimated_duration_seconds}s • Onay gerekli: {def.requires_approval ? 'Evet' : 'Hayır'}</p>
      </div>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Adımlar</h3>
        <div className="space-y-1">
          {def.steps.sort((a, b) => a.order - b.order).map((step, i) => (
            <div key={step.step_id} className="flex items-start gap-3 p-3 rounded-lg border border-border">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-mono">{i + 1}</span>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium">{step.name}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{step.description}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] bg-muted px-1 rounded">{step.type}</span>
                  <span className="text-[10px] text-muted-foreground">{step.is_automated ? 'Otomatik' : 'Manuel'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {relatedRuns.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Çalıştırma Geçmişi ({relatedRuns.length})</h3>
          <div className="space-y-2">
            {relatedRuns.map((r) => (
              <div key={r.run_id} className="p-3 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px]">{r.run_id}</span>
                  <StatusPill status={r.status} />
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {r.step_results.map((sr) => (
                    <span key={sr.step_id} className="text-[10px] text-muted-foreground" title={sr.output ?? ''}>
                      {sr.status === 'completed' ? <CheckCircle className="w-3 h-3 text-status-completed inline" /> : <Circle className="w-3 h-3 inline" />}
                    </span>
                  ))}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">Süre: {r.duration_seconds}s</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
