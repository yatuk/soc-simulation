import { useEffect, useMemo, useState, memo } from 'react'
import { Link } from 'react-router-dom'
import { useMitreStore, useAlertStore } from '@/store'
import { SkeletonCard } from '@/components/ui/skeleton-card'
import { SeverityPill } from '@/components/ui/severity-pill'
import { EmptyState } from '@/components/ui/empty-state'
import { Target, X, ChevronRight } from 'lucide-react'
import type { MitreTechnique } from '@/types'

const TACTIC_BORDER_COLORS: Record<string, string> = {
  TA0001: 'border-t-blue-500',   TA0002: 'border-t-purple-500', TA0003: 'border-t-amber-500',
  TA0004: 'border-t-orange-500', TA0005: 'border-t-cyan-500',   TA0006: 'border-t-red-500',
  TA0007: 'border-t-lime-500',   TA0008: 'border-t-pink-500',   TA0009: 'border-t-teal-500',
  TA0010: 'border-t-rose-500',   TA0011: 'border-t-indigo-500',
}

export default function Mitre() {
  const { data: mitre, isLoading, load: loadMitre } = useMitreStore()
  const { data: alerts, load: loadAlerts } = useAlertStore()
  const [selectedTech, setSelectedTech] = useState<MitreTechnique | null>(null)

  useEffect(() => { loadMitre(); loadAlerts() }, [loadMitre, loadAlerts])

  const grouped = useMemo(() => {
    if (!mitre) return []
    const map = new Map<string, MitreTechnique[]>()
    mitre.tactics.forEach((t) => map.set(t.tactic_id, []))
    mitre.techniques.forEach((tech) => {
      const arr = map.get(tech.tactic_id)
      if (arr) arr.push(tech)
      else map.set(tech.tactic_id, [tech])
    })
    return mitre.tactics.map((t) => ({ tactic: t, techniques: map.get(t.tactic_id) ?? [] }))
  }, [mitre])

  const selectedAlerts = useMemo(() => {
    if (!selectedTech) return []
    return alerts.filter((a) => a.mitre_technique_ids?.includes(selectedTech.technique_id))
  }, [selectedTech, alerts])

  if (isLoading) return <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-3">{Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}</div>
  if (!mitre) return <div className="p-6"><EmptyState icon={<Target className="w-8 h-8" />} title="MITRE verisi yüklenemedi" /></div>

  return (
    <div className="p-6 space-y-4">
      {/* Summary */}
      <div>
        <h2 className="text-sm font-semibold">MITRE ATT&CK Kapsamı</h2>
        <p className="text-xs text-muted-foreground mt-1">
          {mitre.summary.covered_techniques}/{mitre.summary.total_techniques} teknik cover edildi
          <span className="mx-2">•</span>
          %{mitre.summary.coverage_percent} kapsam
          <span className="mx-2">•</span>
          {mitre.summary.total_observations} gözlem
        </p>
      </div>

      {/* Horizontal scroll matrix */}
      <div className="overflow-x-auto -mx-2 px-2">
        <div className="flex gap-3" style={{ minWidth: grouped.length * 170 }}>
          {grouped.map(({ tactic, techniques }) => (
            <div key={tactic.tactic_id} className="flex-shrink-0 w-40 flex flex-col">
              {/* Tactic header */}
              <div className={`rounded-t-lg border border-border bg-card px-2.5 py-2 border-t-2 ${TACTIC_BORDER_COLORS[tactic.tactic_id] ?? 'border-t-border'}`}>
                <div className="text-[10px] font-semibold leading-tight">{tactic.name}</div>
                <div className="text-[9px] text-muted-foreground mt-0.5">{tactic.technique_count} teknik</div>
              </div>
              {/* Technique cards */}
              <div className="flex-1 space-y-0.5 border-l border-r border-b border-border rounded-b-lg bg-muted/10 p-1">
                {techniques.length === 0 && <div className="text-[9px] text-muted-foreground p-2 text-center">—</div>}
                {techniques.map((tech) => (
                  <TechCard key={tech.technique_id} technique={tech} onClick={() => setSelectedTech(tech)} isSelected={selectedTech?.technique_id === tech.technique_id} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: accordion fallback */}
      <div className="lg:hidden space-y-2">
        {grouped.map(({ tactic, techniques }) => (
          <details key={tactic.tactic_id} className="rounded-lg border border-border bg-card">
            <summary className="px-3 py-2 text-xs font-semibold cursor-pointer hover:bg-accent transition-colors">{tactic.name} ({tactic.technique_count})</summary>
            <div className="px-3 pb-3 space-y-1">
              {techniques.map((tech) => <TechCard key={tech.technique_id} technique={tech} onClick={() => setSelectedTech(tech)} isSelected={selectedTech?.technique_id === tech.technique_id} />)}
            </div>
          </details>
        ))}
      </div>

      {/* Technique detail drawer */}
      {selectedTech && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedTech(null)} />
          <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-card border-l border-border shadow-2xl overflow-y-auto animate-slide-in-right" role="dialog" aria-modal="true" aria-label={selectedTech.name}>
            <div className="flex items-center justify-between h-14 px-4 border-b border-border sticky top-0 bg-card z-10">
              <div>
                <span className="font-mono text-[10px] text-primary">{selectedTech.technique_id}</span>
                <h3 className="text-sm font-semibold">{selectedTech.name}</h3>
              </div>
              <button onClick={() => setSelectedTech(null)} className="p-1 rounded hover:bg-accent" aria-label="Kapat"><X className="w-4 h-4" /></button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-[10px]">
                <div><span className="text-muted-foreground">Alert:</span> <span className="font-mono font-bold">{selectedTech.alert_count}</span></div>
                <div><span className="text-muted-foreground">Olay:</span> <span className="font-mono font-bold">{selectedTech.incident_ids.length}</span></div>
                <div className="col-span-2"><span className="text-muted-foreground">Cover:</span> {selectedTech.is_covered ? '✅ Var' : '❌ Yok'}</div>
              </div>

              <div>
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">İlgili Uyarılar ({selectedAlerts.length})</h4>
                {selectedAlerts.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground">Bu tekniğe bağlı uyarı yok.</p>
                ) : (
                  <div className="space-y-1.5">
                    {selectedAlerts.map((a) => (
                      <Link key={a.alert_id} to={`/alerts/${a.alert_id}`} onClick={() => setSelectedTech(null)} className="flex items-center justify-between p-2.5 rounded-lg border border-border hover:bg-accent transition-colors text-[10px]">
                        <div className="min-w-0">
                          <div className="font-medium truncate">{a.title}</div>
                          <div className="text-muted-foreground font-mono mt-0.5">{a.alert_id} • {new Date(a.detected_at).toLocaleDateString('tr-TR')}</div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <SeverityPill severity={a.severity} />
                          <ChevronRight className="w-3 h-3 text-muted-foreground" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {selectedTech.incident_ids.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Bağlı Olaylar</h4>
                  <div className="space-y-1">
                    {selectedTech.incident_ids.map((iid) => (
                      <Link key={iid} to={`/incidents/${iid}`} onClick={() => setSelectedTech(null)} className="flex items-center gap-1 text-[10px] font-mono text-primary hover:underline">{iid}</Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </>
      )}
    </div>
  )
}

const TechCard = memo(function TechCard({ technique, onClick, isSelected }: { technique: MitreTechnique; onClick: () => void; isSelected: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-2 py-1.5 rounded text-[9px] transition-colors border border-transparent ${
        technique.is_covered
          ? 'bg-card hover:bg-accent cursor-pointer'
          : 'opacity-40 cursor-default'
      } ${isSelected ? 'ring-1 ring-primary border-primary/30' : ''}`}
      disabled={!technique.is_covered}
      aria-label={`${technique.technique_id}: ${technique.name}`}
    >
      <div className="font-mono font-medium leading-tight">{technique.technique_id}</div>
      <div className="text-muted-foreground leading-tight mt-0.5">{technique.name}</div>
      {technique.alert_count > 0 && (
        <span className="inline-block mt-1 text-[8px] bg-primary/10 text-primary font-medium px-1 rounded">{technique.alert_count}</span>
      )}
    </button>
  )
})
