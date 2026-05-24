import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useIncidentStore, useAlertStore } from '@/store'
import { SkeletonCard } from '@/components/ui/skeleton-card'
import { SeverityPill } from '@/components/ui/severity-pill'
import { StatusPill } from '@/components/ui/status-pill'
import { ArrowLeft, ChevronRight } from 'lucide-react'

export default function IncidentDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: incidents, isLoading, load: loadInc } = useIncidentStore()
  const { data: alerts, load: loadAlerts } = useAlertStore()

  useEffect(() => {
    if (incidents.length === 0) loadInc()
    if (alerts.length === 0) loadAlerts()
  }, [incidents.length, alerts.length, loadInc, loadAlerts])

  if (isLoading) return <div className="p-6"><SkeletonCard /></div>

  const incident = incidents.find((i) => i.incident_id === id)
  if (!incident) {
    return <div className="p-6 text-center text-muted-foreground">Olay bulunamadı. <Link to="/incidents" className="text-primary hover:underline">Listeye dön</Link></div>
  }

  const linkedAlerts = alerts.filter((a) => incident.alert_ids.includes(a.alert_id))

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <Link to="/incidents" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-3 h-3" /> Olaylara dön
      </Link>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <SeverityPill severity={incident.severity} />
          <StatusPill status={incident.status} />
        </div>
        <h1 className="text-lg font-bold">{incident.title}</h1>
        <p className="text-xs text-muted-foreground font-mono mt-1">{incident.incident_id}</p>
      </div>

      {/* Narrative */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Olay Özeti</h3>
        <p className="text-sm text-muted-foreground">{incident.summary}</p>
        <div className="mt-3 text-sm leading-relaxed whitespace-pre-line bg-muted/30 rounded-lg p-4 border border-border">
          {incident.narrative}
        </div>
      </section>

      {/* Kill Chain */}
      {incident.kill_chain_steps.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Saldırı Zinciri (Kill Chain)</h3>
          <div className="space-y-0">
            {incident.kill_chain_steps.map((step) => (
              <div key={step.step_id} className="flex items-start gap-3 py-2 border-l-2 border-border pl-4 relative">
                <div className="absolute -left-[5px] top-3 w-2 h-2 rounded-full bg-primary" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium">{step.tactic}</span>
                    <span className="text-[10px] font-mono bg-muted px-1 rounded">{step.technique_id}</span>
                    <StatusPill status={step.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                  {step.alert_id && (
                    <Link to={`/alerts/${step.alert_id}`} className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline mt-1">
                      {step.alert_id} <ChevronRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Linked Alerts */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Bağlı Uyarılar ({linkedAlerts.length})
        </h3>
        <div className="space-y-2">
          {linkedAlerts.map((a) => (
            <Link
              key={a.alert_id}
              to={`/alerts/${a.alert_id}`}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <div>
                <div className="text-xs font-medium">{a.title}</div>
                <div className="text-[10px] text-muted-foreground font-mono">{a.alert_id}</div>
              </div>
              <SeverityPill severity={a.severity} />
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 text-xs">
        <div><span className="text-muted-foreground">Atanan:</span> {incident.assignee ?? '—'}</div>
        <div><span className="text-muted-foreground">Oluşturma:</span> {new Date(incident.created_at).toLocaleString('tr-TR')}</div>
        <div><span className="text-muted-foreground">Güncelleme:</span> {new Date(incident.updated_at).toLocaleString('tr-TR')}</div>
        {incident.resolved_at && <div><span className="text-muted-foreground">Çözüm:</span> {new Date(incident.resolved_at).toLocaleString('tr-TR')}</div>}
      </div>
    </div>
  )
}
