import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAssetStore } from '@/store'
import { SkeletonTable } from '@/components/ui/skeleton-card'
import { Wifi, WifiOff } from 'lucide-react'

const osIcons: Record<string, string> = {
  'Windows 11 Pro': '⊞',
  'Windows 10 Pro': '⊞',
  'Windows 11 Enterprise': '⊞',
  'Windows 10 LTSC': '⊞',
  'Windows Server 2022': '⬡',
  'macOS 14 Sonoma': '',
  'Ubuntu 22.04 LTS': '',
  'iOS 17': '',
  'Android 14': '',
  'Embedded Linux': '',
}

export default function Endpoints() {
  const { data: assets, isLoading, load } = useAssetStore()

  useEffect(() => { load() }, [load])

  if (isLoading) return <div className="p-6"><SkeletonTable rows={10} /></div>

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Cihazlar ({assets.length})</h2>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Hostname</th>
              <th className="text-left px-3 py-2 font-medium">OS</th>
              <th className="text-left px-3 py-2 font-medium">Konum</th>
              <th className="text-left px-3 py-2 font-medium">Risk</th>
              <th className="text-left px-3 py-2 font-medium">Durum</th>
              <th className="text-left px-3 py-2 font-medium hidden md:table-cell">Uyarı</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((ast) => (
              <tr key={ast.asset_id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-3 py-2">
                  <Link to={`/endpoints/${ast.asset_id}`} className="hover:text-primary transition-colors font-mono text-[10px] font-medium">
                    {ast.hostname}
                  </Link>
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  <span className="mr-1" aria-hidden="true">{osIcons[ast.os] ?? ''}</span>
                  {ast.os}
                </td>
                <td className="px-3 py-2 text-muted-foreground">{ast.location}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${ast.risk_score >= 70 ? 'bg-severity-critical' : ast.risk_score >= 40 ? 'bg-severity-medium' : 'bg-severity-low'}`} />
                    <span className="font-mono text-[10px]">{ast.risk_score}</span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  {ast.isolation_status === 'isolated' ? (
                    <span className="inline-flex items-center gap-1 text-severity-critical text-[10px]">
                      <WifiOff className="w-3 h-3" /> İzole
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-severity-low text-[10px]">
                      <Wifi className="w-3 h-3" /> Normal
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground hidden md:table-cell">{ast.open_alert_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
