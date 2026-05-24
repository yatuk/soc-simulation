import { Search, X } from 'lucide-react'
import type { Severity } from '@/types'

export interface AlertFilterState {
  severity: Severity | 'all'
  status: string | 'all'
  source: string | 'all'
  search: string
}

interface Props {
  filters: AlertFilterState
  onChange: (f: Partial<AlertFilterState>) => void
  sources: string[]
  totalCount: number
  filteredCount: number
}

const SEVERITIES: (Severity | 'all')[] = ['all', 'critical', 'high', 'medium', 'low']
const STATUSES = ['all', 'new', 'acknowledged', 'resolved']

export function AlertFilters({ filters, onChange, sources, totalCount, filteredCount }: Props) {
  const hasFilters = filters.severity !== 'all' || filters.status !== 'all' || filters.source !== 'all' || filters.search !== ''
  const clear = () => onChange({ severity: 'all', status: 'all', source: 'all', search: '' })

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Uyarılarda ara... (başlık, kaynak, IP)"
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          className="w-full h-9 pl-8 pr-8 rounded-md border border-border bg-card text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          aria-label="Uyarılarda ara"
        />
        {filters.search && (
          <button onClick={() => onChange({ search: '' })} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Aramayı temizle">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] text-muted-foreground mr-1">Filtre:</span>

        {/* Severity */}
        <select
          value={filters.severity}
          onChange={(e) => onChange({ severity: e.target.value as AlertFilterState['severity'] })}
          className="h-7 px-2 rounded-md border border-border bg-card text-[10px] focus:outline-none"
          aria-label="Önem seviyesi"
        >
          {SEVERITIES.map((s) => <option key={s} value={s}>{s === 'all' ? 'Tüm Önem' : s}</option>)}
        </select>

        {/* Status */}
        <select
          value={filters.status}
          onChange={(e) => onChange({ status: e.target.value })}
          className="h-7 px-2 rounded-md border border-border bg-card text-[10px] focus:outline-none"
          aria-label="Durum"
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s === 'all' ? 'Tüm Durum' : s === 'new' ? 'Yeni' : s === 'acknowledged' ? 'Onaylandı' : 'Çözüldü'}</option>)}
        </select>

        {/* Source */}
        <select
          value={filters.source}
          onChange={(e) => onChange({ source: e.target.value })}
          className="h-7 px-2 rounded-md border border-border bg-card text-[10px] focus:outline-none"
          aria-label="Kaynak"
        >
          <option value="all">Tüm Kaynak</option>
          {sources.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        {hasFilters && (
          <button onClick={clear} className="h-7 px-2 rounded-md border border-border text-[10px] text-muted-foreground hover:bg-accent transition-colors">
            Temizle
          </button>
        )}

        <span className="text-[10px] text-muted-foreground ml-auto">
          {filteredCount}/{totalCount} uyarı
        </span>
      </div>
    </div>
  )
}
