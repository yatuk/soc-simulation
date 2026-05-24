import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useAlertStore, useIOCStore, useMitreStore, useIncidentStore } from '@/store'
import { SkeletonCard } from '@/components/ui/skeleton-card'
import { SeverityPill } from '@/components/ui/severity-pill'
import { StatusPill } from '@/components/ui/status-pill'
import { EmptyState } from '@/components/ui/empty-state'
import { defang } from '@/lib/utils'
import { ArrowLeft, Shield, Target, ArrowUpRight, Copy, CheckCircle } from 'lucide-react'

export default function AlertDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: alerts, isLoading, load: loadAlerts } = useAlertStore()
  const { data: iocs, load: loadIocs } = useIOCStore()
  const { data: mitre, load: loadMitre } = useMitreStore()
  const { data: incidents, load: loadInc } = useIncidentStore()

  useEffect(() => {
    if (alerts.length === 0) loadAlerts()
    if (iocs.length === 0) loadIocs()
    if (!mitre) loadMitre()
    if (incidents.length === 0) loadInc()
  }, [])

  if (isLoading) return <div className="p-6 max-w-4xl"><SkeletonCard /></div>

  const alert = alerts.find((a) => a.alert_id === id)
  if (!alert) {
    return <div className="p-6 text-center text-muted-foreground">Uyarı bulunamadı. <Link to="/alerts" className="text-primary hover:underline">Listeye dön</Link></div>
  }

  const relatedIOCs = iocs.filter((ioc) => ioc.related_alert_ids.includes(alert.alert_id))
  const relatedIncident = alert.incident_id ? incidents.find((i) => i.incident_id === alert.incident_id) : null
  const techniqueDetails = (alert.mitre_technique_ids ?? []).map((tid) => {
    const tech = mitre?.techniques.find((t) => t.technique_id === tid)
    return { id: tid, name: tech?.name ?? tid, tactic: tech?.tactic_id ?? '' }
  })

  const handlePromoteToIncident = () => {
    const newIncidentId = `INC-PROMO-${Date.now()}`
    toast.success(`${alert.alert_id}, ${newIncidentId} olayına yükseltildi.`, {
      description: 'Kurgusal işlem — veri refresh edilince sıfırlanır.',
      duration: 4000,
    })
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast('Kopyalandı (defanged)', { duration: 1500 })
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Back + Actions */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Link to="/alerts" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3 h-3" /> Uyarılara dön
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePromoteToIncident}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/30 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
            aria-label="Uyarıyı olaya yükselt"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            Olaya Yükselt
          </button>
        </div>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <SeverityPill severity={alert.severity} />
          <StatusPill status={alert.status} />
          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">{alert.confidence}% güven</span>
        </div>
        <h1 className="text-lg font-bold">{alert.title}</h1>
        <p className="text-xs text-muted-foreground font-mono mt-1">{alert.alert_id}</p>
      </div>

      {/* Metadata grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Meta label="Kaynak" value={alert.source} mono />
        <Meta label="Tespit" value={new Date(alert.detected_at).toLocaleString('tr-TR')} />
        {alert.source_ip && <Meta label="Kaynak IP" value={alert.source_ip} mono />}
        {relatedIncident && (
          <div className="text-xs">
            <span className="text-muted-foreground">Olay</span><br />
            <Link to={`/incidents/${relatedIncident.incident_id}`} className="font-mono text-primary hover:underline">{relatedIncident.incident_id}</Link>
          </div>
        )}
      </div>

      {/* Description */}
      <section>
        <SectionTitle icon={Shield}>Açıklama</SectionTitle>
        <p className="text-sm leading-relaxed">{alert.description}</p>
      </section>

      {/* Evidence */}
      <section>
        <SectionTitle icon={Shield}>Kanıt Özeti</SectionTitle>
        <p className="text-sm text-muted-foreground leading-relaxed bg-muted/20 rounded-lg p-3 border border-border">{alert.evidence_summary}</p>
      </section>

      {/* MITRE Techniques */}
      {techniqueDetails.length > 0 && (
        <section>
          <SectionTitle icon={Target}>MITRE ATT&CK</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {techniqueDetails.map((t) => (
              <div key={t.id} className="flex items-start gap-2 p-3 rounded-lg border border-border bg-card">
                <Target className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                <div>
                  <div className="font-mono text-[10px] font-medium">{t.id}</div>
                  <div className="text-xs">{t.name}</div>
                  <div className="text-[10px] text-muted-foreground">{t.tactic}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related IOCs */}
      {relatedIOCs.length > 0 && (
        <section>
          <SectionTitle icon={Shield}>İlgili IOC'ler</SectionTitle>
          <div className="space-y-1">
            {relatedIOCs.map((ioc) => {
              const defanged = defang(ioc.value, ioc.type)
              return (
                <div key={ioc.ioc_id} className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-[10px] bg-muted px-1 py-0.5 rounded shrink-0">{ioc.type.toUpperCase()}</span>
                    <span className="font-mono text-[10px] truncate" title={defanged}>{defanged}</span>
                    <SeverityPill severity={ioc.severity} />
                  </div>
                  <button
                    onClick={() => handleCopy(defanged)}
                    className="p-1 rounded hover:bg-accent transition-colors shrink-0"
                    aria-label="IOC değerini kopyala"
                  >
                    <Copy className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Recommended Actions */}
      {alert.recommended_actions.length > 0 && (
        <section>
          <SectionTitle icon={CheckCircle}>Önerilen Aksiyonlar</SectionTitle>
          <ul className="space-y-2">
            {alert.recommended_actions.map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                {action}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function SectionTitle({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3"><Icon className="w-3.5 h-3.5" aria-hidden="true" />{children}</h3>
}

function Meta({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="text-xs">
      <span className="text-muted-foreground">{label}</span><br />
      <span className={mono ? 'font-mono' : ''}>{value}</span>
    </div>
  )
}
