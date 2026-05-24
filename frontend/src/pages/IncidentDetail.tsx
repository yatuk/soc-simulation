import { useEffect, useState, Suspense, lazy } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useIncidentStore, useAlertStore, usePlaybookRunStore } from '@/store'
import { SkeletonCard } from '@/components/ui/skeleton-card'
import { SeverityPill } from '@/components/ui/severity-pill'
import { StatusPill } from '@/components/ui/status-pill'
import { EmptyState } from '@/components/ui/empty-state'
import { ArrowLeft, Lock, Play, CheckCircle, Target, FileSearch, Share2, Shield } from 'lucide-react'

const InvestigationGraph = lazy(() => import('@/components/features/investigation/InvestigationGraph'))

export default function IncidentDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: incidents, isLoading, load: loadInc } = useIncidentStore()
  const { data: alerts, load: loadAlerts } = useAlertStore()
  const { data: runs, load: loadRuns } = usePlaybookRunStore()

  useEffect(() => {
    if (incidents.length === 0) loadInc()
    if (alerts.length === 0) loadAlerts()
    if (runs.length === 0) loadRuns()
  }, [])

  if (isLoading) return <div className="p-6 max-w-5xl"><SkeletonCard /></div>

  const incident = incidents.find((i) => i.incident_id === id)
  if (!incident) return <div className="p-6 text-center text-muted-foreground">Olay bulunamadı. <Link to="/incidents" className="text-primary hover:underline">Listeye dön</Link></div>

  const [activeTab, setActiveTab] = useState<'timeline' | 'graph'>('timeline')
  const linkedAlerts = alerts.filter((a) => incident.alert_ids.includes(a.alert_id))
  const linkedRuns = runs.filter((r) => incident.playbook_run_ids.includes(r.run_id))

  const handleLockAccount = () => toast.success(`${incident.affected_user_ids.length} hesap kilitlendi.`, { description: 'Kurgusal işlem — session içinde geçerli.', duration: 3000 })
  const handleRunPlaybook = () => toast('Playbook çalıştırıldı.', { description: `Olay #${incident.incident_id} için otomatik yanıt başlatıldı.`, duration: 3000 })
  const handleCloseIncident = () => toast.success('Olay kapatıldı.', { description: 'Durum "closed" olarak işaretlendi.', duration: 3000 })

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Back + Actions */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Link to="/incidents" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3 h-3" /> Olaylara dön
        </Link>
        <div className="flex items-center gap-1.5 flex-wrap">
          <ActionBtn icon={Lock} label="Hesapları Kilitle" onClick={handleLockAccount} />
          <ActionBtn icon={Play} label="Playbook Çalıştır" onClick={handleRunPlaybook} variant="secondary" />
          <ActionBtn icon={CheckCircle} label="Olayı Kapat" onClick={handleCloseIncident} variant="secondary" />
        </div>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <SeverityPill severity={incident.severity} />
          <StatusPill status={incident.status} />
          <span className="text-[10px] text-muted-foreground">{linkedAlerts.length} uyarı • {linkedRuns.length} playbook run</span>
        </div>
        <h1 className="text-lg font-bold">{incident.title}</h1>
        <p className="text-xs text-muted-foreground font-mono mt-1">{incident.incident_id}</p>
      </div>

      {/* Narrative */}
      <section className="bg-card rounded-lg border border-border p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Olay Hikayesi</h3>
        <p className="text-sm text-muted-foreground mb-3">{incident.summary}</p>
        <div className="text-sm leading-relaxed whitespace-pre-line text-foreground/90">{incident.narrative}</div>
      </section>

      {/* Tabs: Timeline | Investigation Graph */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button onClick={() => setActiveTab('timeline')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeTab === 'timeline' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'}`}>
          <Target className="w-3.5 h-3.5 inline mr-1" />Kill Chain
        </button>
        <button onClick={() => setActiveTab('graph')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeTab === 'graph' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'}`}>
          <Share2 className="w-3.5 h-3.5 inline mr-1" />Investigation Graph
        </button>
      </div>

      {activeTab === 'graph' ? (
        <Suspense fallback={<div className="h-64 rounded-lg bg-muted animate-pulse" />}>
          <InvestigationGraph incident={incident} />
        </Suspense>
      ) : (
        <>
      {/* Kill Chain Timeline */}
      {incident.kill_chain_steps.length > 0 && (
        <section>
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            <Target className="w-3.5 h-3.5" /> Saldırı Zinciri (Kill Chain)
          </h3>
          <div className="relative pl-8">
            {incident.kill_chain_steps.map((step, i) => {
              const stepAlert = step.alert_id ? alerts.find((a) => a.alert_id === step.alert_id) : null
              const isLast = i === incident.kill_chain_steps.length - 1
              return (
                <div key={step.step_id} className="relative pb-6 last:pb-0">
                  {/* Connector line */}
                  {!isLast && <div className="absolute left-[-17px] top-4 bottom-0 w-px border-l border-dashed border-border" />}
                  {/* Dot */}
                  <div className={`absolute left-[-21px] top-1.5 w-[9px] h-[9px] rounded-full border-2 ${step.status === 'completed' ? 'bg-primary border-primary' : step.status === 'in_progress' ? 'bg-amber-500 border-amber-500 animate-pulse' : 'bg-muted border-border'}`} />
                  {/* Card */}
                  <div className="p-3 rounded-lg border border-border bg-card">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="text-xs font-semibold">{step.tactic}</span>
                      <span className="font-mono text-[10px] bg-muted px-1 rounded">{step.technique_id}</span>
                      <StatusPill status={step.status} />
                      <span className="text-[10px] text-muted-foreground font-mono ml-auto">{new Date(step.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                    {stepAlert && (
                      <Link to={`/alerts/${step.alert_id}`} className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline mt-2">
                        {step.alert_id}: {stepAlert.title}
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Playbook Runs */}
      {linkedRuns.length > 0 && (
        <section>
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            <Play className="w-3.5 h-3.5" /> SOAR Playbook Run'ları
          </h3>
          <div className="space-y-2">
            {linkedRuns.map((r) => (
              <div key={r.run_id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px]">{r.run_id}</span>
                    <StatusPill status={r.status} />
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">Süre: {r.duration_seconds}s • {r.triggered_by} tarafından</div>
                </div>
                <Link to={`/playbooks/${r.playbook_id}`} className="text-[10px] text-primary hover:underline shrink-0">Detay</Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Linked Alerts */}
      <section>
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          <FileSearch className="w-3.5 h-3.5" /> Bağlı Uyarılar ({linkedAlerts.length})
        </h3>
        {linkedAlerts.length === 0 ? (
          <EmptyState icon={<FileSearch className="w-5 h-5" />} title="Bağlı uyarı yok" />
        ) : (
          <div className="space-y-2">
            {linkedAlerts.map((a) => (
              <Link key={a.alert_id} to={`/alerts/${a.alert_id}`} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition-colors">
                <div className="min-w-0">
                  <div className="text-xs font-medium truncate">{a.title}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">{a.alert_id} • {new Date(a.detected_at).toLocaleDateString('tr-TR')}</div>
                </div>
                <SeverityPill severity={a.severity} />
              </Link>
            ))}
          </div>
        )}
      </section>

        </>
      )}

      {/* Metadata */}
      {/* Actor cross-reference */}
      <ThreatActorMatches incidentId={incident.incident_id} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs p-4 rounded-lg border border-border bg-card">
        <Meta label="Atanan" value={incident.assignee ?? '—'} />
        <Meta label="Oluşturma" value={new Date(incident.created_at).toLocaleString('tr-TR')} />
        <Meta label="Son Güncelleme" value={new Date(incident.updated_at).toLocaleString('tr-TR')} />
        <Meta label="Çözüm" value={incident.resolved_at ? new Date(incident.resolved_at).toLocaleString('tr-TR') : '—'} />
        <Meta label="Etkilenen Kullanıcı" value={`${incident.affected_user_ids.length} kişi`} />
        <Meta label="Etkilenen Cihaz" value={`${incident.affected_asset_ids.length} cihaz`} />
      </div>
    </div>
  )
}

function ActionBtn({ icon: Icon, label, onClick, variant }: { icon: React.ComponentType<{ className?: string }>; label: string; onClick: () => void; variant?: 'secondary' }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-medium border transition-colors ${
        variant === 'secondary'
          ? 'border-border text-muted-foreground hover:bg-accent hover:text-foreground'
          : 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20'
      }`}
      aria-label={label}
    >
      <Icon className="w-3 h-3" />{label}
    </button>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return <div><span className="text-muted-foreground">{label}</span><br /><span className="font-medium">{value}</span></div>
}

function ThreatActorMatches({ incidentId }: { incidentId: string }) {
  const [actors, setActors] = useState<Array<Record<string,unknown>>>([])
  useEffect(() => {
    import('@/lib/data').then(m => m.loadEntity<Array<Record<string,unknown>>>('threat_actors.json').then(setActors))
  }, [])
  const matches = actors.filter(a => {
    const mi = (a.matched_incidents as Array<Record<string,unknown>>|undefined)
    return mi?.some((m: Record<string,unknown>) => m.incident_id === incidentId)
  })
  if (matches.length === 0 || actors.length === 0) return null
  return (
    <section>
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        <Shield className="w-3.5 h-3.5" /> Olası Aktör Eşleşmeleri
      </h3>
      <div className="space-y-2">
        {matches.map(a => {
          const m = ((a.matched_incidents as Array<Record<string,unknown>>) ?? []).find((mi: Record<string,unknown>) => mi.incident_id === incidentId) as Record<string,unknown> | undefined
          return (
            <Link key={a.id as string} to={`/threat-actors/${a.id}`} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors text-xs">
              <span className="font-bold">{a.name as string}</span>
              <div className="flex items-center gap-2 flex-1">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-32">
                  <div className="h-full bg-primary rounded-full" style={{width:`${m?.ttp_overlap_percent ?? 0}%`}}/>
                </div>
                <span className="font-mono text-[10px]">%{String(m?.ttp_overlap_percent ?? 0)}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">→</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
