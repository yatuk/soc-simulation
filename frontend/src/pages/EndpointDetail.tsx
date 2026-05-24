import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useAssetStore, useUserStore } from '@/store'
import { SkeletonCard } from '@/components/ui/skeleton-card'
import { StatusPill } from '@/components/ui/status-pill'
import { ArrowLeft, Monitor, ShieldBan, ShieldCheck, Zap, Cpu, Globe, AlertTriangle } from 'lucide-react'

export default function EndpointDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: assets, isLoading, load: loadAssets } = useAssetStore()
  const { data: users, load: loadUsers } = useUserStore()

  useEffect(() => {
    if (assets.length === 0) loadAssets()
    if (users.length === 0) loadUsers()
  }, [])

  if (isLoading) return <div className="p-6 max-w-4xl"><SkeletonCard /></div>

  const asset = assets.find((a) => a.asset_id === id)
  if (!asset) return <div className="p-6 text-muted-foreground text-center">Cihaz bulunamadı. <Link to="/endpoints" className="text-primary hover:underline">Listeye dön</Link></div>

  const owner = users.find((u) => u.user_id === asset.owner_user_id)

  const handleIsolate = () => toast.success(`${asset.hostname} izole edildi.`, { description: 'Kurgusal EDR aksiyonu — cihaz ağdan izole edildi.', duration: 3000 })
  const handleRestore = () => toast(`${asset.hostname} izolasyonu kaldırıldı.`, { description: 'Kurgusal EDR aksiyonu.', duration: 3000 })

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Link to="/endpoints" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3 h-3" /> Cihazlara dön
        </Link>
        {asset.isolation_status === 'isolated' ? (
          <button onClick={handleRestore} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs hover:bg-accent transition-colors"><ShieldCheck className="w-3.5 h-3.5" />İzolasyonu Kaldır</button>
        ) : (
          <button onClick={handleIsolate} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-severity-critical/10 border border-severity-critical/30 text-severity-critical text-xs font-medium hover:bg-severity-critical/20 transition-colors"><ShieldBan className="w-3.5 h-3.5" />Cihazı İzole Et</button>
        )}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <Monitor className="w-4 h-4 text-muted-foreground" />
          <StatusPill status={asset.isolation_status} />
        </div>
        <h1 className="text-lg font-bold">{asset.hostname}</h1>
        <p className="text-xs text-muted-foreground font-mono mt-1">{asset.asset_id}</p>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <InfoCard icon={Cpu} label="İşletim Sistemi" value={asset.os} />
        <InfoCard icon={Monitor} label="Tip" value={asset.type} />
        <InfoCard icon={Globe} label="Konum" value={asset.location} />
        <InfoCard icon={Monitor} label="Kullanıcı" value={owner?.display_name ?? asset.owner_user_id} />
        <InfoCard icon={AlertTriangle} label="Risk Skoru" value={String(asset.risk_score)} mono highlight />
        <InfoCard icon={Zap} label="Açık Uyarı" value={String(asset.open_alert_count)} mono />
        <InfoCard icon={Globe} label="İlk Görülme" value={new Date(asset.first_seen).toLocaleDateString('tr-TR')} />
        <InfoCard icon={Globe} label="Son Görülme" value={new Date(asset.last_seen).toLocaleDateString('tr-TR')} />
      </div>

      {/* Process Tree */}
      {asset.recent_processes.length > 0 && (
        <section>
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3"><Cpu className="w-3.5 h-3.5" />İşlem Ağacı</h3>
          <div className="space-y-0">
            {asset.recent_processes.map((p, i) => (
              <div key={i} className="relative pl-6 pb-3 last:pb-0">
                {i < asset.recent_processes.length - 1 && <div className="absolute left-[7px] top-4 bottom-0 w-px border-l border-dashed border-border" />}
                <div className={`absolute left-[3px] top-1.5 w-[9px] h-[9px] rounded-full border-2 ${p.is_suspicious ? 'bg-severity-critical border-severity-critical' : 'bg-primary border-primary'}`} />
                <div className={`p-2.5 rounded-lg border ${p.is_suspicious ? 'border-severity-critical/30 bg-severity-critical/5' : 'border-border bg-card'}`}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] font-semibold">{p.process_name}</span>
                    {p.pid && <span className="text-[9px] text-muted-foreground font-mono">PID {p.pid}</span>}
                    {p.is_suspicious && <span className="text-[9px] text-severity-critical font-medium ml-auto">ŞÜPHELİ</span>}
                  </div>
                  {p.parent_process_name && (
                    <div className="text-[9px] text-muted-foreground mt-1">
                      <span className="text-muted-foreground">Parent: </span>
                      <span className="font-mono">{p.parent_process_name}</span>
                    </div>
                  )}
                  {p.command_line && <div className="text-[9px] text-muted-foreground mt-0.5 font-mono truncate">{p.command_line}</div>}
                  {p.file_hash && <div className="text-[9px] text-muted-foreground mt-0.5 font-mono">SHA256: {p.file_hash}</div>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Network Connections */}
      {asset.recent_network_connections.length > 0 && (
        <section>
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3"><Globe className="w-3.5 h-3.5" />Ağ Bağlantıları</h3>
          <div className="space-y-1.5">
            {asset.recent_network_connections.map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-card text-[10px]">
                <span className="font-mono shrink-0">{c.protocol}</span>
                <span className="font-mono text-muted-foreground">{c.domain ?? c.dst_ip ?? '—'}</span>
                {c.port && <span className="text-muted-foreground font-mono">:{c.port}</span>}
                {c.is_suspicious && <span className="text-severity-critical font-medium ml-auto">ŞÜPHELİ</span>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function InfoCard({ icon: Icon, label, value, mono, highlight }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div className="p-3 rounded-lg border border-border bg-card">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1"><Icon className="w-3 h-3" /><span className="text-[10px]">{label}</span></div>
      <span className={`${highlight ? 'font-bold text-base' : 'font-medium'} ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}
