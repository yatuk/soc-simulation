import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadEntity } from '@/lib/data'
import { SkeletonTable } from '@/components/ui/skeleton-card'
import { EmptyState } from '@/components/ui/empty-state'
import { useTranslation } from '@/i18n'
import { ShieldAlert } from 'lucide-react'
import type { Vulnerability } from '@/types'

const CVSS_COLORS: Record<string, string> = {
  critical: '#CC0000', high: '#FF8C00', medium: '#F0AD4E', low: '#5CB85C', none: '#999999',
}

const CVSS_LABELS: Record<string, string> = {
  critical: 'KRITIK', high: 'YUKSEK', medium: 'ORTA', low: 'DUSUK', none: 'YOK',
}

function Gauge({ score }: { score: number }) {
  const pct = Math.min(100, Math.round((score / 10) * 100))
  const color = score >= 9 ? CVSS_COLORS.critical : score >= 7 ? CVSS_COLORS.high : score >= 4 ? CVSS_COLORS.medium : score > 0 ? CVSS_COLORS.low : CVSS_COLORS.none
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden max-w-16">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-mono font-bold tabular-nums" style={{ color }}>{score.toFixed(1)}</span>
    </div>
  )
}

export default function Vulnerabilities() {
  const { t } = useTranslation()
  const [vulns, setVulns] = useState<Vulnerability[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    loadEntity<Vulnerability[]>('vulnerabilities.json')
      .then(setVulns)
      .catch(() => setVulns([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (filter === 'all') return vulns.slice().sort((a, b) => b.cvss_score - a.cvss_score)
    return vulns.filter(v => v.severity === filter).sort((a, b) => b.cvss_score - a.cvss_score)
  }, [vulns, filter])

  const sevs = ['all', 'critical', 'high', 'medium', 'low']

  if (loading) return <div className="p-6"><SkeletonTable rows={12} /></div>

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-semibold">Vulnerabilities</h2>
          <p className="text-xs text-muted-foreground mt-1">{vulns.length} CVE — CVSS öncelikli</p>
        </div>
      </div>

      {/* Severity filter */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {sevs.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
              filter === s ? 'bg-card border-border text-foreground shadow-sm' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {s === 'all' ? t('common.all') : CVSS_LABELS[s] ?? s}
            {s !== 'all' && ` (${vulns.filter(v => v.severity === s).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<ShieldAlert className="w-8 h-8" />} title={t('common.noResults')} />
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-xs">
            <thead className="sticky top-0 z-10 bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-3 py-2 font-medium">CVSS</th>
                <th className="text-left px-3 py-2 font-medium w-[35%]">CVE / Açıklama</th>
                <th className="text-left px-3 py-2 font-medium hidden md:table-cell">Önem</th>
                <th className="text-left px-3 py-2 font-medium hidden lg:table-cell">Vektör</th>
                <th className="text-left px-3 py-2 font-medium hidden xl:table-cell">Cihaz</th>
                <th className="text-left px-3 py-2 font-medium">Durum</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.vuln_id} className="border-b border-border last:border-0 even:bg-muted/5 hover:bg-muted/30 transition-colors cursor-pointer">
                  <td className="px-3 py-2.5"><Gauge score={v.cvss_score} /></td>
                  <td className="px-3 py-2.5">
                    <Link to={`/vulnerabilities/${v.vuln_id}`} className="hover:text-primary transition-colors">
                      <div className="font-mono text-xs font-bold">{v.cve_id}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">{v.name}</div>
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 hidden md:table-cell">
                    <span className="text-xs font-medium" style={{ color: CVSS_COLORS[v.severity] ?? '#8b949e' }}>{CVSS_LABELS[v.severity] ?? v.severity}</span>
                  </td>
                  <td className="px-3 py-2.5 hidden lg:table-cell font-mono text-2xs text-muted-foreground max-w-[180px] truncate" title={v.cvss_vector}>
                    {v.cvss_vector.replace('CVSS:3.1/', '')}
                  </td>
                  <td className="px-3 py-2.5 hidden xl:table-cell text-muted-foreground font-mono text-xs">
                    {v.affected_asset_ids.length} cihaz
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`px-1.5 py-0.5 rounded text-2xs font-medium ${
                      v.status === 'open' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                      v.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
                      v.status === 'remediated' ? 'bg-green-500/10 text-green-400 border border-green-500/30' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {v.status === 'open' ? 'Açık' : v.status === 'in_progress' ? 'Sürüyor' : v.status === 'remediated' ? 'Giderildi' : 'Risk Kabul'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
