import { useEffect, useState } from 'react'
import { useIOCStore } from '@/store'
import { SkeletonTable } from '@/components/ui/skeleton-card'
import { SeverityPill } from '@/components/ui/severity-pill'
import { EmptyState } from '@/components/ui/empty-state'
import { Shield } from 'lucide-react'
import type { IOCType } from '@/types'

export default function IOCs() {
  const { data: iocs, isLoading, load } = useIOCStore()
  const [typeFilter, setTypeFilter] = useState<IOCType | 'all'>('all')

  useEffect(() => { load() }, [load])

  const filtered = typeFilter === 'all' ? iocs : iocs.filter((i) => i.type === typeFilter)

  if (isLoading) return <div className="p-6"><SkeletonTable rows={10} /></div>

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <h2 className="text-sm font-semibold mr-2">Tip:</h2>
        {(['all', 'domain', 'ip', 'hash', 'email'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${typeFilter === t ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border text-muted-foreground hover:bg-accent'}`}
            aria-pressed={typeFilter === t}
          >
            {t === 'all' ? 'Tümü' : t.toUpperCase()}
          </button>
        ))}
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} IOC</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Shield className="w-8 h-8" />} title="IOC bulunamadı" />
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Tip</th>
                <th className="text-left px-3 py-2 font-medium">Değer</th>
                <th className="text-left px-3 py-2 font-medium">Etiket</th>
                <th className="text-left px-3 py-2 font-medium">Önem</th>
                <th className="text-left px-3 py-2 font-medium hidden md:table-cell">Skor</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ioc) => (
                <tr key={ioc.ioc_id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2">
                    <span className="font-mono text-[10px] bg-muted px-1 py-0.5 rounded">{ioc.type.toUpperCase()}</span>
                  </td>
                  <td className="px-3 py-2 font-mono text-[10px] max-w-[200px] truncate" title={ioc.value}>
                    {ioc.value}
                  </td>
                  <td className="px-3 py-2">{ioc.label}</td>
                  <td className="px-3 py-2"><SeverityPill severity={ioc.severity} /></td>
                  <td className="px-3 py-2 text-muted-foreground hidden md:table-cell">{ioc.threat_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
