import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { usePlaybookDefStore, usePlaybookRunStore } from '@/store'
import { SkeletonCard } from '@/components/ui/skeleton-card'
import { StatusPill } from '@/components/ui/status-pill'
import { ArrowLeft, Play, CheckCircle, Circle, XCircle, Clock, ChevronDown, ChevronRight, Zap } from 'lucide-react'

const STEP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  enrich: Zap, lookup: Zap, hunt: Zap, action: Play, approval: Clock, decision: Clock, notify: Zap,
}

export default function PlaybookDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: definitions, isLoading, load: loadDef } = usePlaybookDefStore()
  const { data: runs, load: loadRuns } = usePlaybookRunStore()
  const [expandedRun, setExpandedRun] = useState<string | null>(null)

  useEffect(() => {
    if (definitions.length === 0) loadDef()
    if (runs.length === 0) loadRuns()
  }, [])

  if (isLoading) return <div className="p-6 max-w-3xl"><SkeletonCard /></div>

  const def = definitions.find((d) => d.playbook_id === id)
  if (!def) return <div className="p-6 text-muted-foreground text-center">Playbook bulunamadı. <Link to="/playbooks" className="text-primary hover:underline">Listeye dön</Link></div>

  const relatedRuns = [...runs].filter((r) => r.playbook_id === id).sort((a, b) => b.started_at.localeCompare(a.started_at))
  const handleRun = () => toast.success(`"${def.name}" başlatıldı.`, { description: 'Kurgusal işlem — run sıraya alındı.', duration: 3000 })

  const sortedSteps = [...def.steps].sort((a, b) => a.order - b.order)

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Link to="/playbooks" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3 h-3" /> Playbook'lara dön
        </Link>
        <button onClick={handleRun} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/30 text-primary text-xs font-medium hover:bg-primary/20 transition-colors" aria-label="Playbook'u şimdi çalıştır">
          <Play className="w-3.5 h-3.5" />Şimdi Çalıştır
        </button>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <Play className="w-4 h-4 text-primary" />
          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{def.category}</span>
          <span className="text-[10px] text-muted-foreground">{def.requires_approval ? 'Onay Gerekli' : 'Otomatik'}</span>
        </div>
        <h1 className="text-lg font-bold">{def.name}</h1>
        <p className="text-sm text-muted-foreground mt-2">{def.description}</p>
      </div>

      {/* DAG-like step flow */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Adım Akışı ({sortedSteps.length} adım • ~{def.estimated_duration_seconds}s)
        </h3>
        <div className="relative pl-8">
          {sortedSteps.map((step, i) => {
            const StepIcon = STEP_ICONS[step.type] ?? Zap
            const isLast = i === sortedSteps.length - 1
            return (
              <div key={step.step_id} className="relative pb-4 last:pb-0">
                {!isLast && <div className="absolute left-[-17px] top-6 bottom-0 w-px border-l-2 border-dashed border-border" />}
                <div className={`absolute left-[-21px] top-2 w-[9px] h-[9px] rounded-full ${step.is_automated ? 'bg-primary border-primary' : 'bg-amber-500 border-amber-500'} border-2`} />
                <div className="p-3 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${step.is_automated ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-500'}`}>
                      <StepIcon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold">{step.name}</span>
                    <span className="text-[9px] bg-muted px-1 rounded font-medium">{step.type}</span>
                    <span className={`text-[9px] ml-auto ${step.is_automated ? 'text-primary' : 'text-amber-500'}`}>
                      {step.is_automated ? 'OTOMATİK' : 'MANUEL'}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground ml-8">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Run history */}
      {relatedRuns.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Çalıştırma Geçmişi ({relatedRuns.length})</h3>
          <div className="space-y-2">
            {relatedRuns.map((r) => {
              const isExpanded = expandedRun === r.run_id
              return (
                <div key={r.run_id} className="rounded-lg border border-border overflow-hidden">
                  <button onClick={() => setExpandedRun(isExpanded ? null : r.run_id)} className="w-full flex items-center justify-between p-3 text-left hover:bg-accent transition-colors" aria-expanded={isExpanded}>
                    <div className="flex items-center gap-3">
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                      <span className="font-mono text-[10px]">{r.run_id}</span>
                      <StatusPill status={r.status} />
                      <span className="text-[10px] text-muted-foreground">{r.duration_seconds}s</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {r.step_results.map((sr) => (
                        <span key={sr.step_id} title={sr.output ?? sr.status}>
                          {sr.status === 'completed' ? <CheckCircle className="w-3 h-3 text-status-completed" /> : sr.status === 'failed' ? <XCircle className="w-3 h-3 text-status-failed" /> : <Circle className="w-3 h-3 text-muted-foreground" />}
                        </span>
                      ))}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="border-t border-border px-3 py-3 bg-muted/10 space-y-3">
                      <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                        <span>Başlatan: {r.triggered_by}</span>
                        <span>Başlangıç: {new Date(r.started_at).toLocaleString('tr-TR')}</span>
                        {r.finished_at && <span>Bitiş: {new Date(r.finished_at).toLocaleString('tr-TR')}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-status-completed rounded-full" style={{ width: `${r.status === 'completed' ? 100 : r.status === 'failed' ? 60 : 40}%` }} />
                        </div>
                        <span className="text-[10px] text-muted-foreground">{r.duration_seconds}s</span>
                      </div>
                      <div className="space-y-1">
                        {r.step_results.map((sr) => (
                          <div key={sr.step_id} className="flex items-center gap-2 text-[10px]">
                            {sr.status === 'completed' ? <CheckCircle className="w-3 h-3 text-status-completed shrink-0" /> : sr.status === 'failed' ? <XCircle className="w-3 h-3 text-status-failed shrink-0" /> : <Circle className="w-3 h-3 text-muted-foreground shrink-0" />}
                            <span className="font-mono">{sr.step_id}</span>
                            <span className="text-muted-foreground">{sr.output ?? sr.status}</span>
                            {sr.finished_at && <span className="text-muted-foreground ml-auto">{new Date(sr.finished_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>}
                          </div>
                        ))}
                      </div>
                      {r.notes && <p className="text-[10px] text-muted-foreground italic">{r.notes}</p>}
                      <Link to={`/incidents/${r.incident_id}`} className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline">Olay: {r.incident_id}</Link>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
