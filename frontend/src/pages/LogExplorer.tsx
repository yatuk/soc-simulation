import { useEffect, useMemo, useState } from 'react'
import { SkeletonTable } from '@/components/ui/skeleton-card'
import { EmptyState } from '@/components/ui/empty-state'
import { FileSearch, Search, X } from 'lucide-react'

interface LogEvent {
  event_id: string
  timestamp: string
  source_type: string
  event_type: string
  severity: string
  user?: { email?: string; username?: string }
  details?: Record<string, unknown>
  raw_log?: string
}

const SOURCES = ['all', 'email_gateway', 'identity_provider', 'web_proxy', 'cloud_mailbox', 'endpoint'] as const

export default function LogExplorer() {
  const [events, setEvents] = useState<LogEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [sourceFilter, setSourceFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch('/data/events.jsonl')
      .then(r => r.text())
      .then(text => {
        const parsed = text.trim().split('\n').filter(Boolean).map(line => {
          try { return JSON.parse(line) } catch { return null }
        }).filter(Boolean) as LogEvent[]
        setEvents(parsed)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return events.filter(e => {
      if (sourceFilter !== 'all' && e.source_type !== sourceFilter) return false
      if (query.trim()) {
        const q = query.toLowerCase()
        const raw = JSON.stringify(e).toLowerCase()
        return raw.includes(q)
      }
      return true
    })
  }, [events, sourceFilter, query])

  if (loading) return <div className="p-6"><SkeletonTable rows={15} /></div>

  return (
    <div className="p-6 space-y-4">
      <div>
        <h2 className="text-sm font-semibold">Log Explorer</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{events.length} event · {filtered.length} görüntüleniyor</p>
      </div>

      {/* Search + filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Event içinde ara... (JSON)"
            className="w-full h-8 pl-7 pr-7 rounded-md border border-border bg-card text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          {SOURCES.map(s => (
            <button
              key={s}
              onClick={() => setSourceFilter(s)}
              className={`px-2 py-1 rounded-md text-xs border transition-colors ${sourceFilter === s ? 'bg-primary/10 border-primary/30 text-primary font-medium' : 'border-border text-muted-foreground hover:bg-accent'}`}
              aria-pressed={sourceFilter === s}
            >
              {s === 'all' ? 'Tümü' : s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<FileSearch className="w-8 h-8" />} title="Eşleşen event yok" description="Filtreleri değiştirmeyi deneyin." />
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-xs font-mono">
            <thead className="sticky top-0 z-10 bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-3 py-2 font-medium w-36">Timestamp</th>
                <th className="text-left px-3 py-2 font-medium">Source</th>
                <th className="text-left px-3 py-2 font-medium">Event Type</th>
                <th className="text-left px-3 py-2 font-medium">User</th>
                <th className="text-left px-3 py-2 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <>
                  <tr
                    key={e.event_id}
                    onClick={() => setExpanded(expanded === e.event_id ? null : e.event_id)}
                    className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(e.timestamp).toLocaleString('tr-TR', { month:'short', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit' })}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <span className={`px-1.5 py-0.5 rounded text-2xs ${
                        e.severity === 'critical' ? 'bg-severity-critical/15 text-severity-critical' :
                        e.severity === 'high' ? 'bg-severity-high/15 text-severity-high' :
                        e.severity === 'medium' ? 'bg-severity-medium/15 text-severity-medium' :
                        'bg-muted text-muted-foreground'
                      }`}>{e.source_type}</span>
                    </td>
                    <td className="px-3 py-2 text-xs">{e.event_type}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{e.user?.email || '—'}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground max-w-xs truncate">
                      {e.details?.subject as string || e.details?.process as string || '—'}
                    </td>
                  </tr>
                  {expanded === e.event_id && (
                    <tr key={`${e.event_id}-raw`} className="bg-muted/20">
                      <td colSpan={5} className="px-3 py-2">
                        <pre className="text-xs text-muted-foreground overflow-x-auto max-h-40 whitespace-pre-wrap break-all">
                          {JSON.stringify(e, null, 1)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
