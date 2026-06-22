import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useIOCStore, useAlertStore } from '@/store'
import { SkeletonTable } from '@/components/ui/skeleton-card'
import { SeverityPill } from '@/components/ui/severity-pill'
import { EmptyState } from '@/components/ui/empty-state'
import { defang } from '@/lib/utils'
import { Shield, Copy, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import type { IOCType } from '@/types'

const IOC_TYPES: (IOCType | 'all')[] = ['all', 'domain', 'ip', 'url', 'hash', 'email']

export default function IOCs() {
  const { data: iocs, isLoading: iocLoading, load: loadIocs } = useIOCStore()
  const { data: alerts, load: loadAlerts } = useAlertStore()
  const [typeFilter, setTypeFilter] = useState<IOCType | 'all'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => { loadIocs(); loadAlerts() }, [loadIocs, loadAlerts])

  const filtered = useMemo(() => typeFilter === 'all' ? iocs : iocs.filter((i) => i.type === typeFilter), [iocs, typeFilter])

  const handleCopy = (value: string, type: string) => {
    navigator.clipboard.writeText(defang(value, type))
    toast('Kopyalandı (güvensizleştirilmiş)', { duration: 1500 })
  }

  if (iocLoading) return <div className="p-6"><SkeletonTable rows={12} /></div>

  return (
    <div className="p-6 space-y-4">
      {/* Type filter chips */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs text-muted-foreground mr-1">Tip:</span>
        {IOC_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => { setTypeFilter(t); setExpandedId(null) }}
            className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${typeFilter === t ? 'bg-primary/10 border-primary/30 text-primary font-medium' : 'border-border text-muted-foreground hover:bg-accent'}`}
            aria-pressed={typeFilter === t}
          >
            {t === 'all' ? 'Tümü' : t.toUpperCase()}
          </button>
        ))}
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} IOC</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Shield className="w-8 h-8" />} title="IOC bulunamadı" description="Bu tipte gösterge yok." />
      ) : (
        <div className="space-y-1.5">
          {filtered.map((ioc) => {
            const relatedAlerts = alerts.filter((a) => ioc.related_alert_ids.includes(a.alert_id))
            const isExpanded = expandedId === ioc.ioc_id
            const defanged = defang(ioc.value, ioc.type)
            return (
              <div key={ioc.ioc_id} className="rounded-lg border border-border bg-card overflow-hidden">
                {/* Main row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : ioc.ioc_id)}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-accent transition-colors"
                  aria-expanded={isExpanded}
                  aria-label={`${ioc.value} detayı`}
                >
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}

                  <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded shrink-0 w-12 text-center">{ioc.type.toUpperCase()}</span>

                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-xs truncate" title={defanged}>{defanged}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{ioc.label}</div>
                  </div>

                  <SeverityPill severity={ioc.severity} />

                  {/* Threat score bar */}
                  <div className="hidden sm:flex items-center gap-1.5 shrink-0 w-16">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${ioc.threat_score >= 80 ? 'bg-severity-critical' : ioc.threat_score >= 60 ? 'bg-severity-high' : ioc.threat_score >= 40 ? 'bg-severity-medium' : 'bg-severity-low'}`} style={{ width: `${ioc.threat_score}%` }} />
                    </div>
                    <span className="font-mono text-xs w-6 text-right">{ioc.threat_score}</span>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleCopy(ioc.value, ioc.type) }}
                    className="p-1 rounded hover:bg-accent transition-colors shrink-0"
                    aria-label="IOC değerini kopyala"
                  >
                    <Copy className="w-3 h-3 text-muted-foreground" />
                  </button>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-border px-3 py-3 bg-muted/10 space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div><span className="text-muted-foreground">Güven:</span> <span className="font-mono">%{ioc.confidence}</span></div>
                      <div><span className="text-muted-foreground">Kaynak:</span> <span>{ioc.source}</span></div>
                      <div><span className="text-muted-foreground">İlk Görülme:</span> <span>{new Date(ioc.first_seen).toLocaleDateString('tr-TR')}</span></div>
                      <div><span className="text-muted-foreground">Son Görülme:</span> <span>{new Date(ioc.last_seen).toLocaleDateString('tr-TR')}</span></div>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      {ioc.tags.map((t) => <span key={t} className="text-2xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{t}</span>)}
                    </div>
                    {ioc.description && <p className="text-xs text-muted-foreground">{ioc.description}</p>}

                    {/* Where seen */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Nerede Görüldü ({relatedAlerts.length} uyarı)
                      </h4>
                      {relatedAlerts.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Henüz bir uyarıyla ilişkilendirilmemiş.</p>
                      ) : (
                        <div className="space-y-1">
                          {relatedAlerts.map((a) => (
                            <Link key={a.alert_id} to={`/alerts/${a.alert_id}`} className="flex items-center justify-between p-2 rounded border border-border hover:bg-accent transition-colors text-xs">
                              <div className="min-w-0">
                                <span className="font-medium truncate block">{a.title}</span>
                                <span className="text-muted-foreground font-mono">{a.alert_id} • {new Date(a.detected_at).toLocaleDateString('tr-TR')}</span>
                              </div>
                              <SeverityPill severity={a.severity} />
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
