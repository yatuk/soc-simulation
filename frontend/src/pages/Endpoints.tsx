import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useAssetStore } from '@/store'
import { SkeletonTable } from '@/components/ui/skeleton-card'
import { EmptyState } from '@/components/ui/empty-state'
import { PivotLink } from '@/components/ui/pivot-link'
import { Wifi, WifiOff, Monitor, ShieldBan, ShieldCheck } from 'lucide-react'
import type { AssetType } from '@/types'

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  workstation: Monitor, laptop: Monitor, server: Monitor, mobile: Monitor, other: Monitor,
}

export default function Endpoints() {
  const { data: assets, isLoading, load } = useAssetStore()
  const [typeFilter, setTypeFilter] = useState<AssetType | 'all'>('all')

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => typeFilter === 'all' ? assets : assets.filter((a) => a.type === typeFilter), [assets, typeFilter])

  const handleIsolate = (hostname: string) => toast.success(`${hostname} izole edildi.`, { description: 'Simüle EDR işlemi.', duration: 2500 })
  const handleRestore = (hostname: string) => toast(`${hostname} izolasyonu kaldırıldı.`, { description: 'Simüle EDR işlemi.', duration: 2500 })

  if (isLoading) return <div className="p-6"><SkeletonTable rows={12} /></div>

  return (
    <div className="p-6 space-y-4">
      {/* Type filter */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs text-muted-foreground mr-1">Tip:</span>
        {(['all', 'workstation', 'laptop', 'server', 'mobile'] as const).map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)} className={`px-2 py-1 rounded-md text-xs border transition-colors ${typeFilter === t ? 'bg-primary/10 border-primary/30 text-primary font-medium' : 'border-border text-muted-foreground hover:bg-accent'}`} aria-pressed={typeFilter === t}>
            {t === 'all' ? 'Tümü' : t === 'workstation' ? 'Workstation' : t === 'laptop' ? 'Laptop' : t === 'server' ? 'Sunucu' : 'Mobil'}
          </button>
        ))}
        <span className="text-xs text-muted-foreground ml-auto">
          {assets.filter((a) => a.isolation_status === 'isolated').length} izole / {filtered.length} cihaz
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Monitor className="w-8 h-8" />} title="Cihaz bulunamadı" />
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-xs">
            <thead className="sticky top-0 z-10 bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Hostname</th>
                <th className="text-left px-3 py-2 font-medium hidden sm:table-cell">OS</th>
                <th className="text-left px-3 py-2 font-medium hidden md:table-cell">Konum</th>
                <th className="text-left px-3 py-2 font-medium">Risk</th>
                <th className="text-left px-3 py-2 font-medium">Durum</th>
                <th className="text-left px-3 py-2 font-medium">Aksiyon</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ast) => {
                const Icon = TYPE_ICONS[ast.type] ?? Monitor
                return (
                  <tr key={ast.asset_id} className="border-b border-border last:border-0 even:bg-muted/5 hover:bg-muted/30 transition-colors cursor-pointer">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3 h-3 text-muted-foreground shrink-0" />
                        <PivotLink to={`/alerts?asset=${ast.asset_id}`} className="font-mono text-xs font-medium">{ast.hostname}</PivotLink>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground hidden sm:table-cell text-xs">{ast.os}</td>
                    <td className="px-3 py-2 text-muted-foreground hidden md:table-cell text-xs">{ast.location}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-10 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${ast.risk_score >= 70 ? 'bg-severity-critical' : ast.risk_score >= 40 ? 'bg-severity-medium' : 'bg-severity-low'}`} style={{ width: `${ast.risk_score}%` }} />
                        </div>
                        <span className="font-mono text-xs">{ast.risk_score}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {ast.isolation_status === 'isolated' ? (
                        <span className="inline-flex items-center gap-1 text-severity-critical text-xs font-medium"><WifiOff className="w-3 h-3" />İzole</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-severity-low text-xs"><Wifi className="w-3 h-3" />Açık</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {ast.isolation_status === 'isolated' ? (
                        <button onClick={() => handleRestore(ast.hostname)} className="inline-flex items-center gap-1 text-2xs px-1.5 py-0.5 rounded border border-border hover:bg-accent transition-colors" aria-label="İzolasyonu kaldır">
                          <ShieldCheck className="w-3 h-3" />Kaldır
                        </button>
                      ) : (
                        <button onClick={() => handleIsolate(ast.hostname)} className="inline-flex items-center gap-1 text-2xs px-1.5 py-0.5 rounded border border-severity-critical/30 text-severity-critical hover:bg-severity-critical/10 transition-colors" aria-label="Cihazı izole et">
                          <ShieldBan className="w-3 h-3" />İzole
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
