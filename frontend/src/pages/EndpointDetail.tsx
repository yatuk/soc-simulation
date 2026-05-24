import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAssetStore, useUserStore } from '@/store'
import { SkeletonCard } from '@/components/ui/skeleton-card'
import { StatusPill } from '@/components/ui/status-pill'
import { ArrowLeft, Monitor } from 'lucide-react'

export default function EndpointDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: assets, isLoading, load: loadAssets } = useAssetStore()
  const { data: users, load: loadUsers } = useUserStore()

  useEffect(() => {
    if (assets.length === 0) loadAssets()
    if (users.length === 0) loadUsers()
  }, [assets.length, users.length, loadAssets, loadUsers])

  if (isLoading) return <div className="p-6"><SkeletonCard /></div>

  const asset = assets.find((a) => a.asset_id === id)
  if (!asset) return <div className="p-6 text-muted-foreground text-center">Cihaz bulunamadı. <Link to="/endpoints" className="text-primary hover:underline">Listeye dön</Link></div>

  const owner = users.find((u) => u.user_id === asset.owner_user_id)

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <Link to="/endpoints" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-3 h-3" /> Cihazlara dön
      </Link>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <Monitor className="w-4 h-4 text-muted-foreground" />
          <StatusPill status={asset.isolation_status} />
        </div>
        <h1 className="text-lg font-bold">{asset.hostname}</h1>
        <p className="text-xs text-muted-foreground font-mono mt-1">{asset.asset_id}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-lg border border-border"><span className="text-muted-foreground">İşletim Sistemi:</span><br /><span className="font-medium">{asset.os}</span></div>
        <div className="p-3 rounded-lg border border-border"><span className="text-muted-foreground">Tip:</span><br /><span className="font-medium">{asset.type}</span></div>
        <div className="p-3 rounded-lg border border-border"><span className="text-muted-foreground">Konum:</span><br /><span className="font-medium">{asset.location}</span></div>
        <div className="p-3 rounded-lg border border-border"><span className="text-muted-foreground">Kullanıcı:</span><br /><span className="font-medium">{owner?.display_name ?? asset.owner_user_id}</span></div>
        <div className="p-3 rounded-lg border border-border"><span className="text-muted-foreground">Risk Skoru:</span><br /><span className="font-mono font-bold text-lg">{asset.risk_score}</span></div>
        <div className="p-3 rounded-lg border border-border"><span className="text-muted-foreground">Açık Uyarı:</span><br /><span className="font-mono font-bold text-lg">{asset.open_alert_count}</span></div>
      </div>

      {asset.recent_processes.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Son İşlemler</h3>
          <div className="space-y-1">
            {asset.recent_processes.map((p, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded border border-border text-xs">
                <span className="font-mono text-[10px]">{p.process_name}</span>
                {p.parent_process_name && <span className="text-muted-foreground text-[10px]">← {p.parent_process_name}</span>}
                {p.is_suspicious && <span className="text-severity-critical text-[10px] ml-auto">şüpheli</span>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
