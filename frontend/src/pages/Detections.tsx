import { useEffect } from 'react'
import { useDetectionStore } from '@/store'
import { SkeletonTable } from '@/components/ui/skeleton-card'
import { SeverityPill } from '@/components/ui/severity-pill'
import { EmptyState } from '@/components/ui/empty-state'
import { Crosshair } from 'lucide-react'

export default function Detections() {
  const { data: rules, isLoading, load } = useDetectionStore()

  useEffect(() => { load() }, [load])

  if (isLoading) return <div className="p-6"><SkeletonTable rows={8} /></div>

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Sigma Kuralları ({rules.length})</h2>
      </div>

      {rules.length === 0 ? (
        <EmptyState icon={<Crosshair className="w-8 h-8" />} title="Kural bulunamadı" />
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div key={rule.rule_id} className="p-4 rounded-lg border border-border hover:bg-accent transition-colors">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] text-muted-foreground">{rule.rule_id}</span>
                    <SeverityPill severity={rule.severity} />
                    {!rule.enabled && <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">Devre Dışı</span>}
                  </div>
                  <h3 className="text-sm font-medium">{rule.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{rule.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[10px] text-muted-foreground flex-wrap">
                <span>Kaynak: <span className="font-mono">{rule.source}</span></span>
                <span>14g uyarı: <span className="font-mono">{rule.alert_count_14d}</span></span>
                <span>FP oranı: <span className="font-mono">%{rule.false_positive_rate}</span></span>
                <span>Yazar: {rule.author}</span>
              </div>

              {rule.mitre_technique_ids.length > 0 && (
                <div className="flex items-center gap-1 mt-2 flex-wrap">
                  {rule.mitre_technique_ids.map((tid) => (
                    <span key={tid} className="text-[10px] font-mono bg-muted px-1 rounded">{tid}</span>
                  ))}
                </div>
              )}

              <details className="mt-3">
                <summary className="text-[10px] text-muted-foreground cursor-pointer hover:text-foreground transition-colors">Sigma Kuralını Göster</summary>
                <pre className="mt-2 p-3 bg-muted/30 rounded text-[10px] font-mono overflow-x-auto whitespace-pre-wrap border border-border">
                  {rule.sigma_rule}
                </pre>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
