import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAlertStore } from '@/store'
import { SkeletonCard } from '@/components/ui/skeleton-card'
import { SeverityPill } from '@/components/ui/severity-pill'
import { StatusPill } from '@/components/ui/status-pill'
import { ArrowLeft } from 'lucide-react'

export default function AlertDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: alerts, isLoading, load } = useAlertStore()

  useEffect(() => { if (alerts.length === 0) load() }, [alerts.length, load])

  if (isLoading) return <div className="p-6"><SkeletonCard /></div>

  const alert = alerts.find((a) => a.alert_id === id)
  if (!alert) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Uyarı bulunamadı. <Link to="/alerts" className="text-primary hover:underline">Listeye dön</Link>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <Link to="/alerts" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-3 h-3" /> Uyarılara dön
      </Link>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <SeverityPill severity={alert.severity} />
          <StatusPill status={alert.status} />
        </div>
        <h1 className="text-lg font-bold">{alert.title}</h1>
        <p className="text-xs text-muted-foreground font-mono mt-1">{alert.alert_id}</p>
      </div>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Açıklama</h3>
        <p className="text-sm">{alert.description}</p>
      </section>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Kanıt Özeti</h3>
        <p className="text-sm text-muted-foreground">{alert.evidence_summary}</p>
      </section>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Önerilen Aksiyonlar</h3>
        <ul className="space-y-1">
          {alert.recommended_actions.map((action, i) => (
            <li key={i} className="text-sm flex items-start gap-2">
              <span className="text-primary mt-1">•</span> {action}
            </li>
          ))}
        </ul>
      </section>

      <div className="grid grid-cols-2 gap-4 text-xs">
        <div><span className="text-muted-foreground">Kaynak:</span> <span className="font-mono">{alert.source}</span></div>
        <div><span className="text-muted-foreground">Güven:</span> %{alert.confidence}</div>
        <div><span className="text-muted-foreground">Tespit:</span> {new Date(alert.detected_at).toLocaleString('tr-TR')}</div>
        {alert.source_ip && <div><span className="text-muted-foreground">IP:</span> <span className="font-mono">{alert.source_ip}</span></div>}
        {alert.incident_id && (
          <div className="col-span-2">
            <span className="text-muted-foreground">Olay:</span>{' '}
            <Link to={`/incidents/${alert.incident_id}`} className="text-primary hover:underline font-mono">{alert.incident_id}</Link>
          </div>
        )}
      </div>
    </div>
  )
}
