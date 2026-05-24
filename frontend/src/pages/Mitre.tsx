import { useEffect, useState } from 'react'
import { useMitreStore } from '@/store'
import { SkeletonCard } from '@/components/ui/skeleton-card'
import { EmptyState } from '@/components/ui/empty-state'
import { Target } from 'lucide-react'

const tacticColors: Record<string, string> = {
  'TA0001': 'bg-blue-500/10 border-blue-500/30',
  'TA0002': 'bg-purple-500/10 border-purple-500/30',
  'TA0003': 'bg-amber-500/10 border-amber-500/30',
  'TA0004': 'bg-orange-500/10 border-orange-500/30',
  'TA0005': 'bg-cyan-500/10 border-cyan-500/30',
  'TA0006': 'bg-red-500/10 border-red-500/30',
  'TA0007': 'bg-lime-500/10 border-lime-500/30',
  'TA0008': 'bg-pink-500/10 border-pink-500/30',
  'TA0009': 'bg-teal-500/10 border-teal-500/30',
  'TA0010': 'bg-rose-500/10 border-rose-500/30',
  'TA0011': 'bg-indigo-500/10 border-indigo-500/30',
}

export default function Mitre() {
  const { data: mitre, isLoading, load } = useMitreStore()
  const [selectedTactic, setSelectedTactic] = useState<string | null>(null)

  useEffect(() => { load() }, [load])

  if (isLoading) return <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>
  if (!mitre) return <div className="p-6"><EmptyState icon={<Target className="w-8 h-8" />} title="MITRE verisi yüklenemedi" /></div>

  const filteredTechniques = selectedTactic
    ? mitre.techniques.filter((t) => t.tactic_id === selectedTactic)
    : mitre.techniques

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">MITRE ATT&CK Kapsamı</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {mitre.summary.covered_techniques}/{mitre.summary.total_techniques} teknik cover edildi (%{mitre.summary.coverage_percent})
          </p>
        </div>
      </div>

      {/* Tactic tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        <button
          onClick={() => setSelectedTactic(null)}
          className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${!selectedTactic ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border text-muted-foreground hover:bg-accent'}`}
          aria-pressed={!selectedTactic}
        >
          Tümü
        </button>
        {mitre.tactics.map((tactic) => (
          <button
            key={tactic.tactic_id}
            onClick={() => setSelectedTactic(tactic.tactic_id)}
            className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${selectedTactic === tactic.tactic_id ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border text-muted-foreground hover:bg-accent'}`}
            aria-pressed={selectedTactic === tactic.tactic_id}
          >
            {tactic.name} ({tactic.technique_count})
          </button>
        ))}
      </div>

      {/* Technique grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {filteredTechniques.map((tech) => (
          <div
            key={tech.technique_id}
            className={`p-3 rounded-lg border text-xs transition-colors ${
              tech.is_covered
                ? tacticColors[tech.tactic_id] ?? 'bg-muted/30 border-border'
                : 'bg-muted/10 border-border opacity-50'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[10px] font-medium">{tech.technique_id}</span>
              {tech.is_covered && <span className="text-[10px] bg-muted px-1 rounded">{tech.alert_count} uyarı</span>}
            </div>
            <div className="font-medium">{tech.name}</div>
            {tech.incident_ids.length > 0 && (
              <div className="text-[10px] text-muted-foreground mt-1">
                {tech.incident_ids.length} olayda görüldü
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
