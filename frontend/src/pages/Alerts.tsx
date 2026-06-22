import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAlertStore } from '@/store'
import { SkeletonTable } from '@/components/ui/skeleton-card'
import { SeverityPill } from '@/components/ui/severity-pill'
import { StatusPill } from '@/components/ui/status-pill'
import { EmptyState } from '@/components/ui/empty-state'
import { PivotLink } from '@/components/ui/pivot-link'
import { AlertFilters, type AlertFilterState } from '@/components/features/alerts/AlertFilters'
import { defang, computeRiskScore, riskScoreColor } from '@/lib/utils'
import { exportCSV, exportJSON, exportFilename } from '@/lib/highlight'
import { toast } from 'sonner'
import { AlertTriangle, X, Download } from 'lucide-react'

function parseSearchParams(sp: URLSearchParams): Partial<AlertFilterState> {
  const f: Partial<AlertFilterState> = {}
  const s = sp.get('severity'); if (s) f.severity = s as AlertFilterState['severity']
  const st = sp.get('status'); if (st) f.status = st
  const src = sp.get('source'); if (src) f.source = src
  const q = sp.get('q'); if (q) f.search = q
  return f
}

export default function Alerts() {
  const { data: alerts, isLoading, load } = useAlertStore()
  const [sp, setSp] = useSearchParams()
  const [filters, setFilters] = useState<AlertFilterState>(() => ({
    severity: 'all', status: 'all', source: 'all', search: '',
    ...parseSearchParams(sp),
  }))

  useEffect(() => { load() }, [load])

  // URL param sync
  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.severity !== 'all') params.set('severity', filters.severity)
    if (filters.status !== 'all') params.set('status', filters.status)
    if (filters.source !== 'all') params.set('source', filters.source)
    if (filters.search) params.set('q', filters.search)
    setSp(params, { replace: true })
  }, [filters, setSp])

  const sources = useMemo(() => [...new Set(alerts.map((a) => a.source))].sort(), [alerts])

  const updateFilters = (partial: Partial<AlertFilterState>) => setFilters((f) => ({ ...f, ...partial }))

  // Pivot from URL
  const pivotIp = sp.get('ip')
  const pivotAsset = sp.get('asset')
  const pivotUser = sp.get('user')

  const filtered = useMemo(() => {
    const filtered = alerts.filter((a) => {
      if (filters.severity !== 'all' && a.severity !== filters.severity) return false
      if (filters.status !== 'all' && a.status !== filters.status) return false
      if (filters.source !== 'all' && a.source !== filters.source) return false
      if (pivotIp && a.source_ip !== pivotIp) return false
      if (pivotAsset && a.affected_asset_id !== pivotAsset) return false
      if (pivotUser && a.affected_user_id !== pivotUser) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        const haystack = [a.title, a.description, a.source, a.source_ip ?? '', a.alert_id].join(' ').toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
    // Sort by risk score descending
    return filtered.sort((a, b) => computeRiskScore(b) - computeRiskScore(a))
  }, [alerts, filters, pivotIp, pivotAsset, pivotUser])

  const clearPivot = () => {
    const params = new URLSearchParams(sp)
    params.delete('ip'); params.delete('asset'); params.delete('user')
    setSp(params, { replace: true })
  }

  if (isLoading) return <div className="p-6"><SkeletonTable rows={12} /></div>

  const hasPivot = pivotIp || pivotAsset || pivotUser

  return (
    <div className="p-6 space-y-4">
      <AlertFilters filters={filters} onChange={updateFilters} sources={sources} totalCount={alerts.length} filteredCount={filtered.length} />

      {/* Pivot breadcrumb */}
      {hasPivot && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Pivot:</span>
          {pivotIp && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 border border-primary/30 text-primary text-xs font-medium">
              IP = {defang(pivotIp, 'ip')}
              <button onClick={clearPivot} className="hover:text-foreground" aria-label="Pivot'u temizle"><X className="w-3 h-3" /></button>
            </span>
          )}
          {pivotAsset && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 border border-primary/30 text-primary text-xs font-medium">
              Asset = {pivotAsset}
              <button onClick={clearPivot} className="hover:text-foreground" aria-label="Pivot'u temizle"><X className="w-3 h-3" /></button>
            </span>
          )}
          {pivotUser && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 border border-primary/30 text-primary text-xs font-medium">
              User = {pivotUser}
              <button onClick={clearPivot} className="hover:text-foreground" aria-label="Pivot'u temizle"><X className="w-3 h-3" /></button>
            </span>
          )}
        </div>
      )}

      {/* Export */}
      <div className="flex items-center justify-end gap-2">
        <button onClick={() => { const rows = filtered.map(({ evidence_event_ids, recommended_actions, ...r }) => r); exportCSV(rows as unknown as Record<string, unknown>[], exportFilename('alerts')); toast(`${filtered.length} kayıt CSV olarak dışa aktarıldı.`) }} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-border text-xs text-muted-foreground hover:bg-accent transition-colors">
          <Download className="w-3 h-3" />CSV
        </button>
        <button onClick={() => { exportJSON(filtered as unknown as Record<string, unknown>[], exportFilename('alerts').replace('.csv', '.json')); toast(`${filtered.length} kayıt JSON olarak dışa aktarıldı.`) }} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-border text-xs text-muted-foreground hover:bg-accent transition-colors">
          <Download className="w-3 h-3" />JSON
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<AlertTriangle className="w-8 h-8" />}
          title={alerts.length === 0 ? 'Hiç uyarı yok' : 'Eşleşen uyarı bulunamadı'}
          description={alerts.length === 0 ? 'Ya gerçekten sakin bir gün, ya da SIEM\'iniz ölmüş.' : 'Filtreleri değiştirmeyi deneyin.'}
        />
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-xs">
            <thead className="sticky top-0 z-10 bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Risk</th>
                <th className="text-left px-3 py-2 font-medium w-[30%]">Uyarı</th>
                <th className="text-left px-3 py-2 font-medium">Önem</th>
                <th className="text-left px-3 py-2 font-medium hidden md:table-cell">Kaynak</th>
                <th className="text-left px-3 py-2 font-medium hidden lg:table-cell">IP</th>
                <th className="text-left px-3 py-2 font-medium hidden xl:table-cell">Kullanıcı</th>
                <th className="text-left px-3 py-2 font-medium hidden xl:table-cell">Cihaz</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const rScore = computeRiskScore(a)
                const rColor = riskScoreColor(rScore)
                return (
                <tr key={a.alert_id} className="border-b border-border last:border-0 even:bg-muted/5 hover:bg-muted/30 transition-colors cursor-pointer">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden max-w-12">
                        <div className="h-full rounded-full transition-all" style={{ width: `${rScore}%`, backgroundColor: rColor }} />
                      </div>
                      <span className="text-xs font-mono font-bold tabular-nums">{rScore}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <Link to={`/alerts/${a.alert_id}`} className="hover:text-primary transition-colors font-medium">{a.title}</Link>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">{a.alert_id} · <StatusPill status={a.status} /></div>
                  </td>
                  <td className="px-3 py-2"><SeverityPill severity={a.severity} /></td>
                  <td className="px-3 py-2 text-muted-foreground hidden md:table-cell">{a.source}</td>
                  <td className="px-3 py-2 hidden lg:table-cell">
                    {a.source_ip ? <PivotLink to={`/alerts?ip=${a.source_ip}`} className="font-mono text-xs">{a.source_ip}</PivotLink> : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-3 py-2 hidden xl:table-cell">
                    <PivotLink to={`/alerts?user=${a.affected_user_id}`} className="font-mono text-xs">{a.affected_user_id}</PivotLink>
                  </td>
                  <td className="px-3 py-2 hidden xl:table-cell">
                    {a.affected_asset_id ? <PivotLink to={`/alerts?asset=${a.affected_asset_id}`} className="font-mono text-xs">{a.affected_asset_id}</PivotLink> : <span className="text-muted-foreground">—</span>}
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
